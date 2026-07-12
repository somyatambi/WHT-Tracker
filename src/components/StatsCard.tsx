import { CheckCircle, Clock, Flame, TrendingUp } from 'lucide-react';
import React from 'react';

interface StatCardConfig {
  icon: React.ReactNode;
  iconBgLight: string;
  iconColorLight: string;
  iconBgDark: string;
  iconColorDark: string;
}

const CARD_CONFIG: Record<string, StatCardConfig> = {
  'Tasks Done': {
    icon: <CheckCircle style={{ width: 22, height: 22 }} />,
    iconBgLight: '#d1fae5', iconColorLight: '#10b981',
    iconBgDark: 'rgba(52,211,153,0.12)', iconColorDark: '#34d399',
  },
  'Tasks Pending': {
    icon: <Clock style={{ width: 22, height: 22 }} />,
    iconBgLight: '#fef3c7', iconColorLight: '#f59e0b',
    iconBgDark: 'rgba(251,191,36,0.12)', iconColorDark: '#fbbf24',
  },
  'Longest Streak': {
    icon: <Flame style={{ width: 22, height: 22 }} />,
    iconBgLight: '#ede9fe', iconColorLight: '#8b5cf6',
    iconBgDark: 'rgba(139,92,246,0.12)', iconColorDark: '#a78bfa',
  },
  'Overall Progress': {
    icon: <TrendingUp style={{ width: 22, height: 22 }} />,
    iconBgLight: '#e0e7ff', iconColorLight: '#6366f1',
    iconBgDark: 'rgba(99,102,241,0.12)', iconColorDark: '#818cf8',
  },
  // Legacy compat
  'Tasks Completed': {
    icon: <CheckCircle style={{ width: 22, height: 22 }} />,
    iconBgLight: '#d1fae5', iconColorLight: '#10b981',
    iconBgDark: 'rgba(52,211,153,0.12)', iconColorDark: '#34d399',
  },
};

interface StatCardProps {
  title: string;
  value: string | number;
  index?: number;
  progressValue?: number;
}

export function StatCard({ title, value, index = 0, progressValue }: StatCardProps) {
  const config = CARD_CONFIG[title] || CARD_CONFIG['Tasks Done'];
  const isProgress = title === 'Overall Progress';
  const pct = isProgress ? (progressValue ?? parseInt(String(value))) : 0;
  const isStreak = title === 'Longest Streak';

  // Read dark mode from html class
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const iconBg = isDark ? config.iconBgDark : config.iconBgLight;
  const iconColor = isDark ? config.iconColorDark : config.iconColorLight;

  return (
    <div
      className="stat-card-enter"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transition: 'all 0.2s ease',
        animationDelay: `${index * 80}ms`,
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {/* Icon square */}
      <div style={{
        width: 48, height: 48,
        borderRadius: 12,
        background: iconBg,
        color: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'background 0.3s ease, color 0.3s ease',
      }}>
        {config.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4,
        }}>
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 28, fontWeight: 800,
            color: 'var(--text-primary)', lineHeight: 1,
          }}>
            {value}
          </span>
          {isStreak && <span style={{ fontSize: 20 }}>🔥</span>}
        </div>
        {isProgress && (
          <div style={{
            height: 4, borderRadius: 99,
            background: 'var(--bg-input)', overflow: 'hidden', marginTop: 8,
          }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: 'var(--brand)',
              width: `${pct}%`,
              transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }} />
          </div>
        )}
      </div>
    </div>
  );
}