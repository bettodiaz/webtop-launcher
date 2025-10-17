import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';

export type Page = 'dashboard' | 'admin/users' | 'admin/sessions' | 'admin/applications' | 'admin/configuration';

interface NavigationContextType {
  page: Page;
  navigateTo: (targetPage: Page) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [page, setPage] = useState<Page>('dashboard');

  const navigateTo = (targetPage: Page) => {
    setPage(targetPage);
  };

  const value = useMemo(() => ({ page, navigateTo }), [page]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
