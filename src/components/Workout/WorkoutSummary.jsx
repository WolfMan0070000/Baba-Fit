import { Share2, X, CheckCircle, Camera, Award, Zap, Target, BarChart2, Smile, Meh, Frown, Clock } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { motion } from 'framer-motion';

export default function WorkoutSummary({ isOpen, onClose, data }) {
    const { t, isRTL } = useLanguage();
    const [difficulty, setDifficulty] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen || !data) return null;

    const handleDifficultySelect = async (val) => {
        setDifficulty(val);
        setIsSaving(true);
        try {
            await api.updateSession(data.sessionId, { difficulty: val });
        } catch (err) {
            console.error("Failed to save difficulty", err);
        } finally {
            setIsSaving(false);
        }
    };

    const container = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1, scale: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 2000,
            overflowY: 'auto',
            padding: '20px 10px',
            direction: isRTL ? 'rtl' : 'ltr'
        }}>
            <motion.div
                variants={container}
                initial="hidden"
                animate="visible"
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    margin: '0 auto',
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '24px',
                    padding: '32px 20px',
                    position: 'relative',
                    border: '1px solid var(--border-light)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}
            >
                <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: isRTL ? 'auto' : '16px', left: isRTL ? '16px' : 'auto', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
                    <X size={20} />
                </button>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <motion.div
                        initial={{ scale: 0, rotate: 0 }}
                        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                        transition={{
                            scale: { type: 'spring', damping: 10, stiffness: 100 },
                            rotate: { duration: 0.5, times: [0, 0.2, 0.5, 1] }
                        }}
                    >
                        <CheckCircle size={64} color="var(--primary)" style={{ marginBottom: '16px', filter: 'drop-shadow(0 0 10px var(--primary))' }} />
                    </motion.div>
                    <h2 className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '4px' }}>{t('workout_completed')}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{data.workoutName}</p>
                </div>

                {/* Session Totals Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    <div className="glass-panel" style={{ padding: '16px 8px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                        <Zap size={18} color="var(--accent)" style={{ marginBottom: '8px' }} />
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('volume')}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                            {data.volume >= 1000
                                ? `${(data.volume / 1000).toFixed(1)}t`
                                : `${Math.round(data.volume)}${t('kg')}`}
                        </div>
                    </div>
                    <div className="glass-panel" style={{ padding: '16px 8px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                        <BarChart2 size={18} color="var(--primary)" style={{ marginBottom: '8px' }} />
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('calories')}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{data.calories}</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '16px 8px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                        <Clock size={18} color="var(--primary)" style={{ marginBottom: '8px' }} />
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('duration')}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{data.duration}{t('min_label')}</div>
                    </div>
                </div>

                {/* Muscle Heatmap / Target */}
                {data.muscles && data.muscles.length > 0 && (
                    <motion.div variants={item} className="glass-panel" style={{ padding: '16px', marginBottom: '24px', background: 'rgba(0, 242, 254, 0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <Target size={18} color="var(--primary)" />
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t('muscles_targeted')}</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {data.muscles.map(m => (
                                <span key={m} style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    color: 'var(--primary)',
                                    border: '1px solid rgba(0, 242, 254, 0.3)'
                                }}>
                                    {t('muscle_' + m.toLowerCase())}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Exercise Breakdown */}
                {data.exerciseBreakdown && data.exerciseBreakdown.length > 0 && (
                    <>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Award size={20} color="var(--accent)" />
                            {t('achievements_highlights')}
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                            {data.exerciseBreakdown.map((ex) => (
                                <motion.div
                                    key={ex.id}
                                    variants={item}
                                    className="glass-panel"
                                    style={{
                                        padding: '16px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: ex.isPR ? '1px solid var(--accent)' : '1px solid var(--border-light)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {ex.isPR && (
                                        <div style={{
                                            position: 'absolute', top: '0', right: isRTL ? 'auto' : '0', left: isRTL ? '0' : 'auto',
                                            background: 'var(--accent)', color: '#000',
                                            padding: '2px 10px', fontSize: '0.65rem',
                                            fontWeight: 900, borderBottomLeftRadius: isRTL ? '0' : '8px', borderBottomRightRadius: isRTL ? '8px' : '0'
                                        }}>
                                            {t('new_record')}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{ex.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                                            {ex.avgWeight} {t('kg')} {t('avg_label')}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                                        <div style={{ color: 'var(--text-muted)' }}>
                                            {t('max_reps')}: <span style={{ color: '#fff', fontWeight: 700 }}>{ex.maxReps}</span>
                                        </div>
                                        {ex.delta > 0 && (
                                            <div style={{ color: '#10b981', fontWeight: 700 }}>
                                                +{ex.delta}{t('kg')} {t('since_last_session')}
                                            </div>
                                        )}
                                    </div>

                                    {/* AI Recommendation */}
                                    <div style={{
                                        marginTop: '12px',
                                        padding: '8px 12px',
                                        background: 'rgba(245, 158, 11, 0.1)',
                                        borderRadius: '8px',
                                        borderLeft: isRTL ? 'none' : '3px solid var(--accent)',
                                        borderRight: isRTL ? '3px solid var(--accent)' : 'none',
                                        fontSize: '0.8rem'
                                    }}>
                                        <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{t('next_week')}: </span>
                                        <span style={{ color: 'var(--text-secondary)' }}>{ex.recommendation}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}

                {/* Efficiency Stats */}
                {data.efficiency && (
                    <motion.div variants={item} className="glass-panel" style={{ padding: '16px', marginBottom: '32px', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('efficiency')}</div>
                                <div style={{ fontSize: '1rem', fontWeight: 700 }}>{data.efficiency.avgTimePerExercise} {t('min_per_exercise')}</div>
                            </div>
                            <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('sets_completed')}</div>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>{data.efficiency.completedSets} {t('hits_label')}</div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Feedback Loop */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>{t('how_feel')}</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                        <button
                            onClick={() => handleDifficultySelect('easy')}
                            disabled={isSaving}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                                background: difficulty === 'easy' ? 'rgba(16, 185, 129, 0.2)' : 'none',
                                border: difficulty === 'easy' ? '1px solid #10b981' : '1px solid var(--border-light)',
                                padding: '12px', borderRadius: '16px', color: '#fff', cursor: 'pointer', transition: 'all 0.2s',
                                width: '80px'
                            }}
                        >
                            <Smile color={difficulty === 'easy' ? '#10b981' : 'var(--text-muted)'} />
                            <span style={{ fontSize: '0.75rem' }}>{t('diff_easy')}</span>
                        </button>
                        <button
                            onClick={() => handleDifficultySelect('moderate')}
                            disabled={isSaving}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                                background: difficulty === 'moderate' ? 'rgba(245, 158, 11, 0.2)' : 'none',
                                border: difficulty === 'moderate' ? '1px solid var(--accent)' : '1px solid var(--border-light)',
                                padding: '12px', borderRadius: '16px', color: '#fff', cursor: 'pointer', transition: 'all 0.2s',
                                width: '80px'
                            }}
                        >
                            <Meh color={difficulty === 'moderate' ? 'var(--accent)' : 'var(--text-muted)'} />
                            <span style={{ fontSize: '0.75rem' }}>{t('diff_moderate')}</span>
                        </button>
                        <button
                            onClick={() => handleDifficultySelect('hard')}
                            disabled={isSaving}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                                background: difficulty === 'hard' ? 'rgba(239, 68, 68, 0.2)' : 'none',
                                border: difficulty === 'hard' ? '1px solid #ef4444' : '1px solid var(--border-light)',
                                padding: '12px', borderRadius: '16px', color: '#fff', cursor: 'pointer', transition: 'all 0.2s',
                                width: '80px'
                            }}
                        >
                            <Frown color={difficulty === 'hard' ? '#ef4444' : 'var(--text-muted)'} />
                            <span style={{ fontSize: '0.75rem' }}>{t('diff_hard')}</span>
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Camera size={18} />
                        {t('btn_photo')}
                    </button>
                    <button className="btn btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Share2 size={18} />
                        {t('btn_share')}
                    </button>
                </div>

            </motion.div>
        </div>
    );
}
