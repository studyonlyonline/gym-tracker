export type BodyPart = 'Chest' | 'Back' | 'Biceps' | 'Triceps' | 'Legs' | 'Shoulders' | 'Core' | 'Other';

export interface Exercise {
    id: string;
    name: string;
    bodyPart: BodyPart;
    isCustom: boolean; // false for pre-populated exercises
}

export interface WorkoutSession {
    id: string;
    date: number; // ms timestamp
}

export interface WorkoutSet {
    id: string;
    sessionId: string;
    exerciseId: string;
    weight: number;
    reps: number;
    loggedAt: number; // ms timestamp, for ordering sets within a session
}
