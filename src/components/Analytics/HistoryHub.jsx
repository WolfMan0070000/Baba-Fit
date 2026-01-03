import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import ActivityHeatmap from './ActivityHeatmap';
import ProgressionChart from './ProgressionChart';
import OneRepMaxChart from './OneRepMaxChart';
import SessionList from './SessionList';
import BodyMetrics from './BodyMetrics';
import PRDashboard from './PRDashboard';
import WeeklyCoach from './WeeklyCoach';
import { api } from '../../services/api';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

export default function HistoryHub({ user }) {
    const { t } = useLanguage();
    const [exercises, setExercises] = useState([]);
    const [selectedExId, setSelectedExId] = useState(null);
    const [volumeData, setVolumeData] = useState([]);
    const [maxWeightData, setMaxWeightData] = useState([]);
    const [oneRepMaxData, setOneRepMaxData] = useState([]);

    useEffect(() => {
        // Fetch Exercises List
        api.getExercises().then(data => {
            if (data && data.length > 0) {
                setExercises(data);
                setSelectedExId(data[0].id);
            }
        }).catch(err => console.error("History fetch error:", err));
    }, []);

    useEffect(() => {
        if (!selectedExId) return;

        api.getVolumeData(selectedExId).then(data => {
            if (!Array.isArray(data)) return;

            const vol = data.map(d => ({
                date: d.date ? d.date.slice(5) : '',
                value: d.volume || 0
            }));
            const maxW = data.map(d => ({
                date: d.date ? d.date.slice(5) : '',
                value: d.max_weight || 0
            }));
            const orm = data.map(d => ({
                date: d.date ? d.date.slice(5) : '',
                value: Math.round((d.one_rep_max || 0) * 10) / 10
            }));
            setVolumeData(vol);
            setMaxWeightData(maxW);
            setOneRepMaxData(orm);
        }).catch(err => console.error("Volume data error:", err));
    }, [selectedExId]);

    const handleExport = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/logs?userId=${user?.id || 1}`);
            const data = await res.json();
            const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gym_data_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
        } catch (err) {
            console.error("Export failed", err);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '20px' }}
        >
            <motion.div variants={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="text-gradient" style={{ fontSize: '1.5rem', marginLeft: '8px' }}>{t('history_hub')}</h2>
                <button
                    onClick={handleExport}
                    style={{
                        fontSize: '0.8rem', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                        background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-light)', color: 'var(--text-main)'
                    }}
                >
                    {t('export_json')}
                </button>
            </motion.div>

            <motion.div variants={item}><WeeklyCoach user={user} /></motion.div>

            <motion.div variants={item}><ActivityHeatmap /></motion.div>

            <motion.div variants={item}><BodyMetrics /></motion.div>

            <motion.div variants={item}><PRDashboard /></motion.div>

            <motion.div variants={item} className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>{t('select_exercise_trends')}</label>
                    <select
                        value={selectedExId || ''}
                        onChange={(e) => setSelectedExId(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-light)', color: 'white' }}
                    >
                        {exercises.map(ex => (
                            <option key={ex.id} value={ex.id}>{ex.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <OneRepMaxChart
                        title={t('orm_evolution')}
                        data={oneRepMaxData}
                        color="var(--primary)"
                    />
                    <ProgressionChart
                        title={t('max_weight_strength')}
                        data={maxWeightData}
                        color="var(--accent)"
                    />
                    <ProgressionChart
                        title={t('total_volume')}
                        data={volumeData}
                        color="var(--success)"
                    />
                </div>
            </motion.div>

            <motion.div variants={item}><SessionList /></motion.div>
        </motion.div>
    );
}
