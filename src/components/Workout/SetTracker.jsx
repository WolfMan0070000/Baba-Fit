import { useState, useEffect } from 'react';
import { Check, Save, Flame, AlertCircle, TrendingDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function SetTracker({ setNum, defaultReps, onSave, initialData, ghostData }) {
    const { t } = useLanguage();
    const [weight, setWeight] = useState(initialData?.weight || '');
    const [reps, setReps] = useState(initialData?.reps || '');
    const [completed, setCompleted] = useState(initialData?.completed || false);

    // New State
    const [setType, setSetType] = useState(initialData?.set_type || 'normal'); // normal, warmup, failure, drop
    const [rpe, setRpe] = useState(initialData?.rpe || '');

    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (initialData) {
            setWeight(initialData.weight);
            setReps(initialData.reps);
            setCompleted(initialData.completed);
            setSetType(initialData.set_type || 'normal');
            setRpe(initialData.rpe || '');
        } else {
            // Logs cleared (New Session), reset fields
            setWeight('');
            setReps('');
            setCompleted(false);
            setSetType('normal');
            setRpe('');
        }
    }, [initialData]);

    const handleSave = () => {
        const isComplete = !!(weight && reps);
        setCompleted(isComplete);
        onSave({ weight, reps, completed: isComplete, set_type: setType, rpe });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const toggleTag = (tag) => {
        setSetType(prev => prev === tag ? 'normal' : tag);
    };

    const getTagColor = () => {
        switch (setType) {
            case 'warmup': return 'var(--accent)';
            case 'failure': return '#ef4444'; // Red
            case 'drop': return '#8b5cf6'; // Purple
            default: return 'transparent';
        }
    };

    // Calculate Ghost Values (Previous Session)
    const ghostWeight = ghostData ? ghostData.weight : '';
    const ghostReps = ghostData ? ghostData.reps : defaultReps;

    return (
        <div style={{
            marginBottom: '12px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '8px',
            padding: '8px'
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 1fr 1fr 40px',
                gap: '8px',
                alignItems: 'center',
            }}>
                {/* Set Number Indicator */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '40px',
                    background: completed ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    color: completed ? '#000' : 'var(--text-muted)',
                    borderRadius: '50%',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    border: setType !== 'normal' ? `2px solid ${getTagColor()}` : 'none'
                }}>
                    {setType === 'warmup' ? 'W' : setType === 'drop' ? 'D' : setType === 'failure' ? 'F' : setNum}
                </div>

                {/* Weight Input */}
                <div style={{ position: 'relative' }}>
                    <input
                        type="number"
                        placeholder={ghostWeight ? `${ghostWeight} kg` : 'kg'}
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        onBlur={handleSave}
                        style={{
                            width: '100%',
                            padding: '8px',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid var(--border-light)',
                            borderRadius: '8px',
                            color: '#fff',
                            textAlign: 'center'
                        }}
                    />
                </div>

                {/* Reps Input */}
                <div style={{ position: 'relative' }}>
                    <input
                        type="number"
                        placeholder={ghostReps}
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        onBlur={handleSave}
                        style={{
                            width: '100%',
                            padding: '8px',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid var(--border-light)',
                            borderRadius: '8px',
                            color: '#fff',
                            textAlign: 'center'
                        }}
                    />
                </div>

                {/* RPE Input */}
                <div style={{ position: 'relative' }}>
                    <input
                        type="number"
                        placeholder="RPE"
                        value={rpe}
                        onChange={(e) => setRpe(e.target.value)}
                        onBlur={handleSave}
                        style={{
                            width: '100%',
                            padding: '8px',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid var(--border-light)',
                            borderRadius: '8px',
                            color: 'var(--text-secondary)',
                            textAlign: 'center',
                            fontSize: '0.85rem'
                        }}
                    />
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    style={{
                        height: '40px',
                        width: '40px',
                        padding: 0,
                        border: 'none',
                        borderRadius: '8px',
                        background: completed ? 'var(--primary-glow)' : 'transparent',
                        color: completed ? 'var(--primary)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {isSaved ? <Check size={20} /> : <Save size={20} />}
                </button>
            </div>

            {/* Tags Row */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', marginLeft: '48px' }}>
                <button
                    onClick={() => toggleTag('warmup')}
                    style={{
                        fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                        background: setType === 'warmup' ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                        color: setType === 'warmup' ? '#000' : 'var(--text-muted)'
                    }}>
                    Warmup
                </button>
                <button
                    onClick={() => toggleTag('drop')}
                    style={{
                        fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                        background: setType === 'drop' ? '#8b5cf6' : 'rgba(255,255,255,0.05)',
                        color: setType === 'drop' ? '#fff' : 'var(--text-muted)'
                    }}>
                    Drop
                </button>
                <button
                    onClick={() => toggleTag('failure')}
                    style={{
                        fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                        background: setType === 'failure' ? '#ef4444' : 'rgba(255,255,255,0.05)',
                        color: setType === 'failure' ? '#fff' : 'var(--text-muted)'
                    }}>
                    Failure
                </button>
            </div>
        </div>
    );
}
