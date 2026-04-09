import { get, set, del } from 'idb-keyval';
import type { Exercise, WorkoutSession, WorkoutSet, BodyPart } from '../models/types';
import defaultExercisesData from '../config/defaultExercises.json';

const FILE_HANDLE_KEY = 'gymtracker_json_file_handle';

export interface DatabaseSchema {
    exercises: Exercise[];
    workoutSessions: WorkoutSession[];
    workoutSets: WorkoutSet[];
}

function parseDefaultExercises(): Exercise[] {
    const exercises: Exercise[] = [];
    const typedDefaults = defaultExercisesData as Record<string, string[]>;
    for (const [bodyPart, names] of Object.entries(typedDefaults)) {
        for (const name of names) {
            exercises.push({
                id: crypto.randomUUID(),
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

    async init() {
        if (this.initialized) return;
        this.fileHandle = await get(FILE_HANDLE_KEY);
        if (this.fileHandle) {
            await this.loadFromFile();
        }
        this.initialized = true;
    }

    async hasValidHandle(): Promise<boolean> {
        this.fileHandle = await get(FILE_HANDLE_KEY);
        if (!this.fileHandle) return false;
        
        const opts = { mode: 'readwrite' as const };
        if ((await this.fileHandle.queryPermission(opts)) === 'granted') {
             return true;
        }
        return false;
    }

    async verifyPermission(): Promise<boolean> {
        if (!this.fileHandle) return false;
        const opts = { mode: 'readwrite' as const };
         if ((await this.fileHandle.queryPermission(opts)) === 'granted') {
             return true;
         }
         return (await this.fileHandle.requestPermission(opts)) === 'granted';
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
            this.data = {
                exercises: parsed.exercises || defaultExercisesData,
                workoutSessions: parsed.workoutSessions || [],
                workoutSets: parsed.workoutSets || []
            };
        } catch(e) {
            console.error("Failed to parse JSON DB", e);
        }
    }

    async save() {
         if (!this.fileHandle) return;
         try {
             // File System Access API streaming save
             const writable = await this.fileHandle.createWritable();
             await writable.write(JSON.stringify(this.data, null, 2));
             await writable.close();
         } catch (e) {
             console.error("Failed to save to JSON file", e);
         }
    }

    async linkExistingFile() {
        try {
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
}

export const jsonDatabase = new JsonDatabaseService();
