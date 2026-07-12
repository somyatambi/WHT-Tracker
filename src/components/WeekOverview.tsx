import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { StatCard } from './StatsCard';
import type { ChartDataPoint, DonutDataPoint } from '../types';

interface WeekOverviewProps {
  completedTasks: number;
  pendingTasks: number;
  maxStreak: number;
  weeklyProgress: number;
  chartData: ChartDataPoint[];
  donutData: DonutDataPoint[];
}

export function WeekOverview({ completedTasks, pendingTasks, maxStreak, weeklyProgress, chartData, donutData }: WeekOverviewProps) {
  const tooltipStyle = {
    background: 'white',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '10px 14px',
    boxShadow: 'var(--shadow-md)',
  };

  return (
    <section style={{ display: 'grid', gridTemplateColumns: '280px 1fr 300px', gap: 20, alignItems: 'stretch' }}>
      {/* Stats 2x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <StatCard title="Tasks Completed" value={completedTasks} index={0} />
        <StatCard title="Tasks Pending" value={pendingTasks} index={1} />
        <StatCard title="Longest Streak" value={maxStreak} index={2} />
        <StatCard title="Overall Progress" value={weeklyProgress + '%'} index={3} progressValue={weeklyProgress} />
      </div>

      {/* Bar Chart */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '20px 24px', boxShadow: 'var(--shadow-sm)',
      }}>
        <span className="label-muted">Daily Completion</span>
        <div style={{ height: 170, width: '100%', marginTop: 12 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={tooltipStyle} itemStyle={{ color: 'var(--text-primary)', fontSize: 13 }} labelStyle={{ color: 'var(--text-secondary)', fontWeight: 600 }} />
              <Bar dataKey="done" stackId="a" fill="var(--brand)" radius={[0, 0, 4, 4]} isAnimationActive={true} />
              <Bar dataKey="remaining" stackId="a" fill="var(--border)" radius={[4, 4, 0, 0]} isAnimationActive={true} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donut Chart */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '20px 24px', boxShadow: 'var(--shadow-sm)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative',
      }}>
        <span className="label-muted" style={{ position: 'absolute', top: 20, left: 24 }}>Weekly Progress</span>
        <div style={{ height: 160, width: '100%', position: 'relative', marginTop: 8 }}>
          <div style={{ animation: 'donut-pulse 2s ease infinite' }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={donutData} innerRadius={52} outerRadius={68} paddingAngle={2} dataKey="value" stroke="none" isAnimationActive={true}>
                  <Cell fill="var(--brand)" />
                  <Cell fill="var(--border)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{weeklyProgress}%</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>this week</span>
          </div>
        </div>
      </div>
    </section>
  );
}