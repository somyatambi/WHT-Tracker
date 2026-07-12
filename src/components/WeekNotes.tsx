import { useState, useCallback } from 'react';

interface WeekNotesProps {
  weekNote: string;
  updateWeekNote: (content: string) => void;
}

export function WeekNotes({ weekNote, updateWeekNote }: WeekNotesProps) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((value: string) => {
    updateWeekNote(value);
    setSaveStatus('saving');
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
    setDebounceTimer(timer);
  }, [updateWeekNote, debounceTimer]);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      padding: 24,
      boxShadow: 'var(--shadow-sm)',
      marginTop: 20,
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <span className="label-muted">📝 Weekly Reflection</span>
        {saveStatus !== 'idle' && (
          <span style={{
            fontSize: 11, fontWeight: 600,
            color: saveStatus === 'saved' ? 'var(--success)' : 'var(--text-muted)',
            transition: 'color 0.3s ease',
          }}>
            {saveStatus === 'saving' ? 'Saving...' : '✓ Saved'}
          </span>
        )}
      </div>

      <textarea
        placeholder="Write your weekly reflection, wins, blockers, or anything on your mind..."
        value={weekNote}
        onChange={e => handleChange(e.target.value)}
        style={{
          width: '100%',
          minHeight: 110,
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          fontSize: 14, lineHeight: 1.7,
          color: 'var(--text-primary)',
          background: 'var(--bg-input)',
          resize: 'vertical', outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
          fontFamily: "'Inter', sans-serif",
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = 'var(--brand)';
          e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-glow)';
          e.currentTarget.style.background = 'var(--bg-card)';
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.background = 'var(--bg-input)';
        }}
      />
    </div>
  );
}