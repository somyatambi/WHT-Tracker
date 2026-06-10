import { Check } from 'lucide-react';
import type { Task } from '../types';
import { useState } from 'react';

interface TaskItemProps {
  task: Task;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  handleConfetti: (e: React.SyntheticEvent) => void;
}

export function TaskItem({ task, onUpdateTask, onDeleteTask, handleConfetti }: TaskItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        transition: 'background 0.1s ease',
        ...(hovered ? { background: 'rgba(255,255,255,0.02)' } : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Custom checkbox */}
      <div
        className={`custom-checkbox ${task.completed ? 'checked' : ''}`}
        onClick={e => {
          if (!task.completed) handleConfetti(e);
          onUpdateTask(task.id, { completed: !task.completed });
        }}
      >
        {task.completed && (
          <Check style={{ width: 14, height: 14, color: '#000', strokeWidth: 3 }} />
        )}
      </div>

      {/* Task text */}
      <input
        value={task.text}
        onChange={e => onUpdateTask(task.id, { text: e.target.value })}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontSize: 13,
          fontWeight: 400,
          color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
          textDecoration: task.completed ? 'line-through' : 'none',
          transition: 'color 0.15s ease',
        }}
      />

      {/* Delete button */}
      <button
        onClick={() => onDeleteTask(task.id)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: 16,
          cursor: 'pointer',
          opacity: hovered ? 1 : 0,
          transition: 'all 0.15s ease',
          padding: '0 4px',
          lineHeight: 1,
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        ×
      </button>
    </div>
  );
}