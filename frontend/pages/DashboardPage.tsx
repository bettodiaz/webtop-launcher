
import React, { useState } from 'react';
import type { User, Application, Session } from '../types';
import api from '../api/client';
import { Modal } from '../components/Modal';

interface DashboardPageProps {
  user: User;
  api: ReturnType<typeof useMockApi>;
}

const AppCard: React.FC<{ app: Application, onLaunch: (appId: string) => void }> = ({ app, onLaunch }) => (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
        <div className="p-6">
            <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                    <app.icon className="h-12 w-12 text-cyan-400" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-white">{app.name}</h3>
                    <p className="text-gray-400 mt-1 text-sm">{app.description}</p>
                </div>
            </div>
            <div className="mt-6">
                <button
                    onClick={() => onLaunch(app.id)}
                    className="w-full bg-cyan-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-cyan-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                    Launch
                </button>
            </div>
        </div>
    </div>
);

const SessionCard: React.FC<{ session: Session, onStop: (sessionId: string) => void }> = ({ session, onStop }) => (
    <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between shadow">
        <div className="flex items-center space-x-4">
            <session.appIcon className="h-10 w-10 text-cyan-400" />
            <div>
                <p className="font-semibold text-white">{session.appName}</p>
                <p className="text-sm text-gray-400">
                    Started: {session.startTime.toLocaleTimeString()} {session.isPersistent ? '(Persistent)' : '(Ephemeral)'}
                </p>
            </div>
        </div>
        <div className="flex space-x-2">
            <button
                onClick={() => window.open(session.accessUrl, '_blank')}
                className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors"
            >
                Resume
            </button>
            <button
                onClick={() => onStop(session.id)}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors"
            >
                Stop
            </button>
        </div>
    </div>
);


export const DashboardPage: React.FC<DashboardPageProps> = ({ user, api }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isPersistent, setIsPersistent] = useState(false);

  const userSessions = api.getUserSessions(user.id);
  const availableApps = api.getAllApplications().filter(app => app.isEnabled);

  const handleLaunchClick = (appId: string) => {
    const app = availableApps.find(a => a.id === appId);
    if (app) {
      setSelectedApp(app);
      setIsModalOpen(true);
    }
  };

  const confirmLaunch = () => {
    if (selectedApp) {
      const newSession = api.launchSession(selectedApp.id, user.id, isPersistent);
      if (newSession) {
          window.open(newSession.accessUrl, '_blank');
      }
    }
    setIsModalOpen(false);
    setSelectedApp(null);
    setIsPersistent(false);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Available Applications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableApps.map(app => (
            <AppCard key={app.id} app={app} onLaunch={handleLaunchClick} />
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Active Sessions</h2>
        {userSessions.length > 0 ? (
          <div className="space-y-4">
            {userSessions.map(session => (
              <SessionCard key={session.id} session={session} onStop={api.stopSession} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">You have no active sessions.</p>
            <p className="text-gray-500 mt-2 text-sm">Launch an application to get started.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Launch ${selectedApp?.name}`}>
        <div>
          <p className="text-gray-300 mb-6">Configure your session before launching.</p>
          <div className="flex items-center justify-between bg-gray-700 p-4 rounded-md">
            <label htmlFor="persistent-profile" className="font-medium text-white">
              Persistent Profile
              <p className="text-sm text-gray-400 font-normal">Saves your data and settings between sessions.</p>
            </label>
            <input
              type="checkbox"
              id="persistent-profile"
              checked={isPersistent}
              onChange={(e) => setIsPersistent(e.target.checked)}
              className="h-6 w-6 rounded border-gray-600 bg-gray-900 text-cyan-600 focus:ring-cyan-500"
            />
          </div>
          <div className="mt-8 flex justify-end space-x-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-md bg-gray-600 text-white font-semibold hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmLaunch}
              className="px-4 py-2 rounded-md bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition-colors"
            >
              Launch Now
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
