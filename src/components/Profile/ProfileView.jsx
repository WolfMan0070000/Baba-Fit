import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Target, Scale, Ruler, Save, LogOut, Globe, Settings } from 'lucide-react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export default function ProfileView({ user, onLogout }) {
    const { t, isRTL, toggleLanguage, language } = useLanguage();
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
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
            <div className="text-gradient" style={{ fontSize: '1.2rem', fontWeight: 600 }}>{t('loading')}</div>
        </div>
    );

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
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
            className="container"
            style={{ paddingBottom: '120px', display: 'flex', flexDirection: 'column', gap: '24px', direction: isRTL ? 'rtl' : 'ltr' }}
        >
            <motion.h2 variants={item} className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('my_profile')}</motion.h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {/* Personal Details */}
                <motion.div variants={item} className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div className="icon-container-blue">
                            <User size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t('personal_details')}</h3>
                    </div>

                    <div style={{ display: 'grid', gap: '20px' }}>
                        <div>
                            <label className="label-small">{t('display_name')}</label>
                            <input
                                className="input-elegant"
                                value={profile.name}
                                onChange={e => setProfile({ ...profile, name: e.target.value })}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div>
                            <label className="label-small">{t('height_cm')}</label>
                            <div style={{ position: 'relative' }}>
                                <Ruler size={18} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '12px', top: '12px', color: 'var(--text-muted)' }} />
                                <input
                                    className="input-elegant"
                                    type="number"
                                    value={profile.height || ''}
                                    onChange={e => setProfile({ ...profile, height: e.target.value })}
                                    style={{ width: '100%', [isRTL ? 'paddingRight' : 'paddingLeft']: '44px' }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Goals */}
                <motion.div variants={item} className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div className="icon-container-red">
                            <Target size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t('fitness_goals')}</h3>
                    </div>

                    <div style={{ display: 'grid', gap: '20px' }}>
                        <div>
                            <label className="label-small">{t('main_goal')}</label>
                            <select
                                className="input-elegant"
                                value={profile.goal}
                                onChange={e => setProfile({ ...profile, goal: e.target.value })}
                                style={{ width: '100%' }}
                            >
                                <option value="Get Strong">{t('get_stronger')}</option>
                                <option value="Build Muscle">{t('build_muscle')}</option>
                                <option value="Lose Fat">{t('lose_fat')}</option>
                                <option value="General Fitness">{t('general_fitness')}</option>
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label className="label-small">{t('target_weight_kg')}</label>
                                <div style={{ position: 'relative' }}>
                                    <Scale size={18} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '12px', top: '12px', color: 'var(--text-muted)' }} />
                                    <input
                                        className="input-elegant"
                                        type="number"
                                        value={profile.target_weight || ''}
                                        onChange={e => setProfile({ ...profile, target_weight: e.target.value })}
                                        style={{ width: '100%', [isRTL ? 'paddingRight' : 'paddingLeft']: '44px' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label-small">{t('weekly_workouts')}</label>
                                <input
                                    className="input-elegant"
                                    type="number"
                                    value={profile.weekly_goal || 4}
                                    onChange={e => setProfile({ ...profile, weekly_goal: e.target.value })}
                                    style={{ width: '100%', textAlign: 'center' }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Settings Section */}
            <motion.div variants={item} className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div className="icon-container-cyan">
                        <Settings size={24} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t('settings')}</h3>
                </div>

                <div style={{ display: 'grid', gap: '20px' }}>
                    {/* Language Selector */}
                    <div>
                        <label className="label-small">{t('language')}</label>
                        <button
                            onClick={toggleLanguage}
                            className="input-elegant"
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                cursor: 'pointer',
                                textAlign: isRTL ? 'right' : 'left',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-md)',
                                padding: '14px 16px',
                                fontFamily: 'inherit',
                                color: 'var(--text-main)',
                                fontSize: '1rem',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Globe size={20} color="var(--primary)" />
                                <span>{language === 'en' ? t('english') : t('persian')}</span>
                            </div>
                            <span style={{
                                background: 'var(--primary)',
                                color: '#000',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: 700
                            }}>
                                {language === 'en' ? 'EN' : 'FA'}
                            </span>
                        </button>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                            {t('language_hint')}
                        </p>
                    </div>
                </div>
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                <motion.button
                    variants={item}
                    onClick={handleSave}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
                >
                    <Save size={20} />
                    {t('save_profile')}
                </motion.button>

                <motion.button
                    variants={item}
                    onClick={onLogout}
                    className="btn btn-danger"
                    style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
                >
                    <LogOut size={20} />
                    {t('log_out')}
                </motion.button>
            </div>
        </motion.div>
    );
}
