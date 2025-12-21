import { useState, useEffect } from 'react';
import { User, Target, Scale, Ruler, Save, LogOut } from 'lucide-react';
import { API_BASE_URL } from '../../config';

export default function ProfileView({ user, onLogout }) {
    const [profile, setProfile] = useState({
        name: '', goal: '', current_weight: '', target_weight: '', height: '', weekly_goal: 4
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/profile?userId=${user?.id || 1}`)
            .then(res => res.json())
            .then(data => {
                if (data.data) setProfile(data.data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    const handleSave = async () => {
        try {
            await fetch(`${API_BASE_URL}/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...profile, user_id: user?.id || 1 })
            });
            // Show toast?
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="glass-panel" style={{ padding: '20px' }}>Loading...</div>;

    return (
        <div style={{ padding: '16px', paddingBottom: '100px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800 }}>My Profile</h2>

            {/* Personal Details */}
            <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', color: '#3b82f6' }}>
                        <User size={24} />
                    </div>
                    <h3 style={{ fontSize: '1.1rem' }}>Personal Details</h3>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Display Name</label>
                        <input
                            value={profile.name}
                            onChange={e => setProfile({ ...profile, name: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Height (cm)</label>
                        <div style={{ position: 'relative' }}>
                            <Ruler size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                            <input
                                type="number"
                                value={profile.height || ''}
                                onChange={e => setProfile({ ...profile, height: e.target.value })}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', color: 'white' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Goals */}
            <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', color: '#ef4444' }}>
                        <Target size={24} />
                    </div>
                    <h3 style={{ fontSize: '1.1rem' }}>Fitness Goals</h3>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Main Goal</label>
                        <select
                            value={profile.goal}
                            onChange={e => setProfile({ ...profile, goal: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', color: 'white' }}
                        >
                            <option value="Get Strong">Get Stronger</option>
                            <option value="Build Muscle">Build Muscle</option>
                            <option value="Lose Fat">Lose Fat</option>
                            <option value="General Fitness">General Fitness</option>
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Target Weight (kg)</label>
                            <div style={{ position: 'relative' }}>
                                <Scale size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                                <input
                                    type="number"
                                    value={profile.target_weight || ''}
                                    onChange={e => setProfile({ ...profile, target_weight: e.target.value })}
                                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', color: 'white' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Weekly Workouts</label>
                            <input
                                type="number"
                                value={profile.weekly_goal || 4}
                                onChange={e => setProfile({ ...profile, weekly_goal: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', color: 'white' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={handleSave}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', fontSize: '1rem' }}
            >
                <Save size={20} />
                Save Profile
            </button>

            <button
                onClick={onLogout}
                className="btn-outline"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', fontSize: '1rem', border: '1px solid #ef4444', color: '#ef4444' }}
            >
                <LogOut size={20} />
                Log Out
            </button>
        </div>
    );
}
