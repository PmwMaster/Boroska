import { createContext, useCallback, useContext, useState } from 'react';
import { ToastContainer } from '../components/ui/Toast.jsx';

let nextId = 0;
const MAX_TOASTS = 3;

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback(
    (type, message) => {
      const id = ++nextId;
      setToasts((prev) => {
        const trimmed = prev.length >= MAX_TOASTS ? prev.slice(prev.length - (MAX_TOASTS - 1)) : prev;
        return [...trimmed, { id, type, message }];
      });
      if (typeof window !== 'undefined') {
        setTimeout(() => remove(id), 3000);
      }
    },
    [remove],
  );

  const success = useCallback((msg) => add('success', msg), [add]);
  const error = useCallback((msg) => add('error', msg), [add]);
  const info = useCallback((msg) => add('info', msg), [add]);

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      <ToastContainer toasts={toasts} remove={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
