import React from 'react';
import { VideoGenerationFormExample } from './components/VideoGenerationFormExample';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">
              AI Video Pipeline Frontend
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-700">
              Generate AI-powered video content for social media platforms
            </p>
          </div>
          <VideoGenerationFormExample />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App; 