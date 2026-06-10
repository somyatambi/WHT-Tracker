import { Edit2, Check } from 'lucide-react';
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

export function HabitTracker({ showEditHabits, setShowEditHabits, habits, weekDates, logs, toggleHabit }: HabitTrackerProps) {
  return (
    <div className="card-surface" style={{ overflow: 'hidden' }}>
      {/* Section header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: '1px solid var(--border)',
      }}>
        <span className="label-muted">Habit Tracker</span>
        <button
          onClick={() => setShowEditHabits(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 14px',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--accent)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <Edit2 style={{ width: 14, height: 14 }} /> Edit Habits
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{
                padding: '12px 24px',
                textAlign: 'left',
                width: 200,
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-secondary)',
              }}>
                Habit
              </th>
              {weekDates.map((d: Date) => {
                const isTodayCol = isToday(d);
                return (
                  <th key={formatDateId(d)} style={{
                    padding: '10px 8px',
                    textAlign: 'center',
                    color: isTodayCol ? 'var(--accent)' : 'var(--text-muted)',
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {format(d, 'eee')}
                      </span>
                      <span style={{ fontSize: 18, fontWeight: 600, lineHeight: 1 }}>
                        {format(d, 'd')}
                      </span>
                      {isTodayCol && (
                        <div style={{
                          width: 5, height: 5,
                          borderRadius: '50%',
                          background: 'var(--accent)',
                          marginTop: 2,
                        }} />
                      )}
                    </div>
                  </th>
                );
              })}
              <th style={{
                padding: '12px 24px',
                textAlign: 'center',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
              }}>
                Progress
              </th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => {
              const daysCompleted = weekDates.filter((d: Date) =>
                logs.some((l) => l.habitId === habit.id && l.date === formatDateId(d) && l.completed)
              ).length;
              const pct = Math.round((daysCompleted / 7) * 100);

              return (
                <tr
                  key={habit.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.1s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{
                    padding: '14px 24px',
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                  }}>
                    {habit.name}
                  </td>
                  {weekDates.map((d: Date) => {
                    const dStr = formatDateId(d);
                    const isDone = logs.some((l) => l.habitId === habit.id && l.date === dStr && l.completed);
                    return (
                      <td key={dStr} style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <div
                          className={`custom-checkbox ${isDone ? 'checked' : ''}`}
                          style={{ margin: '0 auto' }}
                          onClick={() => toggleHabit(habit.id, dStr)}
                        >
                          {isDone && (
                            <Check style={{ width: 14, height: 14, color: '#000', strokeWidth: 3 }} />
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td style={{ padding: '14px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        flex: 1,
                        height: 6,
                        borderRadius: 99,
                        background: 'var(--bg-hover)',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          borderRadius: 99,
                          background: 'linear-gradient(90deg, #22c55e, #4ade80)',
                          width: `${pct}%`,
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                      <span style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--accent)',
                        minWidth: 36,
                        textAlign: 'right',
                      }}>
                        {pct}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
            {habits.length === 0 && (
              <tr>
                <td colSpan={9} style={{
                  padding: 32,
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: 14,
                }}>
                  No habits added. Click "Edit Habits" to start tracking.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}