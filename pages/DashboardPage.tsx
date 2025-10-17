
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Session, Application } from '../types';
// Fix: Corrected import path for the api service.
import { getSessionsForUser, getAvailableApplications, startSession, stopSession } from '../services/api';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for launch options modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isPersistent, setIsPersistent] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        try {
          const [userSessions, availableApps] = await Promise.all([
            getSessionsForUser(user.id),
            getAvailableApplications(),
          ]);
          setSessions(userSessions);
          setApplications(availableApps);
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  const handleLaunchClick = (app: Application) => {
    setSelectedApp(app);
    setIsPersistent(false);
    setIsModalOpen(true);
  };

  const handleConfirmLaunch = async () => {
    if (selectedApp && user) {
      console.log(`Launching ${selectedApp.name} for ${user.username} with persistence: ${isPersistent}`);
      // Simulate API call
      const newSession = await startSession(user.id, selectedApp.id, isPersistent);
      if (newSession) {
          setSessions(prev => [...prev, newSession]);
          // Open new tab - this may be blocked by the sandbox environment
          window.open(`/session/${newSession.id}`, '_blank');
      }
      setIsModalOpen(false);
      setSelectedApp(null);
    }
  };

  const handleStopSession = async (sessionId: string) => {
    await stopSession(sessionId);
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const handleResumeSession = (sessionId: string) => {
    // Open new tab - this may be blocked by the sandbox environment
    window.open(`/session/${sessionId}`, '_blank');
  };

  if (loading) {
    return <div className="text-center p-8">Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-text-primary">My Dashboard</h1>

      {/* Active Sessions */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-text-secondary">Active Sessions</h2>
        {sessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map(session => (
              <div key={session.id} className="bg-surface rounded-lg shadow-lg p-5 flex flex-col justify-between">
                <div className="flex items-center mb-4">
                  <img src={session.applicationLogo} alt={session.applicationName} className="w-12 h-12 mr-4"/>
                  <div>
                    <h3 className="text-xl font-bold">{session.applicationName}</h3>
                    <p className="text-sm text-gray-400">Started: {new Date(session.startTime).toLocaleString()}</p>
                    <p className="text-sm text-gray-400">Data: {session.persistent ? 'Persistent' : 'Ephemeral'}</p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button onClick={() => handleResumeSession(session.id)} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-sm font-medium transition">Resume</button>
                  <button onClick={() => handleStopSession(session.id)} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition">Stop</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface rounded-lg p-6 text-center text-gray-400">
            <p>You have no active sessions.</p>
          </div>
        )}
      </section>

      {/* Available Applications */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4 text-text-secondary">Available Applications</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {applications.map(app => (
            <div key={app.id} className="bg-surface rounded-lg shadow-lg p-4 flex flex-col items-center justify-center text-center">
              <img src={app.logoUrl} alt={app.name} className="w-16 h-16 sm:w-20 sm:h-20 mb-4 object-contain"/>
              <h3 className="text-base sm:text-lg font-semibold mb-4 h-12 flex items-center justify-center">{app.name}</h3>
              <button onClick={() => handleLaunchClick(app)} className="w-full px-2 sm:px-4 py-2 bg-accent hover:bg-blue-600 rounded-md font-medium transition text-sm sm:text-base">Launch</button>
            </div>
          ))}
        </div>
      </section>

      {/* Launch Options Modal */}
      {isModalOpen && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Launch {selectedApp.name}</h2>
            <div className="flex items-center justify-between my-6">
              <span className="text-lg text-text-secondary">Persistent Data</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isPersistent} onChange={() => setIsPersistent(!isPersistent)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
            <p className="text-sm text-gray-400 mb-6">Enable this to keep your application data and profile settings after stopping the session.</p>
            <div className="flex justify-end space-x-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-secondary hover:bg-gray-600 rounded-md font-medium transition">Cancel</button>
              <button onClick={handleConfirmLaunch} className="px-4 py-2 bg-accent hover:bg-blue-600 rounded-md font-medium transition">Confirm & Launch</button>
            </div>
          </div>
        </div>
      )}
      
      <footer className="text-center text-xs text-gray-500 mt-12 py-4">
          <p>
              Webtop Launcher by bettodiaz. Visit on <a href="https://github.com/bettodiaz/webtop-launcher" target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline">GitHub</a>.
          </p>
      </footer>
    </div>
  );
};

export default DashboardPage;