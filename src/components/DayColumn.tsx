import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';
import type { Task } from '../types';
import { TaskItem } from './TaskItem';

interface DayColumnProps {
  date: Date;
  isToday: boolean;
  tasks: Task[];
  weekId: string;
  onAddTask: (text: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  animationDelay?: number;
  addToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const DAY_COLORS: Record<string, string> = {
  Sun: '#f43f5e',
  Mon: '#8b5cf6',
  Tue: '#3b82f6',
  Wed: '#10b981',
  Thu: '#f59e0b',
  Fri: '#ec4899',
  Sat: '#06b6d4',
};

export function DayColumn({
  date, isToday, tasks, weekId: _weekId,
  onAddTask, onUpdateTask, onDeleteTask,
  animationDelay = 0, addToast,
}: DayColumnProps) {
  const dCompleted = tasks.filter(t => t.completed).length;
  const dTotal = tasks.length;
  const pct = dTotal === 0 ? 0 : Math.round((dCompleted / dTotal) * 100);
  const isComplete = pct === 100 && dTotal > 0;

  const dayShort = format(date, 'eee');
  const dayColor = DAY_COLORS[dayShort] || 'var(--brand)';

  // Fire confetti + toast only once per completion cycle
  const prevCompleteRef = useRef(false);
  useEffect(() => {
    if (isComplete && !prevCompleteRef.current) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b'],
      });
      addToast(`🎉 ${format(date, 'EEEE')} complete!`, 'success');
    }
    prevCompleteRef.current = isComplete;
  }, [isComplete, date, addToast]);

  // Inline add state
  const [adding, setAdding] = useState(false);
  const [addText, setAddText] = useState('');
  const addInputRef = useRef<HTMLInputElement>(null);

  const commitAdd = () => {
    if (addText.trim()) {
      onAddTask(addText.trim());
      setAddText('');
    }
    setAdding(false);
  };

  useEffect(() => {
    if (adding && addInputRef.current) addInputRef.current.focus();
  }, [adding]);

  return (
    <div
      className={`day-column-enter ${isComplete ? 'column-complete' : ''}`}
      style={{
        minWidth: 220,
        maxWidth: 220,
        background: isToday
          ? 'var(--bg-card)'
          : 'var(--bg-card)',
        border: isToday ? '2px solid var(--brand)' : '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: isToday
          ? '0 0 0 4px var(--brand-glow), var(--shadow-md)'
          : 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        scrollSnapAlign: 'start',
        transition: 'all 0.3s ease',
        animationDelay: `${animationDelay}ms`,
        flexShrink: 0,
      }}
    >
      {/* ── Top color bar ── */}
      <div style={{
        height: 4,
        background: isToday
          ? `linear-gradient(90deg, var(--brand), var(--brand-mid))`
          : dayColor,
        width: '100%',
      }} />

      {/* ── Header ── */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
        {/* Day name + badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              {format(date, 'eeee')}
            </span>
            {isToday && (
              <span style={{
                fontSize: 9, fontWeight: 800,
                background: 'var(--brand)', color: 'white',
                borderRadius: 6, padding: '3px 7px', letterSpacing: '0.1em',
              }}>
                TODAY
              </span>
            )}
            {dTotal > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 700,
                background: 'var(--brand-light)', color: 'var(--brand)',
                borderRadius: 99, padding: '2px 8px',
              }}>
                {dTotal}
              </span>
            )}
          </div>
          {/* Add button */}
          <button
            onClick={() => setAdding(true)}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--bg-input)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: 'var(--text-muted)',
              transition: 'all 0.2s ease',
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--brand)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--bg-input)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            +
          </button>
        </div>

        {/* Date + progress */}
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 8 }}>
          {format(date, 'dd MMM')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
            PROGRESS
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: dayColor }}>
            {pct}%
          </span>
        </div>
        <div style={{ height: 4, borderRadius: 99, background: 'var(--bg-input)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            background: isToday ? 'var(--brand)' : dayColor,
            width: `${pct}%`,
            transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }} />
        </div>
      </div>

      {/* ── Task list ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0 4px' }}>
        {tasks.length === 0 && !adding ? (
          /* Empty state */
          <div style={{
            border: '2px dashed var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px 16px',
            textAlign: 'center',
            margin: 12,
          }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>📝</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>No tasks yet</div>
            <button
              onClick={() => setAdding(true)}
              style={{
                fontSize: 13, color: 'var(--brand)',
                background: 'none', border: 'none',
                cursor: 'pointer', fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              + Add your first task
            </button>
          </div>
        ) : (
          tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              dayColor={dayColor}
              dayName={format(date, 'eee')}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
            />
          ))
        )}

        {/* Inline add input */}
        {adding ? (
          <div style={{
            margin: '0 12px 8px',
            border: '1.5px solid var(--brand)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--brand-light)',
          }}>
            <span style={{ color: 'var(--brand)', fontSize: 14 }}>+</span>
            <input
              ref={addInputRef}
              value={addText}
              onChange={e => setAddText(e.target.value)}
              placeholder="Task name..."
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: 13, color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif",
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') commitAdd();
                if (e.key === 'Escape') { setAdding(false); setAddText(''); }
              }}
              onBlur={commitAdd}
            />
          </div>
        ) : (
          tasks.length > 0 && (
            <div
              onClick={() => setAdding(true)}
              style={{
                margin: '0 12px 8px',
                border: '1.5px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 8,
                cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--brand)';
                e.currentTarget.style.background = 'var(--brand-light)';
                e.currentTarget.style.color = 'var(--brand)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <span style={{ fontSize: 14 }}>+</span>
              <span>Add task...</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}