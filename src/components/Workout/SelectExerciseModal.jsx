import { useState, useEffect } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { API_BASE_URL } from '../../config';

export default function SelectExerciseModal({ onClose, onSelect }) {
    const { t } = useLanguage();
    const [exercises, setExercises] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch(`${API_BASE_URL}/exercises`)
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setExercises(data.data);
                    setFiltered(data.data);
                }
            });
    }, []);

    useEffect(() => {
        const lower = search.toLowerCase();
        setFiltered(exercises.filter(ex => ex.name.toLowerCase().includes(lower)));
    }, [search, exercises]);

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', height: '80vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)', border: '1px solid var(--border-light)' }}>
                {/* Header */}
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>{t('add_exercise')}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
                </div>

                {/* Search */}
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                        <input
                            placeholder={t('search_exercises')}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white' }}
                        />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filtered.map(ex => (
                        <div key={ex.id} onClick={() => onSelect(ex)}
                            className="glass-panel"
                            style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {ex.image_url ? (
                                    <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <img src={ex.image_url} alt={ex.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ) : (
                                    <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>💪</span>
                                    </div>
                                )}
                                <div>
                                    <div style={{ fontWeight: 600 }}>{ex.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ex.muscle_group}</div>
                                </div>
                            </div>
                            <Plus size={18} color="var(--primary)" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
