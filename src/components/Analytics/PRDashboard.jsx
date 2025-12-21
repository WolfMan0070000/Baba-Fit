import { useState, useEffect } from 'react';
import { Trophy, Award, TrendingUp } from 'lucide-react';
import { API_BASE_URL } from '../../config';

export default function PRDashboard() {
    const [prs, setPrs] = useState([]);

    useEffect(() => {
        // Fetch All-time PRs
        fetch(`${API_BASE_URL}/history/prs`)
            .then(res => res.json())
            .then(data => setPrs(data.data || []));
    }, []);

    if (!prs.length) return null;

    return (
        <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Trophy color="var(--accent)" size={24} />
                <h3 className="text-gradient-accent" style={{ fontSize: '1.4rem' }}>Trophy Room</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                {prs.map((pr, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '16px',
                        border: '1px solid var(--border-light)'
                    }}>
                        <div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{pr.muscle_group}</p>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{pr.name}</h4>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{pr.max_weight}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>kg</span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--success)' }}>
                                <Award size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                Personal Record
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
