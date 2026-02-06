import { Component, type ReactNode, type ErrorInfo } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Fallback UI to show when error occurs */
  fallback?: ReactNode
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error boundary component to catch and handle errors in child components
 * Prevents entire app from crashing when a component fails
 *
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<div>Something went wrong</div>}>
 *   <Avatar3D vrmUrl={url} />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-8">
          <div className="text-red-400 text-xl mb-4">Something went wrong</div>
          <div className="text-gray-400 text-sm mb-6 max-w-md text-center">
            {this.state.error?.message || 'An unexpected error occurred'}
          </div>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Specific error boundary for 3D components with appropriate fallback UI
 */
export function ThreeJSErrorBoundary({ children }: { children: ReactNode }): ReactNode {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-8">
          <div className="text-red-400 text-xl mb-4">3D Rendering Error</div>
          <div className="text-gray-400 text-sm mb-4 max-w-md text-center">
            Failed to render 3D content. This could be due to:
          </div>
          <ul className="text-gray-500 text-sm list-disc list-inside mb-6">
            <li>Invalid or corrupted VRM file</li>
            <li>WebGL not supported in your browser</li>
            <li>Graphics driver issues</li>
          </ul>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            Reload Page
          </button>
        </div>
      }
      onError={(error) => {
        console.error('3D rendering error:', error)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundary
