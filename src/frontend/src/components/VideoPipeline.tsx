import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Upload, Play, Settings, FileVideo, Sparkles, Download } from 'lucide-react';

interface VideoConfig {
  platform: string;
  duration: string;
  style: string;
  language: string;
}

interface ProcessingStatus {
  isProcessing: boolean;
  progress: number;
  currentStep: string;
}

export function VideoPipeline() {
  const [config, setConfig] = useState<VideoConfig>({
    platform: 'tiktok',
    duration: '60',
    style: 'trendy',
    language: 'english'
  });

  const [status, setStatus] = useState<ProcessingStatus>({
    isProcessing: false,
    progress: 0,
    currentStep: ''
  });

  const [script, setScript] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleGenerateVideo = async () => {
    setStatus({
      isProcessing: true,
      progress: 0,
      currentStep: 'Initializing video generation...'
    });

    // Simulate processing steps
    const steps = [
      'Analyzing content...',
      'Generating script...',
      'Creating video scenes...',
      'Adding effects and transitions...',
      'Rendering final video...',
      'Optimizing for platform...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus(prev => ({
        ...prev,
        progress: ((i + 1) / steps.length) * 100,
        currentStep: steps[i]
      }));
    }

    setStatus(prev => ({
      ...prev,
      isProcessing: false,
      currentStep: 'Video generation complete!'
    }));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Video Pipeline
          </h1>
          <p className="text-muted-foreground text-lg">
            Create engaging social media videos with AI-powered automation
          </p>
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create Video</TabsTrigger>
            <TabsTrigger value="upload">Upload Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configuration Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Video Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your video settings and target platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Platform</label>
                    <Select value={config.platform} onValueChange={(value: string) => setConfig(prev => ({ ...prev, platform: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="youtube">YouTube Shorts</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration (seconds)</label>
                    <Select value={config.duration} onValueChange={(value: string) => setConfig(prev => ({ ...prev, duration: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">60 seconds</SelectItem>
                        <SelectItem value="90">90 seconds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Style</label>
                    <Select value={config.style} onValueChange={(value: string) => setConfig(prev => ({ ...prev, style: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trendy">Trendy & Modern</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual & Fun</SelectItem>
                        <SelectItem value="educational">Educational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Language</label>
                    <Select value={config.language} onValueChange={(value: string) => setConfig(prev => ({ ...prev, language: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Content Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileVideo className="h-5 w-5" />
                    Content Input
                  </CardTitle>
                  <CardDescription>
                    Provide your content or let AI generate it for you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Script or Topic</label>
                    <Textarea
                      placeholder="Enter your script, topic, or let AI generate content for you..."
                      value={script}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setScript(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Upload Media (Optional)</label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Drop your video, image, or audio files here
                      </p>
                      <Input
                        type="file"
                        accept="video/*,image/*,audio/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button variant="outline" asChild>
                        <label htmlFor="file-upload">
                          Choose Files
                        </label>
                      </Button>
                    </div>
                    {uploadedFile && (
                      <p className="text-sm text-muted-foreground">
                        Uploaded: {uploadedFile.name}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Generate Button */}
            <Card>
              <CardContent className="pt-6">
                <Button 
                  onClick={handleGenerateVideo}
                  disabled={status.isProcessing}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {status.isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Generate Video
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Existing Content</CardTitle>
                <CardDescription>
                  Upload your existing videos for AI enhancement and optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Upload your video</h3>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop your video files here or click to browse
                  </p>
                  <Button variant="outline">
                    Choose Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Settings</CardTitle>
                <CardDescription>
                  Configure your AI video pipeline preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">API Key</label>
                  <Input type="password" placeholder="Enter your API key" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Output Quality</label>
                  <Select defaultValue="high">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Fast)</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High (Slow)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="w-full">
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Processing Status */}
        {status.isProcessing && (
          <Card>
            <CardHeader>
              <CardTitle>Processing Video</CardTitle>
              <CardDescription>{status.currentStep}</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={status.progress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">
                {Math.round(status.progress)}% complete
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {!status.isProcessing && status.progress === 100 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Video Ready!
              </CardTitle>
              <CardDescription>
                Your AI-generated video is ready for download
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download Video
                </Button>
                <Button variant="outline" className="flex-1">
                  Share to Platform
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}