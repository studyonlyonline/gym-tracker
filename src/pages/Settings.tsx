import React from 'react';
import { databaseService } from '../data/services/DatabaseService';
import { Download, Upload, AlertTriangle } from 'lucide-react';

export const Settings: React.FC = () => {
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

        if (window.confirm('This will overwrite all existing data. Are you sure?')) {
            try {
                await databaseService.importDatabase(file);
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleWipeDatabase = async () => {
        if (window.confirm('🚨 DANGER! This will permanently delete your entire workout history and custom exercises. You cannot undo this unless you have exported a backup first.\n\nAre you 100% sure you want to wipe the app?')) {
            if (window.confirm('Final warning: Delete all data?')) {
                await databaseService.clearDatabase();
            }
        }
    };

    return (
        <div className="p-6">
            <header className="mb-8 mt-4">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
            </header>

            <div className="space-y-6">
                <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Data Portability</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Your data is stored completely locally on this device. Use these tools to backup your data or move it to another device.
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
                            Importing will immediately overwrite all current data.
                        </p>
                    </div>
                </section>

                <section className="bg-red-50 p-5 rounded-2xl shadow-sm border border-red-100">
                    <h2 className="text-lg font-bold text-red-800 mb-2 flex items-center">
                        <AlertTriangle size={20} className="mr-2 text-red-600" />
                        Danger Zone
                    </h2>
                    <p className="text-sm text-red-700/80 mb-6 font-medium">
                        Permanently delete your entire database and reset the application to its factory default state.
                    </p>

                    <button
                        onClick={handleWipeDatabase}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center transition-colors active:scale-95 transform shadow-sm"
                    >
                        <span>Wipe All Data</span>
                    </button>
                </section>
            </div>
        </div>
    );
};
