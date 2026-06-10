interface WeekNotesProps {
  weekNote: string;
  updateWeekNote: (content: string) => void;
}

export function WeekNotes({ weekNote, updateWeekNote }: WeekNotesProps) {
  return (
    <div className="card-surface" style={{ padding: '20px 24px', marginTop: 20 }}>
      <span className="label-muted" style={{ display: 'block', marginBottom: 12 }}>
        📝 Weekly Reflection
      </span>
      <textarea
        placeholder="Write your weekly reflection, wins, blockers, or anything on your mind..."
        value={weekNote}
        onChange={e => updateWeekNote(e.target.value)}
        style={{
          width: '100%',
          minHeight: 100,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          fontSize: 14,
          lineHeight: 1.7,
          padding: '14px 16px',
          resize: 'vertical',
          outline: 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          fontFamily: "'Inter', sans-serif",
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-dim)';
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}