import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { StatCard } from './StatsCard';
import type { AppSettings, ChartDataPoint, DonutDataPoint } from '../types';

interface WeekOverviewProps {
  completedTasks: number;
  pendingTasks: number;
  maxStreak: number;
  weeklyProgress: number;
  chartData: ChartDataPoint[];
  donutData: DonutDataPoint[];
  settings: AppSettings;
}

export function WeekOverview({ completedTasks, pendingTasks, maxStreak, weeklyProgress, chartData, donutData }: WeekOverviewProps) {
  return (
    <section style={{
      display: 'grid',
      gridTemplateColumns: '280px 1fr 300px',
      gap: 20,
      alignItems: 'stretch',
    }}>
      {/* Stats 2x2 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <StatCard title="Tasks Completed" value={completedTasks} index={0} />
        <StatCard title="Tasks Pending" value={pendingTasks} index={1} />
        <StatCard title="Longest Streak" value={maxStreak} index={2} />
        <StatCard title="Overall Progress" value={weeklyProgress + '%'} index={3} />
      </div>

      {/* Bar Chart */}
      <div className="card-surface" style={{ padding: '20px 24px' }}>
        <span className="label-muted">Daily Completion</span>
        <div style={{ height: 170, width: '100%', marginTop: 12 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-hover)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  boxShadow: 'var(--shadow-md)',
                }}
                itemStyle={{ color: 'var(--text-primary)', fontSize: 13 }}
                labelStyle={{ color: 'var(--text-secondary)', fontWeight: 600 }}
              />
              <Bar
                dataKey="done"
                stackId="a"
                fill="#22c55e"
                radius={[0, 0, 4, 4]}
                isAnimationActive={true}
                cursor="pointer"
              />
              <Bar
                dataKey="remaining"
                stackId="a"
                fill="rgba(255,255,255,0.06)"
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                cursor="pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="card-surface" style={{
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <span className="label-muted" style={{ position: 'absolute', top: 20, left: 24 }}>
          Weekly Progress
        </span>
        <div style={{ height: 160, width: '100%', position: 'relative', marginTop: 8 }}>
          <div style={{ animation: 'donut-pulse 2s ease infinite' }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={donutData}
                  innerRadius={52}
                  outerRadius={68}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={true}
                  style={{ filter: 'drop-shadow(0 0 8px rgba(34,197,94,0.4))' }}
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="rgba(255,255,255,0.06)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
              {weeklyProgress}%
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              this week
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}