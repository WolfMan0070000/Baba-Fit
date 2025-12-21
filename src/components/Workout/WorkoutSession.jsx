import { useState, useEffect, useRef } from 'react';
import { Timer, CheckSquare, StopCircle, Clock } from 'lucide-react';

export default function WorkoutSession({ onFinish, initialStartTime }) {
    const [elapsed, setElapsed] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const startTimeRef = useRef(initialStartTime ? new Date(initialStartTime) : new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            if (isActive) {
                setElapsed(Math.floor((new Date() - startTimeRef.current) / 1000));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [isActive]);

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
        <div className="glass-panel-elevated animate-slide-up" style={{
            position: 'fixed', bottom: '110px', left: '16px', right: '16px',
            padding: '16px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            zIndex: 1000,
            border: '1px solid var(--border-active)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ background: 'rgba(0, 242, 254, 0.1)', padding: '8px', borderRadius: '50%' }}>
                    <Clock size={22} color="var(--primary)" />
                </div>
                <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Session Duration</p>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'monospace', color: '#fff' }}>
                        {formatTime(elapsed)}
                    </span>
                </div>
            </div>

            <button
                onClick={handleFinish}
                className="btn-primary"
                style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    display: 'flex',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #ff4e50 0%, #f9d423 100%)',
                    boxShadow: '0 4px 15px rgba(255, 78, 80, 0.4)',
                    color: '#000',
                    border: 'none'
                }}
            >
                <StopCircle size={20} />
                Finish Workout
            </button>
        </div>
    );
}
