import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) setTimeout(() => remove(id), duration);
  }, [remove]);

  const iconMap = {
    success: <CheckCircle size={18} color="#22c55e" />,
    error:   <XCircle size={18} color="#ef4444" />,
    info:    <Info size={18} color="#3b82f6" />,
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {iconMap[t.type]}
              <span className="toast-msg">{t.message}</span>
            </div>
            <button className="btn-icon" onClick={() => remove(t.id)} style={{ flexShrink: 0 }}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};
