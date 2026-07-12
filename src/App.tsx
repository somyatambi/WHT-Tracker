import { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useHabits } from './hooks/useHabits';
import { useTasks } from './hooks/useTasks';
import { useWeek } from './hooks/useWeek';
import { useToast } from './components/Toast';
import type { AppSettings } from './types';

import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { Analytics } from './components/Analytics';
import { PlannerView } from './components/PlannerView';
import { Toast } from './components/Toast';

const DEFAULT_SETTINGS: AppSettings = {
  weekStartDay: 'sunday',
  darkMode: false,
  reminderEnabled: false,
  reminderTime: '08:00'
};

export default function App() {
  const [settings, setSettings] = useLocalStorage<AppSettings>('momentum_settings', DEFAULT_SETTINGS);

  // Verify data loads on mount
  useEffect(() => {
    const test = localStorage.getItem('momentum_tasks');
    console.log('Data loaded:', test ? 'YES' : 'EMPTY');
  }, []);

  // Sync dark mode: use localStorage key + html class (FOUC-safe)
  useEffect(() => {
    const savedTheme = localStorage.getItem('momentum_theme');
    const isDark = savedTheme === 'dark' || settings.darkMode;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const handleToggleTheme = () => {
    const newDarkMode = !settings.darkMode;
    setSettings({ ...settings, darkMode: newDarkMode });
    localStorage.setItem('momentum_theme', newDarkMode ? 'dark' : 'light');
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Lift useWeek to App level so Header can consume navigation
  const weekStartDayNum = settings.weekStartDay === 'sunday' ? 0 : 1;
  const weekNav = useWeek(weekStartDayNum as 0 | 1);

  // Single source of truth
  const habitState = useHabits();
  const taskState = useTasks();

  // Toast system
  const { toasts, addToast, removeToast } = useToast();

  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', color: 'var(--text-primary)', transition: 'background 0.3s ease, color 0.3s ease' }}>
      <Header
        settings={settings}
        handleToggleTheme={handleToggleTheme}
        setShowSettings={setShowSettings}
        setShowAnalytics={setShowAnalytics}
        showAnalytics={showAnalytics}
        weekNav={weekNav}
      />

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px 40px' }}>
        {showAnalytics ? (
          <Analytics habitState={habitState} taskState={taskState} />
        ) : (
          <PlannerView
            settings={settings}
            habitState={habitState}
            taskState={taskState}
            weekNav={weekNav}
            addToast={addToast}
          />
        )}
      </main>

      <SettingsModal
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        settings={settings}
        setSettings={setSettings}
      />

      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Keyboard shortcut hint */}
      <div style={{
        position: 'fixed',
        bottom: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 11,
        color: 'var(--text-muted)',
        letterSpacing: '0.02em',
        pointerEvents: 'none',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}>
        Ctrl+← → to navigate weeks • Ctrl+T for today
      </div>
    </div>
  );
}
