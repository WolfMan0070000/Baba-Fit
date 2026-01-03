import { useState, useEffect, useRef } from 'react';
import { StopCircle, Clock, Flame, Dumbbell, CheckSquare, XCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function WorkoutSession({ onFinish, onCancel, initialStartTime, exercises = [] }) {
    const { t } = useLanguage();
    const [elapsed, setElapsed] = useState(0);

    const [isActive, setIsActive] = useState(true);
    const startTimeRef = useRef(initialStartTime ? new Date(initialStartTime) : new Date());

    useEffect(() => {
        if (initialStartTime) {
            startTimeRef.current = new Date(initialStartTime);
        }
    }, [initialStartTime]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (isActive) {
                setElapsed(Math.floor((new Date() - startTimeRef.current) / 1000));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [isActive]);

    // Stats Calculations - Science-based approach
    const totalExercises = exercises.length;
    let completedSets = 0;
    let totalSets = 0;
    let exercisesWithCompletedSets = 0;
    let totalVolume = 0; // Total volume in kg (weight × reps)

    exercises.forEach(ex => {
        let exerciseCompletedSets = 0;
        const exerciseTotalSets = ex.sets.length;

        ex.sets.forEach(set => {
            totalSets++;
            // A set is considered "completed" if it has both weight and reps entered
            const weight = parseFloat(set.weight) || 0;
            const reps = parseFloat(set.reps) || 0;
            const hasData = weight > 0 && reps > 0;

            if (hasData || set.completed) {
                completedSets++;
                exerciseCompletedSets++;
                totalVolume += weight * reps;
            }
        });

        // Exercise counts as complete only when ALL sets are done
        if (exerciseTotalSets > 0 && exerciseCompletedSets === exerciseTotalSets) {
            exercisesWithCompletedSets++;
        }
    });

    // Calorie calculation based on resistance training research:
    // - Base metabolic cost: ~3.5 kcal/min for moderate intensity lifting
    // - Volume component: ~0.05 kcal per kg of volume (mechanical work)
    // - Formula accounts for both the work done and the metabolic demand
    // Reference: ACSM guidelines for resistance training energy expenditure
    const durationMinutes = elapsed / 60;
    const baseMetabolicCost = durationMinutes * 3.5; // Base calorie burn during rest periods
    const volumeCalories = totalVolume * 0.05; // Additional calories from actual lifting
    const calories = Math.max(0, Math.floor(baseMetabolicCost + volumeCalories));

    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleFinish = () => {
        setIsActive(false);
        onFinish({
            startTime: startTimeRef.current.toISOString(),
            endTime: new Date().toISOString(),
            durationMinutes: Math.ceil(elapsed / 60),
        });
    };

    return (
        <div className="glass-panel" style={{
            margin: '20px 0',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(16px)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-lg)',
        }}>
            {/* Header / Timer */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div className="icon-container-cyan" style={{ marginBottom: '8px', width: '50px', height: '50px' }}>
                    <Clock size={28} />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>
                    {t('total_duration')}
                </p>
                <span style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-main)', color: '#fff', letterSpacing: '-1.5px' }}>
                    {formatTime(elapsed)}
                </span>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '12px',
                padding: '16px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <Dumbbell size={18} color="var(--primary)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{exercisesWithCompletedSets}/{totalExercises}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('exercises')}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <CheckSquare size={18} color="var(--success)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{completedSets}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('sets')}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <Flame size={18} color="#ff4e50" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{calories}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Kcal</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'center' }}>
                <button
                    onClick={handleFinish}
                    className="btn-primary"
                    style={{
                        width: '100%',
                        maxWidth: '320px',
                        padding: '18px 32px',
                        borderRadius: '100px',
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        boxShadow: '0 10px 30px var(--primary-glow)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    <StopCircle size={24} />
                    {t('finish_workout')}
                </button>

                <button
                    onClick={onCancel}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--error)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        padding: '10px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: 0.8,
                        transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                >
                    <XCircle size={18} />
                    {t('cancel_workout')}
                </button>
            </div>
        </div>
    );
}
