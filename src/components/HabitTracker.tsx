import { useState } from 'react';
import { Edit2, Check, Plus } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { formatDateId } from '../utils/dateUtils';
import type { Habit, HabitLog } from '../types';

interface HabitTrackerProps {
  showEditHabits: boolean;
  setShowEditHabits: (s: boolean) => void;
  habits: Habit[];
  weekDates: Date[];
  logs: HabitLog[];
  toggleHabit: (habitId: string, dateStr: string) => void;
}

export function HabitTracker({
  setShowEditHabits, habits, weekDates, logs, toggleHabit,
}: HabitTrackerProps) {
  const [hoveredHabit, setHoveredHabit] = useState<string | null>(null);

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
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span className="label-muted">🎯 Habit Tracker</span>
        <button
          onClick={() => setShowEditHabits(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 13, color: 'var(--brand)', fontWeight: 600,
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            borderRadius: 6, padding: '4px 10px',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-light)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <Edit2 style={{ width: 13, height: 13 }} /> Edit
        </button>
      </div>

      {/* ── Column Headers ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '180px repeat(7, 1fr) 120px',
        padding: '10px 24px',
        borderBottom: '1px solid var(--border)',
        gap: 8,
        alignItems: 'center',
      }}>
        <div /> {/* Habit name col */}
        {weekDates.map(d => {
          const isTodayCol = isToday(d);
          return (
            <div key={formatDateId(d)} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: isTodayCol ? 'var(--brand)' : 'var(--text-muted)',
              }}>
                {format(d, 'eee')}
              </span>
              {isTodayCol && (
                <div style={{
                  width: 4, height: 4,
                  borderRadius: 99,
                  background: 'var(--brand)',
                }} />
              )}
            </div>
          );
        })}
        <div style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.06em', color: 'var(--text-muted)',
          textAlign: 'right',
        }}>
          PROG
        </div>
      </div>

      {/* ── Habit Rows ── */}
      {habits.map(habit => {
        const daysCompleted = weekDates.filter(d =>
          logs.some(l => l.habitId === habit.id && l.date === formatDateId(d) && l.completed)
        ).length;
        const pct = Math.round((daysCompleted / 7) * 100);
        const pctColor =
          pct > 66 ? 'var(--success)' :
          pct >= 33 ? 'var(--warning)' :
          'var(--danger)';

        return (
          <div
            key={habit.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '180px repeat(7, 1fr) 120px',
              padding: '14px 24px',
              borderBottom: '1px solid var(--border)',
              gap: 8,
              alignItems: 'center',
              transition: 'background 0.15s ease',
              cursor: 'default',
              background: hoveredHabit === habit.id ? 'var(--bg-page)' : 'transparent',
            }}
            onMouseEnter={() => setHoveredHabit(habit.id)}
            onMouseLeave={() => setHoveredHabit(null)}
          >
            {/* Habit name — full, no truncation */}
            <span style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--text-primary)',
            }}>
              {habit.name}
            </span>

            {/* Day checkboxes */}
            {weekDates.map(d => {
              const dStr = formatDateId(d);
              const isDone = logs.some(l => l.habitId === habit.id && l.date === dStr && l.completed);
              return (
                <div
                  key={dStr}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <div
                    className={`custom-checkbox ${isDone ? 'checked' : ''}`}
                    onClick={() => toggleHabit(habit.id, dStr)}
                  >
                    {isDone && (
                      <Check style={{ width: 13, height: 13, color: 'white', strokeWidth: 3 }} />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Progress column */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                flex: 1, height: 6, borderRadius: 99,
                background: 'var(--bg-input)', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  background: 'linear-gradient(90deg, var(--brand), #818cf8)',
                  width: `${pct}%`,
                  transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
              <span style={{
                fontSize: 12, fontWeight: 700,
                minWidth: 32, textAlign: 'right',
                color: pctColor,
              }}>
                {pct}%
              </span>
            </div>
          </div>
        );
      })}

      {/* ── Empty state ── */}
      {habits.length === 0 && (
        <div style={{
          padding: '32px 24px', textAlign: 'center',
          color: 'var(--text-muted)', fontSize: 14,
        }}>
          No habits added yet.
        </div>
      )}

      {/* ── Add Habit row ── */}
      <div style={{ padding: '14px 24px' }}>
        <button
          onClick={() => setShowEditHabits(true)}
          style={{
            border: '1.5px dashed var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 16px',
            fontSize: 13,
            color: 'var(--text-muted)',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            transition: 'all 0.2s ease',
            fontFamily: "'Inter', sans-serif",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--brand)';
            e.currentTarget.style.color = 'var(--brand)';
            e.currentTarget.style.background = 'var(--brand-light)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Plus style={{ width: 14, height: 14 }} /> Add habit
        </button>
      </div>
    </div>
  );
}