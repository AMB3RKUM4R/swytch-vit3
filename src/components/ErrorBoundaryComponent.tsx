// src/components/ErrorBoundaryComponent.tsx
import { useState, useEffect, ReactNode, FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react'; // Use AlertTriangle
import { SwytchErrorBoundaryProps } from '@/lib/types'; // Import the type

const errorModalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3 } },
};

const SwytchErrorBoundary: FC<SwytchErrorBoundaryProps> = ({ children, setShowMessage }) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // A component that simulates the componentDidCatch behavior
  const ErrorCatchComponent: FC<{ children: ReactNode }> = ({ children }) => {
    useEffect(() => {
      const errorHandler = (error: ErrorEvent) => {
        setHasError(true);
        setErrorMessage(error.message || 'An unexpected error occurred.');
        console.error('Error caught by Error Boundary:', error.error);
        setShowMessage('⚠️ System error detected. Please reload.');
      };
      
      const promiseRejectionHandler = (event: PromiseRejectionEvent) => {
         setHasError(true);
         setErrorMessage(event.reason?.message || 'An unhandled promise rejection occurred.');
         console.error('Unhandled Promise Rejection:', event.reason);
         setShowMessage('⚠️ System error detected. Please reload.');
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
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative card p-8 rounded-lg max-w-sm w-full mx-4 border border-destructive"
              variants={errorModalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.button
                className="absolute top-4 right-4 text-muted-foreground"
                onClick={() => window.location.reload()}
                whileHover={{ scale: 1.1, color: 'hsl(var(--foreground))' }}
                aria-label="Close Modal"
              >
                <X className="w-6 h-6" />
              </motion.button>

              <div className="text-center">
                <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-6" />
                <h2 className="text-3xl font-poppins font-bold text-destructive mb-4">
                  System Error
                </h2>
                <p className="text-sm text-muted-foreground text-center mb-6 font-inter">
                  An unexpected anomaly was detected. Please reload the application.
                  <br />
                  <span className="text-xs text-muted-foreground/50 mt-2 block">{errorMessage}</span>
                </p>
                <motion.button
                  className="btn-primary w-full mt-4"
                  onClick={() => window.location.reload()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Reload Application
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      );
    }

    return <>{children}</>;
  };

  return <ErrorCatchComponent>{children}</ErrorCatchComponent>;
};

export default SwytchErrorBoundary;
