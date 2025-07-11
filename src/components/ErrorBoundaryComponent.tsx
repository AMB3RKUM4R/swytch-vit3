import { Component } from 'react';
import { motion } from 'framer-motion';

// IMPORTANT: Import SwytchErrorBoundaryProps and SwytchErrorBoundaryState from lib/types.ts
import { SwytchErrorBoundaryProps as ImportedSwytchErrorBoundaryProps, SwytchErrorBoundaryState } from '../lib/types';


// Use ImportedSwytchErrorBoundaryProps for the component props
class SwytchErrorBoundary extends Component<ImportedSwytchErrorBoundaryProps, SwytchErrorBoundaryState> {
  state: SwytchErrorBoundaryState = { // Use ImportedSwytchErrorBoundaryState
    hasError: false,
  };

  static getDerivedStateFromError(): SwytchErrorBoundaryState { // Use ImportedSwytchErrorBoundaryState for return type
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error caught:', error.message, info.componentStack);
    this.props.setShowMessage('⚠️ An error occurred. Please try again.');
    this.props.setActiveModal('error');
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
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default SwytchErrorBoundary;