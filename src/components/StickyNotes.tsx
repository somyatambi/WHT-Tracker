import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Plus, X, GripVertical } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface StickyItem {
  id: string;
  text: string;
  createdAt: string;
}

export function StickyNotes() {
  const [items, setItems] = useLocalStorage<StickyItem[]>('momentum_sticky_notes', []);
  const [inputValue, setInputValue] = useState('');

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
    <div className="card-surface" style={{ padding: '20px 24px', marginTop: 20 }}>
      <span className="label-muted" style={{ display: 'block', marginBottom: 14 }}>
        📌 Long-Term Notes &amp; Keywords
      </span>

      {/* Item list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(item => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent-dim)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <GripVertical
              style={{
                width: 14,
                height: 14,
                color: 'var(--text-muted)',
                flexShrink: 0,
                opacity: 0.4,
              }}
            />
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
                fontSize: 14,
                fontFamily: "'Inter', sans-serif",
                lineHeight: 1.5,
              }}
            />
            <button
              onClick={() => removeItem(item.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                transition: 'color 0.15s ease, background 0.15s ease',
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.background = 'none';
              }}
              title="Remove"
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
        ))}
      </div>

      {/* Add new item */}
      <form
        onSubmit={e => {
          e.preventDefault();
          addItem();
        }}
        style={{
          display: 'flex',
          gap: 8,
          marginTop: items.length > 0 ? 12 : 0,
        }}
      >
        <input
          type="text"
          placeholder="Add a long-term task, keyword, or note..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          style={{
            flex: 1,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: 14,
            padding: '10px 14px',
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
        <button
          type="submit"
          disabled={!inputValue.trim()}
          style={{
            background: inputValue.trim() ? 'var(--accent)' : 'var(--bg-elevated)',
            color: inputValue.trim() ? '#000' : 'var(--text-muted)',
            border: inputValue.trim() ? 'none' : '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
            fontSize: 13,
            fontWeight: 600,
            cursor: inputValue.trim() ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            if (inputValue.trim()) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Plus style={{ width: 16, height: 16 }} /> Add
        </button>
      </form>

      {items.length === 0 && (
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: 13,
            textAlign: 'center',
            margin: '16px 0 4px',
            opacity: 0.6,
          }}
        >
          No notes yet — items you add here persist across all weeks.
        </p>
      )}
    </div>
  );
}
