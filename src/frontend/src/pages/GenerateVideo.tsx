import React, { useState } from 'react';
import { VideoGenerationForm } from '../components/VideoGenerationForm';

export default function GenerateVideoPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (request: any) => {
    setIsGenerating(true);
    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setIsGenerating(false);
        setProgress(0);
        alert('A videó elkészült!');
      }
    }, 400);
  };

  return (
    <VideoGenerationForm
      onSubmit={handleSubmit}
      isGenerating={isGenerating}
      progress={progress}
    />
  );
}