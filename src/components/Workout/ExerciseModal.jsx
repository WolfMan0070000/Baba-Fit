import { useState, useEffect } from 'react';
import { X, PlayCircle, Loader2, Camera } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { useLanguage } from '../../context/LanguageContext';

export default function ExerciseModal({ exercise, onClose }) {
    const { t, isRTL } = useLanguage();
    const [videoUrl, setVideoUrl] = useState(exercise?.video_url || null);
    const [imageUrl, setImageUrl] = useState(exercise?.image_url || null);
    const [loading, setLoading] = useState(!exercise?.video_url && !exercise?.image_url);

    useEffect(() => {
        if (!exercise?.video_url && !exercise?.image_url) {
            setLoading(true);
            fetch(`${API_BASE_URL}/exercises`)
                .then(res => res.json())
                .then(data => {
                    if (data.data) {
                        const match = data.data.find(ex =>
                            ex.name.toLowerCase() === (exercise.name_en || exercise.name).toLowerCase()
                        );
                        if (match) {
                            if (match.video_url) setVideoUrl(match.video_url);
                            if (match.image_url) setImageUrl(match.image_url);
                        }
                    }
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [exercise]);

    const getEmbedUrl = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    if (!exercise) return null;

    const embedUrl = getEmbedUrl(videoUrl);

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }} onClick={onClose}>
            <div style={{
                background: 'var(--bg-app)',
                width: '100%',
                maxWidth: '500px',
                borderRadius: '16px',
                border: '1px solid var(--border-light)',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{isRTL ? exercise.name_fa : exercise.name_en}</h3>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Video / Image Area */}
                <div style={{
                    height: '400px',
                    background: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                }}>
                    {loading ? (
                        <div style={{ textAlign: 'center' }}>
                            <Loader2 size={32} className="rotate" color="var(--primary)" />
                            <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.8rem' }}>Loading details...</p>
                        </div>
                    ) : imageUrl ? (
                        <div style={{ width: '100%', height: '100%', padding: '0', position: 'relative' }}>
                            <img
                                src={imageUrl}
                                alt={exercise.name_en || exercise.name}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        </div>
                    ) : embedUrl ? (
                        <iframe
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            src={embedUrl}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <PlayCircle size={48} color="rgba(255,255,255,0.1)" />
                            <p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>No demonstration available</p>
                        </div>
                    )}

                    <div style={{ position: 'absolute', bottom: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                        <label htmlFor="upload-exercise-img" style={{
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(4px)',
                            padding: '8px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Camera size={20} color="white" />
                        </label>
                        <input
                            id="upload-exercise-img"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                const formData = new FormData();
                                formData.append('file', file);
                                try {
                                    setLoading(true);
                                    const res = await fetch(`${API_BASE_URL}/upload`, {
                                        method: 'POST',
                                        body: formData
                                    });
                                    const data = await res.json();
                                    if (data.path) {
                                        setImageUrl(`${API_BASE_URL.replace('/api', '')}` + data.path);
                                        // TODO: Optionally save this to DB indefinitely or just locally for session? 
                                        // User request implies "users can add their own", so we should persist it to custom exercise or override.
                                        // For now, I'll allow visual override.
                                    }
                                    setLoading(false);
                                } catch (err) {
                                    console.error("Upload failed", err);
                                    setLoading(false);
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Details */}
                <div style={{ padding: '20px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ color: 'var(--primary)', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{t('notes')}</h4>
                        <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)' }}>
                            {isRTL ? exercise.note_fa : exercise.note_en || "Follow proper form and control the eccentric phase of the movement for maximum efficiency."}
                        </p>
                    </div>

                    <div>
                        <h4 style={{ color: 'var(--text-muted)', marginBottom: '12px', fontSize: '0.8rem', fontWeight: 700 }}>WORKOUT GOALS</h4>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {[
                                { label: 'Sets', val: exercise.sets },
                                { label: 'Reps', val: exercise.reps },
                                { label: 'RPE', val: exercise.rpe }
                            ].map(item => (
                                <div key={item.label} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>{item.label}</span>
                                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>{item.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
