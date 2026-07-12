import { Check } from 'lucide-react';
import type { Task } from '../types';
import { useState } from 'react';

interface TaskItemProps {
  task: Task;
  dayColor: string;
  dayName: string;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

export function TaskItem({ task, dayColor, dayName, onUpdateTask, onDeleteTask }: TaskItemProps) {
  const [hovered, setHovered] = useState(false);

  // Day color at ~12% opacity for pill background
  const dayColorLight = `${dayColor}1F`;

  return (
    <div
      style={{
        background: hovered ? 'var(--bg-elevated)' : 'var(--bg-input)',
        border: hovered ? '1px solid rgba(99,102,241,0.25)' : '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 14px',
        margin: '0 12px 8px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        ...(hovered ? {
          boxShadow: 'var(--shadow-xs)',
          transform: 'translateX(2px)',
        } : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Circular checkbox */}
      <div
        className={`task-checkbox ${task.completed ? 'checked' : ''}`}
        style={{ marginTop: 1 }}
        onClick={e => {
          e.stopPropagation();
          onUpdateTask(task.id, { completed: !task.completed });
        }}
      >
        {task.completed && (
          <Check style={{ width: 11, height: 11, color: 'white', strokeWidth: 3 }} />
        )}
      </div>

      {/* Task content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <input
          value={task.text}
          onChange={e => onUpdateTask(task.id, { text: e.target.value })}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none', outline: 'none',
            fontSize: 13, fontWeight: 500,
            color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
            textDecoration: task.completed ? 'line-through' : 'none',
            transition: 'color 0.15s ease',
            lineHeight: 1.4,
            fontFamily: "'Inter', sans-serif",
          }}
        />
        {/* Pill badges */}
        <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 10, fontWeight: 600,
            color: dayColor, background: dayColorLight,
            borderRadius: 99, padding: '2px 8px',
          }}>
            {dayName}
          </span>
          {task.completed && (
            <span style={{
              fontSize: 10, fontWeight: 600,
              color: 'var(--success)', background: 'var(--success-light)',
              borderRadius: 99, padding: '2px 8px',
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
              ✓ COMPLETED
            </span>
          )}
        </div>
      </div>

      {/* Delete button (hover only) */}
      {hovered && (
        <button
          onClick={e => { e.stopPropagation(); onDeleteTask(task.id); }}
          style={{
            background: 'none', border: 'none',
            color: 'var(--text-muted)',
            fontSize: 16, cursor: 'pointer',
            padding: '0 2px', lineHeight: 1,
            transition: 'color 0.15s ease', flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          ×
        </button>
      )}
    </div>
  );
}