
// Fix: Import React to use React.ComponentType
import React from 'react';

export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
}

export interface Application {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  repositoryUrl: string;
  isEnabled: boolean;
  dockerCompose?: string;
}

export interface Session {
  id: string;
  appId: string;
  appName: string;
  appIcon: React.ComponentType<{ className?: string }>;
  userId: string;
  username: string;
  startTime: Date;
  isPersistent: boolean;
  accessUrl: string;
}

export enum Page {
  Login,
  Dashboard,
  Admin,
}