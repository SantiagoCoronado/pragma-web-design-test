"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const accentClass =
    item.type === "error"
      ? "text-pragma-danger"
      : item.type === "success"
      ? "text-pragma-accent"
      : "text-pragma-text";
  return (
    <div className="flex items-start gap-3 px-4 py-3 border border-pragma-border bg-pragma-surface shadow-lg min-w-[260px] max-w-sm rounded-[var(--radius-pragma-md)]">
      <span className={`font-mono text-[10px] tracking-[0.15em] uppercase ${accentClass} pt-0.5`}>
        {item.type === "error" ? "ERR" : item.type === "success" ? "OK" : "INFO"}
      </span>
      <p className="text-sm flex-1 text-pragma-text">{item.message}</p>
      <button
        onClick={onDismiss}
        className="text-pragma-subtext hover:text-pragma-text transition-colors cursor-pointer font-mono text-xs"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info") => {
      counter.current += 1;
      const id = `t-${Date.now()}-${counter.current}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast item={t} onDismiss={() => dismiss(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
