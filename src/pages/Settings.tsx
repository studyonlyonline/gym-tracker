import React, { useState, useEffect } from 'react';
import { databaseService } from '../data/services/DatabaseService';
import { Download, Upload, AlertTriangle, FileJson, Link, Plus } from 'lucide-react';
import { getJsonConfig, saveJsonConfig } from '../data/json/jsonConfig';
import type { JsonConfig } from '../data/json/jsonConfig';
import { jsonDatabase } from '../data/json/JsonDatabaseService';

export const Settings: React.FC = () => {
    const [jsonConfig, setJsonConfigState] = useState<JsonConfig>({
        enabled: false,
    });
    const [hasHandle, setHasHandle] = useState<boolean>(false);

    useEffect(() => {
        setJsonConfigState(getJsonConfig());
        jsonDatabase.hasValidHandle().then(setHasHandle);
    }, []);

    const toggleJsonConfig = (checked: boolean) => {
        const newConfig = { enabled: checked };
        setJsonConfigState(newConfig);
        saveJsonConfig(newConfig);
        setTimeout(() => window.location.reload(), 100);
    };

    const handleCreateFile = async () => {
        if (await jsonDatabase.createNewFile()) {
            setHasHandle(true);
        }
    };

    const handleLinkFile = async () => {
        if (await jsonDatabase.linkExistingFile()) {
            setHasHandle(true);
        }
    };
    
    const handleClearLink = async () => {
        if (window.confirm("Disconnect JSON file? This won't delete the file, just break the link.")) {
            await jsonDatabase.clearLink();
            setHasHandle(false);
        }
    }

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
        <div className="p-6 pb-24">
            <header className="mb-8 mt-4 whitespace-nowrap overflow-hidden text-ellipsis">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
            </header>

            <div className="space-y-6">

                {/* JSON Configuration Section */}
                <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            {jsonConfig.enabled ? <FileJson className="mr-2 text-blue-500" size={20} /> : <FileJson className="mr-2 text-gray-400" size={20} />}
                            JSON File System Sync
                        </h2>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={jsonConfig.enabled} onChange={(e) => toggleJsonConfig(e.target.checked)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none ring-0 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <p className="text-sm text-gray-500 mb-4">
                        Connect directly to a JSON file on your iCloud or Google Drive to sync your workouts across devices without a server.
                    </p>

                    {jsonConfig.enabled && (
                        <div className="space-y-4 border-t border-gray-100 pt-4 mt-2">
                             {hasHandle ? (
                                 <div className="bg-green-50 text-green-800 p-4 rounded-xl flex items-center justify-between border border-green-100">
                                     <div className="flex items-center">
                                         <Link size={18} className="mr-2" />
                                         <span className="font-semibold text-sm">Successfully Linked to JSON File</span>
                                     </div>
                                     <button onClick={handleClearLink} className="text-xs font-bold text-red-600 bg-white px-3 py-1 rounded-lg border border-red-200 hover:bg-red-50">Disconnect</button>
                                 </div>
                             ) : (
                                 <div className="grid grid-cols-2 gap-3">
                                     <button onClick={handleCreateFile} className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors">
                                          <Plus size={24} className="text-gray-600 mb-2" />
                                          <span className="text-sm font-semibold text-gray-800">Create New File</span>
                                     </button>
                                     <button onClick={handleLinkFile} className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors">
                                          <Link size={24} className="text-blue-600 mb-2" />
                                          <span className="text-sm font-semibold text-blue-800">Link Existing File</span>
                                     </button>
                                 </div>
                             )}
                        </div>
                    )}
                </section>

                <section className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 ${jsonConfig.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Local DB Portability</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        These tools apply to the local SQLite database. Not available while JSON Sync is active.
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

                {!jsonConfig.enabled && (
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
