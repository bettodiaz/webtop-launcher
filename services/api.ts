import { User, Session, Application, PortainerConfig, PortainerStatus } from '../types';

const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE) || process.env.API_BASE || '/api';
function authHeaders() {
    const token = localStorage.getItem('jwt');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res: Response) {
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
    }
    if (res.status === 204) return null;
    return res.json();
}
// Auth
export async function login(username: string, password: string): Promise<void> {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await handleResponse(res) as { token: string };
    localStorage.setItem('jwt', data.token);
}
export function logout() {
    localStorage.removeItem('jwt');
}
export async function changePassword(current: string, newPassword: string) {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ currentPassword: current, newPassword })
    });
    return handleResponse(res);
}

// Users (admin)
export async function getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/admin/users`, { headers: { ...authHeaders() } });
    return handleResponse(res);
}

export async function addUser(user: Omit<User, 'id'>, password: string): Promise<User> {
    const res = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ ...user, password })
    });
    return handleResponse(res);
}

export async function deleteUser(userId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, { method: 'DELETE', headers: { ...authHeaders() } });
    return handleResponse(res);
}

export async function resetUserPassword(userId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/reset-password`, { method: 'POST', headers: { ...authHeaders() } });
    return handleResponse(res);
}

// Applications
export async function getApplications(): Promise<Application[]> {
    const res = await fetch(`${API_BASE}/admin/apps`, { headers: { ...authHeaders() } });
    return handleResponse(res);
}

export async function getAvailableApplications(): Promise<Application[]> {
    const res = await fetch(`${API_BASE}/apps`, { headers: { ...authHeaders() } });
    return handleResponse(res);
}

export async function updateApplication(app: Application): Promise<Application> {
    const res = await fetch(`${API_BASE}/admin/apps/${app.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(app)
    });
    return handleResponse(res);
}

export async function scrapeApps(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/apps/scrape`, { method: 'POST', headers: { ...authHeaders() } });
    return handleResponse(res);
}
// Sessions
export async function getSessionsForUser(): Promise<Session[]> {
    const res = await fetch(`${API_BASE}/sessions`, { headers: { ...authHeaders() } });
    return handleResponse(res);
}

export async function getAllSessions(): Promise<Session[]> {
    const res = await fetch(`${API_BASE}/admin/sessions`, { headers: { ...authHeaders() } });
    return handleResponse(res);
}

export async function startSession(applicationId: string, isPersistent: boolean): Promise<Session> {
    const res = await fetch(`${API_BASE}/sessions/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ applicationId, isPersistent })
    });
    return handleResponse(res);
}

export async function stopSession(sessionId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/stop`, { method: 'POST', headers: { ...authHeaders() } });
    return handleResponse(res);
}
// Portainer
export async function getPortainerConfig(): Promise<PortainerConfig> {
    const res = await fetch(`${API_BASE}/admin/portainer`, { headers: { ...authHeaders() } });
    return handleResponse(res);
}

export async function updatePortainerConfig(config: PortainerConfig): Promise<PortainerConfig> {
    const res = await fetch(`${API_BASE}/admin/portainer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(config)
    });
    return handleResponse(res);
}

export async function getPortainerStatus(): Promise<PortainerStatus> {
    const res = await fetch(`${API_BASE}/admin/portainer/status`, { headers: { ...authHeaders() } });
    return handleResponse(res);
}

export async function deployPortainer(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/portainer/deploy`, { method: 'POST', headers: { ...authHeaders() } });
    return handleResponse(res);
}
// (Removed duplicate import)
