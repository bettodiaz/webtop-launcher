# Webtop Launcher - Backend Generation Instructions

This document provides a comprehensive blueprint for an LLM agent (like Visual Studio Code's Copilot agent) to generate the backend for the Webtop Launcher application.

## Core Technologies

*   **Language/Framework:** Go (Golang) using the standard library and lightweight libraries like `gorilla/mux` for routing.
*   **Database:** PostgreSQL for all persistent data.
*   **Authentication:** JWT (JSON Web Tokens) for stateless session management.
*   **Docker Orchestration:** Portainer-CE API. The backend will act as a client to a user-provided or self-hosted Portainer instance.
*   **Containerization:** The backend itself will be distributed as a Docker image.

---

## "Big Picture" Architecture

This section describes the major components, their boundaries, and the flow of data. Understanding this is critical before writing any code.

The system is composed of several key components:

1.  **Go Backend API:** The central nervous system. It handles user authentication, session management, database interactions, and communicates with Portainer. **Crucially, it will also have direct access to the host's Docker daemon to manage its own Portainer-CE instance if required.**
2.  **PostgreSQL Database:** The source of truth for all application data, including users, application definitions, and session metadata. It does *not* store container state.
3.  **Portainer-CE Instance:** The "muscle." This is the container orchestrator. The Go backend will use Portainer's API to perform all Docker-related actions: creating stacks, starting/stopping containers, etc.
4.  **Reverse Proxy (e.g., Traefik, Nginx):** This is a critical architectural component that sits in front of the launched application containers. It's responsible for routing traffic from a session-specific URL (`https://yourhost/{sessionId}/`) to the correct internal container port (`{container_ip}:3001`). The backend will need to be configured to interact with this proxy's API to add/remove routing rules when sessions are started and stopped.

### Critical Developer Workflows

*   **Build:** Standard `go build ./...`
*   **Testing:** Use Go's built-in testing framework. Write unit tests for business logic (e.g., user validation) and integration tests for database and Portainer API interactions.
*   **Debugging:** Use Delve for debugging Go applications.

---

## Database Schema (PostgreSQL)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    repository_url TEXT,
    docker_compose TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    portainer_stack_id INT, -- The ID of the stack in Portainer
    is_persistent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT
);

-- For Portainer config
INSERT INTO settings (key, value) VALUES ('portainer_url', '');
INSERT INTO settings (key, value) VALUES ('portainer_api_key', '');
```

---

## API Endpoint Definitions

All endpoints should be prefixed with `/api`. Authentication should be handled by a middleware that checks for a valid JWT in the `Authorization` header.

### Authentication (`/auth`)

*   `POST /auth/login`: Takes `{"username": "...", "password": "..."}`. Validates credentials against the `users` table. Returns a JWT on success.
*   `POST /auth/change-password`: (Authenticated) Takes `{"currentPassword": "...", "newPassword": "..."}`. Changes the logged-in user's password.

### User Management (`/admin/users`) - Admin Only

*   `GET /admin/users`: List all users.
*   `POST /admin/users`: Create a new user.
*   `PUT /admin/users/{id}`: Update a user (e.g., toggle admin status).
*   `POST /admin/users/{id}/reset-password`: Resets a user's password to a random string (or a provided one).
*   `DELETE /admin/users/{id}`: Delete a user.

### Application Management (`/admin/apps`) - Admin Only

*   `GET /admin/apps`: List all applications from the database.
*   `POST /admin/apps/scrape`: This is a long-running job. It should trigger the Gemini service to scrape GitHub and then store the results in the `applications` table, avoiding duplicates.
*   `PUT /admin/apps/{id}`: Update an application (e.g., enable/disable, update compose file).

### Session Management

*   `GET /sessions`: (Authenticated) Get all active sessions for the current user.
*   `GET /admin/sessions`: (Admin Only) Get all active sessions for all users.
*   `POST /sessions/launch`: (Authenticated) The core launch logic.
    *   **Input:** `{"applicationId": "...", "isPersistent": true}`
    *   **Workflow:**
        1.  Generate a unique session ID (UUID).
        2.  Create a Portainer stack. The stack name should be unique, incorporating the username and session ID (e.g., `user-session-xyz`).
        3.  The `docker-compose` definition from the `applications` table is the content of the stack.
        4.  **Important:** Modify the compose file on-the-fly to inject the session ID as an environment variable or label. This is crucial for the reverse proxy.
        5.  If `isPersistent` is true, create and attach a named volume to the container for persistent data (e.g., `/config`). The volume name should also be unique to the session/user.
        6.  After the stack is running, configure the reverse proxy to route `https://yourhost/{sessionId}/` to the new container.
        7.  Store the session metadata (user ID, session ID, Portainer stack ID) in the `sessions` table.
        8.  Return the new session object to the frontend.
*   `POST /sessions/{id}/stop`: (Authenticated)
    *   Find the session in the database to get the `portainer_stack_id`.
    *   Use the Portainer API to stop and delete the stack.
    *   If the session was persistent, **do not** delete the named volume.
    *   Remove the routing rule from the reverse proxy.
    *   Delete the session record from the database.

---

## Orchestrator Self-Management

To provide a seamless "out-of-the-box" experience, the backend must be capable of deploying and managing its own Portainer-CE instance. This functionality is exposed via the following endpoints and requires the backend process to have access to the host's Docker socket (e.g., `/var/run/docker.sock`).

> **Security Warning:** Granting access to the Docker socket is highly privileged. The backend application must be secured and trusted. Ensure this feature is well-documented for the end-user.

### `POST /api/admin/portainer/deploy`

This endpoint triggers the automatic deployment of a `portainer/portainer-ce:latest` container.

**Workflow:**
1.  **Check for Existing Container:** The backend should first check if a container named `webtop-launcher-portainer` already exists. If so, it should stop and remove it before proceeding, ensuring a clean deployment.
2.  **Pull Image:** Pull the `portainer/portainer-ce:latest` image from Docker Hub.
3.  **Create Volume:** Create a named Docker volume (e.g., `webtop-launcher-portainer-data`) to ensure Portainer's data persists across container restarts.
4.  **Run Container:** Start the Portainer container with the following configuration:
    *   **Name:** `webtop-launcher-portainer`
    *   **Ports:** Map host port `9443` to container port `9443`, and host port `8000` to container port `8000`.
    *   **Volumes:**
        *   Mount the created data volume to `/data`.
        *   Mount the host's Docker socket (`/var/run/docker.sock`) to the same path in the container. This allows Portainer to manage the host's Docker environment.
5.  **Initial Setup via API:**
    *   Portainer's API will be available at `https://localhost:9443` (from the backend's perspective). The backend will need to poll this endpoint until it's responsive.
    *   Make a `POST` request to `/api/users/admin/init` to create the initial admin user. A secure, randomly generated password should be used.
    *   Using the new admin credentials, make a `POST` request to `/api/auth` to get a JSON Web Token (JWT).
    *   Using the JWT, make a `POST` request to `/api/users/{admin_id}/tokens` to create a new API key for Webtop Launcher to use.
6.  **Store and Respond:**
    *   Store the Portainer URL (`https://{host_ip}:9443` or similar) and the newly generated API key in the application's database (`settings` table).
    *   Respond to the frontend with the new configuration.

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Portainer deployed successfully!",
  "config": {
    "url": "https://localhost:9443",
    "apiKey": "ptr_...newlygeneratedkey"
  }
}
```

### `GET /api/admin/portainer/status`

This endpoint retrieves the status of the managed Portainer container.

**Workflow:**
1.  Use the Docker SDK to inspect the container named `webtop-launcher-portainer`.
2.  If the container doesn't exist, return `null` or a `404`.
3.  Extract relevant information:
    *   `status`: (e.g., 'running', 'exited', 'restarting'). Map this to a frontend-friendly enum: `running`, `stopped`, `error`.
    *   `uptime`: Calculate from the `StartedAt` timestamp.
    *   `version`: Extract from the image tag.

**Success Response (`200 OK`):**
```json
{
  "status": "running",
  "uptime": "3 hours",
  "version": "2.19.4"
}
```

---

## Transitioning from Frontend Mock API

**This is a critical step.** The frontend currently uses a mock API located in `src/services/api.ts` to simulate backend functionality and provide a seamless development experience. When building the backend, this file must be entirely replaced by real HTTP requests to the Go API.

**Instructions:**

1.  **Disable/Remove Mock API:** The entire `services/api.ts` file should be considered temporary. The functions within it are a contract that the real API must fulfill.
2.  **Implement Real API Calls:** For every function in `services/api.ts`, create a corresponding function that uses `fetch` to call the real API endpoint defined above. For example:
    *   `mockLogin(username, password)` becomes `fetch('/api/auth/login', ...)`
    *   `getUsers()` becomes `fetch('/api/admin/users', ...)`
    *   `startSession(...)` becomes `fetch('/api/sessions/launch', ...)`
    *   ...and so on for every function.
3.  **Seed Initial Data:** The mock data at the top of `api.ts` (`initialUsers`, `initialApplications`) should be used as the basis for a database seeding script. The backend should have a mechanism (e.g., a startup script or a CLI command) to populate the `users` and `applications` tables with this initial data. The frontend should **not** contain this data once the backend is live.
4.  **Remove Delays:** The `delay()` function in the mock API is purely for simulating network latency and should be removed. Real API calls will have their own natural latency.
5.  **Local Storage:** The mock API uses `localStorage` to persist some data (`users`, `applications`). This is a frontend-only simulation. The backend's PostgreSQL database is the single source of truth; all `localStorage` usage for data persistence in `api.ts` must be removed. `localStorage` should only be used for storing the user's JWT and potentially some UI state.