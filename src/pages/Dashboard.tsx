import React, { useEffect, useState } from 'react';
import { Play, TrendingUp, CalendarDays, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { workoutService } from '../data/services/WorkoutService';
import type { WorkoutSession } from '../data/models/types';

export const Dashboard: React.FC = () => {
    const [latestSession, setLatestSession] = useState<WorkoutSession | null>(null);
    const [metrics, setMetrics] = useState({
        daysSinceStart: 0,
        daysAttended: 0,
        daysMissed: 0,
        daysSinceLast: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const latest = await workoutService.getLatestSession();
                const first = await workoutService.getFirstSession();
                const attended = await workoutService.getTotalDaysAttended();

                setLatestSession(latest);

                let daysSinceStart = 0;
                let daysMissed = 0;
                let daysSinceLast = 0;

                const now = new Date();
                // Reset to start of day for accurate full-day counting
                const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

                if (first) {
                    const localFirstMidnight = new Date(new Date(first.date).getFullYear(), new Date(first.date).getMonth(), new Date(first.date).getDate()).getTime();
                    // Add 1 so the first day counts as day 1
                    daysSinceStart = Math.floor((todayMidnight - localFirstMidnight) / (1000 * 60 * 60 * 24)) + 1;
                    daysMissed = Math.max(0, daysSinceStart - attended);
                }

                if (latest) {
                    const localLatestMidnight = new Date(new Date(latest.date).getFullYear(), new Date(latest.date).getMonth(), new Date(latest.date).getDate()).getTime();
                    daysSinceLast = Math.floor((todayMidnight - localLatestMidnight) / (1000 * 60 * 60 * 24));
                }

                setMetrics({
                    daysSinceStart,
                    daysAttended: attended,
                    daysMissed,
                    daysSinceLast
                });
            } catch (e) {
                console.error("Error loading dashboard data:", e);
            }
        };

        loadDashboardData();
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
            <header className="mb-6 mt-4">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gym Tracker</h1>
                <p className="text-gray-500 mt-1">Let's get those gains today.</p>
            </header>

            <section className="mb-6">
                <button
                    onClick={handleStartWorkout}
                    className="w-full bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-primary-500/30 flex items-center justify-center space-x-3 transition-transform transform active:scale-95"
                >
                    <Play fill="currentColor" size={24} />
                    <span className="text-lg">Start Empty Workout</span>
                </button>
            </section>

            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Your Progress</h2>
                    <TrendingUp size={20} className="text-primary-500" />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
                        <span className="text-3xl font-black text-primary-600 mb-1">{metrics.daysAttended}</span>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Days</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
                        <span className="text-3xl font-black text-red-500 mb-1">{metrics.daysMissed}</span>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Days Missed</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4 flex items-center">
                    <div className="bg-blue-50 p-3 rounded-full mr-4">
                        <CalendarDays className="text-blue-500" size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-1">Days since last workout</p>
                        <p className="text-xl font-bold text-gray-900">
                            {metrics.daysSinceLast === 0 ? "You went today! 🎉" :
                                metrics.daysSinceLast === 1 ? "1 day ago" :
                                    `${metrics.daysSinceLast} days ago`}
                        </p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center mb-6">
                    <div className="bg-green-50 p-3 rounded-full mr-4">
                        <Activity className="text-green-500" size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-1">Last Session Date</p>
                        <p className="font-bold text-gray-800">
                            {latestSession ? new Date(latestSession.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) : "No workouts yet"}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};
