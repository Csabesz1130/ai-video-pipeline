import React from 'react';
import Dashboard from './components/dashboard';
import { ThemeProvider } from './components/theme-provider';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ai-video-pipeline-theme">
      <Dashboard />
    </ThemeProvider>
  );
}

export default App; 