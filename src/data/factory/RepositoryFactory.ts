import type { ExerciseRepository, WorkoutSessionRepository, WorkoutSetRepository } from '../repositories/interfaces';
import { JsonExerciseRepository } from '../json/JsonExerciseRepository';
import { JsonWorkoutSessionRepository } from '../json/JsonWorkoutSessionRepository';
import { JsonWorkoutSetRepository } from '../json/JsonWorkoutSetRepository';

export class RepositoryFactory {
    static getExerciseRepository(): ExerciseRepository {
        return new JsonExerciseRepository();
    }

    static getWorkoutSessionRepository(): WorkoutSessionRepository {
        return new JsonWorkoutSessionRepository();
    }

    static getWorkoutSetRepository(): WorkoutSetRepository {
        return new JsonWorkoutSetRepository();
    }
}
