import { Share2, X, CheckCircle, Camera } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { API_BASE_URL } from '../../config';

export default function WorkoutSummary({ isOpen, onClose, data }) {
    const { t } = useLanguage();

    if (!isOpen || !data) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '32px 24px', position: 'relative', textAlign: 'center' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#fff' }}>
                    <X size={24} />
                </button>

                <CheckCircle size={64} color="var(--primary)" style={{ marginBottom: '20px' }} />

                <h2 className="text-gradient" style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Workout Completed!</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>{data.workoutName}</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                    <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Duration</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{data.duration}m</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Calories</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{data.calories}</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', gridColumn: 'span 2' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Volume</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>{data.volume.toLocaleString()} kg</div>
                    </div>

                    <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', gridColumn: 'span 2', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', width: '100%', textAlign: 'left' }}>Progress Photo</div>
                        <label className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', padding: '12px', border: '1px dashed var(--border-light)' }}>
                            <Camera size={20} />
                            <span>Add Photo</span>
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
                                        const res = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: formData });
                                        const uData = await res.json();
                                        if (uData.path) {
                                            await fetch(`${API_BASE_URL}/progress-photos`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    date: new Date().toISOString(),
                                                    image_url: uData.path.startsWith('http') ? uData.path : `${API_BASE_URL.replace('/api', '')}` + uData.path,
                                                    notes: 'Post-workout',
                                                    userId: 1 // hardcoded for now
                                                })
                                            });
                                            alert('Photo saved to your private gallery!');
                                        }
                                    } catch (err) {
                                        console.error('Photo save failed', err);
                                    }
                                }}
                            />
                        </label>
                    </div>
                </div>

                <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Share2 size={18} />
                    Share Results
                </button>

            </div>
        </div>
    );
}
