import { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Save, Trash2, GripVertical } from 'lucide-react';
import SelectExerciseModal from '../Workout/SelectExerciseModal';

export default function TemplateBuilder({ template, onBack, onSave }) {
    const [name, setName] = useState(template?.name || 'New Workout');
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
        <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={onBack} className="btn-icon">
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-gradient" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                        {template ? 'Blueprint' : 'New Routine'}
                    </h2>
                </div>
                <button
                    onClick={handleSave}
                    className="btn-primary"
                    style={{ padding: '8px 20px', borderRadius: '12px', fontSize: '0.9rem' }}
                >
                    <Save size={18} /> Save
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Template Name</label>
                    <input
                        className="input-elegant"
                        style={{ width: '100%' }}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Chest & Triceps"
                    />
                </div>
                <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Routine Notes</label>
                    <textarea
                        className="input-elegant"
                        style={{ width: '100%', minHeight: '80px', resize: 'none' }}
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="General instructions for this workout..."
                    />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {exercises.map((ex, idx) => (
                    <div key={idx} className="glass-panel" style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <GripVertical size={20} color="var(--text-muted)" />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{ex.exercise_name || ex.name}</h3>
                            </div>
                            <button onClick={() => handleRemoveExercise(idx)} className="btn-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                                <Trash2 size={18} color="#ef4444" />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <div>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sets</label>
                                <input
                                    className="input-elegant"
                                    style={{ width: '100%' }}
                                    type="number"
                                    value={ex.sets}
                                    onChange={e => updateExercise(idx, 'sets', e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Reps Strategy</label>
                                <input
                                    className="input-elegant"
                                    style={{ width: '100%' }}
                                    value={ex.reps}
                                    onChange={e => updateExercise(idx, 'reps', e.target.value)}
                                    placeholder="8-12"
                                />
                            </div>
                        </div>
                        <input
                            className="input-elegant"
                            style={{ width: '100%', fontSize: '0.85rem' }}
                            value={ex.notes}
                            onChange={e => updateExercise(idx, 'notes', e.target.value)}
                            placeholder="Exercise specific notes..."
                        />
                    </div>
                ))}
            </div>

            <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-outline"
                style={{ width: '100%', marginTop: '16px', borderStyle: 'dashed' }}
            >
                <Plus size={20} /> Add Exercise
            </button>

            <div style={{ marginTop: '32px' }}>
                <button onClick={handleSave} className="btn-primary" style={{ width: '100%', padding: '16px', borderRadius: '16px' }}>
                    <Save size={20} /> Finish & Save Blueprint
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
