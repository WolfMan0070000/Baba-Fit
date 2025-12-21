import { useState, useEffect } from 'react';
import { Scale, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { api } from '../../services/api';
import ProgressionChart from './ProgressionChart';

export default function BodyMetrics() {
    const [expanded, setExpanded] = useState(false);
    const [metrics, setMetrics] = useState([]);
    const [todayForm, setTodayForm] = useState({
        weight: '', body_fat: '', chest: '', arms: '', waist: '', legs: ''
    });

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        const data = await api.getMetrics();
        setMetrics([...data].reverse());
    };

    const handleSave = async () => {
        try {
            const dateStr = new Date().toISOString().split('T')[0];
            const payload = { ...todayForm, date: dateStr };

            await api.saveMetrics(payload);
            fetchMetrics();
            setExpanded(false);
        } catch (err) {
            console.error(err);
        }
    };

    // Prepare chart data (reverse back to chronological)
    const weightData = [...metrics].reverse().map(m => ({
        date: m.date ? m.date.slice(5) : '',
        value: m.weight
    })).filter(d => d.value);

    return (
        <div className="glass-panel" style={{ padding: '16px' }}>
            <div
                onClick={() => setExpanded(!expanded)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px' }}>
                        <Scale size={20} color="var(--primary)" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Body Metrics</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Weight: {metrics[0]?.weight || '--'} kg
                        </span>
                    </div>
                </div>
                {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>

            {expanded && (
                <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weight (kg)</label>
                            <input
                                type="number"
                                value={todayForm.weight}
                                onChange={e => setTodayForm({ ...todayForm, weight: e.target.value })}
                                style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'white' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Body Fat (%)</label>
                            <input
                                type="number"
                                value={todayForm.body_fat}
                                onChange={e => setTodayForm({ ...todayForm, body_fat: e.target.value })}
                                style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'white' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>M: Chest (cm)</label>
                            <input
                                type="number"
                                value={todayForm.chest}
                                onChange={e => setTodayForm({ ...todayForm, chest: e.target.value })}
                                style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'white' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>M: Waist (cm)</label>
                            <input
                                type="number"
                                value={todayForm.waist}
                                onChange={e => setTodayForm({ ...todayForm, waist: e.target.value })}
                                style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'white' }}
                            />
                        </div>
                    </div>
                    <button onClick={handleSave} className="btn-primary" style={{ wudth: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <Save size={16} /> Save Today's Metrics
                    </button>

                    <div style={{ marginTop: '20px', height: '150px' }}>
                        {/* Simple Chart Visualization Reuse - assumes ProgressionChart handles data */}
                        {weightData.length > 1 && (
                            <ProgressionChart
                                title="Weight Trend"
                                data={weightData}
                                color="#ffb300"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
