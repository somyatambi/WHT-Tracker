import { useState, useCallback, useEffect, useRef } from 'react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

export function Toast({ toasts, removeToast }: ToastProps) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 300,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      pointerEvents: 'none',
    }}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => onRemove(toast.id), 3200);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [toast.id, onRemove]);

  const borderColor =
    toast.type === 'success' ? 'var(--success)' :
    toast.type === 'warning' ? 'var(--warning)' :
    toast.type === 'error'   ? 'var(--danger)'  :
    'var(--brand)';

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border)',
        borderLeft: `4px solid ${borderColor}`,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        animation: 'slideInRight 0.3s ease',
        fontSize: 14,
        fontWeight: 500,
        color: 'var(--text-primary)',
        minWidth: 240,
        pointerEvents: 'all',
        cursor: 'pointer',
      }}
      onClick={() => onRemove(toast.id)}
    >
      <span style={{ flex: 1 }}>{toast.message}</span>
      <span style={{ color: 'var(--text-muted)', fontSize: 18, lineHeight: 1 }}>×</span>
    </div>
  );
}

let toastIdCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = String(++toastIdCounter);
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
