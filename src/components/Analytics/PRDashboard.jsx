import { useState, useEffect } from 'react';
import { Trophy, Award } from 'lucide-react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export default function PRDashboard() {
    const { t } = useLanguage();
    const [prs, setPrs] = useState([]);

    useEffect(() => {
        api.getPRs().then(setPrs);
    }, []);

    if (!prs.length) return null;

    return (
        <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Trophy color="var(--accent)" size={24} />
                <h3 className="text-gradient-accent" style={{ fontSize: '1.4rem', fontWeight: 700 }}>{t('trophy_room')}</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {prs.map((pr, idx) => (
                    <div key={idx} className="glass-panel" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '16px',
                        border: '1px solid var(--border-light)'
                    }}>
                        <div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{t(`muscle_${pr.muscle_group.toLowerCase()}`)}</p>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{pr.name}</h4>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{pr.max_weight}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('kg')}</span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px' }}>
                                <Award size={12} />
                                {t('personal_record')}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
