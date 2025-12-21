import { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';

import WorkoutView from './components/Workout/WorkoutView';
import ExerciseLibrary from './components/Exercise/ExerciseLibrary';
import HistoryHub from './components/Analytics/HistoryHub';
import Templates from './components/Templates/Templates';
import ProfileView from './components/Profile/ProfileView';
import LoginView from './components/Auth/LoginView';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [hasActiveSession, setHasActiveSession] = useState(false);

  // Global Check for Active Session
  useEffect(() => {
    const checkSession = () => {
      const saved = localStorage.getItem('active_workout_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        const today = new Date().toISOString().split('T')[0];
        setHasActiveSession(parsed.date === today);
      } else {
        setHasActiveSession(false);
      }
    };

    checkSession();
    // Re-check whenever view changes or on an interval
    const interval = setInterval(checkSession, 5000);
    return () => clearInterval(interval);
  }, [currentView]);

  // Check for stored session (simplified)
  useEffect(() => {
    const storedUser = localStorage.getItem('gym_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('gym_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('gym_user');
  };

  const startWorkout = (template) => {
    setActiveTemplate(template);
    setCurrentView('workout');
  };

  if (!user) {
    return (
      <LanguageProvider>
        <LoginView onLogin={handleLogin} onGuest={() => handleLogin({ name: 'Guest', is_guest: true })} />
      </LanguageProvider>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard user={user} onViewChange={setCurrentView} />;
      case 'workout': return <WorkoutView user={user} template={activeTemplate} onFinish={() => setHasActiveSession(false)} />;
      case 'exercises': return <ExerciseLibrary user={user} />;
      case 'templates': return <Templates user={user} onStartWorkout={startWorkout} />;
      case 'history': return <HistoryHub user={user} />;
      case 'profile': return <ProfileView user={user} onLogout={handleLogout} />;
      default: return <Dashboard user={user} onViewChange={setCurrentView} />;
    }
  };

  return (
    <LanguageProvider>
      <Layout
        currentView={currentView}
        onViewChange={setCurrentView}
        hasActiveSession={hasActiveSession && currentView !== 'workout'}
      >
        {renderView()}
      </Layout>
    </LanguageProvider>
  );
}

export default App;
