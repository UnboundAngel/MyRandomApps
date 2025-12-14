import React from 'react';
import { createRoot } from 'react-dom/client';
import ProjectOS from './App';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'white', backgroundColor: 'red', padding: '20px' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error && this.state.error.toString()}</pre>
          <br />
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }

    return this.props.children; 
  }
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ProjectOS />
    </ErrorBoundary>
  </React.StrictMode>
);
