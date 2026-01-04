import { useState, useEffect, useMemo } from 'react';
import { Clock, TrendingUp, TrendingDown, Minus, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { program } from '../../data/program';

export default function SessionList() {
    const { t } = useLanguage();
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [details, setDetails] = useState(null);
    const [exercises, setExercises] = useState([]);

    // Create a fallback map of ID -> Name from the static program data
    const programExerciseMap = useMemo(() => {
        const map = {};
        Object.values(program.days).forEach(day => {
            day.exercises.forEach(ex => {
                map[ex.id] = ex.name_en; // Default to English name
            });
        });
        return map;
    }, []);

    useEffect(() => {
        Promise.all([
            api.getSessions(),
            api.getExercises()
        ]).then(([sessionsData, exercisesData]) => {
            setSessions(sessionsData);
            setExercises(exercisesData || []);
        });
    }, []);

    const handleSessionClick = async (id) => {
        const data = await api.getSessionDetails(id);
        setDetails(data);
        setSelectedSession(id);
    };

    const getExerciseName = (id) => {
        const ex = (exercises || []).find(e => String(e.id) === String(id));
        if (ex) return ex.name;
        if (programExerciseMap[id]) return programExerciseMap[id];
        return `Unknown Exercise (ID: ${id})`;
    };

    const closeModal = () => {
        setSelectedSession(null);
        setDetails(null);
    };

    // Group logs by exercise for display
    const groupedLogs = details ? details.logs.reduce((acc, log) => {
        const name = log.exercise_name || getExerciseName(log.exercise_id);
        if (!acc[name]) acc[name] = [];
        acc[name].push(log);
        return acc;
    }, {}) : {};

    if (!sessions || sessions.length === 0) {
        return (
            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                {t('no_sessions')}
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ marginLeft: '8px', fontSize: '1.4rem', fontWeight: 700 }}>{t('recent_workouts')}</h3>
            {(Array.isArray(sessions) ? [...sessions] : []).sort((a, b) => new Date(b.date) - new Date(a.date)).map((session, index, arr) => {
                const prevSession = arr[index + 1];
                const currentVol = session.total_volume || 0;
                const prevVol = prevSession ? (prevSession.total_volume || 0) : 0;
                const diff = currentVol - prevVol;
                const isPositive = diff > 0;
                const isNegative = diff < 0;

                return (
                    <div
                        key={session.id}
                        onClick={() => handleSessionClick(session.id)}
                        className="glass-panel"
                        style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer', borderLeft: '4px solid var(--primary)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{session.workout_name || t('workout')}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={14} />
                                    {session.date} • {session.duration_minutes} {t('min_label')}
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: isPositive ? 'rgba(74, 222, 128, 0.1)' : isNegative ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                color: isPositive ? '#4ade80' : isNegative ? '#ef4444' : 'var(--text-muted)'
                            }}>
                                {isPositive ? <TrendingUp size={14} /> : isNegative ? <TrendingDown size={14} /> : <Minus size={14} />}
                                <span>{diff > 0 ? '+' : ''}{diff.toLocaleString()}</span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('total_volume_label')}</span>
                                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>{currentVol.toLocaleString()} {t('kg')}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('calories')}</span>
                                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>{session.calories_burned || 0} {t('kcal_label')}</span>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Detail Modal */}
            {selectedSession && details && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1100, padding: '20px', overflowY: 'auto' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--bg-app)', borderRadius: '16px', minHeight: '80vh', padding: '20px', border: '1px solid var(--border-light)' }}>
                        <button onClick={closeModal} style={{ float: 'right', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
                        <h2 className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '4px' }}>{details.workout_name || t('workout_details')}</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>{details.date} • {details.duration_minutes} {t('mins_label')} • {details.calories_burned} {t('cals_label')}</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {Object.entries(groupedLogs).map(([exerciseName, logs]) => (
                                <div key={exerciseName} className="glass-panel" style={{ padding: '16px' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--primary)' }}>{exerciseName}</h4>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                                                <th style={{ textAlign: 'start', paddingBottom: '8px' }}>{t('set_label')}</th>
                                                <th style={{ textAlign: 'center', paddingBottom: '8px' }}>{t('kg')}</th>
                                                <th style={{ textAlign: 'center', paddingBottom: '8px' }}>{t('reps_label')}</th>
                                                <th style={{ textAlign: 'end', paddingBottom: '8px' }}>{t('rpe_label')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {logs.map((log, idx) => (
                                                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '8px 0', verticalAlign: 'middle' }}>
                                                        <span style={{
                                                            display: 'inline-block', width: '24px', height: '24px',
                                                            textAlign: 'center', lineHeight: '24px', borderRadius: '50%',
                                                            background: 'rgba(255,255,255,0.1)', fontSize: '0.75rem'
                                                        }}>{log.set_type === 'warmup' ? 'W' : (log.set_number || idx + 1)}</span>
                                                    </td>
                                                    <td style={{ textAlign: 'center', color: 'white' }}>{log.weight || '-'}</td>
                                                    <td style={{ textAlign: 'center', color: 'white' }}>{log.reps || '-'}</td>
                                                    <td style={{ textAlign: 'end', color: 'var(--text-muted)' }}>{log.rpe || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
