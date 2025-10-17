
import React, { useState, useEffect } from 'react';
import { Application } from '../../types';
// Fix: Corrected import path for the api service.
import { getApplications, updateApplication } from '../../services/api';
import { scrapeLinuxServerRepos } from '../../services/geminiService';

const ComposeEditorModal: React.FC<{ app: Application, onClose: () => void, onSave: (updatedApp: Application) => void }> = ({ app, onClose, onSave }) => {
    const [composeContent, setComposeContent] = useState(app.dockerCompose);
    const [saving, setSaving] = useState(false);
    
    const handleSave = async () => {
        setSaving(true);
        const updatedApp = { ...app, dockerCompose: composeContent };
        const result = await updateApplication(updatedApp);
        if(result) {
            onSave(result);
        }
        setSaving(false);
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg p-6 w-full max-w-2xl h-full max-h-[80vh] flex flex-col">
                <h2 className="text-2xl font-bold mb-4">Edit Docker Compose: {app.name}</h2>
                <textarea 
                    value={composeContent}
                    onChange={(e) => setComposeContent(e.target.value)}
                    className="flex-grow w-full p-2 bg-gray-900 text-gray-300 font-mono text-sm border border-gray-700 rounded-md resize-none"
                    spellCheck="false"
                />
                <div className="flex justify-end space-x-4 mt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-secondary hover:bg-gray-600 rounded-md font-medium transition">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-accent hover:bg-blue-600 rounded-md font-medium transition disabled:bg-gray-500">{saving ? 'Saving...' : 'Save'}</button>
                </div>
            </div>
        </div>
    )
}


const ApplicationManagementPage: React.FC = () => {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScraping, setIsScraping] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);

  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true);
      const fetchedApps = await getApplications();
      setApps(fetchedApps);
      setLoading(false);
    };
    fetchApps();
  }, []);

  const handleToggleEnabled = async (app: Application) => {
    const updatedApp = { ...app, isEnabled: !app.isEnabled };
    const result = await updateApplication(updatedApp);
    if (result) {
      setApps(apps.map(a => a.id === app.id ? result : a));
    }
  };

  const handleScrape = async () => {
      setIsScraping(true);
      try {
          const newApps = await scrapeLinuxServerRepos();
          console.log("Scraped Apps:", newApps);
          alert(`${newApps.length} new potential applications found! Check the console for details. (This is a mock response)`);
      } catch (error) {
          console.error("Scraping failed:", error);
          alert("Failed to scrape repositories. See console for details.");
      } finally {
          setIsScraping(false);
      }
  }
  
  const handleSaveCompose = (updatedApp: Application) => {
      setApps(apps.map(a => a.id === updatedApp.id ? updatedApp : a));
      setEditingApp(null);
  }

  if (loading) return <p>Loading applications...</p>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-text-primary">Application Management</h1>
        <button
            onClick={handleScrape}
            disabled={isScraping}
            className="px-4 py-2 bg-accent hover:bg-blue-600 rounded-md font-medium transition disabled:bg-gray-500 w-full sm:w-auto"
        >
            {isScraping ? 'Scraping...' : 'Scan for New Apps'}
        </button>
      </div>
      <div className="bg-surface shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="border-b-2 border-gray-700 bg-secondary">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Application</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Enabled</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map(app => (
                <tr key={app.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="px-5 py-5 text-sm">
                    <div className="flex items-center">
                      <img src={app.logoUrl} alt={app.name} className="w-8 h-8 mr-3"/>
                      <p className="text-text-primary whitespace-no-wrap">{app.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-5 text-sm">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={app.isEnabled} onChange={() => handleToggleEnabled(app)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                    </label>
                  </td>
                  <td className="px-5 py-5 text-sm">
                    <button onClick={() => setEditingApp(app)} className="text-blue-400 hover:text-blue-300">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {editingApp && <ComposeEditorModal app={editingApp} onClose={() => setEditingApp(null)} onSave={handleSaveCompose} />}
    </div>
  );
};

export default ApplicationManagementPage;
