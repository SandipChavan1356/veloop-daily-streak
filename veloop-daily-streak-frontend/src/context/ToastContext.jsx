import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

// Two contexts on purpose: `useToast()` returns STABLE actions (so pages can put it
// in effect/callback dependency lists without re-triggering fetches every time a
// toast appears), while only <ToastStack> subscribes to the changing list.
const ToastActionsContext = createContext(null);
const ToastListContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const push = useCallback(
    (message, variant = 'info', duration = 4200) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev.slice(-3), { id, message, variant }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const actions = useMemo(
    () => ({
      success: (msg) => push(msg, 'success'),
      error: (msg) => push(msg, 'error'),
      info: (msg) => push(msg, 'info'),
    }),
    [push]
  );
  const list = useMemo(() => ({ toasts, dismiss }), [toasts, dismiss]);

  return (
    <ToastActionsContext.Provider value={actions}>
      <ToastListContext.Provider value={list}>{children}</ToastListContext.Provider>
    </ToastActionsContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastActionsContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const useToastList = () => {
  const ctx = useContext(ToastListContext);
  if (!ctx) throw new Error('useToastList must be used within ToastProvider');
  return ctx;
};
