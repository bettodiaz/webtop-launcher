import { useState, useCallback } from 'react';
import type { User, Application, Session } from '../types';
import { CodeIcon } from '../components/icons/CodeIcon';
import { FirefoxIcon } from '../components/icons/FirefoxIcon';
import { DockerIcon } from '../components/icons/DockerIcon';

const initialUsers: User[] = [
  { id: '1', username: 'admin', isAdmin: true },
  { id: '2', username: 'user', isAdmin: false },
];

const initialApplications: Application[] = [
  {
    id: 'app-1',
    name: 'VS Code',
    description: 'A versatile code editor. Options in all Selkies-based GUI containers.',
    icon: CodeIcon,
    repositoryUrl: 'https://github.com/linuxserver/docker-code-server',
    isEnabled: true,
    dockerCompose: `version: "2.1"
services:
  code-server:
    image: lscr.io/linuxserver/code-server:latest
    container_name: code-server
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - PASSWORD=password
      - SUDO_PASSWORD=password
    volumes:
      - ./config:/config
    ports:
      - 8443:8443
    restart: unless-stopped`,
  },
  {
    id: 'app-2',
    name: 'Firefox',
    description: 'The full-featured Firefox browser. Options in all Selkies-based GUI containers.',
    icon: FirefoxIcon,
    repositoryUrl: 'https://github.com/linuxserver/docker-firefox',
    isEnabled: true,
    dockerCompose: `version: "2.1"
services:
  firefox:
    image: lscr.io/linuxserver/firefox:latest
    container_name: firefox
    security_opt:
      - seccomp:unconfined
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - ./config:/config
    ports:
      - 3000:3000
    shm_size: '1gb'
    restart: unless-stopped`,
  },
  {
    id: 'app-3',
    name: 'Webtop',
    description: 'A full Linux desktop environment (XFCE). Options in all Selkies-based GUI containers.',
    icon: DockerIcon,
    repositoryUrl: 'https://github.com/linuxserver/docker-webtop',
    isEnabled: false,
    dockerCompose: `version: "2.1"
services:
  webtop:
    image: lscr.io/linuxserver/webtop:latest
    container_name: webtop
    security_opt:
      - seccomp:unconfined
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - ./config:/config
      - /var/run/docker.sock:/var/run/docker.sock
    ports:
      - 3000:3000
    restart: unless-stopped`,
  },
];

// This simulates the data that would be fetched from a GitHub API scan
const newlyFetchedApplications: Application[] = [
    {
        id: 'app-4',
        name: 'Krita',
        description: 'A professional painting program. Options in all Selkies-based GUI containers.',
        icon: DockerIcon,
        repositoryUrl: 'https://github.com/linuxserver/docker-krita',
        isEnabled: false,
        dockerCompose: `version: "2.1"
services:
  krita:
    image: lscr.io/linuxserver/krita:latest
    container_name: krita
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - ./config:/config
    ports:
      - 3000:3000
    shm_size: '2gb'
    restart: unless-stopped`,
    },
    {
        id: 'app-5',
        name: 'GIMP',
        description: 'GNU Image Manipulation Program. Options in all Selkies-based GUI containers.',
        icon: DockerIcon,
        repositoryUrl: 'https://github.com/linuxserver/docker-gimp',
        isEnabled: false,
        dockerCompose: `version: "2.1"
services:
  gimp:
    image: lscr.io/linuxserver/gimp:latest
    container_name: gimp
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - ./config:/config
    ports:
      - 3000:3000
    shm_size: '2gb'
    restart: unless-stopped`,
    },
    {
        id: 'app-6',
        name: 'Digikam',
        description: 'Advanced open-source digital photo management. Options in all Selkies-based GUI containers.',
        icon: DockerIcon,
        repositoryUrl: 'https://github.com/linuxserver/docker-digikam',
        isEnabled: false,
        dockerCompose: `version: "2.1"
services:
  digikam:
    image: lscr.io/linuxserver/digikam:latest
    container_name: digikam
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - ./config:/config
      - /path/to/photos:/photos
      - /path/to/database:/database
    ports:
      - 5000:5000
    restart: unless-stopped`,
    }
];


export const useMockApi = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [sessions, setSessions] = useState<Session[]>([]);

  const findUser = useCallback((username: string) => users.find(u => u.username === username), [users]);

  const getUserSessions = useCallback((userId: string) => sessions.filter(s => s.userId === userId), [sessions]);

  const launchSession = useCallback((appId: string, userId: string, isPersistent: boolean): Session | undefined => {
    const app = applications.find(a => a.id === appId);
    const user = users.find(u => u.id === userId);
    if (!app || !user) return undefined;

    const newSession: Session = {
      id: `session-${Date.now()}`,
      appId: app.id,
      appName: app.name,
      appIcon: app.icon,
      userId: user.id,
      username: user.username,
      startTime: new Date(),
      isPersistent,
      accessUrl: `https://webtop.launcher/session/${Math.random().toString(36).substring(2)}`,
    };
    setSessions(prev => [...prev, newSession]);
    return newSession;
  }, [applications, users]);

  const stopSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  }, []);
  
  const getAllUsers = useCallback(() => users, [users]);
  
  const getAllSessions = useCallback(() => sessions, [sessions]);
  
  const getAllApplications = useCallback(() => applications, [applications]);
  
  const toggleApplicationEnabled = useCallback((appId: string) => {
    setApplications(prev => prev.map(app => app.id === appId ? { ...app, isEnabled: !app.isEnabled } : app));
  }, []);

  const addUser = useCallback((username: string, isAdmin: boolean) => {
    const newUser: User = { id: `user-${Date.now()}`, username, isAdmin };
    setUsers(prev => [...prev, newUser]);
  }, []);

  const deleteUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, []);

  const toggleUserAdmin = useCallback((userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, isAdmin: !user.isAdmin } : user
    ));
  }, []);

  const changePassword = useCallback((userId: string, currentPassword: string, newPassword: string): boolean => {
    // Mock implementation: In a real app, you'd validate the old password.
    // For this mock, we'll just log it and assume success.
    console.log(`Attempting to change password for user ${userId}.`);
    // Simulate success
    return true;
  }, []);

  const resetPassword = useCallback((userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
        // In a real app, you'd generate a secure temp password and email it.
        // For this mock, we'll alert a default password.
        alert(`Password for user "${user.username}" has been reset to "password123".`);
    }
  }, [users]);

  const syncApplicationsFromSource = useCallback(async () => {
    console.log('Simulating fetch from linuxserver.io...');
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

    setApplications(currentApps => {
      const existingUrls = new Set(currentApps.map(app => app.repositoryUrl));
      // Add a unique ID to the fetched apps and ensure they are disabled by default
      const appsToAdd = newlyFetchedApplications
        .filter(fetchedApp => !existingUrls.has(fetchedApp.repositoryUrl))
        .map((app, index) => ({
          ...app,
          id: `app-fetched-${Date.now()}-${index}`,
          isEnabled: false, // Ensure all newly synced apps are disabled by default
        }));

      return [...currentApps, ...appsToAdd];
    });

    console.log('Sync complete.');
  }, []);
  
  const updateApplicationCompose = useCallback((appId: string, compose: string) => {
    setApplications(prev => prev.map(app => app.id === appId ? { ...app, dockerCompose: compose } : app));
  }, []);


  return {
    findUser,
    getUserSessions,
    launchSession,
    stopSession,
    getAllUsers,
    getAllSessions,
    getAllApplications,
    toggleApplicationEnabled,
    addUser,
    deleteUser,
    toggleUserAdmin,
    changePassword,
    resetPassword,
    syncApplicationsFromSource,
    updateApplicationCompose,
  };
};