import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Dumbbell, X, Camera, Pencil, Trash2, Info } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { api } from '../../services/api';
import ExerciseModal from '../Workout/ExerciseModal';
import { useLanguage } from '../../context/LanguageContext';

export default function ExerciseLibrary() {
    const { t } = useLanguage();
    const [exercises, setExercises] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);

    // New Exercise Form
    const [newEx, setNewEx] = useState({ name: '', muscle_group: 'Chest', equipment: 'Barbell', type: 'weight_reps', video_url: '', image_url: '' });

    useEffect(() => {
        fetchExercises();
    }, []);

    useEffect(() => {
        if (!exercises.length) return;
        const lower = search.toLowerCase();
        setFiltered(exercises.filter(e =>
            e.name.toLowerCase().includes(lower) ||
            e.muscle_group.toLowerCase().includes(lower)
        ));
    }, [search, exercises]);

    const fetchExercises = async () => {
        try {
            const data = await api.getExercises();
            setExercises(data);
            setFiltered(data);
        } catch (err) {
            console.error(err);
        }
    };

    const getUserId = () => {
        try {
            const user = localStorage.getItem('gym_user');
            if (!user) return 1;
            const parsed = JSON.parse(user);
            return parsed.id || 1;
        } catch {
            return 1;
        }
    };

    const handleAdd = async () => {
        if (!newEx.name) return;
        try {
            const userId = getUserId();
            const payload = { ...newEx, userId };

            const method = newEx.id ? 'PUT' : 'POST';
            const url = newEx.id
                ? `${API_BASE_URL}/exercises/${newEx.id}`
                : `${API_BASE_URL}/exercises`;

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setShowAdd(false);
                setNewEx({ name: '', muscle_group: 'Chest', equipment: 'Barbell', type: 'weight_reps', video_url: '', image_url: '' });
                fetchExercises();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (ex) => {
        setNewEx(ex);
        setShowAdd(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this exercise?')) return;
        try {
            const userId = getUserId();
            await fetch(`${API_BASE_URL}/exercises/${id}?userId=${userId}`, { method: 'DELETE' });
            fetchExercises();
        } catch (err) {
            console.error(err);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
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
            style={{ padding: '16px', paddingBottom: '100px' }}
        >
            {/* Header */}
            <motion.div variants={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('exercises')}</h2>
                <button
                    onClick={() => {
                        setNewEx({ name: '', muscle_group: 'Chest', equipment: 'Barbell', type: 'weight_reps', video_url: '', image_url: '' });
                        setShowAdd(!showAdd);
                    }}
                    className="btn-primary"
                    style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Plus size={24} />
                </button>
            </motion.div>

            {/* Search */}
            <motion.div variants={item} style={{ position: 'relative', marginBottom: '24px' }}>
                <Search size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)', zIndex: 1 }} />
                <input
                    className="input-elegant"
                    type="text"
                    placeholder={t('search_exercises')}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        width: '100%',
                        paddingLeft: '44px',
                        fontSize: '1rem'
                    }}
                />
            </motion.div>


            {/* Add/Edit Form */}
            {showAdd && (
                <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', border: '1px solid var(--primary-glow)', background: 'rgba(0, 242, 254, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0 }}>{newEx.id ? t('edit_exercise') : t('new_exercise')}</h3>
                        <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input
                            className="input-elegant"
                            placeholder={t('exercise_name')}
                            value={newEx.name}
                            onChange={e => setNewEx({ ...newEx, name: e.target.value })}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select
                                className="input-elegant"
                                value={newEx.muscle_group}
                                onChange={e => setNewEx({ ...newEx, muscle_group: e.target.value })}
                                style={{ flex: 1 }}
                            >
                                {['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Cardio'].map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <select
                                className="input-elegant"
                                value={newEx.equipment}
                                onChange={e => setNewEx({ ...newEx, equipment: e.target.value })}
                                style={{ flex: 1 }}
                            >
                                {['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Other'].map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </div>
                        <input
                            className="input-elegant"
                            placeholder="Video URL (YouTube)"
                            value={newEx.video_url || ''}
                            onChange={e => setNewEx({ ...newEx, video_url: e.target.value })}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {newEx.image_url ? (
                                <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                                    <img src={newEx.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button
                                        onClick={() => setNewEx({ ...newEx, image_url: '' })}
                                        style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', padding: '2px', cursor: 'pointer' }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <label className="btn btn-secondary" style={{ flex: 1, cursor: 'pointer', padding: '12px', borderStyle: 'dashed' }}>
                                    <Camera size={20} />
                                    <span>{t('upload_image')}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            try {
                                                const res = await fetch(`${API_BASE_URL}/upload`, {
                                                    method: 'POST',
                                                    body: formData
                                                });
                                                const data = await res.json();
                                                if (data.path) {
                                                    const finalPath = data.path.startsWith('http') ? data.path : `${API_BASE_URL.replace('/api', '')}` + data.path;
                                                    setNewEx({ ...newEx, image_url: finalPath });
                                                }
                                            } catch (err) {
                                                console.error("Upload failed", err);
                                            }
                                        }}
                                    />
                                </label>
                            )}
                        </div>
                        <button onClick={handleAdd} className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                            {newEx.id ? t('update_exercise') : t('save_exercise')}
                        </button>
                    </div>
                </div>
            )}

            {/* Exercise Details Modal */}
            {selectedExercise && (
                <ExerciseModal
                    exercise={selectedExercise}
                    onClose={() => setSelectedExercise(null)}
                />
            )}

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filtered.map((ex, index) => (
                    <motion.div
                        key={ex.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.3 }}
                        className="glass-panel"
                        style={{
                            padding: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'rgba(255,255,255,0.02)',
                            cursor: 'pointer'
                        }}
                        onClick={() => setSelectedExercise(ex)}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '8px',
                                background: 'rgba(0,229,255,0.1)', color: 'var(--primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                {ex.image_url ? (
                                    <img src={ex.image_url} alt={ex.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <Dumbbell size={20} />
                                )}
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>{ex.name}</h4>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{ex.muscle_group} • {ex.equipment}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleEdit(ex); }}
                                className="btn-icon"
                            >
                                <Pencil size={18} color="var(--text-muted)" />
                            </button>
                            <button
                                onClick={(e) => { handleDelete(ex.id, e); }}
                                className="btn-icon"
                            >
                                <Trash2 size={18} color="var(--text-muted)" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
