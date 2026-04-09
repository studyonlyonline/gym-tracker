import type { WorkoutSetRepository } from '../repositories/interfaces';
import type { WorkoutSet } from '../models/types';
import { jsonDatabase } from './JsonDatabaseService';

export class JsonWorkoutSetRepository implements WorkoutSetRepository {
    async save(set: WorkoutSet): Promise<void> {
        await jsonDatabase.init();
        const idx = jsonDatabase.data.workoutSets.findIndex(s => s.id === set.id);
        if (idx !== -1) {
            jsonDatabase.data.workoutSets[idx] = set;
        } else {
            jsonDatabase.data.workoutSets.push(set);
        }
        await jsonDatabase.save();
    }

    async getBySessionId(sessionId: string): Promise<WorkoutSet[]> {
        await jsonDatabase.init();
        return jsonDatabase.data.workoutSets
            .filter(set => set.sessionId === sessionId)
            .sort((a, b) => a.loggedAt - b.loggedAt);
    }
    
    async getByExerciseId(exerciseId: string): Promise<WorkoutSet[]> {
        await jsonDatabase.init();
        return jsonDatabase.data.workoutSets
            .filter(set => set.exerciseId === exerciseId)
            .sort((a, b) => a.loggedAt - b.loggedAt);
    }
    
    async getRecentSetsForExercise(exerciseId: string, limit: number): Promise<WorkoutSet[]> {
         await jsonDatabase.init();
         return jsonDatabase.data.workoutSets
             .filter(set => set.exerciseId === exerciseId)
             .sort((a, b) => b.loggedAt - a.loggedAt)
             .slice(0, limit);
    }
    
    async deleteById(id: string): Promise<void> {
         await jsonDatabase.init();
         jsonDatabase.data.workoutSets = jsonDatabase.data.workoutSets.filter(s => s.id !== id);
         await jsonDatabase.save();
    }
}
