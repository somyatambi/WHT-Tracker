import { useHabits } from '../hooks/useHabits';
import { useTasks } from '../hooks/useTasks';
import { getBestStreak, getStreak, formatDateId } from '../utils/dateUtils';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { useMemo } from 'react';

export function Analytics() {
  const { habits, logs } = useHabits();
  const { tasks } = useTasks();

  // Streak data
  const streakData = habits.map((h: any) => ({
    name: h.name,
    current: getStreak(h.id, logs),
    best: getBestStreak(h.id, logs)
  })).sort((a: any, b: any) => b.best - a.best);

  // Completion trend (last 28 days)
  const trendData = useMemo(() => {
    const today = new Date();
    const days = eachDayOfInterval({ start: subDays(today, 27), end: today });
    return days.map(d => {
      const dStr = formatDateId(d);
      const dTasks = tasks.filter((t: any) => t.dayDate === dStr);
      const done = dTasks.filter((t: any) => t.completed).length;
      const pct = dTasks.length ? Math.round((done / dTasks.length) * 100) : 0;
      return { date: format(d, 'MMM d'), pct };
    });
  }, [tasks]);

  // Habit completion breakdown
  const habitLeaderboard = habits.map((h: any) => {
    const habitLogs = logs.filter((l: any) => l.habitId === h.id && l.completed).length;
    return { name: h.name, total: habitLogs };
  }).sort((a: any, b: any) => b.total - a.total);

  const tooltipStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-hover)',
    borderRadius: 'var(--radius-md)',
    padding: '10px 14px',
    boxShadow: 'var(--shadow-md)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Analytics</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Trend chart */}
        <div className="card-surface" style={{ padding: '20px 24px' }}>
          <span className="label-muted" style={{ display: 'block', marginBottom: 16 }}>
            Task Completion Trend
          </span>
          <div style={{ height: 256, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} minTickGap={30} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} domain={[0, 100]} tickFormatter={val => `${val}%`} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={tooltipStyle} itemStyle={{ color: 'var(--text-primary)' }} labelStyle={{ color: 'var(--text-secondary)' }} />
                <Line type="monotone" dataKey="pct" stroke="#22c55e" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#22c55e' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="card-surface" style={{ padding: '20px 24px' }}>
          <span className="label-muted" style={{ display: 'block', marginBottom: 16 }}>
            Habits Leaderboard (All Time)
          </span>
          <div style={{ height: 256, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habitLeaderboard} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={tooltipStyle} itemStyle={{ color: 'var(--text-primary)' }} labelStyle={{ color: 'var(--text-secondary)' }} />
                <Bar dataKey="total" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Streaks table */}
        <div className="card-surface" style={{ padding: '20px 24px', gridColumn: 'span 2' }}>
          <span className="label-muted" style={{ display: 'block', marginBottom: 16 }}>
            Streaks
          </span>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: 12, textAlign: 'left', fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>Habit</th>
                  <th style={{ padding: 12, textAlign: 'left', fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>Current Streak</th>
                  <th style={{ padding: 12, textAlign: 'left', fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>Best Streak</th>
                </tr>
              </thead>
              <tbody>
                {streakData.map((s: any) => (
                  <tr key={s.name} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 12, fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{s.name}</td>
                    <td style={{ padding: 12, fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{s.current} days</td>
                    <td style={{ padding: 12, fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)' }}>{s.best} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}