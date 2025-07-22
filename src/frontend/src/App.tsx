import React, { useState, useEffect } from 'react';
import { VideoGenerationForm } from './components/VideoGenerationForm';
import { VideoDashboard } from './components/VideoDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { 
  Sparkles, 
  Video, 
  BarChart3, 
  Settings,
  Github,
  Twitter,
  Zap,
  Brain,
  Palette,
  Music
} from 'lucide-react';

interface VideoGenerationRequest {
  topic: string;
  platforms: ('tiktok' | 'reels' | 'shorts')[];
  style?: string;
  targetAudience?: string;
  duration?: number;
  educationalContent?: boolean;
  visualPreferences?: {
    colorScheme?: string;
    styleReference?: string;
  };
  audioPreferences?: {
    voiceStyle?: string;
    musicGenre?: string;
  };
  autoDistribute?: boolean;
}

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

function App() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('create');

  // Mock data for demonstration
  useEffect(() => {
    const mockVideos: VideoData[] = [
      {
        id: '1',
        title: 'AI in Healthcare: Revolutionizing Patient Care',
        platform: 'tiktok',
        thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=320&h=180&fit=crop',
        videoUrl: '#',
        createdAt: '2024-01-15T10:30:00Z',
        duration: 30,
        status: 'completed',
        analytics: {
          views: 15400,
          likes: 892,
          comments: 156,
          shares: 89
        }
      },
      {
        id: '2',
        title: 'Quick Cooking Tips for Busy Professionals',
        platform: 'reels',
        thumbnailUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=320&h=180&fit=crop',
        videoUrl: '#',
        createdAt: '2024-01-14T14:20:00Z',
        duration: 60,
        status: 'completed',
        analytics: {
          views: 8900,
          likes: 445,
          comments: 78,
          shares: 45
        }
      },
      {
        id: '3',
        title: '2024 Tech Trends You Need to Know',
        platform: 'shorts',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=320&h=180&fit=crop',
        videoUrl: '#',
        createdAt: '2024-01-13T09:15:00Z',
        duration: 45,
        status: 'processing'
      }
    ];
    setVideos(mockVideos);
  }, []);

  const handleVideoGeneration = async (request: VideoGenerationRequest) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setActiveTab('dashboard');

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      // Call the API
      const response = await fetch('/api/v1/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to start video generation');
      }

      const result = await response.json();
      
      // Clear progress and add new video
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      setTimeout(() => {
        const newVideo: VideoData = {
          id: result.workflowId || Math.random().toString(),
          title: request.topic,
          platform: request.platforms[0],
          thumbnailUrl: '',
          videoUrl: '',
          createdAt: new Date().toISOString(),
          duration: request.duration || 30,
          status: 'processing'
        };
        
        setVideos(prev => [newVideo, ...prev]);
        setIsGenerating(false);
        setGenerationProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Error generating video:', error);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleVideoPlay = (videoId: string) => {
    console.log('Playing video:', videoId);
    // Implement video playback
  };

  const handleVideoDownload = (videoId: string) => {
    console.log('Downloading video:', videoId);
    // Implement video download
  };

  const handleVideoShare = (videoId: string) => {
    console.log('Sharing video:', videoId);
    // Implement video sharing
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Video Pipeline</h1>
                <p className="text-sm text-gray-500">Create stunning social content with AI</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </Button>
              <Button variant="ghost" size="sm">
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Transform Ideas into 
            <span className="text-blue-600"> Viral Videos</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Harness the power of AI to create engaging social media content. 
            From script to screen in minutes, not hours.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            <Card className="text-center border-0 shadow-sm bg-white/70 backdrop-blur">
              <CardContent className="p-6">
                <Brain className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold mb-2">AI-Powered Scripts</h3>
                <p className="text-sm text-gray-600">Generate compelling narratives tailored to your audience</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-sm bg-white/70 backdrop-blur">
              <CardContent className="p-6">
                <Palette className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                <h3 className="font-semibold mb-2">Dynamic Visuals</h3>
                <p className="text-sm text-gray-600">Create stunning visuals that capture attention</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-sm bg-white/70 backdrop-blur">
              <CardContent className="p-6">
                <Music className="h-8 w-8 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold mb-2">Perfect Audio</h3>
                <p className="text-sm text-gray-600">AI voices and music that match your content</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Create
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-8">
            <VideoGenerationForm
              onSubmit={handleVideoGeneration}
              isGenerating={isGenerating}
              progress={generationProgress}
            />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-8">
            <VideoDashboard
              videos={videos}
              onPlay={handleVideoPlay}
              onDownload={handleVideoDownload}
              onShare={handleVideoShare}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>
                  Detailed insights into your video performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                  <p className="text-gray-500">Advanced analytics coming soon!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900">AI Video Pipeline</span>
            </div>
            <p className="text-gray-500 text-sm">
              Powered by advanced AI • Create • Analyze • Optimize
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App; 