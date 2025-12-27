
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, MoreVertical, Trash2, Info, Dumbbell, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import WorkoutSession from './WorkoutSession';
import WorkoutSummary from './WorkoutSummary';
import SelectExerciseModal from './SelectExerciseModal';
import SetTracker from './SetTracker';

export default function WorkoutView({ user, template, onFinish }) {
    // Core State
    const [activeExercises, setActiveExercises] = useState([]);
    const [sessionStartTime, setSessionStartTime] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [workoutName, setWorkoutName] = useState('');

    // UI State
    const [showAddExercise, setShowAddExercise] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize Session
    useEffect(() => {
        const initSession = async () => {
            const saved = localStorage.getItem('active_workout_session');
            let currentExercises = [];

            if (saved) {
                // Resume existing session
                const parsed = JSON.parse(saved);
                const today = new Date().toISOString().split('T')[0];

                if (parsed.date === today) {
                    setSessionStartTime(parsed.startTime);
                    setWorkoutName(parsed.name);
                    setSessionId(parsed.id); // If we have a backend ID
                    if (parsed.exercises) {
                        currentExercises = parsed.exercises;
                    }
                } else {
                    // Expired session
                    localStorage.removeItem('active_workout_session');
                }
            }

            // If no active session found (or expired), start fresh from template
            if (currentExercises.length === 0 && template) {
                setWorkoutName(template.name);
                setSessionStartTime(new Date().toISOString());

                // Map template exercises to active format
                currentExercises = template.exercises?.map(ex => ({
                    ...ex,
                    sets: Array.from({ length: ex.target_sets || 3 }).map((_, i) => ({
                        id: Date.now() + Math.random(),
                        setNum: i + 1,
                        weight: '',
                        reps: '',
                        completed: false,
                        type: 'normal'
                    }))
                })) || [];
            }

            setActiveExercises(currentExercises);
            setLoading(false);
        };

        initSession();
    }, [template]);

    // Persist to LocalStorage
    useEffect(() => {
        if (!loading && activeExercises.length > 0) {
            const sessionData = {
                date: new Date().toISOString().split('T')[0],
                startTime: sessionStartTime,
                name: workoutName,
                exercises: activeExercises
            };
            localStorage.setItem('active_workout_session', JSON.stringify(sessionData));
        }
    }, [activeExercises, sessionStartTime, workoutName, loading]);

    const handleAddExercise = (exercise) => {
        const newExercise = {
            id: exercise.id,
            name: exercise.name,
            target_sets: 3,
            target_reps: '10', // Default
            sets: [
                { id: Date.now(), setNum: 1, weight: '', reps: '', completed: false, type: 'normal' },
                { id: Date.now() + 1, setNum: 2, weight: '', reps: '', completed: false, type: 'normal' },
                { id: Date.now() + 2, setNum: 3, weight: '', reps: '', completed: false, type: 'normal' }
            ]
        };
        setActiveExercises([...activeExercises, newExercise]);
        setShowAddExercise(false);
    };

    const handleRemoveExercise = (index) => {
        if (window.confirm('Remove this exercise?')) {
            const updated = [...activeExercises];
            updated.splice(index, 1);
            setActiveExercises(updated);
        }
    };

    const handleAddSet = (exerciseIndex) => {
        const updated = [...activeExercises];
        const exercise = updated[exerciseIndex];
        const lastSet = exercise.sets[exercise.sets.length - 1];

        exercise.sets.push({
            id: Date.now(),
            setNum: exercise.sets.length + 1,
            weight: lastSet ? lastSet.weight : '',
            reps: lastSet ? lastSet.reps : '',
            completed: false,
            type: 'normal'
        });
        setActiveExercises(updated);
    };

    const handleRemoveLastSet = (exerciseIndex) => {
        const updated = [...activeExercises];
        const exercise = updated[exerciseIndex];
        if (exercise.sets.length > 0) {
            exercise.sets.pop(); // Remove last set
            setActiveExercises(updated);
        }
    };

    const handleUpdateSet = (exerciseIndex, setIndex, data) => {
        const updated = [...activeExercises];
        updated[exerciseIndex].sets[setIndex] = {
            ...updated[exerciseIndex].sets[setIndex],
            ...data
        };
        setActiveExercises(updated);
    };

    const handleFinishWorkout = async (timerData) => {
        // Compute Summary Data
        let totalVolume = 0;
        let setsCompleted = 0;
        const muscles = new Set();

        const exerciseBreakdown = activeExercises.map(ex => {
            let exVolume = 0;
            let maxWeight = 0;
            let maxReps = 0;

            ex.sets.forEach(s => {
                if (s.completed && s.weight && s.reps) {
                    const vol = parseFloat(s.weight) * parseFloat(s.reps);
                    exVolume += vol;
                    totalVolume += vol;
                    setsCompleted++;
                    if (parseFloat(s.weight) > maxWeight) maxWeight = parseFloat(s.weight);
                    if (parseFloat(s.reps) > maxReps) maxReps = parseFloat(s.reps);
                }
            });

            // Assuming we have muscle data in exercise object, if not we skip
            if (ex.muscle_group) muscles.add(ex.muscle_group);

            return {
                id: ex.id,
                name: ex.name,
                volume: exVolume,
                maxWeight,
                maxReps,
                // These are placeholders for now, would typically compare with history
                isPR: false,
                delta: 0,
                recommendation: "Keep pushing!"
            };
        });

        const finishedData = {
            workoutName: workoutName,
            startTime: sessionStartTime,
            endTime: new Date().toISOString(),
            duration: timerData.durationMinutes,
            volume: totalVolume,
            calories: Math.floor(timerData.durationMinutes * 5), // Estimate
            efficiency: {
                avgTimePerExercise: activeExercises.length > 0 ? (timerData.durationMinutes / activeExercises.length).toFixed(1) : 0,
                completedSets: setsCompleted
            },
            muscles: Array.from(muscles),
            exerciseBreakdown,
            sessionId: sessionId // Use if we had a backend ID created at start
        };

        // Save to Backend
        try {
            const userId = user?.id || 1;
            const res = await api.saveSession({
                userId,
                name: workoutName,
                startTime: sessionStartTime,
                endTime: new Date().toISOString(),
                exercises: activeExercises
            });
            if (res && res.sessionId) {
                finishedData.sessionId = res.sessionId;
            }
        } catch (e) {
            console.error("Failed to save session", e);
        }

        setSummaryData(finishedData);
        setShowSummary(true);
        localStorage.removeItem('active_workout_session');
    };

    const handleCloseSummary = () => {
        setShowSummary(false);
        if (onFinish) onFinish();
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Workout...</div>;

    return (
        <div style={{ paddingBottom: '100px', minHeight: '100vh', position: 'relative' }}>
            {/* Header */}
            <div style={{
                padding: '20px 16px',
                position: 'sticky', top: 0, zIndex: 10,
                background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid var(--border-light)'
            }}>
                <div style={{ flex: 1 }}>
                    <h2 className="text-gradient" style={{ margin: 0, fontSize: '1.4rem' }}>{workoutName}</h2>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {activeExercises.length} Exercises • In Progress
                    </p>
                </div>
                <button
                    onClick={() => setShowAddExercise(true)}
                    className="btn-icon"
                    style={{ background: 'var(--primary)', color: '#000' }}
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* Exercise List */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {activeExercises.map((ex, exIndex) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={exIndex} // Using index as key for simplicity if duplicates allowed, though id preferred
                        className="glass-panel"
                        style={{ padding: '0', overflow: 'hidden' }}
                    >
                        {/* Exercise Header */}
                        <div style={{
                            padding: '16px',
                            background: 'rgba(255,255,255,0.03)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.05)', color: 'var(--primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Dumbbell size={20} />
                                </div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{ex.name}</h3>
                            </div>
                            <button
                                onClick={() => handleRemoveExercise(exIndex)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        {/* Sets */}
                        <div style={{ padding: '16px' }}>
                            <div style={{
                                display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr 40px',
                                gap: '8px', marginBottom: '8px',
                                fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center'
                            }}>
                                <div>Set</div>
                                <div>kg</div>
                                <div>Reps</div>
                                <div>RPE</div>
                                <div>✓</div>
                            </div>

                            {ex.sets.map((set, setIndex) => {
                                // Calculate ghost data (previous set in this session)
                                const ghostData = setIndex > 0 ? ex.sets[setIndex - 1] : null;

                                return (
                                    <SetTracker
                                        key={set.id || setIndex}
                                        setNum={set.setNum}
                                        defaultReps={ex.target_reps}
                                        initialData={set}
                                        ghostData={ghostData}
                                        onSave={(data) => handleUpdateSet(exIndex, setIndex, data)}
                                    />
                                );
                            })}

                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                <button
                                    onClick={() => handleAddSet(exIndex)}
                                    style={{
                                        flex: 1, padding: '12px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px dashed var(--border-light)', borderRadius: '8px',
                                        color: 'var(--text-secondary)', fontSize: '0.9rem',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                    }}
                                >
                                    <Plus size={16} /> Add Set
                                </button>
                                {ex.sets.length > 0 && (
                                    <button
                                        onClick={() => handleRemoveLastSet(exIndex)}
                                        style={{
                                            width: '48px', padding: '0',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px dashed var(--border-light)', borderRadius: '8px',
                                            color: 'var(--text-muted)', fontSize: '0.9rem',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                    >
                                        <Minus size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}

                {activeExercises.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
                        <p>No exercises added yet.</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowAddExercise(true)}
                        >
                            Add Your First Exercise
                        </button>
                    </div>
                )}
            </div>

            {/* Footer Session Timer */}
            <div style={{ marginTop: '24px', padding: '0 16px 40px 16px', zIndex: 10 }}>
                <WorkoutSession
                    initialStartTime={sessionStartTime}
                    onFinish={handleFinishWorkout}
                />
            </div>

            {/* Modals */}
            {showAddExercise && (
                <SelectExerciseModal
                    onClose={() => setShowAddExercise(false)}
                    onSelect={handleAddExercise}
                />
            )}

            <AnimatePresence>
                {showSummary && (
                    <WorkoutSummary
                        isOpen={showSummary}
                        onClose={handleCloseSummary}
                        data={summaryData}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}