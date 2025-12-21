import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, Dumbbell, Award, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

export default function WeeklyCoach({ user }) {
    const [stats, setStats] = useState({
        thisWeekVol: 0,
        lastWeekVol: 0,
        pctChange: 0,
        topExercises: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        analyzeHistory();
    }, []);

    const analyzeHistory = async () => {
        try {
            const sessions = await api.getSessions();
            if (!sessions || !sessions.length) {
                setLoading(false);
                return;
            }

            // 1. Weekly Volume Analysis
            const now = new Date();
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

            let thisWeek = 0;
            let lastWeek = 0;

            // 2. Exercise Frequency & Recency for Recommendations
            const exerciseMap = {};

            // We need full details for this, but unique sessions list might not have all logs.
            // For now, we utilize the sessions summary 'total_volume' if available. 
            // If not, we might need to fetch details. Assuming session objects have total_volume.

            const sessionList = Array.isArray(sessions) ? sessions : [];

            sessionList.forEach(s => {
                const d = new Date(s.date);
                const vol = s.total_volume || 0;

                if (d >= oneWeekAgo) {
                    thisWeek += vol;
                } else if (d >= twoWeeksAgo) {
                    lastWeek += vol;
                }
            });

            // Calculate percentage
            const pct = lastWeek === 0 ? 100 : Math.round(((thisWeek - lastWeek) / lastWeek) * 100);

            // 3. Get Recommendations (Mocked logic or requires deep fetch)
            // Ideally we need "Last Session" for top exercises.
            // We'll fetch the last 3 full session details to get recent exercises
            const recentIds = sessions.slice(0, 3).map(s => s.id);
            const recommendations = [];

            // Fetch details for recent sessions to find exercises
            const detailsPromises = recentIds.map(id => api.getSessionDetails(id));
            const details = await Promise.all(detailsPromises);

            const processedExercises = new Set();
            const detailList = Array.isArray(details) ? details : [];

            detailList.forEach(d => {
                if (!d || !Array.isArray(d.logs)) return;
                d.logs.forEach(log => {
                    if (!log || processedExercises.has(log.exercise_name)) return;
                    if (recommendations.length >= 3) return;

                    // Simple Algo: Suggest +2.5kg or +1 rep
                    processedExercises.add(log.exercise_name);
                    recommendations.push({
                        name: log.exercise_name,
                        lastWeight: log.weight || 0,
                        lastReps: log.reps || 0,
                        nextWeight: (log.weight || 0) + 2.5, // Simple progressive overload
                        nextReps: log.reps || 0
                    });
                });
            });

            setStats({
                thisWeekVol: thisWeek,
                lastWeekVol: lastWeek,
                pctChange: pct,
                topExercises: recommendations
            });
            setLoading(false);

        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) return <div className="glass-panel" style={{ padding: '20px' }}>Loading Insights...</div>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            {/* Weekly Volume Card */}
            <div className="glass-panel" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(0,242,254,0.05) 100%)', border: '1px solid rgba(0,242,254,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Weekly Volume</h3>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>
                            {stats.thisWeekVol.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>kg</span>
                        </div>
                    </div>
                    <div style={{
                        padding: '8px 12px', borderRadius: '12px',
                        background: stats.pctChange >= 0 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: stats.pctChange >= 0 ? '#4ade80' : '#ef4444',
                        display: 'flex', alignItems: 'center', gap: '4px', border: `1px solid ${stats.pctChange >= 0 ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                    }}>
                        {stats.pctChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        <span style={{ fontWeight: 700 }}>{stats.pctChange > 0 ? '+' : ''}{stats.pctChange}%</span>
                    </div>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    vs. last 7 days ({stats.lastWeekVol.toLocaleString()} kg)
                </p>
            </div>

            {/* Smart Coach / Recommendations */}
            <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Target size={20} color="var(--primary)" />
                    <h3 className="text-gradient" style={{ fontSize: '1.2rem', margin: 0 }}>Smart Goals</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {stats.topExercises.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
                            Complete more workouts to get specific goals!
                        </div>
                    ) : (
                        stats.topExercises.map((ex, idx) => (
                            <div key={idx} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
                                borderLeft: '3px solid var(--accent)'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '2px' }}>{ex.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last: {ex.lastWeight}kg x {ex.lastReps}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ArrowRight size={14} color="var(--text-muted)" />
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>{ex.nextWeight}kg</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', opacity: 0.8 }}>Target</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
