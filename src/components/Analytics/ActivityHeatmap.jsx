import { useState, useEffect } from 'react';
import { api } from '../../services/api'; // Ensure correct import path

export default function ActivityHeatmap() {
    const [data, setData] = useState([]);

    useEffect(() => {
        api.getHeatmapData().then(setData);
    }, []);

    // Mock grid generation for last 3 months ~ 90 days
    const today = new Date();
    const days = [];
    for (let i = 89; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const activity = data.find(item => item.date === dateStr);
        days.push({ date: dateStr, count: activity ? activity.count : 0 });
    }

    const getColor = (count) => {
        if (count === 0) return 'rgba(255,255,255,0.05)';
        if (count < 5) return 'rgba(0, 242, 254, 0.2)'; // Low activity
        if (count < 10) return 'rgba(0, 242, 254, 0.4)';
        if (count < 20) return 'rgba(0, 242, 254, 0.7)';
        return 'rgba(0, 242, 254, 1)'; // High activity
    };

    return (
        <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '1rem' }}>Consistency Streak</h3>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {days.map((day) => (
                    <div
                        key={day.date}
                        title={`${day.date}: ${day.count} sets`}
                        style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '2px',
                            background: getColor(day.count)
                        }}
                    ></div>
                ))}
            </div>
        </div>
    );
}
