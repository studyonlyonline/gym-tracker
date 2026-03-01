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

    async getLastSetForExercise(exerciseId: string): Promise<WorkoutSet | null> {
        const rows = await dbSelect<WorkoutSet>('SELECT * FROM workout_sets WHERE exerciseId = ? ORDER BY loggedAt DESC LIMIT 1', [exerciseId]);
        return rows.length > 0 ? rows[0] : null;
    }
}
