import React, { useState, useEffect } from 'react';
import { PortainerConfig, PortainerStatus } from '../../types';
import { getPortainerConfig, updatePortainerConfig, deployPortainer, getPortainerStatus } from '../../services/api';

const StatusIndicator: React.FC<{ status: PortainerStatus['status'] }> = ({ status }) => {
    const colorMap = {
        running: 'bg-green-500',
        stopped: 'bg-yellow-500',
        error: 'bg-red-500',
        deploying: 'bg-blue-500 animate-pulse'
    };
    const textMap = {
        running: 'Running',
        stopped: 'Stopped',
        error: 'Error',
        deploying: 'Deploying...'
    }

    return (
        <div className="flex items-center">
            <span className={`h-3 w-3 rounded-full ${colorMap[status]} mr-2`}></span>
            <span className="capitalize">{textMap[status]}</span>
        </div>
    )
}

const ConfigurationPage: React.FC = () => {
    const [config, setConfig] = useState<PortainerConfig>({ url: '', apiKey: '' });
    const [status, setStatus] = useState<PortainerStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [fetchedConfig, fetchedStatus] = await Promise.all([
                    getPortainerConfig(),
                    getPortainerStatus()
                ]);
                setConfig(fetchedConfig);
                setStatus(fetchedStatus);
            } catch (error) {
                console.error("Failed to fetch initial config data:", error);
                setMessage({ text: 'Failed to load configuration.', type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfig({ ...config, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });
        try {
            await updatePortainerConfig(config);
            setMessage({ text: 'Configuration saved successfully!', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (error) {
            setMessage({ text: 'Failed to save configuration.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeploy = async () => {
        setIsDeploying(true);
        setMessage({ text: 'Portainer deployment initiated...', type: 'info' });
        setStatus({ status: 'deploying', uptime: '', version: '' });
        try {
            const result = await deployPortainer();
            if (result.success && result.config) {
                setConfig(result.config);
                setMessage({ text: result.message, type: 'success' });
                // fetch status again
                const newStatus = await getPortainerStatus();
                setStatus(newStatus);
            } else {
                setMessage({ text: result.message, type: 'error' });
                const newStatus = await getPortainerStatus();
                setStatus(newStatus);
            }
        } catch (error) {
            setMessage({ text: 'An unexpected error occurred during deployment.', type: 'error' });
            setStatus({ status: 'error', uptime: '', version: '' });
        } finally {
            setIsDeploying(false);
        }
    }
    
    if (loading) return <p>Loading configuration...</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-text-primary">Configuration</h1>
            <div className="bg-surface shadow-md rounded-lg p-6 max-w-2xl mx-auto">
                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold text-text-secondary border-b border-gray-700 pb-2 mb-4">Portainer Settings</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="url" className="block text-sm font-medium text-gray-300">Portainer URL</label>
                                <input 
                                    type="text" 
                                    name="url" 
                                    id="url" 
                                    value={config.url}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-900 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" 
                                />
                            </div>
                            <div>
                                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300">API Key</label>
                                <input 
                                    type="password" 
                                    name="apiKey" 
                                    id="apiKey" 
                                    value={config.apiKey}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-900 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" 
                                />
                            </div>
                        </div>
                    </div>
                    {message.text && <p className={`${message.type === 'success' ? 'text-green-500' : message.type === 'error' ? 'text-red-500' : 'text-blue-400'} text-sm`}>{message.text}</p>}
                    <div className="flex justify-end pt-4">
                        <button 
                            type="submit" 
                            disabled={saving || isDeploying}
                            className="px-6 py-2 bg-accent hover:bg-blue-600 rounded-md font-medium transition disabled:bg-gray-500"
                        >
                            {saving ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-700">
                    <h2 className="text-xl font-semibold text-text-secondary mb-4">Orchestrator Management</h2>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gray-900 p-4 rounded-lg">
                        <div className="mb-4 md:mb-0">
                            <p className="font-medium">Deploy Portainer-CE Instance</p>
                            <p className="text-sm text-gray-400">If no Portainer is running, deploy a managed instance.</p>
                        </div>
                        <button 
                            onClick={handleDeploy}
                            disabled={isDeploying}
                            className="px-4 py-2 bg-secondary hover:bg-gray-600 rounded-md font-medium transition disabled:bg-gray-500 w-full md:w-auto"
                        >
                            {isDeploying ? 'Deploying...' : 'Deploy Automatically'}
                        </button>
                    </div>

                    {status && (
                         <div className="mt-6 bg-gray-900 p-4 rounded-lg">
                             <h3 className="text-lg font-semibold text-text-secondary mb-3">Container Status</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                 <div>
                                     <p className="text-gray-400">Status</p>
                                     <StatusIndicator status={status.status} />
                                 </div>
                                  <div>
                                     <p className="text-gray-400">Uptime</p>
                                     <p>{status.uptime || 'N/A'}</p>
                                 </div>
                                  <div>
                                     <p className="text-gray-400">Version</p>
                                     <p>{status.version || 'N/A'}</p>
                                 </div>
                             </div>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfigurationPage;
