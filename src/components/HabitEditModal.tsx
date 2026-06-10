import { X, Plus, Trash2 } from 'lucide-react';
import type { Habit } from '../types';

interface HabitEditModalProps {
  showEditHabits: boolean;
  setShowEditHabits: (s: boolean) => void;
  habits: Habit[];
  addHabit: (name: string) => void;
  removeHabit: (id: string) => void;
}

export function HabitEditModal({ showEditHabits, setShowEditHabits, habits, addHabit, removeHabit }: HabitEditModalProps) {
  if (!showEditHabits) return null;

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
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Edit Habits</h2>
          <button
            onClick={() => setShowEditHabits(false)}
            className="ghost-btn"
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Add form */}
        <form
          onSubmit={e => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const input = form.elements.namedItem('habitName') as HTMLInputElement;
            if (input.value.trim()) {
              addHabit(input.value.trim());
              input.value = '';
            }
          }}
          style={{ display: 'flex', gap: 10, marginBottom: 24 }}
        >
          <input
            name="habitName"
            type="text"
            placeholder="New habit name..."
            className="modal-input"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 16px', fontSize: 14,
          }}>
            <Plus style={{ width: 16, height: 16 }} /> Add
          </button>
        </form>

        {/* Habit list */}
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          maxHeight: 380,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {habits.map(habit => (
            <li
              key={habit.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                transition: 'border-color 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <span style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)' }}>
                {habit.name}
              </span>
              <button
                onClick={() => removeHabit(habit.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 4,
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--red)';
                  e.currentTarget.style.background = 'rgba(248,113,113,0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.background = 'none';
                }}
              >
                <Trash2 style={{ width: 16, height: 16 }} />
              </button>
            </li>
          ))}
          {habits.length === 0 && (
            <p style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              padding: 24,
              fontSize: 14,
            }}>
              No habits defined.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
}