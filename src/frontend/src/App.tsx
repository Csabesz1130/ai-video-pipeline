import React from 'react';
import { VideoGenerationFormExample } from './components/VideoGenerationFormExample';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">
            AI Video Pipeline Frontend
          </h1>
          <p className="mt-2 text-gray-700">
            Generate AI-powered video content for social media platforms
          </p>
        </div>
        <VideoGenerationFormExample />
      </div>
    </div>
  );
}

export default App; 