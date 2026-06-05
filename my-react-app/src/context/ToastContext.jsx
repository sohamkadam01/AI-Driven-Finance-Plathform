import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ChevronRight, Info, Sparkles, X, XCircle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 5000, options = {}) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type, duration, ...options }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 left-4 sm:left-auto sm:top-6 z-[9999] flex flex-col gap-3 sm:w-full sm:max-w-md pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              className="pointer-events-auto"
            >
              <ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const getToastConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: CheckCircle2,
          title: 'Success',
          surface: 'from-emerald-50 via-white to-white',
          accent: 'bg-emerald-500',
          iconBg: 'bg-emerald-50',
          iconColor: 'text-emerald-600',
          border: 'border-emerald-100',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          title: 'Action needed',
          surface: 'from-amber-50 via-white to-white',
          accent: 'bg-amber-500',
          iconBg: 'bg-amber-50',
          iconColor: 'text-amber-600',
          border: 'border-amber-100',
        };
      case 'error':
        return {
          icon: XCircle,
          title: 'Something went wrong',
          surface: 'from-rose-50 via-white to-white',
          accent: 'bg-rose-500',
          iconBg: 'bg-rose-50',
          iconColor: 'text-rose-600',
          border: 'border-rose-100',
        };
      case 'insight':
        return {
          icon: Sparkles,
          title: 'Insight',
          surface: 'from-violet-50 via-white to-white',
          accent: 'bg-violet-500',
          iconBg: 'bg-violet-50',
          iconColor: 'text-violet-600',
          border: 'border-violet-100',
        };
      default:
        return {
          icon: Info,
          title: 'Notification',
          surface: 'from-blue-50 via-white to-white',
          accent: 'bg-blue-500',
          iconBg: 'bg-blue-50',
          iconColor: 'text-blue-600',
          border: 'border-blue-100',
        };
    }
  };

  const { icon: Icon, title, surface, accent, iconBg, iconColor, border } = getToastConfig();
  const displayTitle = toast.title || title;
  const message = String(toast.message || '').replace(/\s+/g, ' ').trim();

  const handleAction = () => {
    if (toast.onAction) {
      toast.onAction();
      onRemove();
    }
  };

  return (
    <div
      role="status"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      className={`relative overflow-hidden rounded-2xl border ${border} bg-gradient-to-br ${surface} shadow-[0_18px_48px_rgba(15,23,42,0.18)] ring-1 ring-black/5 backdrop-blur`}
    >
      <div className={`absolute left-0 top-0 h-full w-1 ${accent}`} />

      <div className="flex items-start gap-3 px-4 py-4 pl-5">
        <div className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${iconBg} shadow-sm`}>
          <Icon size={20} className={iconColor} />
        </div>

        <div className="min-w-0 flex-1 pr-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {toast.subtitle && (
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  {toast.subtitle}
                </p>
              )}
              <p className="text-sm font-semibold text-gray-950">{displayTitle}</p>
              <p className="mt-1 line-clamp-3 text-sm leading-5 text-gray-600 break-words">{message}</p>
              {toast.actionLabel && toast.onAction && (
                <button
                  onClick={handleAction}
                  className="mt-3 inline-flex items-center gap-1 rounded-lg bg-gray-950 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-gray-800"
                >
                  {toast.actionLabel}
                  <ChevronRight size={13} />
                </button>
              )}
            </div>
            <button
              onClick={onRemove}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>

      <motion.div
        className={`h-0.5 ${accent}`}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: toast.duration / 1000, ease: 'linear' }}
      />
    </div>
  );
};
