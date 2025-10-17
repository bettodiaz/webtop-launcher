import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { CubeTransparentIcon } from '@heroicons/react/24/outline';


const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      if (!user) {
        setError('Invalid username or password.');
      }
      // On successful login, the auth state changes and the App component
      // will automatically render the dashboard. No navigation is needed here.
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-surface rounded-lg shadow-lg">
        <div className="text-center">
            <CubeTransparentIcon className="h-12 w-12 text-accent mx-auto" aria-hidden="true" />
          <h2 className="mt-6 text-3xl font-extrabold text-text-primary">
            Webtop Launcher
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Login
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 text-text-primary placeholder-gray-500 focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm rounded-t-md"
                placeholder="Username (admin or user)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 text-text-primary placeholder-gray-500 focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm rounded-b-md"
                placeholder="Password (password)"
                value={password}
                // Fix: Corrected typo 'e.targe' to 'e.target'.
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-center text-sm text-red-500">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-gray-500"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        <div className="text-center text-xs text-gray-500 mt-8">
            <p>
                Open Source project by bettodiaz. Visit on <a href="https://github.com/bettodiaz/webtop-launcher" target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline">GitHub</a>.
            </p>
        </div>
      </div>
    </div>
  );
};

// Fix: Added default export for the component to resolve the import error in App.tsx.
export default LoginPage;