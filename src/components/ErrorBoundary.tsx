import { Component, ErrorInfo, ReactNode } from 'react';
import logger from '../utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component that catches JavaScript errors in child components.
 * Displays a fallback UI instead of crashing the whole app.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{
            background: 'linear-gradient(135deg, #3E2723 0%, #4E342E 50%, #3E2723 100%)',
          }}
        >
          <div
            className="bg-sand-100 border-8 border-wood-800 p-8 shadow-2xl max-w-md text-center"
            style={{
              background: 'linear-gradient(135deg, #F5E6D3 0%, #E8D5B7 100%)',
            }}
          >
            <h1 className="text-3xl font-display font-bold text-wood-900 mb-4">
              Whoa, Partner!
            </h1>
            <p className="text-wood-800 font-body mb-4">
              Something went wrong at the poker table.
            </p>
            {this.state.error && (
              <p className="text-red-700 font-body text-sm mb-4 p-2 bg-red-100 rounded">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleReset}
              className="bg-gradient-to-b from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-wood-900 font-body font-bold py-3 px-8 rounded-lg shadow-xl transition-all hover:scale-105 active:scale-95 border-4 border-gold-600"
            >
              Restart Game
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
