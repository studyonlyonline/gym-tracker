import React, { useEffect, useState } from 'react';
import type { WorkoutSession } from '../data/models/types';
import { workoutService } from '../data/services/WorkoutService';
import { Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HistoryView: React.FC = () => {
    const [sessions, setSessions] = useState<WorkoutSession[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Better way since I need to add getAllSessions to WorkoutService
        workoutService.getAllSessions().then(setSessions).catch(console.error);
    }, []);

    return (
        <div className="p-6">
            <header className="mb-6 mt-4">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Workout History</h1>
                <p className="text-gray-500 text-sm mt-1">Review your past sessions</p>
            </header>

            <div className="space-y-4">
                {sessions.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl border border-gray-200 border-dashed">
                        <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No workout history found.</p>
                    </div>
                ) : (
                    sessions.map(session => (
                        <button
                            key={session.id}
                            onClick={() => navigate(`/workout/${session.id}`)}
                            className="w-full bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center active:bg-gray-50 transition-colors text-left"
                        >
                            <div>
                                <h3 className="font-bold text-gray-900">
                                    {new Date(session.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(session.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <ChevronRight size={20} className="text-gray-400" />
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};
