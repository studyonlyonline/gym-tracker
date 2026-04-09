import type { ExerciseRepository } from '../repositories/interfaces';
import type { Exercise, BodyPart } from '../models/types';
import { jsonDatabase } from './JsonDatabaseService';

export class JsonExerciseRepository implements ExerciseRepository {
    async getAll(): Promise<Exercise[]> {
        await jsonDatabase.init();
        return [...jsonDatabase.data.exercises];
    }

    async getByBodyPart(part: BodyPart): Promise<Exercise[]> {
        await jsonDatabase.init();
        return jsonDatabase.data.exercises.filter(e => e.bodyPart === part);
    }

    async findById(id: string): Promise<Exercise | null> {
         await jsonDatabase.init();
         return jsonDatabase.data.exercises.find(e => e.id === id) || null;
    }

    async save(exercise: Exercise): Promise<void> {
        await jsonDatabase.init();
        const idx = jsonDatabase.data.exercises.findIndex(e => e.id === exercise.id);
        if (idx !== -1) {
            jsonDatabase.data.exercises[idx] = exercise;
        } else {
            jsonDatabase.data.exercises.push(exercise);
        }
        await jsonDatabase.save();
    }

    async saveAll(exercises: Exercise[]): Promise<void> {
        await jsonDatabase.init();
        for (const exercise of exercises) {
            const idx = jsonDatabase.data.exercises.findIndex(e => e.id === exercise.id);
            if (idx !== -1) {
                jsonDatabase.data.exercises[idx] = exercise;
            } else {
                jsonDatabase.data.exercises.push(exercise);
            }
        }
        await jsonDatabase.save();
    }
}
