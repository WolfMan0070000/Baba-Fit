import { useLanguage } from '../../context/LanguageContext';
import { Home, Dumbbell, Utensils, Globe, User } from 'lucide-react';

export default function Layout({ children, currentView, onViewChange, hasActiveSession }) {
    const { t, toggleLanguage, language } = useLanguage();

    const navItems = [
        { id: 'dashboard', icon: Home, label: t('dashboard') },
        { id: 'templates', icon: Dumbbell, label: 'Workouts' },
        { id: 'exercises', icon: Utensils, label: 'Library' },
        { id: 'history', icon: Globe, label: 'History' },
        { id: 'profile', icon: User, label: 'Profile' }
    ];

    return (
        <div className="container">
            {/* Header */}
            <header className="app-header glass-panel" style={{
                marginBottom: '20px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '16px'
            }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '1.25rem', fontWeight: 800 }}>FAT SHREDDER</h1>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>12-Week Specialization</p>
                </div>
                <button
                    onClick={toggleLanguage}
                    className="btn glass-panel"
                    style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                    <Globe size={16} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{language === 'en' ? 'FA' : 'EN'}</span>
                </button>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1, paddingBottom: '120px' }}>
                {children}
            </main>

            {/* Resume Banner */}
            {hasActiveSession && (
                <div onClick={() => onViewChange('workout')} style={{
                    position: 'fixed',
                    bottom: '100px',
                    left: '20px',
                    right: '20px',
                    background: 'linear-gradient(90deg, var(--primary), #00d2ff)',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    color: 'black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(0, 242, 254, 0.4)',
                    zIndex: 90,
                    animation: 'pulse 2s infinite'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Dumbbell size={18} />
                        <span>Workout in Progress...</span>
                    </div>
                    <span>Resume →</span>
                </div>
            )}

            {/* Bottom Navigation */}
            <nav className="glass-panel" style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'calc(100% - 40px)',
                maxWidth: '440px',
                display: 'flex',
                justifyContent: 'space-around',
                padding: '12px',
                zIndex: 100
            }}>
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: currentView === item.id ? 'var(--primary)' : 'var(--text-muted)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            transition: 'color 0.2s',
                            fontFamily: 'inherit'
                        }}
                    >
                        <item.icon size={24} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}
