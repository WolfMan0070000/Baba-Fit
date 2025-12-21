import { useState } from 'react';
import { Flame, X } from 'lucide-react';

export default function WarmupCalculator({ isOpen, onClose, targetWeight }) {
    if (!isOpen) return null;

    const calculateWarmup = (target) => {
        return [
            { pct: 40, weight: Math.round(target * 0.4 / 2.5) * 2.5, reps: 10 },
            { pct: 60, weight: Math.round(target * 0.6 / 2.5) * 2.5, reps: 8 },
            { pct: 80, weight: Math.round(target * 0.8 / 2.5) * 2.5, reps: 5 },
            { pct: 90, weight: Math.round(target * 0.9 / 2.5) * 2.5, reps: 2 },
        ];
    };

    const warmupSets = calculateWarmup(targetWeight);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.92)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div className="glass-panel-elevated animate-slide-up" style={{ width: '100%', maxWidth: '400px', padding: '24px', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)' }}>
                    <X size={24} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                    <Flame color="var(--accent)" />
                    <h3 className="text-gradient">Warm-up Assistant</h3>
                </div>

                <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Target Working Set</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{targetWeight} kg</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {warmupSets.map((set, i) => (
                        <div key={i} className="flex-between" style={{
                            padding: '12px 16px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '12px',
                            border: '1px solid var(--border-light)'
                        }}>
                            <div>
                                <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem' }}>{set.pct}%</span>
                                <span style={{ marginLeft: '12px', fontSize: '1.1rem', fontWeight: 600 }}>{set.weight} kg</span>
                            </div>
                            <div style={{ color: 'var(--text-secondary)' }}>
                                {set.reps} reps
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    className="btn btn-primary"
                    onClick={onClose}
                    style={{ width: '100%', marginTop: '32px' }}
                >
                    Ready to Lift
                </button>
            </div>
        </div>
    );
}
