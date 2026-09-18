// client/src/components/ui/Toast.tsx
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useToast } from "../../contexts/ToastContext";
import type { ToastItem } from "../../contexts/ToastContext"; // <-- ADD 'type' HERE

export default function Toast() {
  const { toasts, removeToast } = useToast();

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-indigo-500" />
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast: ToastItem) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className="bg-white border border-slate-200 shadow-lg rounded-lg p-4 flex items-start gap-3 min-w-[300px]"
          >
            {icons[toast.type]}
            <p className="text-sm font-medium text-slate-800 flex-1 pt-0.5">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}