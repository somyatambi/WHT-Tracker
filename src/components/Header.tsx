import { useState, useEffect } from 'react';
import { Settings, Moon, Sun, BarChart2, ChevronLeft, ChevronRight, Calendar, Grid3x3 } from 'lucide-react';
import type { AppSettings } from '../types';
import type { useWeek } from '../hooks/useWeek';
import { getISOWeek } from 'date-fns';

type WeekNav = ReturnType<typeof useWeek>;

interface HeaderProps {
  settings: AppSettings;
  handleToggleTheme: () => void;
  setShowSettings: (s: boolean) => void;
  setShowAnalytics: (s: boolean) => void;
  showAnalytics: boolean;
  weekNav: WeekNav;
}

export function Header({
  settings,
  handleToggleTheme,
  setShowSettings,
  setShowAnalytics,
  showAnalytics,
  weekNav,
}: HeaderProps) {
  const { currentDate, prevWeek, nextWeek, jumpToToday } = weekNav;
  const weekNum = getISOWeek(currentDate);
  const isDark = settings.darkMode;

  // Spin animation state for theme icon
  const [spinning, setSpinning] = useState(false);

  const handleThemeClick = () => {
    setSpinning(true);
    handleToggleTheme();
    setTimeout(() => setSpinning(false), 400);
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: isDark
          ? 'rgba(10,12,18,0.85)'
          : 'rgba(255,255,255,0.85)',
        backdropFilter: isDark ? 'blur(20px) saturate(150%)' : 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: isDark ? 'blur(20px) saturate(150%)' : 'blur(20px) saturate(180%)',
        borderBottom: isDark
          ? '1px solid rgba(255,255,255,0.06)'
          : '1px solid var(--border)',
        height: 68,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        gap: 16,
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}
    >
      {/* ── Left — Logo ── */}
      <div
        onClick={() => setShowAnalytics(false)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flexShrink: 0 }}
      >
        <div style={{
          width: 40, height: 40,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-brand)',
          flexShrink: 0,
        }}>
          <Grid3x3 style={{ width: 20, height: 20, color: 'white' }} />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            Weekly Momentum
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.03em', marginTop: 1 }}>
            Track Habits • Build Consistency • Achieve Goals
          </div>
        </div>
      </div>

      {/* ── Right — Controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Week pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          border: isDark ? '1.5px solid rgba(255,255,255,0.1)' : '1.5px solid var(--border)',
          borderRadius: 20,
          padding: '6px 16px',
          fontSize: 13, fontWeight: 600,
          color: 'var(--text-secondary)',
          background: isDark ? 'rgba(255,255,255,0.03)' : 'transparent',
        }}>
          <Calendar style={{ width: 13, height: 13 }} />
          Week {weekNum}
        </div>

        {/* Prev week */}
        <button
          onClick={prevWeek}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--bg-input)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--brand-light)';
            e.currentTarget.style.color = 'var(--brand)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--bg-input)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
          title="Previous week (Ctrl+←)"
        >
          <ChevronLeft style={{ width: 16, height: 16 }} />
        </button>

        {/* Next week */}
        <button
          onClick={nextWeek}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--bg-input)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--brand-light)';
            e.currentTarget.style.color = 'var(--brand)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--bg-input)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
          title="Next week (Ctrl+→)"
        >
          <ChevronRight style={{ width: 16, height: 16 }} />
        </button>

        {/* Today button */}
        <button
          onClick={jumpToToday}
          style={{
            background: 'var(--brand)',
            color: 'white',
            border: 'none',
            borderRadius: 20,
            padding: '8px 20px',
            fontSize: 13, fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: "'Inter', sans-serif",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = 'var(--shadow-brand)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          title="Jump to today (Ctrl+T)"
        >
          Today
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />

        {/* Analytics toggle */}
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="ghost-btn"
          title="Analytics"
          style={showAnalytics ? { background: 'var(--brand-light)', color: 'var(--brand)' } : {}}
        >
          <BarChart2 style={{ width: 18, height: 18 }} />
        </button>

        {/* Theme toggle — with spin animation */}
        <button
          onClick={handleThemeClick}
          style={{
            width: 36, height: 36,
            borderRadius: '50%',
            border: isDark
              ? '1px solid rgba(99,102,241,0.3)'
              : '1px solid var(--border)',
            background: isDark
              ? 'rgba(99,102,241,0.15)'
              : 'var(--bg-input)',
            color: isDark ? '#818cf8' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span style={{
            display: 'flex',
            animation: spinning ? 'spin 0.4s ease' : 'none',
          }}>
            {isDark
              ? <Sun style={{ width: 16, height: 16 }} />
              : <Moon style={{ width: 16, height: 16 }} />
            }
          </span>
        </button>

        {/* Settings */}
        <button onClick={() => setShowSettings(true)} className="ghost-btn" title="Settings">
          <Settings style={{ width: 18, height: 18 }} />
        </button>
      </div>
    </header>
  );
}