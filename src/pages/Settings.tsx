import React, { useState, useEffect } from 'react';
import { databaseService } from '../data/services/DatabaseService';
import { Download, Upload, AlertTriangle, Cloud, CloudOff } from 'lucide-react';
import { getMongoConfig, saveMongoConfig } from '../data/mongo/mongoConfig';
import type { MongoConfig } from '../data/mongo/mongoConfig';

export const Settings: React.FC = () => {
    const [mongoConfig, setMongoConfigState] = useState<MongoConfig>({
        enabled: false,
        apiUrl: '',
        apiKey: '',
        clusterName: '',
        dbName: 'gymtracker'
    });

    useEffect(() => {
        setMongoConfigState(getMongoConfig());
    }, []);

    const handleMongoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const newConfig = {
            ...mongoConfig,
            [name]: type === 'checkbox' ? checked : value
        };
        setMongoConfigState(newConfig);
        saveMongoConfig(newConfig);
    };

    const handleExport = async () => {
        try {
            await databaseService.exportDatabase();
        } catch (e) {
            console.error(e);
            alert('Failed to export. Database might not be fully initialized.');
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (window.confirm('This will overwrite all existing local data. Are you sure?')) {
            try {
                await databaseService.importDatabase(file);
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleWipeDatabase = async () => {
        if (window.confirm('🚨 DANGER! This will permanently delete your entire local workout history. Are you 100% sure?')) {
            if (window.confirm('Final warning: Delete all local data?')) {
                await databaseService.clearDatabase();
            }
        }
    };

    return (
        <div className="p-6">
            <header className="mb-8 mt-4 whitespace-nowrap overflow-hidden text-ellipsis">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
            </header>

            <div className="space-y-6">

                {/* MongoDB Configuration Section */}
                <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            {mongoConfig.enabled ? <Cloud className="mr-2 text-blue-500" size={20} /> : <CloudOff className="mr-2 text-gray-400" size={20} />}
                            Cloud Sync (MongoDB)
                        </h2>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="enabled" checked={mongoConfig.enabled} onChange={(e) => { handleMongoChange(e); setTimeout(() => window.location.reload(), 100); }} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none ring-0 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <p className="text-sm text-gray-500 mb-4">
                        Connect directly to your MongoDB Atlas Data API to sync your workouts across devices. Requires app restart when toggled.
                    </p>

                    {mongoConfig.enabled && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Data API URL</label>
                                <input name="apiUrl" value={mongoConfig.apiUrl} onChange={handleMongoChange} type="text" placeholder="https://data.mongodb-api.com/..." className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Data API Key</label>
                                <input name="apiKey" value={mongoConfig.apiKey} onChange={handleMongoChange} type="password" placeholder="Key..." className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Cluster Name</label>
                                    <input name="clusterName" value={mongoConfig.clusterName} onChange={handleMongoChange} type="text" placeholder="Cluster0" className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Database Name</label>
                                    <input name="dbName" value={mongoConfig.dbName} onChange={handleMongoChange} type="text" placeholder="gymtracker" className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                <section className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 ${mongoConfig.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Local Data Portability</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        These tools apply to the local SQLite database. Not available while Cloud Sync is active.
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={handleExport}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors"
                        >
                            <Download size={20} />
                            <span>Export Database (Backup)</span>
                        </button>

                        <div className="relative">
                            <input
                                type="file"
                                accept=".sqlite3"
                                onChange={handleImport}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <button className="w-full bg-primary-100 hover:bg-primary-200 text-primary-800 font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors pointer-events-none">
                                <Upload size={20} />
                                <span>Import Database (Restore)</span>
                            </button>
                        </div>
                        <p className="text-xs text-center text-gray-400 mt-2">
                            Importing will immediately overwrite all current local data.
                        </p>
                    </div>
                </section>

                {!mongoConfig.enabled && (
                    <section className="bg-red-50 p-5 rounded-2xl shadow-sm border border-red-100">
                        <h2 className="text-lg font-bold text-red-800 mb-2 flex items-center">
                            <AlertTriangle size={20} className="mr-2 text-red-600" />
                            Danger Zone
                        </h2>
                        <p className="text-sm text-red-700/80 mb-6 font-medium">
                            Permanently delete your entire local database and reset the application to its factory default state.
                        </p>

                        <button
                            onClick={handleWipeDatabase}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center transition-colors active:scale-95 transform shadow-sm"
                        >
                            <span>Wipe Local Data</span>
                        </button>
                    </section>
                )}
            </div>
        </div>
    );
};
