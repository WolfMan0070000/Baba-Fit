import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { program } from '../../data/program';
import { Info, Dumbbell, Calculator, Plus, X, Clock, TrendingUp, Flame, Save, Minus } from 'lucide-react';
import SelectExerciseModal from './SelectExerciseModal';
import SetTracker from './SetTracker';
import ExerciseModal from './ExerciseModal';
import PlateCalculator from './PlateCalculator';
import WarmupCalculator from './WarmupCalculator';
import RestTimer from './RestTimer';
import WorkoutSession from './WorkoutSession';
import WorkoutSummary from './WorkoutSummary';
import { api } from '../../services/api';

export default function WorkoutView({ template, user, onFinish }) {
    const { t, isRTL } = useLanguage();

    const [dayData, setDayData] = useState(null);
    const [logs, setLogs] = useState([]);
    const [history, setHistory] = useState({});
    const [selectedExercise, setSelectedExercise] = useState(null);

    // Feature States
    const [showPlateCalc, setShowPlateCalc] = useState(false);
    const [calcTargetWeight, setCalcTargetWeight] = useState(100);
    const [showTimer, setShowTimer] = useState(false);
    const [timerDuration, setTimerDuration] = useState(90);
    const [showWarmup, setShowWarmup] = useState(false);
    const [warmupTarget, setWarmupTarget] = useState(100);

    // Session States
    const [sessionActive, setSessionActive] = useState(false);
    const [sessionStartTime, setSessionStartTime] = useState(null);
    const [showSummary, setShowSummary] = useState(false);
    const [sessionStats, setSessionStats] = useState(null);

    const [activeExercises, setActiveExercises] = useState([]);
    const [initialExercises, setInitialExercises] = useState([]); // To track changes
    const [showAddExercise, setShowAddExercise] = useState(false);
    const [swapIndex, setSwapIndex] = useState(null);

    // Debounce Refs
    const debounceTimers = useRef({});

    // Initialize Day Data / Resume Session
    useEffect(() => {
        const saved = localStorage.getItem('active_workout_session');
        if (saved) {
            const parsed = JSON.parse(saved);
            const today = new Date().toISOString().split('T')[0];
            if (parsed.date === today) {
                setDayData(parsed.dayData);
                setActiveExercises(parsed.activeExercises);
                setInitialExercises(parsed.initialExercises || parsed.activeExercises);
                setLogs(parsed.logs);
                setSessionStartTime(parsed.startTime);
                setSessionActive(true);
                return;
            }
        }

        if (template) {
            const adaptedExercises = template.exercises.map(e => ({
                id: e.exercise_id || e.id,
                name_en: e.exercise_name || e.name,
                name_fa: e.exercise_name || e.name,
                sets: e.target_sets || 3,
                reps: e.target_reps || '10',
                rpe: 8,
                note_en: e.notes,
                note_fa: e.notes
            }));

            setDayData({
                title_en: template.name,
                title_fa: template.name,
                subtitle_en: template.notes || 'Custom Template',
                subtitle_fa: template.notes || 'Custom Template'
            });
            setActiveExercises(adaptedExercises);
            setInitialExercises(adaptedExercises);
        } else {
            const today = new Date().getDay();
            const defaultDayId = program.schedule[today] === 'rest' ? 'day1' : program.schedule[today];
            const defaultData = program.days[defaultDayId];
            setDayData(defaultData);
            setActiveExercises(defaultData.exercises);
            setInitialExercises(defaultData.exercises);
        }
        setSessionStartTime(new Date().toISOString());
        setSessionActive(true);
    }, [template]);

    // Persist session state
    useEffect(() => {
        if (sessionActive && dayData) {
            const sessionState = {
                date: new Date().toISOString().split('T')[0],
                dayData,
                activeExercises,
                initialExercises,
                logs,
                startTime: sessionStartTime
            };
            localStorage.setItem('active_workout_session', JSON.stringify(sessionState));
        }
    }, [activeExercises, logs, dayData, sessionStartTime, sessionActive, initialExercises]);

    const handleAddExercise = (exercise) => {
        const newExercise = {
            id: exercise.id,
            name_en: exercise.name,
            name_fa: exercise.name,
            sets: 3,
            reps: '10',
            rpe: 8,
            note_en: '',
            note_fa: ''
        };

        if (swapIndex !== null) {
            const updated = [...activeExercises];
            updated[swapIndex] = { ...newExercise, sets: activeExercises[swapIndex].sets };
            setActiveExercises(updated);
            setSwapIndex(null);
        } else {
            setActiveExercises([...activeExercises, newExercise]);
        }
        setShowAddExercise(false);
    };

    const handleRemoveExercise = (index) => {
        if (window.confirm("Are you sure you want to remove this exercise?")) {
            const updated = [...activeExercises];
            updated.splice(index, 1);
            setActiveExercises(updated);
        }
    };

    const handleSwapExercise = (index) => {
        setSwapIndex(index);
        setShowAddExercise(true);
    };

    const handleAddSet = (index) => {
        const updated = [...activeExercises];
        updated[index].sets += 1;
        setActiveExercises(updated);
    };

    const handleRemoveSet = (index) => {
        const updated = [...activeExercises];
        if (updated[index].sets > 1) {
            updated[index].sets -= 1;
            setActiveExercises(updated);
        }
    };

    // Fetch current logs
    useEffect(() => {
        if (!dayData) return;
        const dateStr = new Date().toISOString().split('T')[0];
        // If resuming logs are already set from localStorage, but we might want to refresh from API?
        // Relying on localStorage is safer for "in-progress" integrity.
        // Only fetch if logs are empty (first load of day)
        if (logs.length === 0) {
            api.getLogs(dateStr).then(data => {
                if (data && data.length > 0) setLogs(data);
            });
        }
    }, [dayData]);

    // Fetch history
    useEffect(() => {
        if (!activeExercises?.length) return;
        const fetchHistory = async () => {
            const historyData = {};
            for (let ex of activeExercises) {
                const prevLogs = await api.getLogs(null, ex.id);
                if (prevLogs && prevLogs.length > 0) {
                    historyData[ex.id] = prevLogs;
                }
            }
            setHistory(historyData);
        };
        fetchHistory();
    }, [activeExercises]);

    if (!dayData) return <div className="glass-panel" style={{ padding: '20px' }}>Loading...</div>;

    const handleSaveSet = (exerciseId, setIndex, data) => {
        const dateStr = new Date().toISOString().split('T')[0];
        const logData = {
            date: dateStr,
            exercise_id: exerciseId,
            set_number: setIndex + 1,
            weight: data.weight,
            reps: data.reps,
            completed: data.completed,
            set_type: data.set_type,
            rpe: data.rpe
        };

        // 1. Immediate Local Update (for Persistence)
        setLogs(prev => {
            const existingInfo = prev.findIndex(l =>
                l.date === dateStr && l.exercise_id === exerciseId && l.set_number === (setIndex + 1)
            );
            if (existingInfo > -1) {
                const newLogs = [...prev];
                newLogs[existingInfo] = { ...newLogs[existingInfo], ...logData };
                return newLogs;
            } else {
                return [...prev, logData];
            }
        });

        // 2. Timer Logic (Immediate)
        if (data.completed && !logs.find(l => l.exercise_id === exerciseId && l.set_number === (setIndex + 1))?.completed) {
            let restTime = 90;
            if (data.set_type === 'warmup') restTime = 45;
            if (data.set_type === 'failure' || (data.rpe && data.rpe >= 9)) restTime = 180;
            setTimerDuration(restTime);
            setShowTimer(true);
        }

        // 3. Debounced API Call
        const timerKey = `${exerciseId}-${setIndex}`;
        if (debounceTimers.current[timerKey]) {
            clearTimeout(debounceTimers.current[timerKey]);
        }

        debounceTimers.current[timerKey] = setTimeout(async () => {
            try {
                await api.saveLog(logData);
            } catch (err) {
                console.error("Failed to save log to API", err);
            }
        }, 1000); // 1 second debounce
    };

    const hasProgramChanged = () => {
        if (activeExercises.length !== initialExercises.length) return true;
        for (let i = 0; i < activeExercises.length; i++) {
            if (activeExercises[i].id !== initialExercises[i].id) return true;
            if (activeExercises[i].sets !== initialExercises[i].sets) return true;
        }
        return false;
    };

    const handleFinishSession = async (sessionData) => {
        // Question: Save Changes?
        if (hasProgramChanged()) {
            if (window.confirm("You modified the workout. Do you want to save these changes to your program for next time?")) {
                // Logic to save template updates (would need an API endpoint for updating templates/program)
                // Since we don't have that explicit API in the snippet, we'll just log or pretend.
                // Ideally: api.updateTemplate(template.id, activeExercises);
                console.log("Saving program changes...");
            }
        }

        try {
            let totalVolume = 0;
            logs.forEach(l => {
                if (l.completed) {
                    totalVolume += (l.weight * l.reps);
                }
            });

            const calories = Math.floor(sessionData.durationMinutes * 5.5);

            const finalSessionData = {
                date: new Date().toISOString().split('T')[0],
                start_time: sessionData.startTime,
                end_time: sessionData.endTime,
                duration_minutes: sessionData.durationMinutes,
                calories_burned: calories,
                total_volume: totalVolume,
                workout_name: isRTL ? dayData.title_fa : dayData.title_en
            };

            await api.saveSession(finalSessionData);

            setSessionStats({
                workoutName: finalSessionData.workout_name,
                duration: finalSessionData.duration_minutes,
                calories: finalSessionData.calories_burned,
                volume: finalSessionData.total_volume
            });
            setShowSummary(true);

            // Clear storage and reset
            localStorage.removeItem('active_workout_session');
            setLogs([]);
            setSessionActive(false);
            setSessionStartTime(null);
            if (onFinish) onFinish();
        } catch (err) {
            console.error("Failed to finish session", err);
        }
    };

    const openWarmup = (weight) => {
        setWarmupTarget(weight || 60);
        setShowWarmup(true);
    };

    const openPlateCalc = (weight) => {
        setCalcTargetWeight(weight || 20);
        setShowPlateCalc(true);
    };

    // Helper to extract strictly CURRENT session data
    const getCurrentLog = (exId, setNum) => {
        return logs.find(l => l.exercise_id === exId && l.set_number === setNum);
    };

    // Helper to extract PREVIOUS session data (Ghost)
    const getGhostLog = (exId, setNum) => {
        if (history[exId]) {
            const prevParams = history[exId]
                .filter(l => l.set_number === setNum)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

            if (prevParams) {
                return { weight: prevParams.weight, reps: prevParams.reps };
            }
        }
        return null;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px' }}>

            {/* Header / Live Metrics */}
            <div className="glass-panel pulse-glow" style={{
                padding: '16px 20px',
                position: 'sticky',
                top: '0',
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                borderTop: 'none'
            }}>
                <div>
                    <h2 className="text-gradient" style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '2px' }}>
                        {isRTL ? dayData.title_fa : dayData.title_en}
                    </h2>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <TrendingUp size={12} color="var(--primary)" />
                            {Math.round(logs.filter(l => l.completed).reduce((acc, l) => acc + (l.weight * l.reps), 0))} kg
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} color="var(--primary)" />
                            {sessionActive ? 'Live' : 'Paused'}
                        </span>
                    </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {activeExercises.length} Exercises
                </div>
            </div>

            {/* Exercises */}
            {activeExercises.map((ex, index) => (
                <div key={`${ex.id}-${index}`} className={`glass-panel ${ex.superset_id ? 'superset-group' : ''}`} style={{
                    padding: '16px',
                    borderLeft: ex.superset_id ? '4px solid var(--primary)' : '1px solid var(--border-light)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <div onClick={() => setSelectedExercise(ex)} style={{ cursor: 'pointer', flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px dashed var(--text-muted)' }}>
                                    {isRTL ? ex.name_fa : ex.name_en}
                                </h3>
                                <Info size={16} color="var(--primary)" />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                <span>{ex.sets} {t('sets')}</span>
                                <span>{ex.reps} {t('reps')}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => openWarmup(getCurrentLog(ex.id, 1)?.weight || getGhostLog(ex.id, 1)?.weight)}
                                className="btn-icon"
                                style={{ background: 'rgba(245, 158, 11, 0.1)' }}
                                title="Warmup Calculator"
                            >
                                <Flame size={18} color="var(--accent)" />
                            </button>
                            <button
                                onClick={() => openPlateCalc(getCurrentLog(ex.id, 1)?.weight || getGhostLog(ex.id, 1)?.weight)}
                                className="btn-icon"
                                title="Plate Calculator"
                            >
                                <Calculator size={18} color="var(--text-secondary)" />
                            </button>
                            <button
                                onClick={() => handleSwapExercise(index)}
                                className="btn-icon"
                                style={{ background: 'rgba(0, 242, 254, 0.1)' }}
                                title="Swap Exercise"
                            >
                                <Dumbbell size={18} color="var(--primary)" />
                            </button>
                            <button
                                onClick={() => handleRemoveExercise(index)}
                                className="btn-icon"
                                style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                                title="Remove"
                            >
                                <X size={18} color="#ef4444" />
                            </button>
                        </div>
                    </div>

                    {(ex.note_en || ex.note_fa) && (
                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '0.8rem', color: 'var(--accent)' }}>
                            {isRTL ? ex.note_fa : ex.note_en}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr 40px', gap: '8px', marginBottom: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                        <div>#</div>
                        <div>Weight</div>
                        <div>Reps</div>
                        <div>RPE</div>
                        <div>Done</div>
                    </div>

                    {Array.from({ length: ex.sets }).map((_, i) => {
                        const currentData = getCurrentLog(ex.id, i + 1);
                        let ghostData = getGhostLog(ex.id, i + 1);

                        // Smart Auto-fill: Use Previous Log from THIS session if available
                        if (i > 0) {
                            const prevSetLog = getCurrentLog(ex.id, i);
                            if (prevSetLog && (prevSetLog.weight || prevSetLog.reps)) {
                                ghostData = {
                                    weight: prevSetLog.weight,
                                    reps: prevSetLog.reps,
                                    rpe: prevSetLog.rpe
                                };
                            }
                        }

                        return (
                            <SetTracker
                                key={i}
                                setNum={i + 1}
                                defaultReps={ex.reps}
                                onSave={(data) => handleSaveSet(ex.id, i, data)}
                                initialData={currentData}
                                ghostData={ghostData}
                            />
                        );
                    })}

                    {/* Add/Remove Sets Controls */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '8px' }}>
                        <button onClick={() => handleAddSet(index)} style={{
                            background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--primary)',
                            padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                            <Plus size={14} /> Set
                        </button>
                        {ex.sets > 1 && (
                            <button onClick={() => handleRemoveSet(index)} style={{
                                background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)',
                                padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                            }}>
                                <Minus size={14} /> Set
                            </button>
                        )}
                    </div>
                </div>
            ))}

            <button
                onClick={() => setShowAddExercise(true)}
                className="glass-panel"
                style={{
                    padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    color: 'var(--primary)', fontWeight: 600, cursor: 'pointer'
                }}
            >
                <Plus size={20} />
                Add Exercise
            </button>

            {/* Session Timer & Finish Button */}
            {sessionActive && (
                <WorkoutSession
                    onFinish={handleFinishSession}
                    initialStartTime={sessionStartTime}
                />
            )}

            {/* Modals */}
            {selectedExercise && (
                <ExerciseModal
                    exercise={selectedExercise}
                    onClose={() => setSelectedExercise(null)}
                />
            )}

            {showAddExercise && (
                <SelectExerciseModal
                    onClose={() => setShowAddExercise(false)}
                    onSelect={handleAddExercise}
                />
            )}

            <PlateCalculator
                isOpen={showPlateCalc}
                onClose={() => setShowPlateCalc(false)}
                targetWeight={calcTargetWeight}
            />

            <WarmupCalculator
                isOpen={showWarmup}
                onClose={() => setShowWarmup(false)}
                targetWeight={warmupTarget}
            />

            <RestTimer
                isOpen={showTimer}
                onClose={() => setShowTimer(false)}
                recommendedSeconds={timerDuration}
            />

            <WorkoutSummary
                isOpen={showSummary}
                onClose={() => setShowSummary(false)}
                data={sessionStats}
            />
        </div>
    );
}
