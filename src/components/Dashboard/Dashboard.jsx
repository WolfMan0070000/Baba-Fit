import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Activity, Flame, Footprints, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { diet } from '../../data/diet';

export default function Dashboard({ onViewChange, user, hasActiveSession }) {
    const { t } = useLanguage();
    const [profile, setProfile] = useState(user || null);
    const [stats, setStats] = useState({ workoutsThisWeek: 0 });

    useEffect(() => {
        // Fetch Profile
        api.getProfile().then(data => {
            if (data) setProfile(prev => ({ ...prev, ...data }));
        });

        // Calculate Weekly Stats (Real Data)
        const fetchStats = async () => {
            try {
                const sessions = await api.getSessions();
                if (sessions && Array.isArray(sessions)) {
                    const today = new Date();
                    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())); // Sunday
                    startOfWeek.setHours(0, 0, 0, 0);

                    const count = sessions.filter(s => new Date(s.date) >= startOfWeek).length;
                    setStats({ workoutsThisWeek: count });
                }
            } catch (err) {
                console.error("Failed to load stats", err);
            }
        };
        fetchStats();
    }, []);

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
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
            {/* Header / Greeting */}
            <motion.div variants={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 8px' }}>
                <div>
                    <h2 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>{t('welcome_back')}</h2>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800 }}>{profile?.name || 'Athlete'}</h1>
                </div>
                <div
                    onClick={() => onViewChange('profile')}
                    style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px var(--primary-glow)' }}>
                    {profile?.name ? profile.name[0].toUpperCase() : 'A'}
                </div>
            </motion.div>

            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '20px' }}>
                {/* Main Action Card */}
                <motion.div
                    variants={item}
                    className="glass-panel"
                    style={{ padding: '32px', background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.1) 0%, rgba(30, 30, 30, 0.6) 100%)', position: 'relative', overflow: 'hidden' }}
                >
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', fontWeight: 700 }}>{t('ready_crush')}</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px', lineHeight: 1.6 }}>
                            You have a {profile?.goal || 'Get Strong'} session waiting for you.
                        </p>
                        <button
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 28px', fontSize: '1rem' }}
                            onClick={() => onViewChange(hasActiveSession ? 'workout' : 'templates')}
                        >
                            {hasActiveSession ? t('resume_workout') : t('start_workout')} <ArrowRight size={20} />
                        </button>
                    </div>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    {/* Weekly Goal Progress */}
                    <motion.div variants={item} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t('weekly_goal')}</h3>
                            <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.2rem' }}>{stats.workoutsThisWeek} / {profile?.weekly_goal || 4}</span>
                        </div>
                        {/* Progress Bar */}
                        <div style={{ height: '10px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (stats.workoutsThisWeek / (profile?.weekly_goal || 4)) * 100)}%` }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                style={{ height: '100%', background: 'var(--primary)', borderRadius: '10px', boxShadow: '0 0 10px var(--primary-glow)' }}
                            />
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '12px', fontWeight: 500 }}>
                            {stats.workoutsThisWeek >= (profile?.weekly_goal || 4) ? t('goal_reached') : t('keep_pushing')}
                        </p>
                    </motion.div>

                    {/* Quick Stats Grid */}
                    <motion.div variants={item} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(249, 212, 35, 0.1)' }}>
                                    <Flame size={20} color="var(--accent)" />
                                </div>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('daily_cals')}</span>
                            </div>
                            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{profile?.daily_calories || diet.goals.calories}</span>
                        </div>
                        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)' }}>
                                    <Footprints size={20} color="#10b981" />
                                </div>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('steps')}</span>
                            </div>
                            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{profile?.daily_steps || diet.goals.steps}</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
