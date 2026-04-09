import React, { useState, useEffect } from 'react';
import { FileJson, Link, Plus } from 'lucide-react';
import { jsonDatabase } from '../data/json/JsonDatabaseService';

export const Settings: React.FC = () => {
    const [hasHandle, setHasHandle] = useState<boolean>(false);

    useEffect(() => {
        jsonDatabase.hasValidHandle().then(setHasHandle);
    }, []);

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

    return (
        <div className="p-6 pb-24">
            <header className="mb-8 mt-4 whitespace-nowrap overflow-hidden text-ellipsis">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
            </header>

            <div className="space-y-6">
                <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            <FileJson className="mr-2 text-blue-500" size={20} />
                            JSON File System Sync
                        </h2>
                    </div>

                    <p className="text-sm text-gray-500 mb-4">
                        Connect directly to a JSON file on your iCloud or Google Drive to sync your workouts across devices without a server.
                    </p>

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
                </section>
            </div>
        </div>
    );
};
