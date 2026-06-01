import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log de erros sem expor dados sensíveis
    console.error('[ErrorBoundary]', error?.message);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh',
        padding: '40px 24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ fontFamily: 'var(--display)', marginBottom: '8px', fontSize: '20px' }}>
          Algo deu errado
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '28px' }}>
          Ocorreu um erro inesperado. Tente recarregar a página.
        </p>
        <button
          className="btn-primary"
          style={{ margin: '0 auto' }}
          onClick={() => window.location.reload()}
        >
          🔄 Recarregar Página
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
