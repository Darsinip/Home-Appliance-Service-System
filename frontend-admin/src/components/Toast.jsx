import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast, toasts }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  const getTypeStyle = (type) => {
    switch (type) {
      case 'success': return 'bg-success text-white';
      case 'error': return 'bg-danger text-white';
      case 'warning': return 'bg-warning text-dark';
      case 'info': default: return 'bg-primary text-white';
    }
  };

  return (
    <div aria-live="polite" aria-atomic="true" className="position-relative">
      <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 1060 }}>
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`toast show align-items-center border-0 mb-2 slide-in-right ${getTypeStyle(toast.type)}`} 
            role="alert" 
            aria-live="assertive" 
            aria-atomic="true"
          >
            <div className="d-flex">
              <div className="toast-body fw-medium">
                {toast.message}
              </div>
              <button 
                type="button" 
                className={`btn-close btn-close-white me-2 m-auto ${toast.type === 'warning' ? 'btn-close-dark' : ''}`}
                onClick={() => removeToast(toast.id)}
                aria-label="Close"
              ></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
