import { useState } from 'react';
import { Disc, X } from 'lucide-react';

export default function PlateCalculator({ isOpen, onClose, targetWeight }) {
    const [weight, setWeight] = useState(targetWeight || 100);
    const barWeight = 20; // Standard Olympic Bar

    if (!isOpen) return null;

    const calculatePlates = (target) => {
        let remaining = (target - barWeight) / 2; // Per side
        if (remaining <= 0) return [];

        const plates = [25, 20, 15, 10, 5, 2.5, 1.25];
        const result = [];

        for (let plate of plates) {
            while (remaining >= plate) {
                result.push(plate);
                remaining -= plate;
            }
        }
        return result;
    };

    const platesNeeded = calculatePlates(weight);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '24px', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#fff' }}>
                    <X size={24} />
                </button>

                <h3 className="text-gradient" style={{ textAlign: 'center', marginBottom: '24px', fontSize: '1.5rem' }}>Plate Calculator</h3>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
                    <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        style={{
                            background: 'transparent',
                            border: '2px solid var(--primary)',
                            color: '#fff',
                            fontSize: '2rem',
                            width: '120px',
                            textAlign: 'center',
                            borderRadius: '12px',
                            padding: '8px'
                        }}
                    />
                    <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>kg</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div style={{ height: '20px', width: '100%', background: '#555', borderRadius: '4px', position: 'relative' }}>
                        {/* Barbell Visualization */}
                        <div style={{ position: 'absolute', left: '50%', top: '-10px', bottom: '-10px', width: '4px', background: '#888' }}></div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Per Side:</span>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {platesNeeded.length > 0 ? platesNeeded.map((p, i) => (
                                <div key={i} style={{
                                    height: `${40 + (p * 2)}px`, // Visual size diff
                                    width: '24px',
                                    background: p >= 20 ? '#ef4444' : p >= 10 ? '#3b82f6' : '#22c55e',
                                    borderRadius: '4px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#000', fontWeight: 'bold', fontSize: '10px',
                                    border: '1px solid rgba(255,255,255,0.2)'
                                }}>
                                </div>
                            )) : <span style={{ color: 'var(--text-muted)' }}>Empty Bar</span>}
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
                            {platesNeeded.map((p, i) => (
                                <span key={i} style={{ background: '#333', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>{p}</span>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
