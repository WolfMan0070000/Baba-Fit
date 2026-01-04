import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, MoreVertical, Trash2, Info, Dumbbell, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import WorkoutSession from './WorkoutSession';
import WorkoutSummary from './WorkoutSummary';
import SelectExerciseModal from './SelectExerciseModal';
import ExerciseModal from './ExerciseModal';
import SetTracker from './SetTracker';
import ConfirmModal from '../Common/ConfirmModal';

export default function WorkoutView({ user, template, onFinish }) {
    const { t } = useLanguage();
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
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [selectedExerciseForModal, setSelectedExerciseForModal] = useState(null);

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
            ...exercise,
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
        if (window.confirm(t('remove_exercise_confirm'))) {
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
        const today = new Date().toISOString().split('T')[0];
        const userId = user?.id || 1;

        // Save workout logs first
        try {
            console.log('Saving workout logs...');
            for (const ex of activeExercises) {
                for (const set of ex.sets) {
                    // Save each set to database
                    await api.saveLog({
                        date: today,
                        exercise_id: ex.id,  // Use numeric ID directly
                        set_number: set.setNum,
                        weight: set.weight || null,
                        reps: set.reps || null,
                        completed: set.completed ? 1 : 0,
                        set_type: set.type || 'normal',
                        rpe: set.rpe || null,
                        userId: userId
                    });
                }
            }
            console.log('All logs saved successfully');
        } catch (error) {
            console.error('Error saving logs:', error);
            alert('Failed to save workout logs. Please try again.');
            return;
        }

        // Now create the session (backend will auto-calculate volume)
        let savedSession = null;
        try {
            console.log('Creating session...');
            const sessionResponse = await api.saveSession({
                date: today,
                start_time: sessionStartTime,
                end_time: new Date().toISOString(),
                duration_minutes: timerData.durationMinutes,
                calories_burned: Math.floor(timerData.durationMinutes * 5),
                workout_name: workoutName,
                userId: userId
            });
            savedSession = sessionResponse;
            console.log('Session created:', sessionResponse);
        } catch (error) {
            console.error('Error saving session:', error);
            alert('Workout logs saved but failed to create session summary.');
        }

        // Compute Summary Data for UI
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

            if (ex.muscle_group) muscles.add(ex.muscle_group);

            return {
                id: ex.id,
                name: ex.name,
                volume: exVolume,
                maxWeight,
                maxReps,
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
            volume: savedSession?.total_volume || totalVolume, // Use backend calculated value if available
            calories: Math.floor(timerData.durationMinutes * 5),
            efficiency: {
                avgTimePerExercise: activeExercises.length > 0 ? (timerData.durationMinutes / activeExercises.length).toFixed(1) : 0,
                completedSets: setsCompleted
            },
            muscles: Array.from(muscles),
            exerciseBreakdown,
            sessionId: savedSession?.id || null
        };

        setSummaryData(finishedData);
        setShowSummary(true);
        localStorage.removeItem('active_workout_session');
    };

    const handleCloseSummary = () => {
        setShowSummary(false);
        if (onFinish) onFinish();
    };

    const handleCancelWorkout = () => {
        setShowCancelConfirm(true);
    };

    const confirmCancel = () => {
        localStorage.removeItem('active_workout_session');
        setShowCancelConfirm(false);
        if (onFinish) onFinish();
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>{t('loading_workout')}</div>;

    return (
        <div style={{ paddingBottom: '100px', minHeight: '100vh', position: 'relative' }}>
            {/* Floating Header Card */}
            <div style={{
                position: 'sticky',
                top: '10px',
                zIndex: 100,
                margin: '10px 16px',
                padding: '20px',
                background: 'rgba(20, 20, 20, 0.75)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                borderRadius: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.5)'
            }}>
                <div style={{ flex: 1 }}>
                    <h2 className="text-gradient" style={{
                        margin: 0,
                        fontSize: '1.8rem',
                        fontWeight: 800,
                        letterSpacing: '-0.03em',
                        lineHeight: 1.1
                    }}>
                        {workoutName}
                    </h2>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginTop: '8px'
                    }}>
                        <div style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary)',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span>{activeExercises.length} {t('exercises')}</span>
                            <span style={{ opacity: 0.2, fontSize: '1.2rem' }}>|</span>
                            <span style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <div className="pulse" style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', boxShadow: '0 0 8px var(--primary)' }}></div>
                                {t('in_progress')}...
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddExercise(true)}
                    className="pulse-glow"
                    style={{
                        background: 'var(--primary)',
                        color: '#000',
                        width: '50px',
                        height: '50px',
                        borderRadius: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 8px 20px var(--primary-glow)',
                        transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <Plus size={24} strokeWidth={3} />
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
                                <h3
                                    onClick={() => setSelectedExerciseForModal(ex)}
                                    style={{
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        margin: 0,
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        textDecorationStyle: 'dashed',
                                        textDecorationColor: 'rgba(255,255,255,0.3)',
                                        textUnderlineOffset: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    {ex.name}
                                    <Info size={14} style={{ opacity: 0.6 }} />
                                </h3>
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
                                <div>{t('set_label')}</div>
                                <div>{t('kg')}</div>
                                <div>{t('reps_label')}</div>
                                <div>{t('rpe_label')}</div>
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
                                    <Plus size={16} /> {t('add_set')}
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
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px', padding: '24px' }}>
                        <p>{t('no_exercises_added')}</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowAddExercise(true)}
                            style={{ padding: '12px 24px' }}
                        >
                            {t('add_first_exercise')}
                        </button>
                    </div>
                )}
            </div>

            {/* Footer Session Timer */}
            <div style={{ marginTop: '24px', padding: '0 16px 40px 16px', zIndex: 10 }}>
                <WorkoutSession
                    initialStartTime={sessionStartTime}
                    onFinish={handleFinishWorkout}
                    onCancel={handleCancelWorkout}
                    exercises={activeExercises}
                />
            </div>

            {/* Modals */}
            {showAddExercise && (
                <SelectExerciseModal
                    onClose={() => setShowAddExercise(false)}
                    onSelect={handleAddExercise}
                />
            )}

            <ConfirmModal
                isOpen={showCancelConfirm}
                onClose={() => setShowCancelConfirm(false)}
                onConfirm={confirmCancel}
                title={t('cancel_workout')}
                message={t('confirm_cancel_workout')}
                confirmText={t('cancel_workout')}
                cancelText={t('cancel')}
                isDestructive={true}
            />

            <AnimatePresence>
                {showSummary && (
                    <WorkoutSummary
                        isOpen={showSummary}
                        onClose={handleCloseSummary}
                        data={summaryData}
                    />
                )}
            </AnimatePresence>

            {selectedExerciseForModal && (
                <ExerciseModal
                    exercise={selectedExerciseForModal}
                    onClose={() => setSelectedExerciseForModal(null)}
                />
            )}
        </div>
    );
}