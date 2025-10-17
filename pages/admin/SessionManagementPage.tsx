import React, { useState, useEffect } from 'react';
import { Session } from '../../types';
import { getAllSessions, stopSession } from '../../services/api';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const ConfirmationModal: React.FC<{
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ title, message, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg p-6 w-full max-w-sm">
                <div className="flex items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-medium text-text-primary">{title}</h3>
                        <div className="mt-2">
                            <p className="text-sm text-text-secondary">{message}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button type="button" onClick={onConfirm} className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm`}>
                        Terminate
                    </button>
                    <button type="button" onClick={onCancel} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-secondary text-base font-medium text-text-primary hover:bg-gray-600 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

const NotificationToast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-5 right-5 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg flex items-center z-50">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            <span>{message}</span>
        </div>
    );
};

const SessionManagementPage: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [sessionToTerminate, setSessionToTerminate] = useState<Session | null>(null);
    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => {
        const fetchSessions = async () => {
            setLoading(true);
            const fetchedSessions = await getAllSessions();
            setSessions(fetchedSessions);
            setLoading(false);
        };
        fetchSessions();
    }, []);

    const handleConfirmTermination = async () => {
        if (!sessionToTerminate) return;
        
        const success = await stopSession(sessionToTerminate.id);
        if (success) {
            setSessions(prev => prev.filter(s => s.id !== sessionToTerminate.id));
            setNotification(`Session for ${sessionToTerminate.applicationName} terminated.`);
        } else {
            console.error('Failed to stop session.');
        }
        setSessionToTerminate(null);
    };

    if (loading) return <p>Loading sessions...</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-text-primary">Active Session Management</h1>

            <div className="bg-surface shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="border-b-2 border-gray-700 bg-secondary">
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">User</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Application</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Start Time</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Persistence</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.length > 0 ? sessions.map(session => (
                                <tr key={session.id} className="border-b border-gray-700 hover:bg-gray-700">
                                    <td className="px-5 py-5 text-sm">
                                        <p className="text-text-primary whitespace-no-wrap">{session.username}</p>
                                    </td>
                                    <td className="px-5 py-5 text-sm">
                                        <div className="flex items-center">
                                            <img src={session.applicationLogo} alt={session.applicationName} className="w-8 h-8 mr-3"/>
                                            <p className="text-text-primary whitespace-no-wrap">{session.applicationName}</p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-5 text-sm">
                                        <p className="text-text-secondary whitespace-no-wrap">{new Date(session.startTime).toLocaleString()}</p>
                                    </td>
                                    <td className="px-5 py-5 text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${session.persistent ? 'bg-green-800 text-green-100' : 'bg-yellow-800 text-yellow-100'}`}>
                                            {session.persistent ? 'Persistent' : 'Ephemeral'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-5 text-sm">
                                        <button onClick={() => setSessionToTerminate(session)} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition">Terminate</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-400">No active sessions.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {sessionToTerminate && (
                <ConfirmationModal 
                    title="Terminate Session"
                    message={`Are you sure you want to terminate this session for "${sessionToTerminate.applicationName}"? This action cannot be undone.`}
                    onConfirm={handleConfirmTermination}
                    onCancel={() => setSessionToTerminate(null)}
                />
            )}

            {notification && <NotificationToast message={notification} onClose={() => setNotification(null)} />}
        </div>
    );
};

export default SessionManagementPage;