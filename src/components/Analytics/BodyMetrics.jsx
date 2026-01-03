import { useState, useEffect } from 'react';
import { Scale, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import ProgressionChart from './ProgressionChart';

export default function BodyMetrics() {
    const { t } = useLanguage();
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
        <div className="glass-panel" style={{ padding: '20px' }}>
            <div
                onClick={() => setExpanded(!expanded)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px' }}>
                        <Scale size={24} color="var(--primary)" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{t('body_metrics')}</h3>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {t('weight_label')}: {metrics[0]?.weight || '--'} {t('kg')}
                        </span>
                    </div>
                </div>
                {expanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </div>

            {expanded && (
                <div style={{ marginTop: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>{t('weight_label')} ({t('kg')})</label>
                            <input
                                type="number"
                                value={todayForm.weight}
                                onChange={e => setTodayForm({ ...todayForm, weight: e.target.value })}
                                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '10px', color: 'white' }}
                                placeholder="e.g. 75.5"
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>{t('body_fat')}</label>
                            <input
                                type="number"
                                value={todayForm.body_fat}
                                onChange={e => setTodayForm({ ...todayForm, body_fat: e.target.value })}
                                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '10px', color: 'white' }}
                                placeholder="e.g. 15"
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>{t('chest_cm')}</label>
                            <input
                                type="number"
                                value={todayForm.chest}
                                onChange={e => setTodayForm({ ...todayForm, chest: e.target.value })}
                                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '10px', color: 'white' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>{t('waist_cm')}</label>
                            <input
                                type="number"
                                value={todayForm.waist}
                                onChange={e => setTodayForm({ ...todayForm, waist: e.target.value })}
                                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '10px', color: 'white' }}
                            />
                        </div>
                    </div>
                    <button onClick={handleSave} className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', padding: '14px' }}>
                        <Save size={18} /> {t('save_today_metrics')}
                    </button>

                    <div style={{ marginTop: '32px' }}>
                        {weightData.length > 1 && (
                            <ProgressionChart
                                title={t('weight_trend')}
                                data={weightData}
                                color="var(--accent)"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
