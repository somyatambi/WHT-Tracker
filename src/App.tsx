import { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useHabits } from './hooks/useHabits';
import { useTasks } from './hooks/useTasks';
import type { AppSettings } from './types';

import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { Analytics } from './components/Analytics';
import { PlannerView } from './components/PlannerView';

const DEFAULT_SETTINGS: AppSettings = {
  weekStartDay: 'sunday',
  darkMode: false,
  reminderEnabled: false,
  reminderTime: '08:00'
};

export default function App() {
  const [settings, setSettings] = useLocalStorage<AppSettings>('momentum_settings', DEFAULT_SETTINGS);

  // Single source of truth — lifted from child components
  const habitState = useHabits();
  const taskState = useTasks();

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const handleToggleTheme = () => setSettings({...settings, darkMode: !settings.darkMode});

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }} className="font-sans pb-12 overflow-x-hidden">
      <Header
        settings={settings}
        handleToggleTheme={handleToggleTheme}
        setShowSettings={setShowSettings}
        setShowAnalytics={setShowAnalytics}
        showAnalytics={showAnalytics}
      />

      <main style={{ maxWidth: 1600, margin: '0 auto', padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {showAnalytics ? (
          <Analytics habitState={habitState} taskState={taskState} />
        ) : (
          <PlannerView settings={settings} habitState={habitState} taskState={taskState} />
        )}
      </main>

      <SettingsModal
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        settings={settings}
        setSettings={setSettings}
      />
    </div>
  );
}
