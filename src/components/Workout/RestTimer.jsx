import { useState, useEffect } from 'react';
import { Timer, X, Play, Pause, RotateCcw } from 'lucide-react';

export default function RestTimer({ isOpen, onClose, recommendedSeconds = 90 }) {
    const [seconds, setSeconds] = useState(recommendedSeconds);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        setSeconds(recommendedSeconds);
        // Auto-start if opened
        if (isOpen) setIsActive(true);
    }, [isOpen, recommendedSeconds]);

    useEffect(() => {
        let interval = null;
        if (isActive && seconds > 0) {
            interval = setInterval(() => {
                setSeconds(seconds => seconds - 1);
            }, 1000);
        } else if (seconds === 0) {
            clearInterval(interval);
            setIsActive(false);
            // Play sound?
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setSeconds(recommendedSeconds);
    };

    if (!isOpen) return null;

    const formatTime = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            zIndex: 1500,
        }}>
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--primary-glow)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rest Timer</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'monospace', color: seconds < 10 ? 'var(--accent)' : 'var(--text-main)' }}>
                        {formatTime(seconds)}
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={toggleTimer} style={{ background: 'var(--primary)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        {isActive ? <Pause size={18} color="#000" /> : <Play size={18} color="#000" />}
                    </button>
                    <button onClick={resetTimer} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <RotateCcw size={18} color="#fff" />
                    </button>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', marginLeft: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={20} />
                    </button>
                </div>

            </div>
        </div>
    );
}
