import React, { useState, useCallback, useMemo } from 'react';
import type { User } from './types';
import { Page } from './types';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
// Fix: Use default import for AdminPage as it is a default export.
import AdminPage from './pages/AdminPage';
import { Header } from './components/Header';
import { useMockApi } from './hooks/useMockApi';
import { Modal } from './components/Modal';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Login);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [passwordChangeData, setPasswordChangeData] = useState({ current: '', new: '', confirm: '' });
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const api = useMockApi();

  const handleLogin = useCallback((username: string): boolean => {
    const user = api.findUser(username);
    if (user) {
      setCurrentUser(user);
      setCurrentPage(Page.Dashboard);
      return true;
    }
    return false;
  }, [api]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setCurrentPage(Page.Login);
  }, []);

  const handleNavigate = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);

  const handleOpenChangePassword = useCallback(() => {
    setIsChangePasswordModalOpen(true);
    setPasswordChangeData({ current: '', new: '', confirm: '' });
    setPasswordChangeError('');
  }, []);

  const handlePasswordChangeSubmit = useCallback(() => {
      if (passwordChangeData.new !== passwordChangeData.confirm) {
          setPasswordChangeError("New passwords do not match.");
          return;
      }
      if (!passwordChangeData.new || passwordChangeData.new.length < 6) {
          setPasswordChangeError("New password must be at least 6 characters long.");
          return;
      }
      if (currentUser) {
          const success = api.changePassword(currentUser.id, passwordChangeData.current, passwordChangeData.new);
          if (success) {
              alert("Password changed successfully!");
              setIsChangePasswordModalOpen(false);
          } else {
              setPasswordChangeError("Failed to change password. Please check your current password.");
          }
      }
  }, [api, currentUser, passwordChangeData]);

  const renderContent = () => {
    if (!currentUser) {
      return <LoginPage onLogin={handleLogin} />;
    }

    switch (currentPage) {
      case Page.Dashboard:
        return <DashboardPage user={currentUser} api={api} />;
      case Page.Admin:
        return currentUser.isAdmin ? <AdminPage user={currentUser} api={api} /> : <DashboardPage user={currentUser} api={api} />;
      default:
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      {currentUser && <Header user={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} onOpenChangePassword={handleOpenChangePassword} />}
      <main>
        {renderContent()}
      </main>
      <Modal isOpen={isChangePasswordModalOpen} onClose={() => setIsChangePasswordModalOpen(false)} title="Change Password">
          <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-300">Current Password</label>
                  <input type="password" value={passwordChangeData.current} onChange={e => setPasswordChangeData(d => ({ ...d, current: e.target.value }))} className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-300">New Password</label>
                  <input type="password" value={passwordChangeData.new} onChange={e => setPasswordChangeData(d => ({ ...d, new: e.target.value }))} className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-300">Confirm New Password</label>
                  <input type="password" value={passwordChangeData.confirm} onChange={e => setPasswordChangeData(d => ({ ...d, confirm: e.target.value }))} className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm" />
              </div>

              {passwordChangeError && <p className="text-sm text-red-500 text-center">{passwordChangeError}</p>}

              <div className="flex justify-end pt-4 space-x-3">
                   <button onClick={() => setIsChangePasswordModalOpen(false)} className="px-4 py-2 rounded-md bg-gray-600 text-white font-semibold hover:bg-gray-500 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handlePasswordChangeSubmit} className="bg-cyan-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-cyan-700 transition-colors">
                      Update Password
                    </button>
              </div>
          </div>
      </Modal>
    </div>
  );
};

export default App;