import React, { useState } from 'react';
import type { User } from '../types';
import { Page } from '../types';
import { UserIcon } from './icons/UserIcon';
import { PowerIcon } from './icons/PowerIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { DockerIcon } from './icons/DockerIcon';
import { KeyIcon } from './icons/KeyIcon';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
  onOpenChangePassword: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onNavigate, onOpenChangePassword }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate(Page.Dashboard)}>
            <DockerIcon className="h-8 w-8 text-cyan-500" />
            <span className="text-2xl font-bold text-white">Webtop Launcher</span>
          </div>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md text-sm font-medium text-white transition-colors"
            >
              <UserIcon className="h-5 w-5" />
              <span>{user.username}</span>
              <ChevronDownIcon className={`h-4 w-4 transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-gray-700 ring-1 ring-black ring-opacity-5 z-10">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onOpenChangePassword(); setDropdownOpen(false); }}
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
                >
                  <KeyIcon className="h-5 w-5 mr-2" />
                  Change Password
                </a>
                {user.isAdmin && (
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); onNavigate(Page.Admin); setDropdownOpen(false); }}
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
                  >
                    <SettingsIcon className="h-5 w-5 mr-2" />
                    Admin Panel
                  </a>
                )}
                <div className="border-t border-gray-600 my-1"></div>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onLogout(); setDropdownOpen(false); }}
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
                >
                  <PowerIcon className="h-5 w-5 mr-2" />
                  Logout
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};