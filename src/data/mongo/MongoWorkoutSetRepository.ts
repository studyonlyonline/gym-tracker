import type { WorkoutSetRepository } from '../repositories/interfaces';
import type { WorkoutSet } from '../models/types';
import { MongoClient } from './apiClient';

export class MongoWorkoutSetRepository implements WorkoutSetRepository {
    private client = new MongoClient('workout_sets');

    async getBySessionId(sessionId: string): Promise<WorkoutSet[]> {
        return this.client.find({ sessionId }, { loggedAt: 1 });
    }

    async getByExerciseId(exerciseId: string): Promise<WorkoutSet[]> {
        return this.client.find({ exerciseId }, { loggedAt: -1 });
    }

    async save(set: WorkoutSet): Promise<void> {
        await this.client.upsertOne({ id: set.id }, set);
    }

    async deleteById(id: string): Promise<void> {
        await this.client.deleteOne({ id });
    }

    async getRecentSetsForExercise(exerciseId: string, limit: number): Promise<WorkoutSet[]> {
        return this.client.find({ exerciseId }, { loggedAt: -1 }, limit);
    }
}
