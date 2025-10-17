import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { getUsers, addUser, deleteUser, resetUserPassword } from '../../services/api';
import { PlusIcon, TrashIcon, KeyIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const AddUserModal: React.FC<{
    onClose: () => void;
    onSave: (user: Omit<User, 'id'>, password?: string) => void;
}> = ({ onClose, onSave }) => {
    const [userData, setUserData] = useState({ username: '', isAdmin: false });
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if(password.length < 4) {
            setError("Password must be at least 4 characters long.");
            return;
        }
        onSave({ username: userData.username, isAdmin: userData.isAdmin }, password);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Add New User</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Username</label>
                        <input
                            type="text"
                            value={userData.username}
                            onChange={e => setUserData({ ...userData, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-900 rounded-md shadow-sm"
                        />
                         <p className="text-xs text-gray-400 mt-1">Lowercase, no spaces.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-900 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-900 rounded-md shadow-sm" />
                    </div>
                    <div className="flex items-center">
                        <input
                           id="isAdmin"
                           type="checkbox"
                           checked={userData.isAdmin}
                           onChange={e => setUserData({ ...userData, isAdmin: e.target.checked })}
                           className="h-4 w-4 text-accent bg-gray-700 border-gray-600 rounded focus:ring-accent"
                         />
                         <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-300">Is Admin?</label>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-secondary hover:bg-gray-600 rounded-md font-medium transition">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-accent hover:bg-blue-600 rounded-md font-medium transition">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ConfirmationModal: React.FC<{
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    confirmColor?: string;
}> = ({ title, message, onConfirm, onCancel, confirmText = 'Confirm', confirmColor = 'bg-red-600 hover:bg-red-700' }) => {
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
                    <button type="button" onClick={onConfirm} className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white ${confirmColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm`}>
                        {confirmText}
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


const UserManagementPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [confirmation, setConfirmation] = useState<{
        action: 'delete' | 'reset';
        user: User;
    } | null>(null);
    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
        setLoading(false);
    };

    const handleSaveUser = async (user: Omit<User, 'id'>, password?: string) => {
        await addUser(user, password!);
        fetchUsers();
        setAddModalOpen(false);
        setNotification(`User "${user.username}" created successfully.`);
    }
    
    const handleConfirmAction = async () => {
        if (!confirmation) return;
        const { action, user } = confirmation;

        if (action === 'delete') {
            await deleteUser(user.id);
            setNotification(`User "${user.username}" has been deleted.`);
        } else if (action === 'reset') {
            await resetUserPassword(user.id);
            setNotification(`Password for "${user.username}" has been reset.`);
        }
        
        setConfirmation(null);
        fetchUsers();
    };

    if (loading) return <p>Loading users...</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-text-primary">User Management</h1>
                <button
                    onClick={() => setAddModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-accent hover:bg-blue-600 rounded-md font-medium transition"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add User
                </button>
            </div>

            <div className="bg-surface shadow-md rounded-lg overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="border-b-2 border-gray-700 bg-secondary">
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Username</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Role</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700">
                                    <td className="px-5 py-5 text-sm">
                                        <p className="text-text-primary whitespace-no-wrap">{user.username}</p>
                                    </td>
                                    <td className="px-5 py-5 text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isAdmin ? 'bg-indigo-800 text-indigo-100' : 'bg-gray-600 text-gray-100'}`}>
                                            {user.isAdmin ? 'Admin' : 'User'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-5 text-sm space-x-2">
                                        <button onClick={() => setConfirmation({ action: 'reset', user })} className="text-yellow-400 hover:text-yellow-300 p-1" title="Reset Password"><KeyIcon className="h-5 w-5" /></button>
                                        <button onClick={() => setConfirmation({ action: 'delete', user })} className="text-red-400 hover:text-red-300 p-1" title="Delete User"><TrashIcon className="h-5 w-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isAddModalOpen && <AddUserModal onClose={() => setAddModalOpen(false)} onSave={handleSaveUser} />}
            
            {confirmation && (
                <ConfirmationModal 
                    title={confirmation.action === 'delete' ? 'Delete User' : 'Reset Password'}
                    message={
                        confirmation.action === 'delete' 
                        ? `Are you sure you want to delete the user "${confirmation.user.username}"? This action cannot be undone.`
                        : `Are you sure you want to reset the password for "${confirmation.user.username}"? The new password will be "password".`
                    }
                    onConfirm={handleConfirmAction}
                    onCancel={() => setConfirmation(null)}
                    confirmText={confirmation.action === 'delete' ? 'Delete' : 'Reset'}
                    confirmColor={confirmation.action === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'}
                />
            )}

            {notification && <NotificationToast message={notification} onClose={() => setNotification(null)} />}
        </div>
    );
};

export default UserManagementPage;