
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { CubeTransparentIcon, Bars3Icon } from '@heroicons/react/24/outline';
// Fix: Corrected import path for the api service.
import { changePassword } from '../services/api';

const ChangePasswordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { user } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        if (!user) {
            setError("You are not logged in.");
            return;
        }
        setError('');
        setSuccess('');
        setLoading(true);
        try {
      const result = await changePassword(currentPassword, newPassword);
      // Assuming API returns nothing on success, or throws on error
      setSuccess('Password changed successfully.');
      setTimeout(() => {
        onClose();
      }, 2000);
        } catch (err) {
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    }

    return (
         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Change Password</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Current Password</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-900 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">New Password</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-900 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-900 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && <p className="text-green-500 text-sm">{success}</p>}
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-secondary hover:bg-gray-600 rounded-md font-medium transition">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-accent hover:bg-blue-600 rounded-md font-medium transition disabled:bg-gray-500">{loading ? 'Saving...' : 'Save'}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}


const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

  return (
    <header className="bg-surface shadow-md p-4 flex justify-between items-center z-10">
      <div className="flex items-center">
        {user?.isAdmin && (
            <button onClick={onMenuClick} className="lg:hidden mr-4 text-text-secondary hover:text-text-primary">
                <Bars3Icon className="h-6 w-6" />
            </button>
        )}
        <CubeTransparentIcon className="h-8 w-8 text-accent mr-3" aria-hidden="true" />
        <h1 className="text-xl md:text-2xl font-bold text-text-primary">Webtop Launcher</h1>
      </div>
      <div className="flex items-center">
        {user && (
          <div className="flex items-center space-x-2 md:space-x-4">
            <span className="hidden md:inline text-text-secondary">Welcome, {user.username} {user.isAdmin && '(Admin)'}</span>
            <button
              onClick={() => setPasswordModalOpen(true)}
              className="bg-secondary hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300 text-sm"
            >
              Change Password
            </button>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 text-sm"
            >
              Logout
            </button>
          </div>
        )}
      </div>
      {isPasswordModalOpen && <ChangePasswordModal onClose={() => setPasswordModalOpen(false)} />}
    </header>
  );
};

export default Header;
