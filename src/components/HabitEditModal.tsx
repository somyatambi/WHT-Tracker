import { useState } from 'react';
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
  const [newName, setNewName] = useState('');

  if (!showEditHabits) return null;

  const handleAdd = () => {
    if (newName.trim()) {
      addHabit(newName.trim());
      setNewName('');
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setShowEditHabits(false); }}>
      <div className="modal-box">
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 24,
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>Edit Habits</h2>
          <button
            onClick={() => setShowEditHabits(false)}
            style={{
              width: 32, height: 32,
              borderRadius: '50%',
              background: 'var(--bg-input)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)',
              transition: 'all 0.15s ease',
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

        {/* Add form */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="New habit name..."
            className="modal-input"
            style={{ flex: 1 }}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
          />
          <button
            onClick={handleAdd}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', fontSize: 13 }}
          >
            <Plus style={{ width: 15, height: 15 }} /> Add
          </button>
        </div>

        {/* Habit list */}
        <ul style={{
          listStyle: 'none', padding: 0, margin: 0,
          maxHeight: 380, overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {habits.map(habit => (
            <li
              key={habit.id}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px',
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border)',
                transition: 'border-color 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#c7d2fe'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <span style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)' }}>
                {habit.name}
              </span>
              <button
                onClick={() => removeHabit(habit.id)}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--text-muted)', cursor: 'pointer',
                  padding: 6, borderRadius: 6,
                  transition: 'all 0.15s ease',
                  display: 'flex', alignItems: 'center',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--danger)';
                  e.currentTarget.style.background = 'var(--danger-light)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.background = 'none';
                }}
              >
                <Trash2 style={{ width: 15, height: 15 }} />
              </button>
            </li>
          ))}
          {habits.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24, fontSize: 14 }}>
              No habits yet. Add one above!
            </p>
          )}
        </ul>
      </div>
    </div>
  );
}