import { useLanguage } from '../../context/LanguageContext';
import { diet } from '../../data/diet';
import { CheckCircle, Utensils, Zap, Moon, Sun, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DietView() {
    const { t, isRTL } = useLanguage();

    const mealIcons = {
        meal1: <Coffee size={24} color="var(--primary)" />,
        meal2: <Utensils size={24} color="var(--primary)" />,
        meal3: <Zap size={24} color="var(--primary)" />,
        meal4: <Sun size={24} color="var(--primary)" />,
        meal5: <Moon size={24} color="var(--primary)" />
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="container"
            style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '120px' }}
        >
            <motion.h2 variants={itemVariants} className="text-gradient" style={{ fontSize: '2rem', fontWeight: 800, textAlign: isRTL ? 'right' : 'left' }}>
                {t('meal_plan')}
            </motion.h2>

            {/* Daily Goal Overview */}
            <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '32px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.1), rgba(0, 0, 0, 0.4))' }}>
                <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('daily_cals')}</div>
                <h2 style={{ fontSize: '3rem', fontWeight: 900, margin: 0 }}>
                    {diet.goals.calories} <span style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{t('kcal_label')}</span>
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '32px' }}>
                    <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>{diet.goals.protein}{t('grams')}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{t('protein')}</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>{diet.goals.carbs}{t('grams')}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{t('carbs')}</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>{diet.goals.fats}{t('grams')}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{t('fats')}</div>
                    </div>
                </div>
            </motion.div>

            {/* Meals Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {diet.meals.map((meal) => (
                    <motion.div key={meal.id} variants={itemVariants} className="glass-panel" style={{ padding: '0', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{
                            padding: '20px',
                            background: 'rgba(255,255,255,0.03)',
                            borderBottom: '1px solid var(--border-light)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '10px' }}>
                                    {mealIcons[meal.id] || <Utensils size={24} />}
                                </div>
                                <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{isRTL ? meal.name_fa : meal.name_en}</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{isRTL ? meal.desc_fa : meal.desc_en}</p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'end', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                                {meal.macros.p}P / {meal.macros.c}C / {meal.macros.f}F
                            </div>
                        </div>

                        <div style={{ padding: '20px' }}>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {meal.items.map((item, idx) => (
                                    <li key={idx} style={{ display: 'flex', gap: '12px', fontSize: '0.95rem', alignItems: 'flex-start', textAlign: isRTL ? 'right' : 'left' }}>
                                        <div style={{ marginTop: '4px' }}><CheckCircle size={16} color="var(--primary)" opacity={0.6} /></div>
                                        <span style={{ color: 'var(--text-main)' }}>{isRTL ? item.fa : item.en}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
