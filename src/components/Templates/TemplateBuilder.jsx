import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Save, Trash2, GripVertical } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import SelectExerciseModal from '../Workout/SelectExerciseModal';

export default function TemplateBuilder({ template, onBack, onSave }) {
    const { t, isRTL } = useLanguage();
    const [name, setName] = useState(template?.name || t('new_workout'));
    const [notes, setNotes] = useState(template?.notes || '');
    const [exercises, setExercises] = useState(template?.exercises || []);
    const [showAddModal, setShowAddModal] = useState(false);

    const handleAddExercise = (exercise) => {
        setExercises([...exercises, {
            exercise_id: exercise.id,
            exercise_name: exercise.name,
            sets: 3,
            reps: '10',
            notes: ''
        }]);
        setShowAddModal(false);
    };

    const handleRemoveExercise = (idx) => {
        setExercises(exercises.filter((_, i) => i !== idx));
    };

    const updateExercise = (idx, field, value) => {
        const updated = [...exercises];
        updated[idx] = { ...updated[idx], [field]: value };
        setExercises(updated);
    };

    const handleSave = () => {
        const payload = {
            name,
            notes,
            exercises
        };
        onSave(payload);
    };

    return (
        <div className="animate-fade-in container" style={{ paddingBottom: '120px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={onBack} className="btn-icon">
                        {isRTL ? <ChevronRight size={28} /> : <ChevronLeft size={28} />}
                    </button>
                    <h2 className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                        {template ? t('blueprint') : t('new_routine')}
                    </h2>
                </div>
                <button
                    onClick={handleSave}
                    className="btn btn-primary"
                    style={{ padding: '10px 20px' }}
                >
                    <Save size={20} /> <span style={{ marginLeft: isRTL ? 0 : '8px', marginRight: isRTL ? '8px' : 0 }}>{t('save')}</span>
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>{t('template_name')}</label>
                    <input
                        className="input-elegant"
                        style={{ width: '100%', fontSize: '1.1rem' }}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Chest & Triceps"
                    />
                </div>
                <div>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>{t('routine_notes')}</label>
                    <textarea
                        className="input-elegant"
                        style={{ width: '100%', minHeight: '100px', resize: 'none', lineHeight: '1.6' }}
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder={t('routine_notes_placeholder')}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {exercises.map((ex, idx) => (
                    <div key={idx} className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <GripVertical size={20} color="var(--text-muted)" style={{ cursor: 'grab' }} />
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>{ex.exercise_name || ex.name}</h3>
                            </div>
                            <button onClick={() => handleRemoveExercise(idx)} className="btn-icon" style={{ background: 'rgba(239, 68, 68, 0.05)' }}>
                                <Trash2 size={20} color="#ef4444" />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>{t('sets_label')}</label>
                                <input
                                    className="input-elegant"
                                    style={{ width: '100%', textAlign: 'center' }}
                                    type="number"
                                    value={ex.sets}
                                    onChange={e => updateExercise(idx, 'sets', e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>{t('reps_strategy')}</label>
                                <input
                                    className="input-elegant"
                                    style={{ width: '100%', textAlign: 'center' }}
                                    value={ex.reps}
                                    onChange={e => updateExercise(idx, 'reps', e.target.value)}
                                    placeholder="8-12"
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>{t('routine_notes')}</label>
                            <input
                                className="input-elegant"
                                style={{ width: '100%', fontSize: '0.9rem' }}
                                value={ex.notes}
                                onChange={e => updateExercise(idx, 'notes', e.target.value)}
                                placeholder={t('exercise_notes_placeholder')}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-outline"
                style={{ width: '100%', marginTop: '24px', borderStyle: 'dashed', padding: '16px', fontSize: '1.1rem', gap: '12px' }}
            >
                <Plus size={24} /> {t('add_exercise')}
            </button>

            <div style={{ marginTop: '48px' }}>
                <button onClick={handleSave} className="btn btn-primary" style={{ width: '100%', padding: '18px', fontSize: '1.2rem', fontWeight: 700, boxShadow: '0 10px 20px rgba(0, 229, 255, 0.2)' }}>
                    <Save size={24} /> <span style={{ marginLeft: '12px' }}>{t('finish_save_blueprint')}</span>
                </button>
            </div>

            {showAddModal && (
                <SelectExerciseModal
                    onClose={() => setShowAddModal(false)}
                    onSelect={handleAddExercise}
                />
            )}
        </div>
    );
}
