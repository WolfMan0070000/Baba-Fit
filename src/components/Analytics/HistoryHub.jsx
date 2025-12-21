import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import ActivityHeatmap from './ActivityHeatmap';
import ProgressionChart from './ProgressionChart';
import OneRepMaxChart from './OneRepMaxChart';
import SessionList from './SessionList';
import BodyMetrics from './BodyMetrics';
import PRDashboard from './PRDashboard';
import { api } from '../../services/api';

export default function HistoryHub({ user }) {
    const [exercises, setExercises] = useState([]);
    const [selectedExId, setSelectedExId] = useState(null);
    const [volumeData, setVolumeData] = useState([]);
    const [maxWeightData, setMaxWeightData] = useState([]);
    const [oneRepMaxData, setOneRepMaxData] = useState([]);

    useEffect(() => {
        // Fetch Exercises List
        fetch(`${API_BASE_URL}/exercises?userId=${user?.id || 1}`)
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setExercises(data.data);
                    if (data.data.length > 0) setSelectedExId(data.data[0].id);
                }
            });
    }, []);

    useEffect(() => {
        if (!selectedExId) return;

        api.getVolumeData(selectedExId).then(data => {
            const vol = data.map(d => ({
                date: d.date.slice(5),
                value: d.volume
            }));
            const maxW = data.map(d => ({
                date: d.date.slice(5),
                value: d.max_weight
            }));
            const orm = data.map(d => ({
                date: d.date.slice(5),
                value: Math.round(d.one_rep_max * 10) / 10
            }));
            setVolumeData(vol);
            setMaxWeightData(maxW);
            setOneRepMaxData(orm);
        });
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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="text-gradient" style={{ fontSize: '1.5rem', marginLeft: '8px' }}>History Hub</h2>
                <button
                    onClick={handleExport}
                    style={{
                        fontSize: '0.8rem', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                        background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-light)', color: 'var(--text-main)'
                    }}
                >
                    Export JSON
                </button>
            </div>

            <ActivityHeatmap />

            <BodyMetrics />

            <PRDashboard />

            <div className="glass-panel" style={{ padding: '16px' }}>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Select Exercise for Trends</label>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                    <OneRepMaxChart
                        title="Estimated 1RM Evolution"
                        data={oneRepMaxData}
                        color="var(--primary)"
                    />
                    <ProgressionChart
                        title="Max Weight Strength"
                        data={maxWeightData}
                        color="var(--accent)"
                    />
                    <ProgressionChart
                        title="Total Volume"
                        data={volumeData}
                        color="var(--success)"
                    />
                </div>
            </div>

            <SessionList />
        </div>
    );
}
