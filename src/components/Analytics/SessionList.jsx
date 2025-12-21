import { useState, useEffect } from 'react';
import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { api } from '../../services/api';

export default function SessionList() {
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [details, setDetails] = useState(null);

    useEffect(() => {
        api.getSessions().then(data => setSessions(data));
    }, []);

    const handleSessionClick = async (id) => {
        const data = await api.getSessionDetails(id);
        setDetails(data);
        setSelectedSession(id);
    };

    const closeModal = () => {
        setSelectedSession(null);
        setDetails(null);
    };

    // Group logs by exercise for display
    const groupedLogs = details ? details.logs.reduce((acc, log) => {
        if (!acc[log.exercise_name]) acc[log.exercise_name] = [];
        acc[log.exercise_name].push(log);
        return acc;
    }, {}) : {};

    if (!sessions.length) {
        return (
            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No completed sessions yet.
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ marginLeft: '8px', fontSize: '1.2rem' }}>Recent Workouts</h3>
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
                        style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    >
                        <div>
                            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>{session.workout_name || 'Workout'}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{session.date}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                Vol: {currentVol.toLocaleString()} kg
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <Clock size={14} />
                                <span>{session.duration_minutes}m</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: '6px',
                                fontSize: '0.85rem',
                                color: isPositive ? '#4ade80' : isNegative ? '#ef4444' : 'var(--text-muted)'
                            }}>
                                {isPositive ? <TrendingUp size={14} /> : isNegative ? <TrendingDown size={14} /> : <Minus size={14} />}
                                <span>{diff > 0 ? '+' : ''}{diff.toLocaleString()} kg</span>
                            </div>
                        </div>
                    </div>
                )
            })}

            {/* Detail Modal */}
            {selectedSession && details && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1100, padding: '20px', overflowY: 'auto' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--bg-app)', borderRadius: '16px', minHeight: '80vh', padding: '20px', border: '1px solid var(--border-light)' }}>
                        <button onClick={closeModal} style={{ float: 'right', background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        <h2 className="text-gradient" style={{ marginBottom: '4px' }}>{details.workout_name || 'Workout Details'}</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>{details.date} • {details.duration_minutes} mins • {details.calories_burned} cals</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {Object.entries(groupedLogs).map(([exerciseName, logs]) => (
                                <div key={exerciseName} className="glass-panel" style={{ padding: '16px' }}>
                                    <h4 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--primary)' }}>{exerciseName}</h4>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                                                <th style={{ textAlign: 'left', paddingBottom: '8px' }}>Set</th>
                                                <th style={{ textAlign: 'center', paddingBottom: '8px' }}>Kg</th>
                                                <th style={{ textAlign: 'center', paddingBottom: '8px' }}>Reps</th>
                                                <th style={{ textAlign: 'right', paddingBottom: '8px' }}>RPE</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {logs.map((log, idx) => (
                                                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '8px 0', verticalAlign: 'middle' }}>
                                                        <span style={{
                                                            display: 'inline-block', width: '20px', height: '20px',
                                                            textAlign: 'center', lineHeight: '20px', borderRadius: '50%',
                                                            background: 'rgba(255,255,255,0.1)', fontSize: '0.75rem'
                                                        }}>{log.set_type === 'warmup' ? 'W' : (log.set_number || idx + 1)}</span>
                                                    </td>
                                                    <td style={{ textAlign: 'center', color: 'white' }}>{log.weight}</td>
                                                    <td style={{ textAlign: 'center', color: 'white' }}>{log.reps}</td>
                                                    <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{log.rpe || '-'}</td>
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
