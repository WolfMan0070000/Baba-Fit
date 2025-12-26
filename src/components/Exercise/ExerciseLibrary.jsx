import { useState, useEffect } from 'react';
import { Search, Plus, Dumbbell, X, Camera, Pencil, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { api } from '../../services/api';
import ExerciseModal from '../Workout/ExerciseModal';

export default function ExerciseLibrary() {
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

    return (
        <div style={{ padding: '16px', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800 }}>Exercise Library</h2>
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
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '24px' }}>
                <Search size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input
                    type="text"
                    placeholder="Search exercises..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px 12px 12px 44px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '1rem'
                    }}
                />
            </div>

            {/* Add/Edit Form */}
            {showAdd && (
                <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', border: '1px solid var(--primary-glow)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0 }}>{newEx.id ? 'Edit Exercise' : 'New Custom Exercise'}</h3>
                        <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input
                            placeholder="Exercise Name"
                            value={newEx.name}
                            onChange={e => setNewEx({ ...newEx, name: e.target.value })}
                            style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', color: 'white' }}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select
                                value={newEx.muscle_group}
                                onChange={e => setNewEx({ ...newEx, muscle_group: e.target.value })}
                                style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', color: 'white' }}
                            >
                                {['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Cardio'].map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <select
                                value={newEx.equipment}
                                onChange={e => setNewEx({ ...newEx, equipment: e.target.value })}
                                style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', color: 'white' }}
                            >
                                {['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Other'].map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </div>
                        <input
                            placeholder="Video URL (YouTube)"
                            value={newEx.video_url || ''}
                            onChange={e => setNewEx({ ...newEx, video_url: e.target.value })}
                            style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', color: 'white' }}
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
                                <label className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', padding: '12px', border: '1px dashed var(--border-light)', borderRadius: '8px' }}>
                                    <Camera size={20} />
                                    <span>Upload Image</span>
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
                        <button onClick={handleAdd} className="btn-primary" style={{ marginTop: '8px' }}>{newEx.id ? 'Update Exercise' : 'Save Exercise'}</button>
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
                {filtered.map(ex => (
                    <div key={ex.id} style={{
                        background: 'rgba(255,255,255,0.03)',
                        padding: '16px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, cursor: 'pointer' }} onClick={() => setSelectedExercise(ex)}>
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
                                <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{ex.name}</h4>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{ex.muscle_group} • {ex.equipment}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleEdit(ex); }}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                            >
                                <Pencil size={18} />
                            </button>
                            <button
                                onClick={(e) => { handleDelete(ex.id, e); }}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
