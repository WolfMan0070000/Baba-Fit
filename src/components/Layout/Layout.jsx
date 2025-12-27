import { useLanguage } from '../../context/LanguageContext';
import { Home, Dumbbell, BicepsFlexed, Globe, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children, currentView, onViewChange, hasActiveSession }) {
    const { t, toggleLanguage, language } = useLanguage();

    const navItems = [
        { id: 'dashboard', icon: Home, label: t('dashboard') },
        { id: 'templates', icon: Dumbbell, label: 'Workouts' },
        { id: 'exercises', icon: BicepsFlexed, label: 'Exercises' },
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
                alignItems: 'center'
            }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em' }}>BABA FIT</h1>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Elite Transformation</p>
                </div>
                <button
                    onClick={toggleLanguage}
                    className="btn btn-secondary"
                    style={{ padding: '8px 12px', minWidth: '60px' }}
                >
                    <Globe size={16} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{language === 'en' ? 'FA' : 'EN'}</span>
                </button>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1, paddingBottom: '120px' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentView}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Resume Banner */}
            {hasActiveSession && (
                <div onClick={() => onViewChange('workout')} style={{
                    position: 'fixed',
                    bottom: 'max(100px, calc(80px + env(safe-area-inset-bottom, 0px)))',
                    left: '20px',
                    right: '20px',
                    background: 'linear-gradient(90deg, var(--primary), #00d2ff)',
                    padding: '14px 24px',
                    borderRadius: '100px',
                    color: 'black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 8px 25px rgba(0, 242, 254, 0.4)',
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
                bottom: 'max(20px, calc(10px + env(safe-area-inset-bottom, 0px)))',
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
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            fontFamily: 'inherit',
                            transform: currentView === item.id ? 'scale(1.1) translateY(-4px)' : 'scale(1)',
                            textShadow: currentView === item.id ? '0 0 10px var(--primary-glow)' : 'none'
                        }}
                    >
                        <item.icon size={22} style={{ filter: currentView === item.id ? 'drop-shadow(0 0 8px var(--primary-glow))' : 'none' }} />
                        <span style={{ fontSize: '0.7rem', fontWeight: currentView === item.id ? 700 : 500 }}>{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}
