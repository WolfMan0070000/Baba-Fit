import { useState } from 'react';

export default function MuscleFatigueMap({ muscleStatus }) {
    // muscleStatus: { chest: 'recovered', back: 'training', legs: 'fatigued' }
    // colors: recovered=green, training=yellow, fatigued=red

    const getColor = (status) => {
        switch (status) {
            case 'fatigue': return '#ef4444';
            case 'training': return '#eab308';
            case 'recovered': return '#22c55e';
            default: return '#333';
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ marginBottom: '16px' }}>Recovery Status</h3>

            <svg viewBox="0 0 200 400" style={{ height: '300px', width: 'auto' }}>
                {/* Silhouette Outline */}

                {/* Chest */}
                <path d="M70,80 Q100,90 130,80 L130,110 Q100,120 70,110 Z"
                    fill={getColor(muscleStatus.chest)} stroke="#555" strokeWidth="2" />

                {/* Shoulders */}
                <circle cx="55" cy="80" r="15" fill={getColor(muscleStatus.shoulders)} stroke="#555" />
                <circle cx="145" cy="80" r="15" fill={getColor(muscleStatus.shoulders)} stroke="#555" />

                {/* Arms */}
                <rect x="40" y="100" width="20" height="60" rx="5" fill={getColor(muscleStatus.arms)} stroke="#555" />
                <rect x="140" y="100" width="20" height="60" rx="5" fill={getColor(muscleStatus.arms)} stroke="#555" />

                {/* Abs */}
                <rect x="80" y="115" width="40" height="60" rx="5" fill={getColor(muscleStatus.abs)} stroke="#555" />

                {/* Legs */}
                <path d="M75,180 L95,180 L95,280 L75,280 Z" fill={getColor(muscleStatus.legs)} stroke="#555" />
                <path d="M105,180 L125,180 L125,280 L105,280 Z" fill={getColor(muscleStatus.legs)} stroke="#555" />

                {/* Head */}
                <circle cx="100" cy="50" r="20" fill="#444" />
            </svg>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%' }}></div>
                    <span>Recovered</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%' }}></div>
                    <span>Fatigued</span>
                </div>
            </div>
        </div>
    );
}
