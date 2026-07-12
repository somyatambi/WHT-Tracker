import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Plus, Pin } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface StickyItem {
  id: string;
  text: string;
  createdAt: string;
}

export function StickyNotes() {
  const [items, setItems] = useLocalStorage<StickyItem[]>('momentum_sticky_notes', []);
  const [inputValue, setInputValue] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const addItem = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setItems(prev => [
      ...prev,
      { id: uuidv4(), text: trimmed, createdAt: new Date().toISOString() },
    ]);
    setInputValue('');
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItem = (id: string, text: string) => {
    setItems(prev => prev.map(item => (item.id === id ? { ...item, text } : item)));
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: '20px 24px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
      }}>
        <div>
          <span className="label-muted">📌 Long-Term Notes</span>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
            Persists across all weeks
          </div>
        </div>
      </div>

      {/* ── Add note input row ── */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        gap: 10,
      }}>
        <input
          type="text"
          placeholder="Add a note or keyword..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addItem(); }}
          style={{
            flex: 1,
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
            fontSize: 14,
            fontFamily: "'Inter', sans-serif",
            color: 'var(--text-primary)',
            background: 'var(--bg-input)',
            outline: 'none',
            transition: 'all 0.2s ease',
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
        <button
          onClick={addItem}
          style={{
            background: inputValue.trim() ? 'var(--brand)' : 'var(--bg-input)',
            color: inputValue.trim() ? 'white' : 'var(--text-muted)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: '10px 18px',
            fontSize: 13,
            fontWeight: 700,
            cursor: inputValue.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', gap: 6,
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease',
            fontFamily: "'Inter', sans-serif",
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            if (inputValue.trim()) {
              e.currentTarget.style.filter = 'brightness(1.1)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-brand)';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.filter = 'none';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Plus style={{ width: 14, height: 14 }} /> Add
        </button>
      </div>

      {/* ── Notes list ── */}
      <div style={{
        padding: items.length ? '12px 24px' : '0',
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxHeight: 320,
      }}>
        {items.map(item => (
          <div
            key={item.id}
            style={{
              background: 'var(--bg-page)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              transition: 'all 0.2s ease',
              animation: 'fadeInUp 0.3s ease',
              ...(hoveredId === item.id ? {
                background: 'var(--bg-card)',
                borderColor: '#c7d2fe',
                transform: 'translateX(3px)',
              } : {}),
            }}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Left: pin icon + editable text */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
              <Pin style={{ width: 14, height: 14, color: 'var(--brand)', opacity: 0.6, flexShrink: 0 }} />
              <input
                type="text"
                value={item.text}
                onChange={e => updateItem(item.id, e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                  minWidth: 0,
                }}
              />
            </div>

            {/* Right: delete button (shows on hover) */}
            {hoveredId === item.id && (
              <button
                onClick={() => removeItem(item.id)}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: 18, lineHeight: 1,
                  cursor: 'pointer', padding: '0 2px',
                  flexShrink: 0,
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ── Empty state ── */}
      {items.length === 0 && (
        <div style={{
          padding: '32px 24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📝</div>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>No long-term notes yet</div>
          <div style={{ fontSize: 12 }}>Add notes that stay with you across all weeks</div>
        </div>
      )}
    </div>
  );
}
