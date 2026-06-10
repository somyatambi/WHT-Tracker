import { Zap, Sun, Moon, Settings, BarChart2 } from 'lucide-react';
import type { AppSettings } from '../types';

interface HeaderProps {
  settings: AppSettings;
  handleToggleTheme: () => void;
  setShowSettings: (s: boolean) => void;
  setShowAnalytics: (s: boolean) => void;
  showAnalytics: boolean;
}

export function Header({ settings, handleToggleTheme, setShowSettings, setShowAnalytics, showAnalytics }: HeaderProps) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(15,17,23,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}
    >
      {/* Left — Logo */}
      <div
        onClick={() => setShowAnalytics(false)}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <div style={{
          width: 36, height: 36,
          borderRadius: 10,
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Zap style={{ width: 20, height: 20, color: '#000', fill: '#000' }} />
        </div>
        <span style={{
          fontWeight: 700,
          fontSize: 20,
          color: '#fff',
          textShadow: '0 0 20px rgba(34,197,94,0.3)',
        }}>
          Momentum
        </span>
      </div>

      {/* Right — Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button onClick={() => setShowAnalytics(!showAnalytics)} className="ghost-btn" title="Analytics">
          <BarChart2 style={{ width: 18, height: 18 }} />
        </button>
        <button onClick={handleToggleTheme} className="ghost-btn" title="Toggle theme">
          {settings.darkMode ? <Sun style={{ width: 18, height: 18 }} /> : <Moon style={{ width: 18, height: 18 }} />}
        </button>
        <button onClick={() => setShowSettings(true)} className="ghost-btn" title="Settings">
          <Settings style={{ width: 18, height: 18 }} />
        </button>
      </div>
    </header>
  );
}