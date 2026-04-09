import type { ExerciseRepository, WorkoutSessionRepository, WorkoutSetRepository } from '../repositories/interfaces';
import { SqliteExerciseRepository } from '../sqlite/SqliteExerciseRepository';
import { SqliteWorkoutSessionRepository, SqliteWorkoutSetRepository } from '../sqlite/SqliteWorkoutRepositories';
import { JsonExerciseRepository } from '../json/JsonExerciseRepository';
import { JsonWorkoutSessionRepository } from '../json/JsonWorkoutSessionRepository';
import { JsonWorkoutSetRepository } from '../json/JsonWorkoutSetRepository';
import { getJsonConfig } from '../json/jsonConfig';

export class RepositoryFactory {
    static getExerciseRepository(): ExerciseRepository {
        if (getJsonConfig().enabled) {
            return new JsonExerciseRepository();
        }
        return new SqliteExerciseRepository();
    }

    static getWorkoutSessionRepository(): WorkoutSessionRepository {
        if (getJsonConfig().enabled) {
            return new JsonWorkoutSessionRepository();
        }
        return new SqliteWorkoutSessionRepository();
    }

    static getWorkoutSetRepository(): WorkoutSetRepository {
        if (getJsonConfig().enabled) {
            return new JsonWorkoutSetRepository();
        }
        return new SqliteWorkoutSetRepository();
    }
}
