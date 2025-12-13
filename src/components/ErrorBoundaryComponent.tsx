import { useState, useEffect, ReactNode, FC } from 'react';
import { AlertTriangle } from 'lucide-react';
import { SwytchErrorBoundaryProps } from '@/lib/types';

const SwytchErrorBoundary: FC<SwytchErrorBoundaryProps> = ({ children, setShowMessage }) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const ErrorCatchComponent: FC<{ children: ReactNode }> = ({ children }) => {
    useEffect(() => {
      const errorHandler = (error: ErrorEvent) => {
        setHasError(true);
        setErrorMessage(error.message || 'FATAL_EXCEPTION');
        console.error(error.error);
        setShowMessage('⚠️ SYSTEM FAILURE DETECTED');
      };
      
      const promiseRejectionHandler = (event: PromiseRejectionEvent) => {
         setHasError(true);
         setErrorMessage(event.reason?.message || 'ASYNC_FAILURE');
         console.error(event.reason);
         setShowMessage('⚠️ SYSTEM FAILURE DETECTED');
      };

      window.addEventListener('error', errorHandler);
      window.addEventListener('unhandledrejection', promiseRejectionHandler);
      return () => {
        window.removeEventListener('error', errorHandler);
        window.removeEventListener('unhandledrejection', promiseRejectionHandler);
      };
    }, []);

    if (hasError) {
      return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black font-mono">
            <div className="w-full max-w-sm border-2 border-red-600 bg-black p-8 text-center shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-6 animate-pulse" />
                <h1 className="text-3xl font-black text-red-600 mb-2 uppercase italic">CRITICAL ERROR</h1>
                <p className="text-red-500 font-mono text-[10px] mb-8 tracking-widest uppercase break-words">
                    ERR_CODE: {errorMessage.slice(0, 50)}...
                </p>
                <button 
                    onClick={() => window.location.reload()}
                    className="w-full py-4 bg-red-600 text-black font-bold uppercase hover:bg-white hover:text-red-600 transition-colors tracking-widest"
                >
                    FORCE REBOOT
                </button>
            </div>
        </div>
      );
    }

    return <>{children}</>;
  };

  return <ErrorCatchComponent>{children}</ErrorCatchComponent>;
};

export default SwytchErrorBoundary;