import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workoutService } from '../data/services/WorkoutService';
import type { Exercise, WorkoutSession, WorkoutSet } from '../data/models/types';
import { ArrowLeft, Calendar, Dumbbell } from 'lucide-react';

export const SessionDetailView: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();

    const [session, setSession] = useState<WorkoutSession | null>(null);
    const [sets, setSets] = useState<WorkoutSet[]>([]);
    const [exercises, setExercises] = useState<Record<string, Exercise>>({});

    useEffect(() => {
        const loadSessionDetails = async () => {
            if (!sessionId) return;

            // In a real app we'd have a getSessionById. 
            // For now, let's get all and filter (since list is small)
            const allSessions = await workoutService.getAllSessions();
            const foundSession = allSessions.find(s => s.id === sessionId);
            if (!foundSession) return;
            setSession(foundSession);

            const sessionSets = await workoutService.getSetsForSession(sessionId);
            setSets(sessionSets);

            const uniqueExerciseIds = [...new Set(sessionSets.map(s => s.exerciseId))];
            const exerciseMap: Record<string, Exercise> = {};
            for (const id of uniqueExerciseIds) {
                const ex = await workoutService.getExerciseById(id);
                if (ex) exerciseMap[ex.id] = ex;
            }
            setExercises(exerciseMap);
        };

        loadSessionDetails();
    }, [sessionId]);

    if (!session) {
        return <div className="p-6 text-center mt-10 text-gray-400">Loading session details...</div>;
    }

    // Group sets by exercise
    const groupedSets: Record<string, WorkoutSet[]> = {};
    sets.forEach(set => {
        if (!groupedSets[set.exerciseId]) {
            groupedSets[set.exerciseId] = [];
        }
        groupedSets[set.exerciseId].push(set);
    });

    const uniqueExerciseIds = Object.keys(groupedSets);

    return (
        <div className="p-4 h-full flex flex-col bg-gray-50/50">
            <header className="mb-6 flex items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <button
                    onClick={() => navigate('/history')}
                    className="p-2 mr-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Workout Review</h1>
                    <p className="text-sm text-gray-500 flex items-center mt-0.5">
                        <Calendar size={14} className="mr-1" />
                        {new Date(session.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto space-y-4 pb-10">
                {uniqueExerciseIds.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed">
                        <Dumbbell size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">No exercises recorded in this session.</p>
                    </div>
                ) : (
                    uniqueExerciseIds.map(exerciseId => {
                        const exercise = exercises[exerciseId];
                        const exerciseSets = groupedSets[exerciseId];
                        if (!exercise) return null;

                        return (
                            <div key={exerciseId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{exercise.name}</h3>
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{exercise.bodyPart}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-white">
                                    <div className="space-y-2">
                                        {exerciseSets.map((s, idx) => (
                                            <div key={s.id} className="flex justify-between items-center text-sm py-2 px-3 bg-gray-50 rounded-lg">
                                                <span className="font-medium text-gray-500 w-8">#{idx + 1}</span>
                                                <span className="font-bold text-gray-800 flex-1">{s.weight} kg</span>
                                                <span className="font-bold text-gray-800 w-16 text-right">{s.reps} reps</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
