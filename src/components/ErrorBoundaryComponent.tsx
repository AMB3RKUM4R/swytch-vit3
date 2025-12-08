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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95">
            <div className="w-full max-w-sm border border-red-600 bg-red-900/10 p-8 text-center">
                <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-6 animate-pulse" />
                <h1 className="text-3xl font-russo text-red-600 mb-2">SYSTEM HALTED</h1>
                <p className="text-red-400 font-mono text-xs mb-8 tracking-widest uppercase">
                    Error Code: {errorMessage.slice(0, 20)}...
                </p>
                <button 
                    onClick={() => window.location.reload()}
                    className="w-full py-4 bg-red-600 text-white font-bold uppercase hover:bg-red-700 transition-colors"
                >
                    REBOOT SYSTEM
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