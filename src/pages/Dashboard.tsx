import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { workoutService } from '../data/services/WorkoutService';
import type { WorkoutSession } from '../data/models/types';

export const Dashboard: React.FC = () => {
    const [latestSession, setLatestSession] = useState<WorkoutSession | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // We assume the worker initializes super fast since it's local
        // In a real app we might want a global "isReady" state
        workoutService.getLatestSession().then(setLatestSession).catch(console.error);
    }, []);

    const handleStartWorkout = async () => {
        try {
            const session = await workoutService.startNewSession();
            navigate(`/workout/${session.id}`);
        } catch (e) {
            console.error(e);
            alert('Failed to start workout. Database might be initializing.');
        }
    };

    return (
        <div className="p-6">
            <header className="mb-8 mt-4">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gym Tracker</h1>
                <p className="text-gray-500 mt-1">Let's get those gains today.</p>
            </header>

            <section className="mb-8">
                <button
                    onClick={handleStartWorkout}
                    className="w-full bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-primary-500/30 flex items-center justify-center space-x-3 transition-transform transform active:scale-95"
                >
                    <Play fill="currentColor" size={24} />
                    <span className="text-lg">Start Empty Workout</span>
                </button>
            </section>

            <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Activity Summary</h2>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    {latestSession ? (
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Last Session</p>
                            <p className="font-medium">{new Date(latestSession.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No workouts recorded yet. Start one above!</p>
                    )}
                </div>
            </section>
        </div>
    );
};
