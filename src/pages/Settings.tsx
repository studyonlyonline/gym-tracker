import React, { useState, useEffect, useRef } from 'react';
import { FileJson, Link, Plus, Download, Upload, CheckCircle2, HardDrive, AlertCircle } from 'lucide-react';
import { jsonDatabase } from '../data/json/JsonDatabaseService';

export const Settings: React.FC = () => {
    const [hasHandle, setHasHandle] = useState<boolean>(false);
    const [sessionCount, setSessionCount] = useState<number>(0);
    const [setCount, setSetCount] = useState<number>(0);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isFileSystemAccessSupported = typeof window !== 'undefined' && 'showSaveFilePicker' in window;

    const refreshStats = () => {
        setSessionCount(jsonDatabase.data.workoutSessions.length);
        setSetCount(jsonDatabase.data.workoutSets.length);
    };

    useEffect(() => {
        jsonDatabase.init().then(() => {
            jsonDatabase.hasValidHandle().then(setHasHandle);
            refreshStats();
        });
    }, []);

    const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 4000);
    };

    const handleCreateFile = async () => {
        if (await jsonDatabase.createNewFile()) {
            setHasHandle(true);
            refreshStats();
            showNotification("Successfully created and linked gymtracker-data.json!");
        }
    };

    const handleLinkFile = async () => {
        if (await jsonDatabase.linkExistingFile()) {
            setHasHandle(true);
            refreshStats();
            showNotification("Successfully linked to JSON file!");
        }
    };
    
    const handleClearLink = async () => {
        if (window.confirm("Disconnect JSON file? This won't delete the file, just break the background file sync link.")) {
            await jsonDatabase.clearLink();
            setHasHandle(false);
            showNotification("Disconnected background file sync.");
        }
    };

    const handleExport = () => {
        try {
            jsonDatabase.exportToJsonFile();
            showNotification("gymtracker-data.json exported to your device!");
        } catch (e: any) {
            showNotification("Failed to export: " + (e.message || "Unknown error"), "error");
        }
    };

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const res = await jsonDatabase.importFromJsonFile(file);
        if (res.success) {
            refreshStats();
            showNotification(res.message, "success");
        } else {
            showNotification(res.message, "error");
        }
        if (e.target) {
            e.target.value = '';
        }
    };

    return (
        <div className="p-6 pb-28 max-w-2xl mx-auto">
            <header className="mb-6 mt-2">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings & Storage</h1>
                <p className="text-sm text-gray-500 mt-1">Manage local database persistence and JSON backups</p>
            </header>

            {message && (
                <div className={`mb-6 p-4 rounded-xl flex items-center text-sm font-medium border ${
                    message.type === 'success' 
                        ? 'bg-green-50 text-green-800 border-green-200' 
                        : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                    {message.type === 'success' ? (
                        <CheckCircle2 size={18} className="mr-2 text-green-600 shrink-0" />
                    ) : (
                        <AlertCircle size={18} className="mr-2 text-red-600 shrink-0" />
                    )}
                    <span>{message.text}</span>
                </div>
            )}

            <div className="space-y-6">
                {/* Section 1: Device Storage Status */}
                <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-bold text-gray-900 flex items-center">
                            <HardDrive className="mr-2 text-blue-600" size={20} />
                            Local Device Storage
                        </h2>
                        <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                            Active (Auto-Saving)
                        </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        Workouts are automatically saved locally to your device via IndexedDB. Your logged sets and history persist permanently across browser restarts on iPhone, Android, and Desktop.
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                            <div className="text-xl font-bold text-gray-900">{sessionCount}</div>
                            <div className="text-xs font-medium text-gray-500 mt-0.5">Workout Sessions</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                            <div className="text-xl font-bold text-gray-900">{setCount}</div>
                            <div className="text-xs font-medium text-gray-500 mt-0.5">Logged Sets</div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Backup & Device Transfer (JSON Export / Import) */}
                <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-base font-bold text-gray-900 flex items-center">
                            <FileJson className="mr-2 text-indigo-600" size={20} />
                            Backup & Device Transfer
                        </h2>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        Export your data to a <code className="bg-gray-100 px-1 py-0.5 rounded text-xs text-gray-800 font-mono">gymtracker-data.json</code> file to save a backup in iCloud / Google Drive, or transfer workouts between iPhone and Android.
                    </p>

                    {/* Hidden file input for import */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".json,application/json"
                        className="hidden"
                        onChange={handleImportFile}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            onClick={handleExport}
                            className="flex items-center justify-center p-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
                        >
                            <Download size={18} className="mr-2" />
                            Export JSON to Device
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center justify-center p-3.5 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 border border-gray-200 text-gray-800 rounded-xl font-semibold text-sm transition-colors"
                        >
                            <Upload size={18} className="mr-2 text-gray-600" />
                            Import JSON from Device
                        </button>
                    </div>
                </section>

                {/* Section 3: File System Access API (Chromium / Android continuous file sync) */}
                <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-base font-bold text-gray-900 flex items-center">
                            <Link className="mr-2 text-gray-700" size={18} />
                            Live File System Sync
                        </h2>
                        {isFileSystemAccessSupported ? (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">Supported</span>
                        ) : (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700">Chromium Only</span>
                        )}
                    </div>

                    {isFileSystemAccessSupported ? (
                        <>
                            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                Directly link a local JSON file on Google Drive or local storage for continuous background write sync.
                            </p>

                            <div className="pt-2">
                                {hasHandle ? (
                                    <div className="bg-green-50 text-green-800 p-4 rounded-xl flex items-center justify-between border border-green-200">
                                        <div className="flex items-center">
                                            <Link size={18} className="mr-2 text-green-700" />
                                            <span className="font-semibold text-sm">Linked to JSON File</span>
                                        </div>
                                        <button 
                                            onClick={handleClearLink} 
                                            className="text-xs font-bold text-red-600 bg-white px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                                        >
                                            Disconnect
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={handleCreateFile} 
                                            className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 border border-gray-200 rounded-xl transition-colors"
                                        >
                                            <Plus size={22} className="text-gray-700 mb-1.5" />
                                            <span className="text-sm font-semibold text-gray-800">Create New File</span>
                                        </button>
                                        <button 
                                            onClick={handleLinkFile} 
                                            className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 border border-blue-200 rounded-xl transition-colors"
                                        >
                                            <Link size={22} className="text-blue-600 mb-1.5" />
                                            <span className="text-sm font-semibold text-blue-800">Link Existing File</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-900 leading-relaxed">
                            <p className="font-semibold text-amber-900 mb-1">Notice for Safari / iOS users:</p>
                            Apple WebKit does not allow websites to stream directly to arbitrary background files. Your workouts are <strong>fully auto-saved</strong> to this device's storage above. To backup or transfer to Android, tap <strong>Export JSON to Device</strong>.
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};
