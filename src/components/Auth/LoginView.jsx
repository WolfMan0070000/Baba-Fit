import { useState } from 'react';
import { User, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { useLanguage } from '../../context/LanguageContext';

export default function LoginView({ onLogin, onGuest }) {
    const { t, isRTL } = useLanguage();
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const endpoint = isRegister ? '/register' : '/login';

        try {
            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (res.ok) {
                onLogin(data.user);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError(t('connection_failed'));
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px',
            background: 'var(--bg-app)',
            direction: isRTL ? 'rtl' : 'ltr'
        }}>
            <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.02em' }}>BABA FIT</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', textAlign: 'center' }}>{t('personal_hub')}</p>

            <div className="glass-panel" style={{ width: '100%', maxWidth: '340px', padding: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>
                    {isRegister ? t('create_account') : t('welcome_back_title')}
                </h2>

                {error && <div style={{ color: '#ff3366', fontSize: '0.85rem', marginBottom: '20px', textAlign: 'center', background: 'rgba(255,51,102,0.1)', padding: '8px', borderRadius: '8px' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '14px', top: '14px', color: 'var(--text-muted)', zIndex: 1 }} />
                        <input
                            className="input-elegant"
                            type="text"
                            placeholder={t('username')}
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            style={{ width: '100%', [isRTL ? 'paddingRight' : 'paddingLeft']: '44px' }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '14px', top: '14px', color: 'var(--text-muted)', zIndex: 1 }} />
                        <input
                            className="input-elegant"
                            type="password"
                            placeholder={t('password')}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{ width: '100%', [isRTL ? 'paddingRight' : 'paddingLeft']: '44px' }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '12px', width: '100%', padding: '14px' }}>
                        {isRegister ? t('sign_up') : t('login')}
                    </button>
                </form>

                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
                    <span
                        onClick={() => setIsRegister(!isRegister)}
                        style={{ fontSize: '0.85rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                    >
                        {isRegister ? t('already_account') : t('new_here')}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                    </div>

                    <button
                        onClick={onGuest}
                        className="btn btn-secondary"
                        style={{ width: '100%', fontSize: '0.95rem', padding: '12px', gap: '12px' }}
                    >
                        {t('continue_guest')} {isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
