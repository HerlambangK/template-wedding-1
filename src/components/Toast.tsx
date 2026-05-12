"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (type: ToastType, message: string, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-green-400" />,
  error: <XCircle className="h-5 w-5 text-red-400" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-400" />,
  info: <Info className="h-5 w-5 text-blue-400" />,
};

const borders: Record<ToastType, string> = {
  success: "border-l-green-400",
  error: "border-l-red-400",
  warning: "border-l-amber-400",
  info: "border-l-blue-400",
};

const bgColors: Record<ToastType, string> = {
  success: "bg-green-50",
  error: "bg-red-50",
  warning: "bg-amber-50",
  info: "bg-blue-50",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration = 4000) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type, message, duration }]);
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  const toast: ToastContextType["toast"] = addToast;

  return (
    <ToastContext.Provider
      value={{
        toast,
        success: (m: string) => addToast("success", m),
        error: (m: string) => addToast("error", m),
        warning: (m: string) => addToast("warning", m),
        info: (m: string) => addToast("info", m),
      }}
    >
      {children}
      <div className="fixed bottom-4 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 sm:bottom-auto sm:right-4 sm:top-4 sm:left-auto sm:translate-x-0 sm:max-w-xs">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`flex items-start gap-3 rounded-xl border border-gray-200 ${bgColors[t.type]} ${borders[t.type]} border-l-4 p-4 shadow-lg`}
            >
              <span className="mt-0.5 flex-shrink-0">{icons[t.type]}</span>
              <p className="flex-1 text-sm text-gray-700 leading-snug">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="flex-shrink-0 rounded-lg p-0.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
