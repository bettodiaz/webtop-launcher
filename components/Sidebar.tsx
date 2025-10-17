
import React from 'react';
import { useNavigation, Page } from '../hooks/useNavigation';
import { HomeIcon, UsersIcon, Cog6ToothIcon, CommandLineIcon, RectangleStackIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { page, navigateTo } = useNavigation();
  
  const handleNavigate = (targetPage: Page) => {
      navigateTo(targetPage);
      setIsOpen(false); // Close sidebar on navigation in mobile view
  }

  const NavButton = ({ targetPage, icon, label }: { targetPage: Page, icon: React.ReactNode, label: string }) => {
    const isActive = page === targetPage;
    const commonClasses = "flex items-center w-full text-left px-4 py-3 text-text-secondary hover:bg-secondary hover:text-text-primary transition duration-200 rounded-md";
    const activeClasses = "bg-accent text-white";
    return (
      <button
        onClick={() => handleNavigate(targetPage)}
        className={`${commonClasses} ${isActive ? activeClasses : ''}`}
      >
        {icon}
        {label}
      </button>
    );
  };
  
  return (
    <aside className={`bg-surface p-4 flex-col w-64 fixed lg:relative lg:flex inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-30`}>
      <nav className="flex-1 space-y-2">
        <NavButton 
            targetPage='dashboard'
            label="Dashboard"
            icon={<HomeIcon className="h-6 w-6 mr-3" aria-hidden="true" />}
        />
        <div className="pt-4 mt-4 border-t border-gray-700">
          <h3 className="px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Admin</h3>
          <div className="mt-2 space-y-2">
            <NavButton 
                targetPage='admin/users'
                label="User Management"
                icon={<UsersIcon className="h-6 w-6 mr-3" aria-hidden="true" />}
            />
            <NavButton 
                targetPage='admin/sessions'
                label="Session Management"
                icon={<CommandLineIcon className="h-6 w-6 mr-3" aria-hidden="true" />}
            />
            <NavButton 
                targetPage='admin/applications'
                label="App Management"
                icon={<RectangleStackIcon className="h-6 w-6 mr-3" aria-hidden="true" />}
            />
            <NavButton 
                targetPage='admin/configuration'
                label="Configuration"
                icon={<Cog6ToothIcon className="h-6 w-6 mr-3" aria-hidden="true" />}
            />
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;