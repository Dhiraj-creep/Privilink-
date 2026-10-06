import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 24px',
          maxWidth: '680px',
          margin: '40px auto',
          textAlign: 'center'
        }}>
          <Card>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              padding: '24px 16px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-danger, #EF4444)'
              }}>
                <AlertTriangle size={24} />
              </div>
              <h2 style={{
                fontSize: 'var(--text-lg, 18px)',
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0
              }}>
                {this.props.fallbackTitle || 'Component Rendering Error'}
              </h2>
              <p style={{
                fontSize: 'var(--text-sm, 13px)',
                color: 'var(--text-secondary)',
                maxWidth: '480px',
                margin: 0,
                lineHeight: 1.5
              }}>
                {this.state.error?.message || 'An unexpected rendering issue occurred while displaying this view.'}
              </p>
              <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
                <Button variant="primary" onClick={this.handleReset}>
                  <RefreshCw size={14} style={{ marginRight: '6px' }} />
                  Reload View
                </Button>
                <Button variant="secondary" onClick={() => window.location.href = '/'}>
                  Return to Dashboard
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
