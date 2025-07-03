import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ThemeToggle } from './theme-toggle';
import { Play, Pause, Upload, Settings, Users, BarChart3, Video, Brain, Sparkles, RefreshCw } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface VideoProject {
  id: string;
  title: string;
  status: 'processing' | 'completed' | 'error' | 'pending';
  progress: number;
  duration: string;
  thumbnail?: string;
}

interface TrendData {
  platform: string;
  trend: string;
  engagement: number;
  growth: string;
}

const Dashboard: React.FC = () => {
  const [videoProjects, setVideoProjects] = useState<VideoProject[]>([
    { id: '1', title: 'AI Trend Analysis Video', status: 'processing', progress: 75, duration: '2:30' },
    { id: '2', title: 'Social Media Compilation', status: 'completed', progress: 100, duration: '1:45' },
    { id: '3', title: 'Product Demo Reel', status: 'pending', progress: 0, duration: '3:15' },
    { id: '4', title: 'Tutorial Series Intro', status: 'error', progress: 45, duration: '1:20' },
  ]);

  const [trendData] = useState<TrendData[]>([
    { platform: 'TikTok', trend: '#AIRevolution', engagement: 892000, growth: '+24%' },
    { platform: 'YouTube', trend: 'Tech Reviews', engagement: 1200000, growth: '+18%' },
    { platform: 'Instagram', trend: 'Behind the Scenes', engagement: 564000, growth: '+31%' },
    { platform: 'Twitter', trend: 'Innovation Stories', engagement: 743000, growth: '+12%' },
  ]);

  const [processingProgress, setProcessingProgress] = useState(75);

  useEffect(() => {
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        const newProgress = prev + Math.random() * 2;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: VideoProject['status']) => {
    switch (status) {
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              AI Video Pipeline
            </h1>
            <p className="text-muted-foreground">
              Advanced content generation and social media trend analysis
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Avatar>
              <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => toast.success('Settings panel opened!')}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+2 from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing Queue</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Active workflows</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trend Accuracy</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">+5.2% improvement</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8.9%</div>
              <p className="text-xs text-muted-foreground">+1.3% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList>
            <TabsTrigger value="projects">Video Projects</TabsTrigger>
            <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Active Projects</h2>
              <Button 
                className="flex items-center gap-2"
                onClick={() => toast.success('New project dialog would open here!')}
              >
                <Upload className="h-4 w-4" />
                New Project
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {videoProjects.map((project) => (
                <Card key={project.id} className="relative overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      {getStatusBadge(project.status)}
                    </div>
                    <CardDescription>Duration: {project.duration}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                      <Video className="h-8 w-8 text-muted-foreground" />
                    </div>
                    {project.status === 'processing' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(project.progress)}%</span>
                        </div>
                        <Progress value={project.progress} />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Platform Trends</h2>
              <Button 
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => toast.loading('Refreshing trend data...', { duration: 2000 })}
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Data
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {trendData.map((trend, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{trend.platform}</CardTitle>
                      <Badge variant="secondary">{trend.growth}</Badge>
                    </div>
                    <CardDescription>Trending: {trend.trend}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Engagement</span>
                        <span className="font-medium">{trend.engagement.toLocaleString()}</span>
                      </div>
                      <Progress value={Math.min((trend.engagement / 1500000) * 100, 100)} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>
                  Overview of your content performance across all platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Content Generation Speed</span>
                    <span className="text-sm text-muted-foreground">2.3x faster</span>
                  </div>
                  <Progress value={85} />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>AI Accuracy Score</span>
                    <span className="text-sm text-muted-foreground">94.2%</span>
                  </div>
                  <Progress value={94} />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>User Engagement</span>
                    <span className="text-sm text-muted-foreground">+12.5%</span>
                  </div>
                  <Progress value={68} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Configuration</CardTitle>
                <CardDescription>
                  Configure your AI video generation and trend monitoring settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">API Endpoint</label>
                  <Input placeholder="https://api.example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Processing Quality</label>
                  <Input placeholder="High" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Trend Update Interval</label>
                  <Input placeholder="5 minutes" />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => toast.success('Configuration saved successfully!')}
                >
                  Save Configuration
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'bg-background text-foreground border border-border',
          duration: 3000,
        }}
      />
    </div>
  );
};

export default Dashboard;