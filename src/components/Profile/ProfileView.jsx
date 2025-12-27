import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Target, Scale, Ruler, Save, LogOut } from 'lucide-react';
import { api } from '../../services/api';

export default function ProfileView({ user, onLogout }) {
    const [profile, setProfile] = useState({
        name: '', goal: '', current_weight: '', target_weight: '', height: '', weekly_goal: 4
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getProfile().then(data => {
            if (data) setProfile(data);
            setLoading(false);
        }).catch(err => setLoading(false));
    }, []);

    const handleSave = async () => {
        try {
            await api.updateProfile(profile);
            // Show toast?
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="glass-panel" style={{ padding: '20px' }}>Loading...</div>;

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            style={{ padding: '16px', paddingBottom: '100px', display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
            <motion.h2 variants={item} className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800 }}>My Profile</motion.h2>

            {/* Personal Details */}
            <motion.div variants={item} className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div className="icon-container-blue">
                        <User size={24} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Personal Details</h3>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                    <div>
                        <label className="label-small">Display Name</label>
                        <input
                            className="input-elegant"
                            value={profile.name}
                            onChange={e => setProfile({ ...profile, name: e.target.value })}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div>
                        <label className="label-small">Height (cm)</label>
                        <div style={{ position: 'relative' }}>
                            <Ruler size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                            <input
                                className="input-elegant"
                                type="number"
                                value={profile.height || ''}
                                onChange={e => setProfile({ ...profile, height: e.target.value })}
                                style={{ width: '100%', paddingLeft: '40px' }}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Goals */}
            <motion.div variants={item} className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div className="icon-container-red">
                        <Target size={24} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Fitness Goals</h3>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                    <div>
                        <label className="label-small">Main Goal</label>
                        <select
                            className="input-elegant"
                            value={profile.goal}
                            onChange={e => setProfile({ ...profile, goal: e.target.value })}
                            style={{ width: '100%' }}
                        >
                            <option value="Get Strong">Get Stronger</option>
                            <option value="Build Muscle">Build Muscle</option>
                            <option value="Lose Fat">Lose Fat</option>
                            <option value="General Fitness">General Fitness</option>
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label className="label-small">Target Weight (kg)</label>
                            <div style={{ position: 'relative' }}>
                                <Scale size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                                <input
                                    className="input-elegant"
                                    type="number"
                                    value={profile.target_weight || ''}
                                    onChange={e => setProfile({ ...profile, target_weight: e.target.value })}
                                    style={{ width: '100%', paddingLeft: '40px' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label-small">Weekly Workouts</label>
                            <input
                                className="input-elegant"
                                type="number"
                                value={profile.weekly_goal || 4}
                                onChange={e => setProfile({ ...profile, weekly_goal: e.target.value })}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.button
                variants={item}
                onClick={handleSave}
                className="btn btn-primary"
                style={{ width: '100%', padding: '16px' }}
            >
                <Save size={20} />
                Save Profile
            </motion.button>

            <motion.button
                variants={item}
                onClick={onLogout}
                className="btn btn-danger"
                style={{ width: '100%', padding: '16px' }}
            >
                <LogOut size={20} />
                Log Out
            </motion.button>
        </motion.div>
    );
}
