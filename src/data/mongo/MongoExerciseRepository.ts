import type { ExerciseRepository } from '../repositories/interfaces';
import type { Exercise } from '../models/types';
import { MongoClient } from './apiClient';

export class MongoExerciseRepository implements ExerciseRepository {
    private client = new MongoClient('exercises');

    async getAll(): Promise<Exercise[]> {
        return this.client.find({});
    }

    async getByBodyPart(bodyPart: string): Promise<Exercise[]> {
        return this.client.find({ bodyPart });
    }

    async findById(id: string): Promise<Exercise | null> {
        return this.client.findOne({ id });
    }

    async save(exercise: Exercise): Promise<void> {
        await this.client.upsertOne({ id: exercise.id }, exercise);
    }

    async saveAll(exercises: Exercise[]): Promise<void> {
        // Data API doesn't have a direct upsertMany, so we might have to use insertMany,
        // but it will fail if duplicate IDs exist.
        // For seed data, we can just insertMany, but safely skip errors if possible.
        // The simplest fallback is looping and saving one by one for now since saveAll is mostly for default data.
        for (const ex of exercises) {
             await this.save(ex);
        }
    }
}
