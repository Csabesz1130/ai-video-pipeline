import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Play, 
  Download, 
  Share, 
  Eye, 
  Heart, 
  MessageCircle,
  TrendingUp,
  Clock,
  Youtube,
  Instagram,
  MonitorPlay
} from 'lucide-react';

interface VideoData {
  id: string;
  title: string;
  platform: 'tiktok' | 'reels' | 'shorts';
  thumbnailUrl: string;
  videoUrl: string;
  createdAt: string;
  duration: number;
  status: 'completed' | 'processing' | 'failed';
  analytics?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

interface VideoDashboardProps {
  videos: VideoData[];
  onPlay: (videoId: string) => void;
  onDownload: (videoId: string) => void;
  onShare: (videoId: string) => void;
}

export function VideoDashboard({ videos, onPlay, onDownload, onShare }: VideoDashboardProps) {
  const completedVideos = videos.filter(v => v.status === 'completed');
  const processingVideos = videos.filter(v => v.status === 'processing');
  
  const totalViews = completedVideos.reduce((sum, video) => sum + (video.analytics?.views || 0), 0);
  const totalLikes = completedVideos.reduce((sum, video) => sum + (video.analytics?.likes || 0), 0);
  const totalComments = completedVideos.reduce((sum, video) => sum + (video.analytics?.comments || 0), 0);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'tiktok': return MonitorPlay;
      case 'reels': return Instagram;
      case 'shorts': return Youtube;
      default: return Play;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'tiktok': return 'bg-black text-white';
      case 'reels': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'shorts': return 'bg-red-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedVideos.length}</div>
            <p className="text-xs text-muted-foreground">
              {processingVideos.length} processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalViews)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalLikes)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(totalComments)} comments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedVideos.length > 0 ? Math.round(totalViews / completedVideos.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">views per video</p>
          </CardContent>
        </Card>
      </div>

      {/* Video Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Your Videos</CardTitle>
          <CardDescription>
            Manage and analyze your AI-generated content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {videos.length === 0 ? (
            <div className="text-center py-12">
              <Play className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No videos yet</h3>
              <p className="text-gray-500">Start creating your first AI-powered video!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => {
                const PlatformIcon = getPlatformIcon(video.platform);
                
                return (
                  <Card key={video.id} className="group hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                        {video.status === 'completed' ? (
                          <img
                            src={video.thumbnailUrl || '/api/placeholder/320/180'}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                        
                        <div className="absolute top-2 left-2">
                          <div className={`p-1 rounded ${getPlatformColor(video.platform)}`}>
                            <PlatformIcon className="h-3 w-3" />
                          </div>
                        </div>
                        
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {video.duration}s
                        </div>
                        
                        {video.status === 'completed' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
                            <Button
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => onPlay(video.id)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-medium line-clamp-2">{video.title}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(video.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        {video.analytics && video.status === 'completed' && (
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {formatNumber(video.analytics.views)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {formatNumber(video.analytics.likes)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {formatNumber(video.analytics.comments)}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {video.status === 'processing' && (
                          <div className="text-sm text-blue-600 font-medium">
                            Processing...
                          </div>
                        )}
                        
                        {video.status === 'failed' && (
                          <div className="text-sm text-red-600 font-medium">
                            Generation failed
                          </div>
                        )}
                        
                        {video.status === 'completed' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => onDownload(video.id)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => onShare(video.id)}
                            >
                              <Share className="h-3 w-3 mr-1" />
                              Share
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}