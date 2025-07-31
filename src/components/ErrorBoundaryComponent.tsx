// src/components/ErrorBoundaryComponent.tsx
import { useState, useEffect, ReactNode, FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

interface SwytchErrorBoundaryProps {
  children: ReactNode;
  setShowMessage: (message: string) => void;
  setActiveModal: (modalName: string | null) => void;
}

const errorModalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3 } },
};

const SwytchErrorBoundary: FC<SwytchErrorBoundaryProps> = ({ children, setShowMessage, setActiveModal }) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // A component that simulates the componentDidCatch behavior in a functional component
  const ErrorCatchComponent = () => {
    useEffect(() => {
      const errorHandler = (error: ErrorEvent) => {
        setHasError(true);
        setErrorMessage(error.message || 'An unexpected error occurred.');
        console.error('Error caught by Error Boundary:', error.error);
        setShowMessage('⚠️ System protocol breached. Initiating recovery...');
      };
      window.addEventListener('error', errorHandler);
      return () => window.removeEventListener('error', errorHandler);
    }, []);

    if (hasError) {
      return (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative holographic-card p-8 rounded-lg max-w-sm w-full mx-4"
              variants={errorModalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.button
                className="absolute top-4 right-4 text-foreground"
                onClick={() => window.location.reload()}
                whileHover={{ scale: 1.1 }}
                aria-label="Close Modal"
              >
                <X className="w-6 h-6 text-[hsl(var(--secondary-hsl))] animate-neon-pulse" />
              </motion.button>

              <h2 className="text-3xl font-russo text-primary mb-4 text-center text-glow-primary">
                System Breach!
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-4">
                An unexpected system anomaly was detected.
                <br />
                {errorMessage}
              </p>
              <motion.button
                className="btn-primary w-full mt-4"
                onClick={() => window.location.reload()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Re-Initialize Protocol
              </motion.button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      );
    }

    return children;
  };

  return <ErrorCatchComponent />;
};

export default SwytchErrorBoundary;