import type { Exercise } from '../models/types';
import type { ExerciseRepository } from '../repositories/interfaces';
import { dbExec, dbSelect } from './dbClient';

export class SqliteExerciseRepository implements ExerciseRepository {
    async getAll(): Promise<Exercise[]> {
        return dbSelect<Exercise>('SELECT * FROM exercises ORDER BY name ASC');
    }

    async getByBodyPart(bodyPart: string): Promise<Exercise[]> {
        return dbSelect<Exercise>('SELECT * FROM exercises WHERE bodyPart = ? ORDER BY name ASC', [bodyPart]);
    }

    async findById(id: string): Promise<Exercise | null> {
        const rows = await dbSelect<Exercise>('SELECT * FROM exercises WHERE id = ?', [id]);
        return rows.length > 0 ? rows[0] : null;
    }

    async save(exercise: Exercise): Promise<void> {
        await dbExec(
            'INSERT OR REPLACE INTO exercises (id, name, bodyPart, isCustom) VALUES (?, ?, ?, ?)',
            [exercise.id, exercise.name, exercise.bodyPart, exercise.isCustom ? 1 : 0]
        );
    }

    async saveAll(exercises: Exercise[]): Promise<void> {
        for (const ex of exercises) {
            await this.save(ex);
        }
    }
}
