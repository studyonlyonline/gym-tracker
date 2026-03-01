import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workoutService } from '../data/services/WorkoutService';
import type { Exercise, WorkoutSet, BodyPart } from '../data/models/types';
import { Plus, Check, ArrowLeft, History as HistoryIcon, X, Timer, Play, Pause, Minus } from 'lucide-react';

export const ActiveSession: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const [sets, setSets] = useState<WorkoutSet[]>([]);

    const [isSelectingExercise, setIsSelectingExercise] = useState(false);
    const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);

    // Custom exercise state
    const [isCreatingCustom, setIsCreatingCustom] = useState(false);
    const [customExerciseName, setCustomExerciseName] = useState('');

    // Group sets by exercise
    const [activeExercises, setActiveExercises] = useState<Exercise[]>([]);

    // Rest Timer State
    const [defaultTimerSecs] = useState(75); // 1 min 15 sec
    const [timerSeconds, setTimerSeconds] = useState(75);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [isTimerVisible, setIsTimerVisible] = useState(false);

    useEffect(() => {
        let interval: ReturnType<typeof setTimeout>;
        if (isTimerRunning && timerSeconds > 0) {
            interval = setTimeout(() => setTimerSeconds(prev => prev - 1), 1000);
        } else if (timerSeconds === 0 && isTimerRunning) {
            setIsTimerRunning(false);
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]); // Vibrate on complete
        }
        return () => clearTimeout(interval);
    }, [isTimerRunning, timerSeconds]);

    const startTimer = () => {
        setTimerSeconds(defaultTimerSecs);
        setIsTimerRunning(true);
        setIsTimerVisible(true);
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

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
        setIsCreatingCustom(false);
        setCustomExerciseName('');
        const exList = await workoutService.getExercisesByBodyPart(part);
        setExercises(exList);
    };

    const handleCreateCustomExercise = async () => {
        if (!customExerciseName.trim() || !selectedBodyPart) return;

        // Save to DB
        const newExercise = await workoutService.addCustomExercise(customExerciseName.trim(), selectedBodyPart);

        // Add to active session right away
        handleSelectExercise(newExercise);

        // Reset states
        setIsCreatingCustom(false);
        setCustomExerciseName('');
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

                            {/* Create Custom Exercise Form / Toggle */}
                            {!isCreatingCustom ? (
                                <button
                                    onClick={() => setIsCreatingCustom(true)}
                                    className="w-full bg-blue-50 text-blue-700 p-4 rounded-xl shadow-sm border border-blue-100 flex justify-center items-center font-bold mb-4 active:bg-blue-100 transition-colors"
                                >
                                    <Plus size={20} className="mr-2" /> Create Custom Exercise
                                </button>
                            ) : (
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-200 mb-4 animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Exercise Name</label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={customExerciseName}
                                            onChange={(e) => setCustomExerciseName(e.target.value)}
                                            placeholder="e.g. Incline Cable Fly"
                                            className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleCreateCustomExercise}
                                            disabled={!customExerciseName.trim()}
                                            className="bg-blue-600 disabled:bg-blue-300 text-white px-4 rounded-xl font-bold shadow-sm"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setIsCreatingCustom(false)}
                                        className="mt-3 text-sm text-gray-500 font-medium w-full text-center"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}

                            {exercises.length === 0 ? <p className="text-gray-500">No exercises found.</p> : null}
                            {exercises.map(ex => (
                                <button
                                    key={ex.id}
                                    onClick={() => handleSelectExercise(ex)}
                                    className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center active:bg-gray-50"
                                >
                                    <span className="font-semibold">{ex.name}</span>
                                    {ex.isCustom && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold ml-2">Custom</span>
                                    )}
                                    <span className="flex-1"></span>
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
                            onSetLogged={() => {
                                loadSessionData(sessionId!);
                                startTimer(); // Auto-start rest timer
                            }}
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

            {/* Floating Rest Timer Component */}
            {isTimerVisible && (
                <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-64 z-40 animate-in slide-in-from-bottom-5">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center text-primary-600 font-bold">
                            <Timer size={18} className="mr-1" /> Rest Timer
                        </div>
                        <button onClick={() => setIsTimerVisible(false)} className="text-gray-400">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="text-center font-mono text-4xl font-black text-gray-900 mb-4 tracking-tighter">
                        {formatTime(timerSeconds)}
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 rounded-xl p-1">
                        <button
                            onClick={() => setTimerSeconds(prev => Math.max(0, prev - 15))}
                            className="p-2 text-gray-600 active:bg-gray-200 rounded-lg"
                        >
                            <Minus size={20} />
                        </button>

                        <button
                            onClick={() => setIsTimerRunning(!isTimerRunning)}
                            className={`p-3 rounded-xl text-white shadow-sm flex-1 mx-2 flex justify-center ${isTimerRunning ? 'bg-orange-500' : 'bg-primary-500'}`}
                        >
                            {isTimerRunning ? <Pause fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} />}
                        </button>

                        <button
                            onClick={() => setTimerSeconds(prev => prev + 15)}
                            className="p-2 text-gray-600 active:bg-gray-200 rounded-lg"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
            )}

            {!isTimerVisible && (
                <button
                    onClick={() => {
                        setIsTimerVisible(true);
                        if (!isTimerRunning && timerSeconds === 0) {
                            setTimerSeconds(defaultTimerSecs);
                        }
                    }}
                    className="fixed bottom-6 right-6 bg-white p-4 rounded-full shadow-xl border border-gray-200 text-primary-600 z-40"
                >
                    <Timer size={24} />
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
    const [pastSets, setPastSets] = useState<WorkoutSet[]>([]);

    useEffect(() => {
        // Fetch last 3 historical sets for progressive overload logic
        workoutService.getRecentSetsForExercise(exercise.id, 3).then(sets => {
            // Filter out sets that were logged TODAY in THIS session to avoid confusion
            const historical = sets.filter(s => s.sessionId !== sessionId);
            setPastSets(historical.slice(0, 3));
        }).catch(console.error);
    }, [exercise.id, sessionId]);

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

            {/* Historical Past 3 Sets Reference */}
            {pastSets.length > 0 && (
                <div className="px-4 py-3 bg-blue-50/50 text-blue-800 text-sm">
                    <div className="flex items-center mb-2 font-semibold">
                        <HistoryIcon size={16} className="mr-2 text-blue-500" />
                        Previous History
                    </div>
                    <div className="space-y-1 pl-6">
                        {pastSets.map((set, i) => (
                            <div key={set.id} className="flex justify-between items-center text-xs border-b border-blue-100/50 pb-1 mb-1 last:border-0 last:pb-0 last:mb-0">
                                <span className="text-blue-600/80 w-8">#{i + 1}</span>
                                <span className="font-bold flex-1">{set.weight}kg x {set.reps} reps</span>
                                <span className="text-blue-600/80 hidden sm:inline">{timeAgoString(set.loggedAt)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {pastSets.length === 0 && (
                <div className="px-4 py-3 bg-blue-50/50 text-blue-800 text-sm flex items-center">
                    <HistoryIcon size={16} className="mr-2 text-blue-500" />
                    <span className="italic">No past history found.</span>
                </div>
            )}

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
