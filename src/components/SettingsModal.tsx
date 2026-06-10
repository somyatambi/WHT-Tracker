import { X, Download, Upload } from 'lucide-react';
import type { AppSettings } from '../types';

interface SettingsModalProps {
  showSettings: boolean;
  setShowSettings: (s: boolean) => void;
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
}

export function SettingsModal({ showSettings, setShowSettings, settings, setSettings }: SettingsModalProps) {
  if (!showSettings) return null;

  const handleExport = () => {
    const data = {
      momentum_habits: localStorage.getItem('momentum_habits'),
      momentum_habit_logs: localStorage.getItem('momentum_habit_logs'),
      momentum_tasks: localStorage.getItem('momentum_tasks'),
      momentum_week_notes: localStorage.getItem('momentum_week_notes'),
      momentum_settings: localStorage.getItem('momentum_settings')
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `momentum-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.momentum_habits) localStorage.setItem('momentum_habits', data.momentum_habits);
        if (data.momentum_habit_logs) localStorage.setItem('momentum_habit_logs', data.momentum_habit_logs);
        if (data.momentum_tasks) localStorage.setItem('momentum_tasks', data.momentum_tasks);
        if (data.momentum_week_notes) localStorage.setItem('momentum_week_notes', data.momentum_week_notes);
        if (data.momentum_settings) localStorage.setItem('momentum_settings', data.momentum_settings);

        alert("Data imported successfully! The page will now reload.");
        window.location.reload();
      } catch (err) {
        alert("Invalid file format.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Settings</h2>
          <button onClick={() => setShowSettings(false)} className="ghost-btn">
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Week Start Day */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--text-secondary)',
              marginBottom: 6,
            }}>
              Week Starts On
            </label>
            <select
              className="modal-input"
              value={settings.weekStartDay}
              onChange={e => setSettings({ ...settings, weekStartDay: e.target.value as 'sunday' | 'monday' })}
              style={{ cursor: 'pointer' }}
            >
              <option value="sunday">Sunday</option>
              <option value="monday">Monday</option>
            </select>
          </div>

          {/* Data Management */}
          <div style={{
            paddingTop: 16,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            <button
              onClick={handleExport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 14px',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--border-hover)';
                e.currentTarget.style.background = 'var(--bg-elevated)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Download style={{ width: 16, height: 16 }} /> Export Data
            </button>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 14px',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--border-hover)';
                e.currentTarget.style.background = 'var(--bg-elevated)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Upload style={{ width: 16, height: 16 }} /> Import Data
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="btn-danger"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 8,
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Reset All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}