// src/components/ErrorBoundaryComponent.tsx
import { Component } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react'; // Import Sparkles for the loading state

// IMPORTANT: Import SwytchErrorBoundaryProps and SwytchErrorBoundaryState from lib/types.ts
import { SwytchErrorBoundaryProps, SwytchErrorBoundaryState } from '../lib/types';


// Use ImportedSwytchErrorBoundaryProps for the component props
class SwytchErrorBoundary extends Component<SwytchErrorBoundaryProps, SwytchErrorBoundaryState> {
  state: SwytchErrorBoundaryState = { // Use ImportedSwytchErrorBoundaryState
    hasError: false,
  };

  static getDerivedStateFromError(): SwytchErrorBoundaryState { // Use ImportedSwytchErrorBoundaryState for return type
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error caught:', error.message, info.componentStack);
    // Use props to set global message and active modal
    this.props.setShowMessage('⚠️ An unexpected error occurred. Please try again.');
    this.props.setActiveModal('error'); // You might have a generic 'error' modal or just rely on the message
  }

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          className="min-h-screen flex items-center justify-center text-white bg-gray-950 font-inter"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold font-poppins text-rose-400 mb-4">Something went wrong!</h2>
            <p className="text-gray-300">Please refresh the page or try again later.</p>
            <Sparkles className="w-10 h-10 text-rose-400 animate-pulse mx-auto mt-4" />
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default SwytchErrorBoundary;
