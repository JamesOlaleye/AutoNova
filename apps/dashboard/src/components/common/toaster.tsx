'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useUiStore, type Toast } from '@/store/ui.store';
import { cn } from '@/lib/utils';

const toastConfig = {
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-200 bg-white text-emerald-900',
    iconClass: 'text-emerald-500',
    progressClass: 'bg-emerald-400',
  },
  error: {
    icon: XCircle,
    className: 'border-red-200 bg-white text-red-900',
    iconClass: 'text-red-500',
    progressClass: 'bg-red-400',
  },
  info: {
    icon: Info,
    className: 'border-blue-200 bg-white text-blue-900',
    iconClass: 'text-blue-500',
    progressClass: 'bg-blue-400',
  },
};

const DURATION = 4000;

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useUiStore((s) => s.removeToast);
  const [exiting, setExiting] = useState(false);
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    const exit = setTimeout(() => setExiting(true), DURATION - 300);
    const remove = setTimeout(() => removeToast(toast.id), DURATION);
    return () => { clearTimeout(exit); clearTimeout(remove); };
  }, [toast.id, removeToast]);

  return (
    <div
      className={cn(
        'relative flex w-80 items-start gap-3 overflow-hidden rounded-xl border p-4 shadow-lg',
        exiting ? 'animate-toast-out' : 'animate-toast-in',
        config.className,
      )}
      role="alert"
    >
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', config.iconClass)} />
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
      <button
        onClick={() => { setExiting(true); setTimeout(() => removeToast(toast.id), 300); }}
        className="ml-1 shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      {/* Progress bar */}
      <div
        className={cn('absolute bottom-0 left-0 h-0.5 rounded-full', config.progressClass)}
        style={{ animation: `shrink-width ${DURATION}ms linear forwards` }}
      />
    </div>
  );
}

export function Toaster() {
  const toasts = useUiStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
