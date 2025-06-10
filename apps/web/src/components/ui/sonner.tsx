import { toast as sonnerToast, Toaster as SonnerToaster } from 'sonner';

// Custom toast function abstraction
function toast(toastProps: Omit<ToastProps, 'id'>) {
  return sonnerToast.custom((id) => (
    <Toast
      id={id}
      title={toastProps.title}
      description={toastProps.description}
      type={toastProps.type || 'default'}
      action={toastProps.action}
    />
  ));
}

// Success toast shorthand
toast.success = (title: string, description?: string, action?: ToastAction) => {
  return toast({ title, description, type: 'success', action });
};

// Error toast shorthand
toast.error = (title: string, description?: string, action?: ToastAction) => {
  return toast({ title, description, type: 'error', action });
};

// Info toast shorthand
toast.info = (title: string, description?: string, action?: ToastAction) => {
  return toast({ title, description, type: 'info', action });
};

// Warning toast shorthand
toast.warning = (title: string, description?: string, action?: ToastAction) => {
  return toast({ title, description, type: 'warning', action });
};

// Custom toast component with your styling
function Toast(props: ToastProps) {
  const { title, description, action, id, type = 'default' } = props;

  // Type-specific styling
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'border-green-200 dark:border-green-800';
      case 'error':
        return 'border-red-200 dark:border-red-800';
      case 'warning':
        return 'border-yellow-200 dark:border-yellow-800';
      case 'info':
        return 'border-blue-200 dark:border-blue-800';
      default:
        return 'border-gray-200 dark:border-gray-700';
    }
  };

  const getIconForType = () => {
    switch (type) {
      case 'success':
        return (
          <div className="flex-shrink-0 w-5 h-5 text-green-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="flex-shrink-0 w-5 h-5 text-red-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="flex-shrink-0 w-5 h-5 text-yellow-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'info':
        return (
          <div className="flex-shrink-0 w-5 h-5 text-blue-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex rounded-lg bg-[#e9e5dc] dark:bg-[#1e1b16] shadow-lg border ${getTypeStyles()} w-full md:max-w-[364px] items-start p-4 font-manrope_1`}>
      {getIconForType() && (
        <div className="mr-3 mt-0.5">
          {getIconForType()}
        </div>
      )}

      <div className="flex flex-1 items-center">
        <div className="w-full">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
          {description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{description}</p>
          )}
        </div>
      </div>

      {action && (
        <div className="ml-4 flex-shrink-0">
          <button
            className="rounded bg-gray-100 dark:bg-gray-700 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            onClick={() => {
              action.onClick();
              sonnerToast.dismiss(id);
            }}
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
}

// Toaster component - you'll use this in your app root
export function Toaster() {
  return <SonnerToaster />;
}



// Type definitions
interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastProps {
  id: string | number;
  title: string;
  description?: string;
  type?: 'default' | 'success' | 'error' | 'warning' | 'info';
  action?: ToastAction;
}

export { toast };