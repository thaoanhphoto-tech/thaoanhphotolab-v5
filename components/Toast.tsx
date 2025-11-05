
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { ExclamationCircleIcon } from './icons/ExclamationCircleIcon';
import { XIcon } from './icons/XIcon';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (message: string, type: ToastType) => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType) => {
    setToasts(prevToasts => {
      // Prevent duplicate messages from being shown
      if (prevToasts.some(toast => toast.message === message)) {
        return prevToasts;
      }
      const id = Date.now() + Math.random(); // Add random to avoid key collisions
      return [...prevToasts, { id, message, type }];
    });
  }, []);

  const contextValue = { toasts, showToast, removeToast };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
};


const Toast: React.FC<{ toast: ToastMessage; onDismiss: (id: number) => void; }> = ({ toast, onDismiss }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onDismiss(toast.id), 300); // Wait for animation
        }, 5000);

        return () => clearTimeout(timer);
    }, [toast.id, onDismiss]);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => onDismiss(toast.id), 300);
    };

    const toastStyles = {
        error: {
            icon: <ExclamationCircleIcon className="w-6 h-6 text-red-500" />,
            bgColor: 'bg-zinc-800 dark:bg-zinc-900 border border-zinc-700',
            textColor: 'text-zinc-100'
        },
        success: {
             icon: <div />, // Placeholder
             bgColor: 'bg-zinc-800 dark:bg-zinc-900 border border-zinc-700',
             textColor: 'text-zinc-100'
        },
        info: {
             icon: <div />, // Placeholder
             bgColor: 'bg-zinc-800 dark:bg-zinc-900 border border-zinc-700',
             textColor: 'text-zinc-100'
        }
    };

    const style = toastStyles[toast.type];

    return (
        <div className={`flex items-start max-w-sm w-full p-4 rounded-lg shadow-lg ${style.bgColor} ${style.textColor} ${isExiting ? 'toast-exit' : 'toast-enter'}`}>
            <div className="flex-shrink-0">{style.icon}</div>
            <p className="ml-3 text-sm font-medium flex-1">{toast.message}</p>
            <button onClick={handleDismiss} className="ml-4 p-1 rounded-full hover:bg-zinc-700">
                <XIcon className="w-5 h-5 text-zinc-400" />
            </button>
        </div>
    );
}

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-5 right-5 z-[100] space-y-3">
            {toasts.map(toast => (
                <Toast 
                    key={toast.id}
                    toast={toast}
                    onDismiss={removeToast}
                />
            ))}
        </div>
    );
}
