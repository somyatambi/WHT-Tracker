import { CheckCircle, Clock, Flame, TrendingUp } from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  'Tasks Completed': <CheckCircle style={{ width: 18, height: 18, color: 'var(--accent)', opacity: 0.7 }} />,
  'Tasks Pending': <Clock style={{ width: 18, height: 18, color: 'var(--accent)', opacity: 0.7 }} />,
  'Longest Streak': <Flame style={{ width: 18, height: 18, color: 'var(--accent)', opacity: 0.7 }} />,
  'Overall Progress': <TrendingUp style={{ width: 18, height: 18, color: 'var(--accent)', opacity: 0.7 }} />,
};

interface StatCardProps {
  title: string;
  value: string | number;
  index?: number;
}

export function StatCard({ title, value, index = 0 }: StatCardProps) {
  const icon = ICON_MAP[title];
  const isProgress = title === 'Overall Progress';
  const isStreak = title === 'Longest Streak';
  const progressNum = isProgress ? parseInt(String(value)) : 0;

  return (
    <div
      className="card-surface stat-card-enter"
      style={{
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        animationDelay: `${index * 100}ms`,
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="label-muted">{title}</span>
        {icon}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
        <span style={{
          fontSize: 32,
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.1,
        }}>
          {value}
        </span>
        {isStreak && <span style={{ fontSize: 24 }}>🔥</span>}
      </div>
      {isProgress && (
        <div style={{
          marginTop: 10,
          height: 3,
          borderRadius: 99,
          background: 'var(--bg-hover)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            borderRadius: 99,
            background: 'var(--accent)',
            width: `${progressNum}%`,
            transition: 'width 0.4s ease',
          }} />
        </div>
      )}
    </div>
  );
}