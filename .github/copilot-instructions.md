# Webtop Launcher - AI Agent Instructions

This document guides AI coding agents to be productive in the Webtop Launcher codebase.

## Big Picture Architecture

The application is a React frontend with a Go backend.

- **Frontend:** A React single-page application built with Vite. It uses Tailwind CSS for styling and communicates with the backend via a REST API. Key components are in `src/components`, pages in `src/pages`, and hooks in `src/hooks`. The `services/api.ts` file is the contract for the backend API.
- **Backend:** A Go application using `gorilla/mux` for routing and `pq` for PostgreSQL communication. It handles user authentication, session management, and Docker orchestration via the Portainer API. The main entrypoint is `backend/cmd/main.go`.
- **Database:** PostgreSQL is the source of truth for users, applications, and sessions. The schema is defined in `backend/internal/database/database.go`.
- **Orchestration:** Portainer-CE is used to manage Docker containers. The backend can deploy and manage its own Portainer instance.

## Critical Developer Workflows

- **Frontend:**
  - `npm install`: Install dependencies.
  - `npm run dev`: Start the development server.
  - `npm run build`: Build for production.
- **Backend:**
  - `go build ./...`: Build the backend.
  - `docker-compose up --build`: Build and run the backend and database.

## Project-Specific Conventions

- **API:** The frontend uses a mock API in `src/services/api.ts`. The backend API must fulfill this contract. All backend endpoints are prefixed with `/api`.
- **Authentication:** JWT is used for stateless session management. The `AuthMiddleware` in `backend/internal/middleware/auth.go` protects authenticated routes.
- **Database:** The database schema is managed in `backend/internal/database/database.go`. The backend uses the `database/sql` package to interact with the database.
- **Models:** Go structs for database tables are in `backend/internal/models/models.go`.

## Integration Points

- **Portainer API:** The backend communicates with the Portainer API to manage Docker containers. The logic is in `backend/internal/portainer/portainer.go`.
- **Gemini API:** The `services/geminiService.ts` file contains logic for scraping GitHub for new applications using the Gemini API.
- **Reverse Proxy:** A reverse proxy (like Traefik or Nginx) is required to route traffic to the launched application containers. The backend needs to be configured to interact with the proxy's API.
