import type { WorkoutSessionRepository } from '../repositories/interfaces';
import type { WorkoutSession } from '../models/types';
import { jsonDatabase } from './JsonDatabaseService';

export class JsonWorkoutSessionRepository implements WorkoutSessionRepository {
    async save(session: WorkoutSession): Promise<void> {
        await jsonDatabase.init();
        const idx = jsonDatabase.data.workoutSessions.findIndex(s => s.id === session.id);
        if (idx !== -1) {
            jsonDatabase.data.workoutSessions[idx] = session;
        } else {
            jsonDatabase.data.workoutSessions.push(session);
        }
        await jsonDatabase.save();
    }

    async findById(id: string): Promise<WorkoutSession | null> {
        await jsonDatabase.init();
        return jsonDatabase.data.workoutSessions.find(s => s.id === id) || null;
    }

    async deleteById(id: string): Promise<void> {
        await jsonDatabase.init();
        jsonDatabase.data.workoutSessions = jsonDatabase.data.workoutSessions.filter(s => s.id !== id);
        // Also clean up any sets referencing this session to maintain integrity
        jsonDatabase.data.workoutSets = jsonDatabase.data.workoutSets.filter(s => s.sessionId !== id);
        await jsonDatabase.save();
    }

    async getLatestSession(): Promise<WorkoutSession | null> {
        await jsonDatabase.init();
        const sessions = [...jsonDatabase.data.workoutSessions].sort((a, b) => b.date - a.date);
        return sessions.length > 0 ? sessions[0] : null;
    }

    async getAll(): Promise<WorkoutSession[]> {
        await jsonDatabase.init();
        return [...jsonDatabase.data.workoutSessions].sort((a, b) => b.date - a.date);
    }
    
    async getFirstSession(): Promise<WorkoutSession | null> {
        await jsonDatabase.init();
        const sessions = [...jsonDatabase.data.workoutSessions].sort((a, b) => a.date - b.date);
        return sessions.length > 0 ? sessions[0] : null;
    }
    
    async getTotalDaysAttended(): Promise<number> {
        await jsonDatabase.init();
        const uniqueDays = new Set<string>();
        jsonDatabase.data.workoutSessions.forEach(session => {
             const dateStr = new Date(session.date).toDateString();
             uniqueDays.add(dateStr);
        });
        return uniqueDays.size;
    }
}
