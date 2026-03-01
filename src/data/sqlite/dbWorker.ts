import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import defaultExercises from '../config/defaultExercises.json';

let db: any;
let sqlite3Inst: any;

sqlite3InitModule().then((sqlite3) => {
    sqlite3Inst = sqlite3;
    if (sqlite3.oo1.OpfsDb) {
        db = new sqlite3.oo1.OpfsDb('/gymtracker.sqlite3');
    } else {
        // Fallback if OPFS is unavailable
        db = new sqlite3.oo1.DB('/gymtracker.sqlite3', 'ct');
    }

    // Auto-migrate tables on start
    db.exec(`
    CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        bodyPart TEXT NOT NULL,
        isCustom INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS workout_sessions (
        id TEXT PRIMARY KEY,
        date INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS workout_sets (
        id TEXT PRIMARY KEY,
        sessionId TEXT NOT NULL,
        exerciseId TEXT NOT NULL,
        weight REAL NOT NULL,
        reps INTEGER NOT NULL,
        loggedAt INTEGER NOT NULL,
        FOREIGN KEY(sessionId) REFERENCES workout_sessions(id),
        FOREIGN KEY(exerciseId) REFERENCES exercises(id)
    );
  `);

    // Seed initial data if empty
    const countRes = db.selectValues('SELECT count(*) FROM exercises');
    const count = countRes[0];

    if (count === 0) {
        let stmt = db.prepare('INSERT INTO exercises (id, name, bodyPart, isCustom) VALUES (?, ?, ?, 0)');

        for (const [bodyPart, exercises] of Object.entries(defaultExercises)) {
            for (const exerciseName of (exercises as string[])) {
                stmt.bind([crypto.randomUUID(), exerciseName, bodyPart]);
                stmt.step();
                stmt.reset();
            }
        }
        stmt.finalize();
    }

    self.postMessage({ type: 'READY' });
}).catch(console.error);
self.onmessage = (e) => {
    const { id, action, sql, bind } = e.data;
    if (!db && action !== 'READY') {
        self.postMessage({ id, error: 'DB not initialized' });
        return;
    }
    try {
        if (action === 'exec') {
            db.exec({ sql, bind });
            self.postMessage({ id, result: true });
        } else if (action === 'select') {
            const rows: any[] = [];
            db.exec({
                sql,
                bind,
                rowMode: 'object',
                callback: (row: any) => rows.push(row)
            });
            self.postMessage({ id, result: rows });
        } else if (action === 'selectValue') {
            const result = db.selectValues(sql, bind);
            self.postMessage({ id, result: result.length > 0 ? result[0] : null });
        } else if (action === 'exportDb') {
            // Export DB file as a Uint8Array
            const byteArray = sqlite3Inst.capi.sqlite3_js_db_export(db.pointer);
            self.postMessage({ id, result: byteArray });
        }
    } catch (err: any) {
        self.postMessage({ id, error: err.message });
    }
};
