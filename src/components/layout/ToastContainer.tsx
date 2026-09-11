import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-xl border text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'success'
              ? 'bg-[#1E3327] text-white border-[#2C4837]'
              : toast.type === 'error'
              ? 'bg-[#EF4444] text-white border-[#DC2626]'
              : toast.type === 'warning'
              ? 'bg-[#FAF6ED] text-[#9E7B36] border-[#DFBE74]'
              : 'bg-[#1A2521] text-white border-[#33423A]'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-white shrink-0 mt-0.5" />}
          {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-[#8EA89B] shrink-0 mt-0.5" />}

          <div className="flex-1 leading-snug">{toast.message}</div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/70 hover:text-white shrink-0 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
