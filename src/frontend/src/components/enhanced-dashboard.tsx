import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  Badge,
  Progress,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui';
import { 
  Play, 
  Pause, 
  Upload, 
  Download,
  Settings, 
  Users, 
  BarChart3, 
  Video, 
  Brain, 
  Sparkles, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  Eye,
  Heart,
  Share,
  MoreHorizontal,
  Plus,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Target,
  Activity,
  Globe
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface VideoProject {
  id: string;
  title: string;
  status: 'processing' | 'completed' | 'error' | 'pending' | 'queued';
  progress: number;
  duration: string;
  thumbnail?: string;
  views?: number;
  engagement?: number;
  createdAt: string;
  type: 'ai-generated' | 'template' | 'custom';
}

interface TrendData {
  platform: string;
  trend: string;
  engagement: number;
  growth: string;
  growthDirection: 'up' | 'down';
  category: string;
  confidence: number;
}

interface AnalyticsData {
  metric: string;
  value: number;
  change: number;
  changeDirection: 'up' | 'down';
  target: number;
  unit: string;
}

const EnhancedDashboard: React.FC = () => {
  const [videoProjects, setVideoProjects] = useState<VideoProject[]>([
    { 
      id: '1', 
      title: 'AI Trend Analysis Video', 
      status: 'processing', 
      progress: 75, 
      duration: '2:30',
      views: 1240,
      engagement: 8.5,
      createdAt: '2024-01-15',
      type: 'ai-generated'
    },
    { 
      id: '2', 
      title: 'Social Media Compilation', 
      status: 'completed', 
      progress: 100, 
      duration: '1:45',
      views: 3450,
      engagement: 12.3,
      createdAt: '2024-01-14',
      type: 'template'
    },
    { 
      id: '3', 
      title: 'Product Demo Reel', 
      status: 'pending', 
      progress: 0, 
      duration: '3:15',
      views: 0,
      engagement: 0,
      createdAt: '2024-01-16',
      type: 'custom'
    },
    { 
      id: '4', 
      title: 'Tutorial Series Intro', 
      status: 'error', 
      progress: 45, 
      duration: '1:20',
      views: 890,
      engagement: 6.7,
      createdAt: '2024-01-13',
      type: 'ai-generated'
    },
    { 
      id: '5', 
      title: 'Brand Story Video', 
      status: 'queued', 
      progress: 0, 
      duration: '2:45',
      views: 0,
      engagement: 0,
      createdAt: '2024-01-16',
      type: 'template'
    },
  ]);

  const [trendData] = useState<TrendData[]>([
    { 
      platform: 'TikTok', 
      trend: '#AIRevolution', 
      engagement: 892000, 
      growth: '+24%',
      growthDirection: 'up',
      category: 'Technology',
      confidence: 94
    },
    { 
      platform: 'YouTube', 
      trend: 'Tech Reviews', 
      engagement: 1200000, 
      growth: '+18%',
      growthDirection: 'up',
      category: 'Education',
      confidence: 87
    },
    { 
      platform: 'Instagram', 
      trend: 'Behind the Scenes', 
      engagement: 564000, 
      growth: '+31%',
      growthDirection: 'up',
      category: 'Lifestyle',
      confidence: 91
    },
    { 
      platform: 'Twitter', 
      trend: 'Innovation Stories', 
      engagement: 743000, 
      growth: '-5%',
      growthDirection: 'down',
      category: 'Business',
      confidence: 73
    },
  ]);

  const [analyticsData] = useState<AnalyticsData[]>([
    { metric: 'Content Generation Speed', value: 2.3, change: 15, changeDirection: 'up', target: 3.0, unit: 'x faster' },
    { metric: 'AI Accuracy Score', value: 94.2, change: 5.2, changeDirection: 'up', target: 96.0, unit: '%' },
    { metric: 'User Engagement', value: 8.9, change: 1.3, changeDirection: 'up', target: 10.0, unit: '%' },
    { metric: 'Processing Queue', value: 3, change: -2, changeDirection: 'down', target: 5, unit: ' items' },
  ]);

  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [filterStatus, setFilterStatus] = useState('all');

  const getStatusBadge = (status: VideoProject['status']) => {
    const variants = {
      processing: { variant: 'secondary' as const, label: 'Processing', icon: Clock },
      completed: { variant: 'default' as const, label: 'Completed', icon: Play },
      error: { variant: 'destructive' as const, label: 'Error', icon: AlertTriangle },
      pending: { variant: 'outline' as const, label: 'Pending', icon: Clock },
      queued: { variant: 'secondary' as const, label: 'Queued', icon: Calendar },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getTypeIcon = (type: VideoProject['type']) => {
    switch (type) {
      case 'ai-generated':
        return <Brain className="h-4 w-4 text-primary" />;
      case 'template':
        return <Zap className="h-4 w-4 text-orange-500" />;
      case 'custom':
        return <Settings className="h-4 w-4 text-blue-500" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  const filteredProjects = filterStatus === 'all' 
    ? videoProjects 
    : videoProjects.filter(project => project.status === filterStatus);

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-8 p-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center">
                  <Brain className="h-7 w-7 text-primary-foreground" />
                </div>
                AI Video Pipeline
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Advanced content generation and social media trend analysis
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Total Projects', value: '24', change: '+2', icon: Video, color: 'text-blue-600' },
              { title: 'Processing Queue', value: '3', change: '-1', icon: Clock, color: 'text-orange-600' },
              { title: 'Trend Accuracy', value: '94.2%', change: '+5.2%', icon: Target, color: 'text-green-600' },
              { title: 'Engagement Rate', value: '8.9%', change: '+1.3%', icon: TrendingUp, color: 'text-purple-600' }
            ].map((stat, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    {stat.change.startsWith('+') ? (
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    {stat.change} from last week
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest updates from your AI pipeline</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {videoProjects.slice(0, 3).map((project) => (
                    <div key={project.id} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        {getTypeIcon(project.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{project.title}</p>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(project.status)}
                          <span className="text-xs text-muted-foreground">{project.duration}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{project.views?.toLocaleString() || 0} views</p>
                        <p className="text-xs text-muted-foreground">{project.engagement}% engagement</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Start new projects or manage existing ones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        New AI Video
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New AI Video</DialogTitle>
                        <DialogDescription>
                          Choose a template or start from scratch with our AI engine.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Button variant="outline" className="h-24 flex-col">
                            <Brain className="h-8 w-8 mb-2 text-primary" />
                            AI Generated
                          </Button>
                          <Button variant="outline" className="h-24 flex-col">
                            <Zap className="h-8 w-8 mb-2 text-orange-500" />
                            Template
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Content
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-processing">Auto Processing</Label>
                      <Switch id="auto-processing" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="trend-alerts">Trend Alerts</Label>
                      <Switch id="trend-alerts" defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators for your AI pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {analyticsData.map((metric, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{metric.metric}</span>
                        <Badge variant={metric.changeDirection === 'up' ? 'default' : 'secondary'}>
                          {metric.changeDirection === 'up' ? '+' : ''}{metric.change}%
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{metric.value}{metric.unit}</span>
                          <span className="text-muted-foreground">Target: {metric.target}{metric.unit}</span>
                        </div>
                        <Progress value={(metric.value / metric.target) * 100} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Video Projects</h2>
                <p className="text-muted-foreground">Manage and monitor your AI-generated content</p>
              </div>
              <div className="flex items-center space-x-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="group hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(project.type)}
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center justify-between">
                      {getStatusBadge(project.status)}
                      <span className="text-sm text-muted-foreground">{project.duration}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                      <Video className="h-12 w-12 text-muted-foreground" />
                      {project.status === 'processing' && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="bg-white/90 rounded-full p-2">
                            <Clock className="h-4 w-4 animate-spin" />
                          </div>
                        </div>
                      )}
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
                    
                    {project.status === 'completed' && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{project.views?.toLocaleString()}</div>
                          <div className="text-muted-foreground">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{project.engagement}%</div>
                          <div className="text-muted-foreground">Engagement</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Social Media Trends</h2>
                <p className="text-muted-foreground">Real-time trend analysis across platforms</p>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh Data
              </Button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {trendData.map((trend, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{trend.platform}</CardTitle>
                      </div>
                      <Badge variant={trend.growthDirection === 'up' ? 'default' : 'secondary'}>
                        {trend.growthDirection === 'up' ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {trend.growth}
                      </Badge>
                    </div>
                    <CardDescription>
                      <span className="font-medium">{trend.trend}</span> • {trend.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Engagement</span>
                        <span className="font-medium">{trend.engagement.toLocaleString()}</span>
                      </div>
                      <Progress value={Math.min((trend.engagement / 1500000) * 100, 100)} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Confidence Score</span>
                        <span className="font-medium">{trend.confidence}%</span>
                      </div>
                      <Progress value={trend.confidence} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>
                  Deep insights into your content performance and AI pipeline efficiency
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {analyticsData.map((metric, index) => (
                  <div key={index} className="space-y-4 p-4 rounded-lg border">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{metric.metric}</h3>
                      <Badge variant={metric.changeDirection === 'up' ? 'default' : 'secondary'}>
                        {metric.changeDirection === 'up' ? '+' : ''}{metric.change}%
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current: {metric.value}{metric.unit}</span>
                        <span className="text-muted-foreground">Target: {metric.target}{metric.unit}</span>
                      </div>
                      <Progress value={(metric.value / metric.target) * 100} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Configuration</CardTitle>
                <CardDescription>
                  Configure your AI video generation and trend monitoring settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">AI Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-generation">Auto Content Generation</Label>
                        <Switch id="auto-generation" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="quality-mode">High Quality Mode</Label>
                        <Switch id="quality-mode" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="trend-integration">Trend Integration</Label>
                        <Switch id="trend-integration" defaultChecked />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="processing-alerts">Processing Alerts</Label>
                        <Switch id="processing-alerts" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="trend-alerts">Trend Alerts</Label>
                        <Switch id="trend-alerts" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="performance-reports">Performance Reports</Label>
                        <Switch id="performance-reports" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Save Configuration</Button>
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

function AlertTriangle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  );
}

export default EnhancedDashboard;