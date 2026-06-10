import { TaskItem } from './TaskItem';
import { isPast, isFuture, format } from 'date-fns';
import { useState } from 'react';
import confetti from 'canvas-confetti';
import type { Task } from '../types';

interface DayColumnProps {
  date: Date;
  isToday: boolean;
  tasks: Task[];
  weekId: string;
  onAddTask: (text: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  animationDelay?: number;
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 16;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg width="40" height="40" viewBox="0 0 40 40" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
      <circle
        cx="20" cy="20" r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="3"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
    </svg>
  );
}

export function DayColumn({ date, isToday: _isToday, tasks, weekId, onAddTask, onUpdateTask, onDeleteTask, animationDelay = 0 }: DayColumnProps) {
  const dCompleted = tasks.filter(t => t.completed).length;
  const dTotal = tasks.length;
  const pct = dTotal === 0 ? 0 : Math.round((dCompleted / dTotal) * 100);
  const isPastDay = isPast(date) && !_isToday;
  const isComplete = pct === 100 && dTotal > 0;

  const handleConfetti = (e: React.SyntheticEvent) => {
    const target = e.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = (rect.left + rect.right) / 2 / window.innerWidth;
    const y = (rect.top + rect.bottom) / 2 / window.innerHeight;

    if (dCompleted + 1 === dTotal && dTotal > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x, y },
        colors: ['#22c55e', '#4ade80', '#86efac']
      });
    }
  };

  return (
    <div
      className={`day-column-enter ${isComplete ? 'column-complete' : ''}`}
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${_isToday ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 420,
        transition: 'border-color 0.2s ease',
        animationDelay: `${animationDelay}ms`,
        ...(_isToday ? {
          boxShadow: '0 0 0 1px rgba(34,197,94,0.1), inset 0 0 40px rgba(34,197,94,0.03)',
        } : {}),
        ...(isPastDay ? { opacity: 0.75 } : {}),
      }}
    >
      {/* Column header */}
      <div style={{
        padding: '14px 16px 12px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...(_isToday ? {
          background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))',
        } : {}),
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              color: _isToday ? 'var(--accent)' : 'var(--text-muted)',
              letterSpacing: '0.08em',
            }}>
              {format(date, 'eeee')}
            </span>
            {_isToday && (
              <span style={{
                fontSize: 9,
                fontWeight: 700,
                background: 'var(--accent)',
                color: '#000',
                borderRadius: 4,
                padding: '2px 6px',
                letterSpacing: '0.1em',
              }}>
                TODAY
              </span>
            )}
          </div>
          <div style={{
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1,
            marginTop: 4,
          }}>
            {format(date, 'dd MMM')}
          </div>
        </div>
        <div style={{ position: 'relative', width: 40, height: 40 }}>
          <ProgressRing pct={pct} />
          <span style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontWeight: 700,
            color: pct > 0 ? 'var(--accent)' : 'var(--text-muted)',
          }}>
            {pct}%
          </span>
        </div>
      </div>

      {/* Task list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingTop: 4,
        paddingBottom: 4,
      }}>
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            handleConfetti={handleConfetti}
          />
        ))}
        {tasks.length < 12 && (
          <div style={{
            padding: '8px 16px',
            borderLeft: '2px dashed rgba(255,255,255,0.08)',
            marginLeft: 16,
            transition: 'all 0.15s ease',
          }}>
            <input
              placeholder="+ Add task..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-muted)',
                fontSize: 13,
              }}
              onFocus={e => {
                e.currentTarget.style.color = 'var(--text-primary)';
                const parent = e.currentTarget.parentElement;
                if (parent) parent.style.borderColor = 'var(--accent-dim)';
              }}
              onBlur={e => {
                if (e.currentTarget.value.trim()) {
                  onAddTask(e.currentTarget.value.trim());
                  e.currentTarget.value = '';
                }
                e.currentTarget.style.color = 'var(--text-muted)';
                const parent = e.currentTarget.parentElement;
                if (parent) parent.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  onAddTask(e.currentTarget.value.trim());
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Column footer */}
      <div style={{
        marginTop: 'auto',
        padding: '10px 16px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.05em',
      }}>
        <span style={{ color: 'var(--accent)' }}>✓ {dCompleted} done</span>
        <span style={{ color: (dTotal - dCompleted) > 0 ? 'var(--amber)' : 'var(--text-muted)' }}>
          ○ {dTotal - dCompleted} left
        </span>
      </div>
    </div>
  );
}