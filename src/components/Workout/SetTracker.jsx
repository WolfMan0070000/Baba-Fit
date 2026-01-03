import { useState, useEffect, useRef } from 'react';
import { Check, Save, Flame, AlertCircle, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

export default function SetTracker({ setNum, defaultReps, onSave, initialData, ghostData }) {
    const { t } = useLanguage();
    const [weight, setWeight] = useState(initialData?.weight || '');
    const [reps, setReps] = useState(initialData?.reps || '');
    const [completed, setCompleted] = useState(initialData?.completed || false);

    // New State
    const [setType, setSetType] = useState(initialData?.set_type || 'normal'); // normal, warmup, failure, drop
    const [rpe, setRpe] = useState(initialData?.rpe || '');

    const [isUserModified, setIsUserModified] = useState(false);
    const [rpeError, setRpeError] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved
    const saveTimeoutRef = useRef(null);

    // Auto-fill from Previous Set (Smart Logic)
    useEffect(() => {
        // Ghost Only Mode: We do NOT auto-fill state immediately.
    }, [ghostData, initialData, isUserModified]);

    const handleFocus = (field) => {
        if (!isUserModified && ghostData) {
            if (field === 'weight' && !weight && ghostData.weight) setWeight(ghostData.weight);
            if (field === 'reps' && !reps && ghostData.reps) setReps(ghostData.reps);
            if (field === 'rpe' && !rpe && ghostData.rpe) setRpe(ghostData.rpe);
        }
    };

    useEffect(() => {
        if (initialData) {
            setWeight(initialData.weight);
            setReps(initialData.reps);
            setCompleted(initialData.completed);
            setSetType(initialData.set_type || 'normal');
            setRpe(initialData.rpe || '');
            // Only show 'saved' if user has entered BOTH weight AND reps
            const hasCompleteData = initialData.weight && initialData.reps;
            setSaveStatus(hasCompleteData ? 'saved' : 'idle');
        } else {
            setWeight('');
            setReps('');
            setCompleted(false);
            setSetType('normal');
            setRpe('');
            setSaveStatus('idle');
        }
    }, [initialData]);

    const debouncedSave = (data) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        setSaveStatus('saving');

        saveTimeoutRef.current = setTimeout(() => {
            onSave(data);
            // Only show 'saved' if both weight and reps are filled
            const hasCompleteData = data.weight && data.reps;
            setSaveStatus(hasCompleteData ? 'saved' : 'idle');
        }, 800); // 800ms debounce for smoother feeling
    };

    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    const handleChange = (field, value) => {
        setIsUserModified(true);
        if (field === 'weight') setWeight(value);
        if (field === 'reps') setReps(value);

        if (field === 'rpe') {
            if (Number(value) > 10) {
                setRpeError(true);
                setRpe(value);
                return;
            }
            setRpeError(false);
            setRpe(value);
        }

        const newData = {
            weight: field === 'weight' ? value : weight,
            reps: field === 'reps' ? value : reps,
            completed: completed,
            set_type: setType,
            rpe: field === 'rpe' ? value : rpe
        };

        debouncedSave(newData);
    };

    const handleBlur = () => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        onSave({
            weight,
            reps,
            completed,
            set_type: setType,
            rpe
        });
        // Only show 'saved' if both weight and reps are filled
        const hasCompleteData = weight && reps;
        setSaveStatus(hasCompleteData ? 'saved' : 'idle');
    };

    const toggleCompleted = () => {
        const newState = !completed;
        setCompleted(newState);
        onSave({ weight, reps, completed: newState, set_type: setType, rpe });
        // Only show 'saved' if both weight and reps are filled
        const hasCompleteData = weight && reps;
        setSaveStatus(hasCompleteData ? 'saved' : 'idle');
    };

    const toggleTag = (tag) => {
        const newType = setType === tag ? 'normal' : tag;
        setSetType(newType);
        onSave({ weight, reps, completed, set_type: newType, rpe });
        // Only show 'saved' if both weight and reps are filled
        const hasCompleteData = weight && reps;
        setSaveStatus(hasCompleteData ? 'saved' : 'idle');
    };

    const getTagColor = () => {
        switch (setType) {
            case 'warmup': return 'var(--accent)';
            case 'failure': return '#ef4444';
            case 'drop': return '#8b5cf6';
            default: return 'transparent';
        }
    };

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
                <div
                    onClick={toggleCompleted}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '40px',
                        background: completed ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        color: completed ? '#000' : 'var(--text-muted)',
                        borderRadius: '50%',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        border: setType !== 'normal' ? `2px solid ${getTagColor()}` : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    {completed ? <Check size={20} strokeWidth={3} /> : (setType === 'warmup' ? 'W' : setType === 'drop' ? 'D' : setType === 'failure' ? 'F' : setNum)}
                </div>

                <div style={{ position: 'relative' }}>
                    <input
                        className="input-compact"
                        type="number"
                        placeholder={ghostWeight ? `${ghostWeight} ${t('kg')}` : t('kg')}
                        value={weight}
                        onChange={(e) => handleChange('weight', e.target.value)}
                        onFocus={() => handleFocus('weight')}
                        onBlur={handleBlur}
                    />
                </div>

                <div style={{ position: 'relative' }}>
                    <input
                        className="input-compact"
                        type="number"
                        placeholder={ghostReps}
                        value={reps}
                        onChange={(e) => handleChange('reps', e.target.value)}
                        onFocus={() => handleFocus('reps')}
                        onBlur={handleBlur}
                    />
                </div>

                <div style={{ position: 'relative' }}>
                    <input
                        className="input-compact"
                        type="number"
                        placeholder={ghostData?.rpe || t('rpe_label')}
                        value={rpe}
                        onChange={(e) => handleChange('rpe', e.target.value)}
                        onFocus={() => handleFocus('rpe')}
                        onBlur={handleBlur}
                        style={{
                            borderColor: rpeError ? '#ef4444' : 'var(--border-light)',
                            color: rpeError ? '#ef4444' : 'var(--text-secondary)',
                            fontSize: '0.85rem'
                        }}
                    />
                    {rpeError && (
                        <div style={{
                            position: 'absolute',
                            bottom: '-18px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '0.6rem',
                            color: '#ef4444',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none'
                        }}>
                            {t('max_10')}
                        </div>
                    )}
                </div>

                <motion.div
                    style={{
                        height: '40px',
                        width: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent'
                    }}
                    animate={{
                        color: saveStatus === 'saved'
                            ? 'var(--primary)'
                            : (saveStatus === 'saving' ? '#fbbf24' : 'var(--text-muted)')
                    }}
                    transition={{
                        duration: 0.6,
                        ease: [0.4, 0, 0.2, 1] // Custom cubic-bezier for smoother transition
                    }}
                >
                    <Save size={18} />
                </motion.div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', marginLeft: '48px' }}>
                <button
                    onClick={() => toggleTag('warmup')}
                    style={{
                        fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                        background: setType === 'warmup' ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                        color: setType === 'warmup' ? '#000' : 'var(--text-muted)'
                    }}>
                    {t('warmup')}
                </button>
                <button
                    onClick={() => toggleTag('drop')}
                    style={{
                        fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                        background: setType === 'drop' ? '#8b5cf6' : 'rgba(255,255,255,0.05)',
                        color: setType === 'drop' ? '#fff' : 'var(--text-muted)'
                    }}>
                    {t('drop_set')}
                </button>
                <button
                    onClick={() => toggleTag('failure')}
                    style={{
                        fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                        background: setType === 'failure' ? '#ef4444' : 'rgba(255,255,255,0.05)',
                        color: setType === 'failure' ? '#fff' : 'var(--text-muted)'
                    }}>
                    {t('failure')}
                </button>
            </div>
        </div>
    );
}
