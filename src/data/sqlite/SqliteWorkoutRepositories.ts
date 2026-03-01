import type { WorkoutSession, WorkoutSet } from '../models/types';
import type { WorkoutSessionRepository, WorkoutSetRepository } from '../repositories/interfaces';
import { dbExec, dbSelect } from './dbClient';

export class SqliteWorkoutSessionRepository implements WorkoutSessionRepository {
    async getAll(): Promise<WorkoutSession[]> {
        return dbSelect<WorkoutSession>('SELECT * FROM workout_sessions ORDER BY date DESC');
    }

    async findById(id: string): Promise<WorkoutSession | null> {
        const rows = await dbSelect<WorkoutSession>('SELECT * FROM workout_sessions WHERE id = ?', [id]);
        return rows.length > 0 ? rows[0] : null;
    }

    async save(session: WorkoutSession): Promise<void> {
        await dbExec(
            'INSERT OR REPLACE INTO workout_sessions (id, date) VALUES (?, ?)',
            [session.id, session.date]
        );
    }

    async getLatestSession(): Promise<WorkoutSession | null> {
        const rows = await dbSelect<WorkoutSession>('SELECT * FROM workout_sessions ORDER BY date DESC LIMIT 1');
        return rows.length > 0 ? rows[0] : null;
    }

    async getFirstSession(): Promise<WorkoutSession | null> {
        const rows = await dbSelect<WorkoutSession>('SELECT * FROM workout_sessions ORDER BY date ASC LIMIT 1');
        return rows.length > 0 ? rows[0] : null;
    }

    async getTotalDaysAttended(): Promise<number> {
        // SQLite: datetime(date/1000, 'unixepoch') converts JS ms to UTC string
        // We calculate unique local days by converting it to local time in SQLite or grouping by distinct dates using JS.
        // For simplicity and to avoid SQLite timezone quirks in OPFS, we'll fetch all sessions and calculate in JS.
        // It's a localized app, so memory footprint is tiny.
        const allSessions = await this.getAll();
        const uniqueDays = new Set(
            allSessions.map(s => {
                const d = new Date(s.date);
                return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            })
        );
        return uniqueDays.size;
    }
}

export class SqliteWorkoutSetRepository implements WorkoutSetRepository {
    async getBySessionId(sessionId: string): Promise<WorkoutSet[]> {
        return dbSelect<WorkoutSet>('SELECT * FROM workout_sets WHERE sessionId = ? ORDER BY loggedAt ASC', [sessionId]);
    }

    async getByExerciseId(exerciseId: string): Promise<WorkoutSet[]> {
        return dbSelect<WorkoutSet>('SELECT * FROM workout_sets WHERE exerciseId = ? ORDER BY loggedAt DESC', [exerciseId]);
    }

    async save(set: WorkoutSet): Promise<void> {
        await dbExec(
            'INSERT OR REPLACE INTO workout_sets (id, sessionId, exerciseId, weight, reps, loggedAt) VALUES (?, ?, ?, ?, ?, ?)',
            [set.id, set.sessionId, set.exerciseId, set.weight, set.reps, set.loggedAt]
        );
    }

    async deleteById(id: string): Promise<void> {
        await dbExec('DELETE FROM workout_sets WHERE id = ?', [id]);
    }

    async getRecentSetsForExercise(exerciseId: string, limit: number): Promise<WorkoutSet[]> {
        return dbSelect<WorkoutSet>('SELECT * FROM workout_sets WHERE exerciseId = ? ORDER BY loggedAt DESC LIMIT ?', [exerciseId, limit]);
    }
}
