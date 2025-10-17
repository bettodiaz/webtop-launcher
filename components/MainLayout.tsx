
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '../hooks/useNavigation';
import DashboardPage from '../pages/DashboardPage';
// Fix: Corrected import paths for admin pages.
import UserManagementPage from '../pages/admin/UserManagementPage';
import ConfigurationPage from '../pages/admin/ConfigurationPage';
import SessionManagementPage from '../pages/admin/SessionManagementPage';
import ApplicationManagementPage from '../pages/admin/ApplicationManagementPage';

const PageContent: React.FC = () => {
    const { page } = useNavigation();
    const { user } = useAuth();

    switch(page) {
        case 'dashboard':
            return <DashboardPage />;
        case 'admin/users':
            return user?.isAdmin ? <UserManagementPage /> : <DashboardPage />;
        case 'admin/sessions':
            return user?.isAdmin ? <SessionManagementPage /> : <DashboardPage />;
        case 'admin/applications':
            return user?.isAdmin ? <ApplicationManagementPage /> : <DashboardPage />;
        case 'admin/configuration':
            return user?.isAdmin ? <ConfigurationPage /> : <DashboardPage />;
        default:
            return <DashboardPage />;
    }
}


const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen bg-background text-text-primary">
      {user?.isAdmin && <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />}
      <div className="flex flex-col flex-1">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <PageContent />
        </main>
      </div>
      {isSidebarOpen && user?.isAdmin && (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default MainLayout;
