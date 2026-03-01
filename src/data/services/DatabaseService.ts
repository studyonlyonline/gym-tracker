import { dbExport } from '../sqlite/dbClient';

export class DatabaseService {
    /**
     * Exports the current SQLite database from OPFS to a downloadable file.
     */
    async exportDatabase(): Promise<void> {
        const data = await dbExport();
        const blob = new Blob([data as any], { type: 'application/x-sqlite3' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `gymtracker-backup-${new Date().toISOString().split('T')[0]}.sqlite3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Imports a SQLite database file into OPFS, overwriting the current database,
     * and subsequently reloads the application to initialize the new data.
     */
    async importDatabase(file: File): Promise<void> {
        try {
            const root = await navigator.storage.getDirectory();
            const fileHandle = await root.getFileHandle('gymtracker.sqlite3', { create: true });

            // In advanced browsers, createWritable() is supported for OPFS Handles
            const writable = await fileHandle.createWritable();
            await writable.write(file);
            await writable.close();

            // Reload the application to ensure the SQLite WASM worker loads the new file
            window.location.reload();
        } catch (error) {
            console.error('Failed to import database:', error);
            alert('Failed to import database. See console for details.');
        }
    }
}

export const databaseService = new DatabaseService();
