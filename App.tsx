import React from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { NavigationProvider } from './hooks/useNavigation';
import LoginPage from './pages/LoginPage';
import MainLayout from './components/MainLayout';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }
  
  return <MainLayout />;
}

export default App;
