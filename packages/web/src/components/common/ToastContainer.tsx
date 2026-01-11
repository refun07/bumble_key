import { useToast, type ToastType } from '../../store/toast';
import {
    CheckCircleIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const ToastContainer = () => {
    const { toasts, hideToast } = useToast();

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
            case 'error':
                return <ExclamationCircleIcon className="h-6 w-6 text-red-500" />;
            case 'warning':
                return <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />;
            default:
                return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
        }
    };

    const getStyles = (type: ToastType) => {
        switch (type) {
            case 'success':
                return 'bg-white border-l-4 border-green-500';
            case 'error':
                return 'bg-white border-l-4 border-red-500';
            case 'warning':
                return 'bg-white border-l-4 border-yellow-500';
            default:
                return 'bg-white border-l-4 border-blue-500';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`pointer-events-auto relative overflow-hidden min-w-[320px] max-w-md p-4 rounded-2xl shadow-xl border border-gray-100 flex items-start gap-3 animate-slide-in-right ${getStyles(toast.type)}`}
                >
                    <div className="flex-shrink-0 mt-0.5">
                        {getIcon(toast.type)}
                    </div>
                    <div className="flex-1 pt-0.5 z-10">
                        <p className="text-sm font-bold text-gray-900">{toast.message}</p>
                    </div>
                    <button
                        onClick={() => hideToast(toast.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors z-10"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 w-full origin-left animate-progress-shrink" />
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
