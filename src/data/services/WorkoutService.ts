import type { Exercise, WorkoutSession, WorkoutSet, BodyPart } from '../models/types';
import { SqliteExerciseRepository } from '../sqlite/SqliteExerciseRepository';
import { SqliteWorkoutSessionRepository, SqliteWorkoutSetRepository } from '../sqlite/SqliteWorkoutRepositories';

// Singleton instances functioning like Spring @Service and @Repository beans
const exerciseRepo = new SqliteExerciseRepository();
const sessionRepo = new SqliteWorkoutSessionRepository();
const setRepo = new SqliteWorkoutSetRepository();

export class WorkoutService {

    // --- Exercises ---
    async getExercisesByBodyPart(part: BodyPart): Promise<Exercise[]> {
        return exerciseRepo.getByBodyPart(part);
    }

    async getAllExercises(): Promise<Exercise[]> {
        return exerciseRepo.getAll();
    }

    async getExerciseById(id: string): Promise<Exercise | null> {
        return exerciseRepo.findById(id);
    }

    async addCustomExercise(name: string, bodyPart: BodyPart): Promise<Exercise> {
        const exercise: Exercise = {
            id: crypto.randomUUID(),
            name,
            bodyPart,
            isCustom: true
        };
        await exerciseRepo.save(exercise);
        return exercise;
    }

    // --- Sessions & Sets ---
    async startNewSession(): Promise<WorkoutSession> {
        const session: WorkoutSession = {
            id: crypto.randomUUID(),
            date: Date.now()
        };
        await sessionRepo.save(session);
        return session;
    }

    async getLatestSession(): Promise<WorkoutSession | null> {
        return sessionRepo.getLatestSession();
    }

    async getAllSessions(): Promise<WorkoutSession[]> {
        return sessionRepo.getAll();
    }

    async logSet(sessionId: string, exerciseId: string, weight: number, reps: number): Promise<WorkoutSet> {
        const set: WorkoutSet = {
            id: crypto.randomUUID(),
            sessionId,
            exerciseId,
            weight,
            reps,
            loggedAt: Date.now()
        };
        await setRepo.save(set);
        return set;
    }

    async getSetsForSession(sessionId: string): Promise<WorkoutSet[]> {
        return setRepo.getBySessionId(sessionId);
    }

    async getLastSetForExercise(exerciseId: string): Promise<WorkoutSet | null> {
        return setRepo.getLastSetForExercise(exerciseId);
    }

    async deleteSet(setId: string): Promise<void> {
        await setRepo.deleteById(setId);
    }
}

// Export a singleton instance of the service
export const workoutService = new WorkoutService();
