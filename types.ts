export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
}

export interface Session {
  id: string;
  applicationName: string;
  applicationLogo: string;
  userId: string;
  username?: string; 
  startTime: string;
  persistent: boolean;
}

export interface Application {
  id: string;
  name: string;
  logoUrl: string;
  repositoryUrl: string;
  dockerCompose: string;
  isEnabled: boolean;
}

export interface PortainerConfig {
    url: string;
    apiKey: string;
}

export interface PortainerStatus {
    status: 'running' | 'stopped' | 'error' | 'deploying';
    uptime: string;
    version: string;
}
