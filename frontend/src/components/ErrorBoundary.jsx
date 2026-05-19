import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[Global Error Boundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '1.5rem', background: 'var(--color-background)',
          padding: '2rem', textAlign: 'center'
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem'
          }}>
            ⚠️
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>
            Something went wrong
          </h1>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', fontSize: '0.875rem' }}>
            The application encountered an unexpected error. Don't worry, your data is safe.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))',
              color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
              fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(74, 92, 106, 0.2)'
            }}
          >
            Reload Application
          </button>
          
          {process.env.NODE_ENV === 'development' && (
            <pre style={{
              marginTop: '2rem', padding: '1rem', background: '#1a1a1a',
              color: '#ff4444', borderRadius: '8px', fontSize: '0.75rem',
              textAlign: 'left', maxWidth: '90vw', overflowX: 'auto'
            }}>
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
