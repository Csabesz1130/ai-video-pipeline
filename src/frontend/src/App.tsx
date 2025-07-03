import React from 'react';
import { ThemeProvider } from './components/theme-provider';
import { MainLayout } from './components/layout/main-layout';
import EnhancedDashboard from './components/enhanced-dashboard';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ai-video-pipeline-theme">
      <MainLayout>
        <EnhancedDashboard />
      </MainLayout>
    </ThemeProvider>
  );
}

export default App; 