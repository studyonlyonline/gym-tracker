import { get, set, del } from 'idb-keyval';
import type { Exercise, WorkoutSession, WorkoutSet, BodyPart } from '../models/types';
import defaultExercisesData from '../config/defaultExercises.json';

const FILE_HANDLE_KEY = 'gymtracker_json_file_handle';
const DB_CACHE_KEY = 'gymtracker_cached_db_data';

export interface DatabaseSchema {
    exercises: Exercise[];
    workoutSessions: WorkoutSession[];
    workoutSets: WorkoutSet[];
}

function generateDefaultId(name: string): string {
    return 'default_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

function parseDefaultExercises(): Exercise[] {
    const exercises: Exercise[] = [];
    const typedDefaults = defaultExercisesData as Record<string, string[]>;
    for (const [bodyPart, names] of Object.entries(typedDefaults)) {
        for (const name of names) {
            exercises.push({
                id: generateDefaultId(name),
                name,
                bodyPart: bodyPart as BodyPart,
                isCustom: false
            });
        }
    }
    return exercises;
}

class JsonDatabaseService {
    public data: DatabaseSchema = {
        exercises: parseDefaultExercises(),
        workoutSessions: [],
        workoutSets: []
    };
    private fileHandle: any | null = null;
    private initialized = false;
    private initPromise: Promise<void> | null = null;

    private hydrateData(parsed: any) {
        if (!parsed || typeof parsed !== 'object') return;
        const defaults = parseDefaultExercises();
        const userExercises = Array.isArray(parsed.exercises) ? parsed.exercises : [];
        const existingIds = new Set(userExercises.map((e: any) => e.id));
        const missingDefaults = defaults.filter(e => !existingIds.has(e.id));

        this.data = {
            exercises: [...userExercises, ...missingDefaults],
            workoutSessions: Array.isArray(parsed.workoutSessions) ? parsed.workoutSessions : [],
            workoutSets: Array.isArray(parsed.workoutSets) ? parsed.workoutSets : []
        };
    }

    async init() {
        if (this.initialized) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            // 1. Restore from IndexedDB first (guarantees persistence across reloads on iOS Safari and everywhere)
            try {
                const cached = await get<DatabaseSchema>(DB_CACHE_KEY);
                if (cached) {
                    this.hydrateData(cached);
                }
            } catch (e) {
                console.error("Failed to read from IndexedDB cache", e);
            }

            // 2. If a native File Handle exists (e.g. Android Chrome), load from it
            try {
                if (typeof window !== 'undefined' && 'showOpenFilePicker' in window) {
                    this.fileHandle = await get(FILE_HANDLE_KEY);
                    if (this.fileHandle) {
                        await this.loadFromFile();
                    }
                }
            } catch (e) {
                console.warn("Could not load from file handle", e);
            }

            this.initialized = true;
        })();

        return this.initPromise;
    }

    async hasValidHandle(): Promise<boolean> {
        this.fileHandle = await get(FILE_HANDLE_KEY);
        if (!this.fileHandle) return false;
        
        try {
            const opts = { mode: 'readwrite' as const };
            if ((await this.fileHandle.queryPermission(opts)) === 'granted') {
                 return true;
            }
        } catch (e) {
            console.warn("queryPermission failed", e);
        }
        return false;
    }

    async verifyPermission(): Promise<boolean> {
        if (!this.fileHandle) return false;
        try {
            const opts = { mode: 'readwrite' as const };
            if ((await this.fileHandle.queryPermission(opts)) === 'granted') {
                return true;
            }
            return (await this.fileHandle.requestPermission(opts)) === 'granted';
        } catch (e) {
            console.warn("verifyPermission failed", e);
            return false;
        }
    }

    async loadFromFile() {
        if (!this.fileHandle) throw new Error("No file linked");
        const file = await this.fileHandle.getFile();
        const text = await file.text();
        if (text.trim() === '') {
             await this.save();
             return;
        }
        try {
            const parsed = JSON.parse(text);
            this.hydrateData(parsed);
            // Also update IndexedDB cache
            await set(DB_CACHE_KEY, this.data);
        } catch(e) {
            console.error("Failed to parse JSON DB", e);
        }
    }

    async save() {
        // 1. ALWAYS persist to IndexedDB (instant persistence on iOS Safari & all platforms)
        try {
            await set(DB_CACHE_KEY, this.data);
        } catch (e) {
            console.error("Failed to save to IndexedDB", e);
        }

        // 2. If a native File System handle is linked (Android / Desktop Chrome), stream to it
        if (!this.fileHandle) return;
        try {
            const writable = await this.fileHandle.createWritable();
            await writable.write(JSON.stringify(this.data, null, 2));
            await writable.close();
        } catch (e) {
            console.error("Failed to save to JSON file", e);
        }
    }

    async linkExistingFile() {
        try {
            if (typeof (window as any).showOpenFilePicker !== 'function') {
                throw new Error("File System Access API is not supported on this browser");
            }
            const [handle] = await (window as any).showOpenFilePicker({
                types: [{
                    description: 'JSON Files',
                    accept: { 'application/json': ['.json'] },
                }],
            });
            this.fileHandle = handle;
            await set(FILE_HANDLE_KEY, handle);
            await this.loadFromFile();
            return true;
        } catch (e) {
             console.error("Canceled or error", e);
             return false;
        }
    }

    async createNewFile() {
        try {
            if (typeof (window as any).showSaveFilePicker !== 'function') {
                throw new Error("File System Access API is not supported on this browser");
            }
            const handle = await (window as any).showSaveFilePicker({
                suggestedName: 'gymtracker-data.json',
                types: [{
                    description: 'JSON Files',
                    accept: { 'application/json': ['.json'] },
                }],
            });
            this.fileHandle = handle;
            await set(FILE_HANDLE_KEY, handle);
            await this.save(); // Initialize it with the current data structure
            return true;
        } catch (e) {
             console.error("Canceled or error", e);
             return false;
        }
    }

    async clearLink() {
        this.fileHandle = null;
        await del(FILE_HANDLE_KEY);
    }

    exportToJsonFile() {
        const jsonString = JSON.stringify(this.data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const fileName = 'gymtracker-data.json';
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    async importFromJsonFile(file: File): Promise<{ success: boolean; message: string; count?: number }> {
        try {
            const text = await file.text();
            const parsed = JSON.parse(text);

            if (!parsed || typeof parsed !== 'object') {
                return { success: false, message: 'Invalid file format: not a JSON object.' };
            }

            if (!Array.isArray(parsed.workoutSessions) && !Array.isArray(parsed.exercises)) {
                return { success: false, message: 'Invalid backup file: Missing workout data structure.' };
            }

            this.hydrateData(parsed);
            await this.save();

            const sessionCount = this.data.workoutSessions.length;
            const setCount = this.data.workoutSets.length;
            return { 
                success: true, 
                message: `Imported ${sessionCount} workout session(s) and ${setCount} set(s) successfully!`,
                count: sessionCount
            };
        } catch (e: any) {
            console.error("Failed to import JSON file", e);
            return { success: false, message: e.message || 'Failed to parse JSON file' };
        }
    }
}

export const jsonDatabase = new JsonDatabaseService();
