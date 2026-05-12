import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  return useContext(ToastContext);
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div id="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === 'error' ? `⚠️ ${toast.msg}` : `✅ ${toast.msg}`}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};
