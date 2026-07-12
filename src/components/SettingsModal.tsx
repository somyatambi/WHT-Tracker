import { X, Download, Upload } from 'lucide-react';
import type { AppSettings } from '../types';
import * as XLSX from 'xlsx';

interface SettingsModalProps {
  showSettings: boolean;
  setShowSettings: (s: boolean) => void;
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
}

export function SettingsModal({ showSettings, setShowSettings, settings, setSettings }: SettingsModalProps) {
  if (!showSettings) return null;

  const handleExport = () => {
    // Gather data
    const safeParse = (key: string) => {
      try {
        return JSON.parse(localStorage.getItem(key) || '[]');
      } catch {
        return [];
      }
    };
    
    const settingsParse = () => {
      try {
        return JSON.parse(localStorage.getItem('momentum_settings') || '{}');
      } catch {
        return {};
      }
    };

    const habits = safeParse('momentum_habits');
    const logs = safeParse('momentum_habit_logs');
    const tasks = safeParse('momentum_tasks');
    const notes = safeParse('momentum_week_notes');
    const sticky = safeParse('momentum_sticky_notes');
    const currentSettings = settingsParse();

    const wb = XLSX.utils.book_new();

    // Add sheets for each data type
    if (habits.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(habits), "Habits");
    if (logs.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(logs), "Habit Logs");
    if (tasks.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tasks), "Tasks");
    if (notes.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(notes), "Week Notes");
    if (sticky.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sticky), "Sticky Notes");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([currentSettings]), "Settings");

    // Write file
    XLSX.writeFile(wb, `momentum-export-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file extension to route JSON vs Excel/CSV
    const isJson = file.name.toLowerCase().endsWith('.json');

    if (isJson) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.momentum_habits) localStorage.setItem('momentum_habits', data.momentum_habits);
          if (data.momentum_habit_logs) localStorage.setItem('momentum_habit_logs', data.momentum_habit_logs);
          if (data.momentum_tasks) localStorage.setItem('momentum_tasks', data.momentum_tasks);
          if (data.momentum_week_notes) localStorage.setItem('momentum_week_notes', data.momentum_week_notes);
          if (data.momentum_sticky_notes) localStorage.setItem('momentum_sticky_notes', data.momentum_sticky_notes);
          if (data.momentum_settings) localStorage.setItem('momentum_settings', data.momentum_settings);
          alert('JSON Data imported successfully! The page will now reload.');
          window.location.reload();
        } catch {
          alert('Invalid JSON file format.');
        }
      };
      reader.readAsText(file);
    } else {
      // Excel or CSV handling
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          let imported = false;

          // Helper to check if row has specific keys
          const hasKeys = (row: any, keys: string[]) => keys.every(k => row[k] !== undefined);

          // Iterate through all sheets to support CSVs with arbitrary names
          workbook.SheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            const rows: any[] = XLSX.utils.sheet_to_json(sheet);
            if (rows.length === 0) return;

            const sample = rows[0];

            // Detect Habits
            if (sheetName === "Habits" || hasKeys(sample, ['id', 'name', 'order', 'createdAt'])) {
              localStorage.setItem('momentum_habits', JSON.stringify(rows));
              imported = true;
            }
            // Detect Habit Logs
            else if (sheetName === "Habit Logs" || hasKeys(sample, ['habitId', 'date', 'completed'])) {
              localStorage.setItem('momentum_habit_logs', JSON.stringify(rows));
              imported = true;
            }
            // Detect Tasks
            else if (sheetName === "Tasks" || hasKeys(sample, ['dayDate', 'weekId', 'text', 'completed'])) {
              localStorage.setItem('momentum_tasks', JSON.stringify(rows));
              imported = true;
            }
            // Detect Week Notes
            else if (sheetName === "Week Notes" || hasKeys(sample, ['weekId', 'content'])) {
              localStorage.setItem('momentum_week_notes', JSON.stringify(rows));
              imported = true;
            }
            // Detect Sticky Notes
            else if (sheetName === "Sticky Notes" || (hasKeys(sample, ['id', 'text', 'createdAt']) && !hasKeys(sample, ['order']))) {
              localStorage.setItem('momentum_sticky_notes', JSON.stringify(rows));
              imported = true;
            }
            // Detect Settings
            else if (sheetName === "Settings" || hasKeys(sample, ['weekStartDay', 'darkMode'])) {
              localStorage.setItem('momentum_settings', JSON.stringify(rows[0]));
              imported = true;
            }
          });
          
          if (imported) {
            alert('Data imported successfully! The page will now reload.');
            window.location.reload();
          } else {
            alert('Could not find any recognizable data (Habits, Tasks, etc.) in this file. Please make sure the columns match the expected format.');
          }
        } catch (error) {
          console.error(error);
          alert('Invalid file format. Please upload a valid Excel (.xlsx) file exported from this app.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={e => { if (e.target === e.currentTarget) setShowSettings(false); }}
    >
      <div className="modal-box">
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 24,
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>Settings</h2>
          <button
            onClick={() => setShowSettings(false)}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--bg-input)', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--danger-light)';
              e.currentTarget.style.color = 'var(--danger)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--bg-input)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Week Start Day */}
          <div>
            <label style={{
              display: 'block', fontSize: 13, fontWeight: 600,
              color: 'var(--text-secondary)', marginBottom: 8,
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
            paddingTop: 20, borderTop: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
              Data Management
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
              Export your data as an Excel file to easily view or edit in spreadsheets. You can import `.xlsx`, `.csv`, or legacy `.json` files.
            </p>

            {/* Export */}
            <button
              onClick={handleExport}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '11px 14px',
                background: 'var(--bg-input)', border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)',
                fontSize: 14, fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.15s ease', fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--brand)';
                e.currentTarget.style.color = 'var(--brand)';
                e.currentTarget.style.background = 'var(--brand-light)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.background = 'var(--bg-input)';
              }}
            >
              <Download style={{ width: 16, height: 16 }} /> Export to Excel (.xlsx)
            </button>

            {/* Import */}
            <label
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '11px 14px',
                background: 'var(--bg-input)', border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)',
                fontSize: 14, fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--brand)';
                e.currentTarget.style.color = 'var(--brand)';
                e.currentTarget.style.background = 'var(--brand-light)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.background = 'var(--bg-input)';
              }}
            >
              <Upload style={{ width: 16, height: 16 }} /> Import from Excel/CSV
              <input type="file" accept=".xlsx,.csv,.json" onChange={handleImport} style={{ display: 'none' }} />
            </label>

            {/* Reset */}
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset ALL data? This cannot be undone.')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="btn-danger"
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8,
                padding: '11px 14px', fontSize: 14, fontWeight: 600,
                marginTop: 8,
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