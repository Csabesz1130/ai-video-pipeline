import React from 'react';
import { VideoDashboard } from '../components/VideoDashboard';

const sampleVideos = [
  {
    id: '1',
    title: 'AI Productivity Hacks',
    platform: 'tiktok',
    thumbnailUrl: 'https://placehold.co/320x180/png',
    videoUrl: '#',
    createdAt: new Date().toISOString(),
    duration: 30,
    status: 'completed',
    analytics: {
      views: 12800,
      likes: 2300,
      comments: 320,
      shares: 120,
    },
  },
  {
    id: '2',
    title: 'Top 5 AI Tools 2025',
    platform: 'shorts',
    thumbnailUrl: 'https://placehold.co/320x180/png',
    videoUrl: '#',
    createdAt: new Date().toISOString(),
    duration: 45,
    status: 'processing',
  },
];

export default function Dashboard() {
  const handlePlay = (id: string) => alert(`Lejátszás: ${id}`);
  const handleDownload = (id: string) => alert(`Letöltés: ${id}`);
  const handleShare = (id: string) => alert(`Megosztás: ${id}`);

  return (
    <VideoDashboard
      videos={sampleVideos as any}
      onPlay={handlePlay}
      onDownload={handleDownload}
      onShare={handleShare}
    />
  );
}