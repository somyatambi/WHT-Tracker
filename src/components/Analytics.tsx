import type { HabitState } from '../hooks/useHabits';
import type { TaskState } from '../hooks/useTasks';
import { getBestStreak, getStreak, formatDateId } from '../utils/dateUtils';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { useMemo } from 'react';

interface AnalyticsProps {
  habitState: HabitState;
  taskState: TaskState;
}

export function Analytics({ habitState, taskState }: AnalyticsProps) {
  const { habits, logs } = habitState;
  const { tasks } = taskState;

  const streakData = habits.map(h => ({
    name: h.name,
    current: getStreak(h.id, logs),
    best: getBestStreak(h.id, logs)
  })).sort((a, b) => b.best - a.best);

  const trendData = useMemo(() => {
    const today = new Date();
    const days = eachDayOfInterval({ start: subDays(today, 27), end: today });
    return days.map(d => {
      const dStr = formatDateId(d);
      const dTasks = tasks.filter(t => t.dayDate === dStr);
      const done = dTasks.filter(t => t.completed).length;
      const pct = dTasks.length ? Math.round((done / dTasks.length) * 100) : 0;
      return { date: format(d, 'MMM d'), pct };
    });
  }, [tasks]);

  const habitLeaderboard = habits.map(h => {
    const total = logs.filter(l => l.habitId === h.id && l.completed).length;
    return { name: h.name, total };
  }).sort((a, b) => b.total - a.total);

  const tooltipStyle = {
    background: 'white',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '10px 14px',
    boxShadow: 'var(--shadow-md)',
  };

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>Analytics</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Task Completion Trend */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px 24px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <span className="label-muted" style={{ display: 'block', marginBottom: 16 }}>
            Task Completion Trend (28 days)
          </span>
          <div style={{ height: 256, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} minTickGap={30} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} domain={[0, 100]} tickFormatter={val => `${val}%`} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={tooltipStyle} itemStyle={{ color: 'var(--text-primary)' }} labelStyle={{ color: 'var(--text-secondary)' }} />
                <Line type="monotone" dataKey="pct" stroke="var(--brand)" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: 'var(--brand)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Habits Leaderboard */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px 24px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <span className="label-muted" style={{ display: 'block', marginBottom: 16 }}>
            Habits Leaderboard (All Time)
          </span>
          <div style={{ height: 256, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habitLeaderboard} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={tooltipStyle} itemStyle={{ color: 'var(--text-primary)' }} labelStyle={{ color: 'var(--text-secondary)' }} />
                <Bar dataKey="total" fill="var(--brand)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Streaks table */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px 24px',
          boxShadow: 'var(--shadow-sm)',
          gridColumn: 'span 2',
        }}>
          <span className="label-muted" style={{ display: 'block', marginBottom: 16 }}>Streaks</span>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Habit</th>
                  <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Current Streak</th>
                  <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Best Streak</th>
                </tr>
              </thead>
              <tbody>
                {streakData.map(s => (
                  <tr key={s.name} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: 12, fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{s.name}</td>
                    <td style={{ padding: 12, fontSize: 14, fontWeight: 700, color: 'var(--brand)' }}>{s.current} days 🔥</td>
                    <td style={{ padding: 12, fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)' }}>{s.best} days</td>
                  </tr>
                ))}
                {streakData.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                      No habits tracked yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}