import type { ExerciseRepository, WorkoutSessionRepository, WorkoutSetRepository } from '../repositories/interfaces';
import { SqliteExerciseRepository } from '../sqlite/SqliteExerciseRepository';
import { SqliteWorkoutSessionRepository, SqliteWorkoutSetRepository } from '../sqlite/SqliteWorkoutRepositories';
import { MongoExerciseRepository } from '../mongo/MongoExerciseRepository';
import { MongoWorkoutSessionRepository } from '../mongo/MongoWorkoutSessionRepository';
import { MongoWorkoutSetRepository } from '../mongo/MongoWorkoutSetRepository';
import { getMongoConfig } from '../mongo/mongoConfig';

export class RepositoryFactory {
    static getExerciseRepository(): ExerciseRepository {
        if (getMongoConfig().enabled) {
            return new MongoExerciseRepository();
        }
        return new SqliteExerciseRepository();
    }

    static getWorkoutSessionRepository(): WorkoutSessionRepository {
        if (getMongoConfig().enabled) {
            return new MongoWorkoutSessionRepository();
        }
        return new SqliteWorkoutSessionRepository();
    }

    static getWorkoutSetRepository(): WorkoutSetRepository {
        if (getMongoConfig().enabled) {
            return new MongoWorkoutSetRepository();
        }
        return new SqliteWorkoutSetRepository();
    }
}
