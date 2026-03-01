import type { Exercise, WorkoutSession, WorkoutSet } from '../models/types';

// Spring-like Repository Interfaces
export interface ExerciseRepository {
    getAll(): Promise<Exercise[]>;
    getByBodyPart(bodyPart: string): Promise<Exercise[]>;
    findById(id: string): Promise<Exercise | null>;
    save(exercise: Exercise): Promise<void>;
    saveAll(exercises: Exercise[]): Promise<void>;
}

export interface WorkoutSessionRepository {
    getAll(): Promise<WorkoutSession[]>;
    findById(id: string): Promise<WorkoutSession | null>;
    save(session: WorkoutSession): Promise<void>;
    getLatestSession(): Promise<WorkoutSession | null>;
}

export interface WorkoutSetRepository {
    getBySessionId(sessionId: string): Promise<WorkoutSet[]>;
    getByExerciseId(exerciseId: string): Promise<WorkoutSet[]>;
    save(set: WorkoutSet): Promise<void>;
    deleteById(id: string): Promise<void>;
    // For progressive overload tracking:
    getLastSetForExercise(exerciseId: string): Promise<WorkoutSet | null>;
}
