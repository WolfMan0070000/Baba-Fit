import { useLanguage } from '../../context/LanguageContext';
import { diet } from '../../data/diet';
import { CheckCircle } from 'lucide-react';

export default function DietView() {
    const { t, isRTL } = useLanguage();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Overview */}
            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                <h2 className="text-gradient" style={{ fontSize: '2rem' }}>{diet.goals.calories} kCal</h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
                    <div>
                        <div style={{ fontWeight: 700 }}>{diet.goals.protein}g</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Protein</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 700 }}>{diet.goals.carbs}g</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Carbs</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 700 }}>{diet.goals.fats}g</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Fats</div>
                    </div>
                </div>
            </div>

            {diet.meals.map((meal) => (
                <div key={meal.id} className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{
                        padding: '16px',
                        background: 'rgba(255,255,255,0.03)',
                        borderBottom: '1px solid var(--border-light)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem' }}>{isRTL ? meal.name_fa : meal.name_en}</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{isRTL ? meal.desc_fa : meal.desc_en}</p>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <div>{meal.macros.p}P / {meal.macros.c}C / {meal.macros.f}F</div>
                        </div>
                    </div>

                    <div style={{ padding: '16px' }}>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {meal.items.map((item, idx) => (
                                <li key={idx} style={{ display: 'flex', gap: '8px', fontSize: '0.9rem' }}>
                                    <span style={{ color: 'var(--primary)' }}>•</span>
                                    <span>{isRTL ? item.fa : item.en}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
}
