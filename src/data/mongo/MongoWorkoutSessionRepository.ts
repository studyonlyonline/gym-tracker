import type { WorkoutSessionRepository } from '../repositories/interfaces';
import type { WorkoutSession } from '../models/types';
import { MongoClient } from './apiClient';

export class MongoWorkoutSessionRepository implements WorkoutSessionRepository {
    private client = new MongoClient('workout_sessions');

    async getAll(): Promise<WorkoutSession[]> {
        return this.client.find({}, { date: -1 });
    }

    async findById(id: string): Promise<WorkoutSession | null> {
        return this.client.findOne({ id });
    }

    async save(session: WorkoutSession): Promise<void> {
        await this.client.upsertOne({ id: session.id }, session);
    }

    async getLatestSession(): Promise<WorkoutSession | null> {
        const docs = await this.client.find({}, { date: -1 }, 1);
        return docs.length > 0 ? docs[0] : null;
    }

    async getFirstSession(): Promise<WorkoutSession | null> {
        const docs = await this.client.find({}, { date: 1 }, 1);
        return docs.length > 0 ? docs[0] : null;
    }

    async getTotalDaysAttended(): Promise<number> {
        // Data API aggregate
        const pipeline = [
            {
                $group: {
                    _id: {
                       $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$date" } }
                    }
                }
            },
            {
                $count: "totalDays"
            }
        ];
        
        try {
            const results = await this.client.aggregate(pipeline);
            if (results && results.length > 0) {
                return results[0].totalDays;
            }
        } catch (e) {
            console.error("Aggregation failed", e);
        }
        return 0;
    }
}
