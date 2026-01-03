import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export default function ActivityHeatmap() {
    const { t } = useLanguage();
    const [data, setData] = useState([]);

    useEffect(() => {
        api.getHeatmapData().then(setData);
    }, []);

    // Mock grid generation for last 3 months ~ 90 days
    const today = new Date();
    const days = [];
    const heatmapData = Array.isArray(data) ? data : [];

    for (let i = 89; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const activity = heatmapData.find(item => item.date === dateStr);
        days.push({ date: dateStr, count: activity ? activity.count : 0 });
    }

    const getColor = (count) => {
        if (count === 0) return 'rgba(255,255,255,0.05)';
        if (count < 5) return 'rgba(0, 242, 254, 0.2)';
        if (count < 10) return 'rgba(0, 242, 254, 0.4)';
        if (count < 20) return 'rgba(0, 242, 254, 0.7)';
        return 'rgba(0, 242, 254, 1)';
    };

    return (
        <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', fontWeight: 700 }}>{t('consistency_streak')}</h3>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {days.map((day) => (
                    <div
                        key={day.date}
                        title={`${day.date}: ${day.count} ${t('sets_label')}`}
                        style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '3px',
                            background: getColor(day.count),
                            transition: 'all 0.2s ease'
                        }}
                    ></div>
                ))}
            </div>
        </div>
    );
}
