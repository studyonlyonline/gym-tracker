import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workoutService } from '../data/services/WorkoutService';
import type { Exercise, WorkoutSet, BodyPart } from '../data/models/types';
import { Plus, Check, ArrowLeft, History as HistoryIcon, X } from 'lucide-react';

export const ActiveSession: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const [sets, setSets] = useState<WorkoutSet[]>([]);

    const [isSelectingExercise, setIsSelectingExercise] = useState(false);
    const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);

    // Group sets by exercise
    const [activeExercises, setActiveExercises] = useState<Exercise[]>([]);

    useEffect(() => {
        if (!sessionId) return;
        loadSessionData(sessionId);
    }, [sessionId]);

    const loadSessionData = async (id: string) => {
        // We'd fetch the session to ensure it exists
        const sessionSets = await workoutService.getSetsForSession(id);
        setSets(sessionSets);

        // Find unique exercises in this session
        const exerciseIds = [...new Set(sessionSets.map(s => s.exerciseId))];
        const loadedExercises = await Promise.all(exerciseIds.map(eId => workoutService.getExerciseById(eId)));
        setActiveExercises(loadedExercises.filter((e): e is Exercise => e !== null));
    };

    const handleOpenExerciseSelect = async () => {
        setIsSelectingExercise(true);
        setSelectedBodyPart(null);
    };

    const handleSelectBodyPart = async (part: BodyPart) => {
        setSelectedBodyPart(part);
        const exList = await workoutService.getExercisesByBodyPart(part);
        setExercises(exList);
    };

    const handleSelectExercise = (exercise: Exercise) => {
        if (!activeExercises.find(e => e.id === exercise.id)) {
            setActiveExercises([...activeExercises, exercise]);
        }
        setIsSelectingExercise(false);
    };

    if (isSelectingExercise) {
        return (
            <div className="fixed inset-0 bg-white z-50 flex flex-col h-full safe-area-pb">
                <header className="p-4 border-b border-gray-100 flex items-center bg-white shadow-sm">
                    <button onClick={() => setIsSelectingExercise(false)} className="p-2 mr-2">
                        <X size={24} />
                    </button>
                    <h2 className="text-xl font-bold">Add Exercise</h2>
                </header>

                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {!selectedBodyPart ? (
                        <div className="grid grid-cols-2 gap-3">
                            {(['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Core'] as BodyPart[]).map(part => (
                                <button
                                    key={part}
                                    onClick={() => handleSelectBodyPart(part)}
                                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 font-semibold text-lg text-gray-800 active:scale-95 transition-transform"
                                >
                                    {part}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <button
                                onClick={() => setSelectedBodyPart(null)}
                                className="flex items-center text-primary-600 mb-4 font-medium"
                            >
                                <ArrowLeft size={18} className="mr-1" /> Back to Body Parts
                            </button>

                            <h3 className="text-lg font-bold mb-4">{selectedBodyPart} Exercises</h3>
                            {exercises.length === 0 ? <p className="text-gray-500">No exercises found.</p> : null}
                            {exercises.map(ex => (
                                <button
                                    key={ex.id}
                                    onClick={() => handleSelectExercise(ex)}
                                    className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center active:bg-gray-50"
                                >
                                    <span className="font-semibold">{ex.name}</span>
                                    <Plus size={20} className="text-gray-400" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 h-full flex flex-col">
            <header className="mb-6 mt-2 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Active Workout</h1>
                    <p className="text-sm text-gray-500">Record your sets below</p>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold text-sm"
                >
                    Finish
                </button>
            </header>

            <div className="flex-1 overflow-y-auto space-y-6 pb-6">
                {activeExercises.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl border border-gray-200 border-dashed">
                        <p className="text-gray-500 mb-4">No exercises added yet.</p>
                        <button
                            onClick={handleOpenExerciseSelect}
                            className="bg-primary-50 text-primary-700 font-semibold py-2 px-6 rounded-full inline-flex items-center"
                        >
                            <Plus size={18} className="mr-2" /> Add First Exercise
                        </button>
                    </div>
                ) : (
                    activeExercises.map(ex => (
                        <ExerciseTrackerCard
                            key={ex.id}
                            exercise={ex}
                            sessionId={sessionId!}
                            sessionSets={sets.filter(s => s.exerciseId === ex.id)}
                            onSetLogged={() => loadSessionData(sessionId!)}
                        />
                    ))
                )}
            </div>

            {activeExercises.length > 0 && (
                <button
                    onClick={handleOpenExerciseSelect}
                    className="w-full bg-primary-600 active:bg-primary-700 text-white font-bold py-4 rounded-2xl shadow-md mt-4 flex justify-center items-center"
                >
                    <Plus size={20} className="mr-2" /> Add Next Exercise
                </button>
            )}
        </div>
    );
};

const ExerciseTrackerCard: React.FC<{
    exercise: Exercise;
    sessionId: string;
    sessionSets: WorkoutSet[];
    onSetLogged: () => void;
}> = ({ exercise, sessionId, sessionSets, onSetLogged }) => {
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [lastSet, setLastSet] = useState<WorkoutSet | null>(null);

    useEffect(() => {
        // Fetch last historical set for progressive overload logic
        workoutService.getLastSetForExercise(exercise.id).then(setLastSet).catch(console.error);
    }, [exercise.id]);

    const handleLogSet = async () => {
        if (!weight || !reps) return;
        await workoutService.logSet(sessionId, exercise.id, parseFloat(weight), parseInt(reps, 10));
        setWeight('');
        setReps('');
        onSetLogged();
    };

    const timeAgoString = (timestamp: number) => {
        const days = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">{exercise.name}</h3>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{exercise.bodyPart}</p>
                </div>
            </div>

            {/* Historical Last Set Reference */}
            <div className="px-4 py-3 bg-blue-50/50 text-blue-800 text-sm flex items-center">
                <HistoryIcon size={16} className="mr-2 text-blue-500" />
                {lastSet ? (
                    <span>
                        Last: <span className="font-bold">{lastSet.weight}kg x {lastSet.reps} reps</span> ({timeAgoString(lastSet.loggedAt)})
                    </span>
                ) : (
                    <span className="italic">No past history found.</span>
                )}
            </div>

            <div className="p-4">
                {/* Today's Sets List */}
                {sessionSets.length > 0 && (
                    <div className="mb-4 space-y-2">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest hidden">Today's Sets</h4>
                        {sessionSets.map((s, idx) => (
                            <div key={s.id} className="flex justify-between items-center text-sm py-2 px-3 bg-gray-50 rounded-lg">
                                <span className="font-medium text-gray-500 w-8">#{idx + 1}</span>
                                <span className="font-bold text-gray-800 flex-1">{s.weight} kg</span>
                                <span className="font-bold text-gray-800 w-16 text-right">{s.reps} reps</span>
                                <Check size={16} className="text-green-500 ml-4 hidden sm:block" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Log New Set Form */}
                <div className="flex space-x-2 mt-4">
                    <div className="flex-1 relative">
                        <input
                            type="number"
                            inputMode="decimal"
                            placeholder="Weight"
                            value={weight}
                            onChange={e => setWeight(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 pl-4 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium font-mono"
                        />
                        <span className="absolute right-3 top-3.5 text-gray-400 text-sm font-medium">kg</span>
                    </div>
                    <div className="flex-1 relative">
                        <input
                            type="number"
                            inputMode="numeric"
                            placeholder="Reps"
                            value={reps}
                            onChange={e => setReps(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium font-mono"
                        />
                        <span className="absolute right-3 top-3.5 text-gray-400 text-sm font-medium">reps</span>
                    </div>
                    <button
                        onClick={handleLogSet}
                        disabled={!weight || !reps}
                        className="bg-primary-600 disabled:bg-primary-300 disabled:active:scale-100 text-white p-3 rounded-xl shadow-sm active:scale-95 transition-transform"
                    >
                        <Check size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};
