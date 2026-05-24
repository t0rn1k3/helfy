import { Component, type ErrorInfo, type ReactNode } from 'react';

import { ErrorState } from '@/components/features/ErrorState';

interface PageErrorBoundaryProps {
  children: ReactNode;
}

interface PageErrorBoundaryState {
  hasError: boolean;
}

export class PageErrorBoundary extends Component<PageErrorBoundaryProps, PageErrorBoundaryState> {
  state: PageErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): PageErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Page render error:', error, info.componentStack);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-lg px-4 py-16">
          <ErrorState
            message="This page failed to render. Please try again."
            onRetry={this.handleRetry}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
