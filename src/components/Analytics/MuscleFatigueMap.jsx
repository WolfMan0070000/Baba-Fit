import { useLanguage } from '../../context/LanguageContext';

export default function MuscleFatigueMap({ muscleStatus = {} }) {
    const { t } = useLanguage();

    const getColor = (status) => {
        switch (status) {
            case 'fatigue': return '#ef4444';
            case 'training': return '#eab308';
            case 'recovered': return '#22c55e';
            default: return 'rgba(255,255,255,0.05)';
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: 700 }}>{t('recovery_status')}</h3>

            <svg viewBox="0 0 200 400" style={{ height: '300px', width: 'auto', filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>
                {/* Silhouette - Simplified humanoid shape */}

                {/* Head */}
                <circle cx="100" cy="50" r="22" fill="#1a1a1a" stroke="rgba(255,255,255,0.1)" />

                {/* Chest */}
                <path d="M70,85 Q100,95 130,85 L130,120 Q100,130 70,120 Z"
                    fill={getColor(muscleStatus.chest)} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

                {/* Shoulders */}
                <circle cx="55" cy="85" r="16" fill={getColor(muscleStatus.shoulders)} stroke="rgba(255,255,255,0.2)" />
                <circle cx="145" cy="85" r="16" fill={getColor(muscleStatus.shoulders)} stroke="rgba(255,255,255,0.2)" />

                {/* Abs */}
                <rect x="75" y="125" width="50" height="65" rx="8" fill={getColor(muscleStatus.abs || muscleStatus.core)} stroke="rgba(255,255,255,0.2)" />

                {/* Arms */}
                <rect x="35" y="105" width="22" height="75" rx="11" fill={getColor(muscleStatus.arms || muscleStatus.biceps)} stroke="rgba(255,255,255,0.2)" />
                <rect x="143" y="105" width="22" height="75" rx="11" fill={getColor(muscleStatus.arms || muscleStatus.biceps)} stroke="rgba(255,255,255,0.2)" />

                {/* Legs */}
                <path d="M72,195 L95,195 L95,340 L70,340 Q70,350 82,350 L95,350 L95,195" fill={getColor(muscleStatus.legs)} stroke="rgba(255,255,255,0.2)" />
                <path d="M105,195 L128,195 L130,340 Q130,350 118,350 L105,350 L105,195" fill={getColor(muscleStatus.legs)} stroke="rgba(255,255,255,0.2)" />
            </svg>

            <div style={{ display: 'flex', gap: '16px', marginTop: '24px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px rgba(34, 197, 94, 0.4)' }}></div>
                    <span style={{ color: 'var(--text-secondary)' }}>{t('recovered')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)' }}></div>
                    <span style={{ color: 'var(--text-secondary)' }}>{t('fatigued')}</span>
                </div>
            </div>
        </div>
    );
}
