import { User, Session, Application, PortainerConfig, PortainerStatus } from '../types';

const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE) || process.env.API_BASE || 'http://localhost:8080/api';
function authHeaders() {
    const token = localStorage.getItem('jwt');
    return token ? { Authorization: `Bearer ${token}` } : {};
async function handleResponse(res: Response) {
    if (!res.ok) {
        const text = await res.text();
    if (res.status === 204) return null;
    return res.json();
}
// Auth
export async function login(username: string, password: string): Promise<void> {
    const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
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
        body: JSON.stringify({ currentPassword: current, newPassword }),
    });
    return handleResponse(res);
}

// Users (admin)
export async function getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/admin/users`, { headers: { ...authHeaders() } });
    return handleResponse(res);
export async function addUser(user: Omit<User, 'id'>, password: string): Promise<User> {
    const res = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ ...user, password }),
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
// Applications
export async function getApplications(): Promise<Application[]> {
    const res = await fetch(`${API_BASE}/admin/apps`, { headers: { ...authHeaders() } });
export async function getAvailableApplications(): Promise<Application[]> {
    const res = await fetch(`${API_BASE}/apps`, { headers: { ...authHeaders() } });
    return handleResponse(res);
export async function updateApplication(app: Application): Promise<Application> {
    const res = await fetch(`${API_BASE}/admin/apps/${app.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(app),
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
        body: JSON.stringify({ applicationId, isPersistent }),
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
        body: JSON.stringify(config),
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
import { User, Session, Application, PortainerConfig, PortainerStatus } from '../types';

// --- MOCK DATABASE ---
const initialUsers: User[] = [
  { id: '1', username: 'admin', isAdmin: true },
  { id: '2', username: 'user', isAdmin: false },
];
const initialApplications: Application[] = [
    { id: 'app-1', name: 'VS Code', logoUrl: 'https://cdn.icon-icons.com/icons2/2107/PNG/512/file_type_vscode_icon_130084.png', repositoryUrl: 'https://github.com/linuxserver/docker-code-server', dockerCompose: '...', isEnabled: true },
    { id: 'app-2', name: 'Ubuntu Desktop', logoUrl: 'https://cdn.icon-icons.com/icons2/1508/PNG/512/ubuntu_104494.png', repositoryUrl: 'https://github.com/linuxserver/docker-webtop', dockerCompose: '...', isEnabled: true },
    { id: 'app-3', name: 'Firefox', logoUrl: 'https://cdn.icon-icons.com/icons2/2415/PNG/512/firefox_plain_logo_icon_146338.png', repositoryUrl: 'https://github.com/linuxserver/docker-firefox', dockerCompose: '...', isEnabled: false },
];
let sessions: Session[] = [];
let portainerConfig: PortainerConfig = { url: 'http://localhost:9000', apiKey: 'test_api_key' };
let portainerStatus: PortainerStatus = { status: 'stopped', uptime: '', version: '' };

const getUsersFromStorage = (): User[] => {
    const stored = localStorage.getItem('users');
    if(stored) return JSON.parse(stored);
    localStorage.setItem('users', JSON.stringify(initialUsers));
    return initialUsers;
}

const getAppsFromStorage = (): Application[] => {
    const stored = localStorage.getItem('applications');
    if(stored) return JSON.parse(stored);
    localStorage.setItem('applications', JSON.stringify(initialApplications));
    return initialApplications;
}


let users: User[] = getUsersFromStorage();
let applications: Application[] = getAppsFromStorage();
const passwords = new Map<string, string>([['1', 'password'], ['2', 'password']]);


// --- Helper Functions ---
const persistUsers = () => localStorage.setItem('users', JSON.stringify(users));
const persistApplications = () => localStorage.setItem('applications', JSON.stringify(applications));

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));


// --- AUTH ---
export const mockLogin = async (username: string, password_input: string): Promise<User | null> => {
    await delay(500);
    const user = users.find(u => u.username === username);
    if (user && passwords.get(user.id) === password_input) {
        return { ...user };
    }
    return null;
}

export const mockLogout = () => {
    // No-op for mock
};

export const mockChangePassword = async (userId: string, current: string, newPass: string) => {
    await delay(500);
    if(passwords.get(userId) === current) {
        passwords.set(userId, newPass);
        return { success: true, message: 'Password changed successfully.' };
    }
    return { success: false, message: 'Incorrect current password.' };
}

// --- USERS ---
export const getUsers = async (): Promise<User[]> => {
    await delay(300);
    return [...users];
}

export const addUser = async (userData: Omit<User, 'id'>, password: string): Promise<User> => {
    await delay(500);
    const newUser: User = { ...userData, id: String(Date.now()) };
    users.push(newUser);
    passwords.set(newUser.id, password);
    persistUsers();
    return newUser;
}

export const deleteUser = async (userId: string): Promise<boolean> => {
    await delay(500);
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
        users.splice(index, 1);
        passwords.delete(userId);
        persistUsers();
        return true;
    }
    return false;
}

export const resetUserPassword = async (userId: string): Promise<boolean> => {
    await delay(500);
    if (passwords.has(userId)) {
        passwords.set(userId, 'password');
        console.log(`Password for user ID ${userId} has been reset to "password".`);
        return true;
    }
    return false;
}

// --- SESSIONS ---
export const getSessionsForUser = async (userId: string): Promise<Session[]> => {
    await delay(500);
    return sessions.filter(s => s.userId === userId);
}

export const getAllSessions = async (): Promise<Session[]> => {
    await delay(500);
    return sessions.map(s => {
        const user = users.find(u => u.id === s.userId);
        return { ...s, username: user?.username || 'Unknown' };
    });
}

export const startSession = async (userId: string, applicationId: string, isPersistent: boolean): Promise<Session | null> => {
    await delay(1000);
    const app = applications.find(a => a.id === applicationId);
    const user = users.find(u => u.id === userId);
    if (!app || !user) return null;

    const newSession: Session = {
        id: `session-${Date.now()}`,
        applicationName: app.name,
        applicationLogo: app.logoUrl,
        userId: user.id,
        username: user.username,
        startTime: new Date().toISOString(),
        persistent: isPersistent
    };
    sessions.push(newSession);
    return newSession;
}

export const stopSession = async (sessionId: string): Promise<boolean> => {
    await delay(500);
    const index = sessions.findIndex(s => s.id === sessionId);
    if (index !== -1) {
        sessions.splice(index, 1);
        return true;
    }
    return false;
}

// --- APPLICATIONS ---
export const getAvailableApplications = async (): Promise<Application[]> => {
    await delay(500);
    return applications.filter(a => a.isEnabled);
}

export const getApplications = async (): Promise<Application[]> => {
    await delay(500);
    return [...applications];
}

export const updateApplication = async (updatedApp: Application): Promise<Application | null> => {
    await delay(500);
    const index = applications.findIndex(a => a.id === updatedApp.id);
    if (index !== -1) {
        applications[index] = updatedApp;
        persistApplications();
        return updatedApp;
    }
    return null;
}

// --- PORTAINER CONFIG ---
export const getPortainerConfig = async (): Promise<PortainerConfig> => {
    await delay(200);
    return { ...portainerConfig };
}

export const updatePortainerConfig = async (newConfig: PortainerConfig): Promise<PortainerConfig> => {
    await delay(500);
    portainerConfig = newConfig;
    return { ...portainerConfig };
}

export const getPortainerStatus = async (): Promise<PortainerStatus> => {
    await delay(800);
    return { ...portainerStatus };
}

export const deployPortainer = async (): Promise<{ success: boolean, message: string, config?: PortainerConfig }> => {
    portainerStatus = { status: 'deploying', uptime: '', version: '' };
    await delay(5000);
    const success = Math.random() > 0.2; // 80% success rate
    if (success) {
        portainerStatus = { status: 'running', uptime: '1s', version: '2.18.4' };
        portainerConfig = { url: 'http://localhost:9000', apiKey: 'newly_generated_secure_key' };
        return { success: true, message: 'Portainer deployed successfully!', config: portainerConfig };
    } else {
        portainerStatus = { status: 'error', uptime: '', version: '' };
        return { success: false, message: 'Deployment failed. Check orchestrator logs.' };
    }
}