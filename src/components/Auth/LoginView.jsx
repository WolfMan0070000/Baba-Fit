import { useState } from 'react';
import { User, Lock, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { API_BASE_URL } from '../../config';

export default function LoginView({ onLogin, onGuest }) {
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
            setError('Connection failed');
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
            paddingTop: 'max(24px, env(safe-area-inset-top, 24px))',
            paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
            background: 'var(--bg-app)'
        }}>
            <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '8px' }}>FAT SHREDDER</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Your Personal Transformation Hub</p>

            <div className="glass-panel" style={{ width: '100%', maxWidth: '320px', padding: '24px' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', textAlign: 'center' }}>
                    {isRegister ? 'Create Account' : 'Welcome Back'}
                </h2>

                {error && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', color: 'white' }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', color: 'white' }}
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
                        {isRegister ? 'Sign Up' : 'Log In'}
                    </button>
                </form>

                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'center' }}>
                    <span
                        onClick={() => setIsRegister(!isRegister)}
                        style={{ fontSize: '0.8rem', color: 'var(--primary)', cursor: 'pointer' }}
                    >
                        {isRegister ? 'Already have an account? Log In' : 'New here? Create Account'}
                    </span>

                    <div style={{ borderTop: '1px solid var(--border-light)', margin: '4px 0' }}></div>

                    <button
                        onClick={onGuest}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                        Continue as Guest <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
                    </button>
                </div>
            </div>
        </div>
    );
}
