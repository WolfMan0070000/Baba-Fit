import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function RestTimer({ isOpen, onClose, recommendedSeconds = 90 }) {
    const { t, isRTL } = useLanguage();
    const [seconds, setSeconds] = useState(recommendedSeconds);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        setSeconds(recommendedSeconds);
        if (isOpen) setIsActive(true);
    }, [isOpen, recommendedSeconds]);

    useEffect(() => {
        let interval = null;
        if (isActive && seconds > 0) {
            interval = setInterval(() => {
                setSeconds(prev => prev - 1);
            }, 1000);
        } else if (seconds === 0) {
            clearInterval(interval);
            setIsActive(false);
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
            right: isRTL ? 'auto' : '20px',
            left: isRTL ? '20px' : 'auto',
            zIndex: 1500,
            direction: isRTL ? 'rtl' : 'ltr'
        }}>
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--primary-glow)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('rest_timer')}</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'monospace', color: seconds < 10 ? 'var(--accent)' : 'var(--text-main)' }}>
                        {formatTime(seconds)}
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={toggleTimer} className="btn-icon" style={{ background: 'var(--primary)', border: 'none', borderRadius: '50%', color: '#000' }}>
                        {isActive ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <button onClick={resetTimer} className="btn-icon" style={{ borderRadius: '50%' }}>
                        <RotateCcw size={18} />
                    </button>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', marginLeft: isRTL ? 0 : '8px', marginRight: isRTL ? '8px' : 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={20} />
                    </button>
                </div>

            </div>
        </div>
    );
}
