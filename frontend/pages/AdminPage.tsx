import React, { useState } from 'react';
import type { User, Application, Session } from '../types';
import { useMockApi } from '../hooks/useMockApi';
import { PlusIcon } from '../components/icons/PlusIcon';
import { Modal } from '../components/Modal';
import { SyncIcon } from '../components/icons/SyncIcon';
import { DocumentTextIcon } from '../components/icons/DocumentTextIcon';

type AdminTab = 'users' | 'sessions' | 'images' | 'configuration';

interface AdminPageProps {
  api: ReturnType<typeof useMockApi>;
  user: User;
}

const AdminPage: React.FC<AdminPageProps> = ({ api, user }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  const tabs: { id: AdminTab, label: string }[] = [
    { id: 'users', label: 'User Management' },
    { id: 'sessions', label: 'Session Management' },
    { id: 'images', label: 'Image Management' },
    { id: 'configuration', label: 'Configuration' },
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-white mb-6">Admin Panel</h1>
      <div className="border-b border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div>
        {activeTab === 'users' && <UserManagementTab api={api} user={user} />}
        {activeTab === 'sessions' && <SessionManagementTab api={api} />}
        {activeTab === 'images' && <ImageManagementTab api={api} />}
        {activeTab === 'configuration' && <ConfigurationTab />}
      </div>
    </div>
  );
};

// --- User Management Tab ---
interface UserManagementTabProps {
    api: ReturnType<typeof useMockApi>;
    user: User;
}

const UserManagementTab: React.FC<UserManagementTabProps> = ({ api, user: currentUser }) => {
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [isNewUserAdmin, setIsNewUserAdmin] = useState(false);
    const [userToReset, setUserToReset] = useState<User | null>(null);
    const users = api.getAllUsers();

    const handleAddUser = () => {
        if(newUsername.trim()) {
            api.addUser(newUsername.trim(), isNewUserAdmin);
            setIsAddUserModalOpen(false);
            setNewUsername('');
            setIsNewUserAdmin(false);
        }
    }

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => setIsAddUserModalOpen(true)} className="flex items-center bg-cyan-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-cyan-700 transition-colors">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add User
                </button>
            </div>
            <div className="bg-gray-800 rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Username</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                   <label htmlFor={`admin-toggle-${user.id}`} className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input 
                                            type="checkbox" 
                                            id={`admin-toggle-${user.id}`} 
                                            className="sr-only" 
                                            checked={user.isAdmin} 
                                            onChange={() => api.toggleUserAdmin(user.id)}
                                            disabled={user.id === currentUser.id}
                                        />
                                        <div className={`block w-14 h-8 rounded-full ${user.id === currentUser.id ? 'bg-gray-700' : 'bg-gray-600'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${user.isAdmin ? (user.id === currentUser.id ? 'translate-x-6 bg-cyan-700' : 'translate-x-6 bg-cyan-400') : ''}`}></div>
                                    </div>
                                    <span className={`ml-3 font-medium ${user.id === currentUser.id ? 'text-gray-500' : 'text-gray-300'}`}>
                                        {user.isAdmin ? 'Admin' : 'User'}
                                    </span>
                                  </label>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                    <button
                                        onClick={() => setUserToReset(user)}
                                        className="text-cyan-500 hover:text-cyan-400 disabled:text-gray-600 disabled:cursor-not-allowed"
                                        disabled={user.id === currentUser.id}
                                    >
                                        Reset Password
                                    </button>
                                    <button
                                        onClick={() => api.deleteUser(user.id)}
                                        className="text-red-500 hover:text-red-400 disabled:text-gray-600 disabled:cursor-not-allowed"
                                        disabled={user.id === currentUser.id}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <Modal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} title="Add New User">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="new-username" className="block text-sm font-medium text-gray-300">Username</label>
                        <input type="text" id="new-username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm" />
                    </div>
                    <div className="flex items-center">
                        <input id="is-admin" type="checkbox" checked={isNewUserAdmin} onChange={(e) => setIsNewUserAdmin(e.target.checked)} className="h-4 w-4 text-cyan-600 bg-gray-900 border-gray-700 rounded focus:ring-cyan-500"/>
                        <label htmlFor="is-admin" className="ml-2 block text-sm text-gray-300">Make Admin</label>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button onClick={handleAddUser} className="bg-cyan-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-cyan-700 transition-colors">Create User</button>
                    </div>
                </div>
            </Modal>
             <Modal 
                isOpen={!!userToReset} 
                onClose={() => setUserToReset(null)} 
                title={`Reset Password for ${userToReset?.username}?`}>
                <p className="text-gray-300">
                    Are you sure you want to reset the password for this user? 
                    This action cannot be undone.
                </p>
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => setUserToReset(null)}
                      className="px-4 py-2 rounded-md bg-gray-600 text-white font-semibold hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                          if (userToReset) {
                              api.resetPassword(userToReset.id);
                          }
                          setUserToReset(null);
                      }}
                      className="px-4 py-2 rounded-md bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition-colors"
                    >
                      Confirm Reset
                    </button>
                </div>
            </Modal>
        </div>
    );
};


// --- Session Management Tab ---
const SessionManagementTab: React.FC<{ api: ReturnType<typeof useMockApi> }> = ({ api }) => {
  const sessions = api.getAllSessions();
  return (
    <div className="bg-gray-800 rounded-lg shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-700">
            <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Application</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Started</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Profile</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {sessions.length > 0 ? sessions.map(session => (
            <tr key={session.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{session.appName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{session.username}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{session.startTime.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{session.isPersistent ? 'Persistent' : 'Ephemeral'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => api.stopSession(session.id)} className="text-red-500 hover:text-red-400">Stop</button>
              </td>
            </tr>
          )) : (
            <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">No active sessions across all users.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// --- Image Management Tab ---
const ImageManagementTab: React.FC<{ api: ReturnType<typeof useMockApi> }> = ({ api }) => {
  const applications = api.getAllApplications();
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [composeContent, setComposeContent] = useState('');

  const handleSync = async () => {
    setIsSyncing(true);
    await api.syncApplicationsFromSource();
    setIsSyncing(false);
  };

  const handleOpenComposeModal = (app: Application) => {
    setEditingApp(app);
    setComposeContent(app.dockerCompose || `# No docker-compose configuration found for ${app.name}`);
  };

  const handleCloseComposeModal = () => {
    setEditingApp(null);
    setComposeContent('');
  };

  const handleSaveCompose = () => {
    if (editingApp) {
      api.updateApplicationCompose(editingApp.id, composeContent);
      handleCloseComposeModal();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-400">Manage and discover Docker images available to users.</p>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center justify-center bg-cyan-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-cyan-700 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          {isSyncing ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <SyncIcon className="h-5 w-5 mr-2" />
          )}
          {isSyncing ? 'Syncing...' : 'Sync from Source'}
        </button>
      </div>
      <div className="space-y-4">
        {applications.map(app => (
          <div key={app.id} className="bg-gray-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between shadow gap-4">
            <div className="flex items-center space-x-4">
              <app.icon className="h-10 w-10 text-cyan-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-white">{app.name}</p>
                <a href={app.repositoryUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-500 hover:underline break-all">{app.repositoryUrl}</a>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-4 flex-shrink-0">
               <span className={`text-sm font-medium ${app.isEnabled ? 'text-green-400' : 'text-gray-400'}`}>
                {app.isEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <label htmlFor={`toggle-${app.id}`} className="flex items-center cursor-pointer">
                  <div className="relative">
                      <input type="checkbox" id={`toggle-${app.id}`} className="sr-only" checked={app.isEnabled} onChange={() => api.toggleApplicationEnabled(app.id)} />
                      <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${app.isEnabled ? 'translate-x-6 bg-cyan-400' : ''}`}></div>
                  </div>
              </label>
              <div className="border-l border-gray-700 h-8"></div>
               <button
                  onClick={() => handleOpenComposeModal(app)}
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700"
                  title="View/Edit Docker Compose"
                >
                  <DocumentTextIcon className="h-5 w-5" />
                </button>
            </div>
          </div>
        ))}
      </div>
      <Modal
        isOpen={!!editingApp}
        onClose={handleCloseComposeModal}
        title={`Docker Compose for ${editingApp?.name}`}
        size="2xl"
      >
        <div>
          <textarea
            value={composeContent}
            onChange={(e) => setComposeContent(e.target.value)}
            className="w-full h-96 bg-gray-900 border border-gray-700 rounded-md text-gray-300 font-mono text-sm p-4 focus:ring-cyan-500 focus:border-cyan-500"
            spellCheck="false"
            aria-label={`Docker compose content for ${editingApp?.name}`}
          />
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={handleCloseComposeModal}
              className="px-4 py-2 rounded-md bg-gray-600 text-white font-semibold hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCompose}
              className="px-4 py-2 rounded-md bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// --- Configuration Tab ---
const ConfigurationTab: React.FC = () => {
    const [portainerUrl, setPortainerUrl] = useState('');
    const [portainerApiKey, setPortainerApiKey] = useState('');
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployedPortainerInfo, setDeployedPortainerInfo] = useState<{ip: string, status: string} | null>(null);

    const handleSave = () => {
        // In a real app, this would save to a config file or backend.
        console.log("Saving Portainer config:", { portainerUrl, portainerApiKey });
        setDeployedPortainerInfo(null); // Manual config overrides deployed status view
        alert('Configuration saved! (Check console)');
    };
    
    const handleDeploy = () => {
        // This would trigger a script or backend process.
        console.log("Triggering Portainer deployment...");
        setIsDeploying(true);
        setTimeout(() => {
             setDeployedPortainerInfo({
                ip: 'localhost:9443',
                status: 'Running'
            });
            setIsDeploying(false);
        }, 2000); // Simulate deployment time
    }

    const isConfigured = portainerUrl && portainerApiKey;

    return (
        <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-white mb-4">Portainer CE Connection</h2>
                <p className="text-gray-400 mb-6">
                    Enter the details for your existing Portainer instance. This will be used to manage Docker containers.
                </p>
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                    <div>
                        <label htmlFor="portainer-url" className="block text-sm font-medium text-gray-300">Portainer API URL</label>
                        <input
                            type="text"
                            id="portainer-url"
                            value={portainerUrl}
                            onChange={(e) => setPortainerUrl(e.target.value)}
                            className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                            placeholder="e.g., http://192.168.1.10:9000"
                        />
                    </div>
                    <div>
                        <label htmlFor="portainer-key" className="block text-sm font-medium text-gray-300">Portainer API Key (Access Token)</label>
                        <input
                            type="password"
                            id="portainer-key"
                            value={portainerApiKey}
                            onChange={(e) => setPortainerApiKey(e.target.value)}
                            className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                            placeholder="Enter your Portainer access token"
                        />
                         <p className="mt-2 text-xs text-gray-500">
                           You can generate an API key from your Portainer user profile settings under "Access tokens".
                        </p>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="submit" className="bg-cyan-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-cyan-700 transition-colors">
                            Save Configuration
                        </button>
                    </div>
                </form>
            </div>
            
            {deployedPortainerInfo ? (
                <div className="bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Managed Portainer Status</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-medium">Status:</span>
                            <span className="text-green-400 font-semibold flex items-center">
                                <span className="h-2 w-2 bg-green-400 rounded-full mr-2"></span>
                                {deployedPortainerInfo.status}
                            </span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-medium">Endpoint:</span>
                            <span className="text-white font-mono bg-gray-700 px-2 py-1 rounded">{deployedPortainerInfo.ip}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-medium">Configuration:</span>
                            <span className="text-white">Managed by Webtop Launcher</span>
                        </div>
                    </div>
                     <p className="mt-4 text-xs text-gray-500">
                        Please enter the URL and a generated API Key from the new Portainer instance above and save the configuration.
                    </p>
                </div>
            ) : (
                 !isConfigured && (
                     <div className="bg-gray-800 rounded-lg shadow p-6 text-center">
                        <h3 className="text-lg font-semibold text-white">No Portainer Instance?</h3>
                        <p className="text-gray-400 mt-2 mb-4">
                            If you don't have Portainer running, we can help you deploy a new instance.
                        </p>
                        <button onClick={handleDeploy} disabled={isDeploying} className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-500 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed">
                            {isDeploying ? 'Deploying...' : 'Deploy Portainer For Me'}
                        </button>
                    </div>
                 )
            )}
        </div>
    );
};

export default AdminPage;