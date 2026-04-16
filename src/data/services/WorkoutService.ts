import type { Exercise, WorkoutSession, WorkoutSet, BodyPart } from '../models/types';
import { RepositoryFactory } from '../factory/RepositoryFactory';

// Fetch instances via the Factory pattern
const getExerciseRepo = () => RepositoryFactory.getExerciseRepository();
const getSessionRepo = () => RepositoryFactory.getWorkoutSessionRepository();
const getSetRepo = () => RepositoryFactory.getWorkoutSetRepository();

export class WorkoutService {

    // --- Exercises ---
    async getExercisesByBodyPart(part: BodyPart): Promise<Exercise[]> {
        return getExerciseRepo().getByBodyPart(part);
    }

    async getAllExercises(): Promise<Exercise[]> {
        return getExerciseRepo().getAll();
    }

    async getExerciseById(id: string): Promise<Exercise | null> {
        return getExerciseRepo().findById(id);
    }

    async addCustomExercise(name: string, bodyPart: BodyPart): Promise<Exercise> {
        const exercise: Exercise = {
            id: crypto.randomUUID(),
            name,
            bodyPart,
            isCustom: true
        };
        await getExerciseRepo().save(exercise);
        return exercise;
    }

    // --- Sessions & Sets ---
    async startNewSession(): Promise<WorkoutSession> {
        const session: WorkoutSession = {
            id: crypto.randomUUID(),
            date: Date.now()
        };
        await getSessionRepo().save(session);
        return session;
    }

    async getLatestSession(): Promise<WorkoutSession | null> {
        return getSessionRepo().getLatestSession();
    }

    async getAllSessions(): Promise<WorkoutSession[]> {
        return getSessionRepo().getAll();
    }

    async getFirstSession(): Promise<WorkoutSession | null> {
        return getSessionRepo().getFirstSession();
    }

    async getTotalDaysAttended(): Promise<number> {
        return getSessionRepo().getTotalDaysAttended();
    }

    async deleteSession(sessionId: string): Promise<void> {
        return getSessionRepo().deleteById(sessionId);
    }
    
    async updateSession(session: WorkoutSession): Promise<void> {
        return getSessionRepo().save(session);
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
        await getSetRepo().save(set);
        return set;
    }

    async getSetsForSession(sessionId: string): Promise<WorkoutSet[]> {
        return getSetRepo().getBySessionId(sessionId);
    }

    async getRecentSetsForExercise(exerciseId: string, limit: number = 3): Promise<WorkoutSet[]> {
        return getSetRepo().getRecentSetsForExercise(exerciseId, limit);
    }

    async deleteSet(setId: string): Promise<void> {
        await getSetRepo().deleteById(setId);
    }
}

// Export a singleton instance of the service
export const workoutService = new WorkoutService();
