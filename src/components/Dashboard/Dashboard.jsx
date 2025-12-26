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
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
            {/* Header / Greeting */}
            <motion.div variants={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 8px' }}>
                <div>
                    <h2 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Welcome back,</h2>
                    <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 800 }}>{profile?.name || 'Athlete'}</h1>
                </div>
                <div
                    onClick={() => onViewChange('profile')}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: 'bold', cursor: 'pointer' }}>
                    {profile?.name ? profile.name[0].toUpperCase() : 'A'}
                </div>
            </motion.div>

            {/* Main Action Card */}
            <motion.div
                variants={item}
                className="glass-panel"
                style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(30, 30, 30, 0.6) 100%)', position: 'relative', overflow: 'hidden' }}
            >
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Ready to crush it?</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', maxWidth: '80%' }}>
                        You have a {profile?.goal || 'Get Strong'} session waiting for you.
                    </p>
                    <button
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
                        onClick={() => onViewChange(hasActiveSession ? 'workout' : 'templates')}
                    >
                        {hasActiveSession ? 'Resume Workout' : 'Start Workout'} <ArrowRight size={18} />
                    </button>
                </div>
            </motion.div>

            {/* Weekly Goal Progress */}
            <motion.div variants={item} className="glass-panel" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Weekly Goal</h3>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{stats.workoutsThisWeek} / {profile?.weekly_goal || 4}</span>
                </div>
                {/* Progress Bar */}
                <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(stats.workoutsThisWeek / (profile?.weekly_goal || 4)) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        style={{ height: '100%', background: 'var(--primary)', borderRadius: '4px' }}
                    />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    {stats.workoutsThisWeek >= (profile?.weekly_goal || 4) ? "Goal reached! Great job." : "Keep pushing!"}
                </p>
            </motion.div>

            {/* Quick Stats Grid */}
            <motion.div variants={item} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Flame size={20} color="var(--accent)" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily Cals</span>
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{profile?.daily_calories || diet.goals.calories}</span>
                </div>
                <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Footprints size={20} color="#10b981" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Steps</span>
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{profile?.daily_steps || diet.goals.steps}</span>
                </div>
            </motion.div>

        </motion.div>
    );
}
