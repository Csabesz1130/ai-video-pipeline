import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FileUpload } from './ui/file-upload';
import { JobManager } from './JobManager';
import { SettingsManager } from './SettingsManager';
import { Upload, Play, Settings, FileVideo, Sparkles, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { VideoConfig, VideoJob, apiService } from '../lib/api';

interface ProcessingStatus {
  isProcessing: boolean;
  progress: number;
  currentStep: string;
  jobId?: string;
}

export function VideoPipeline() {
  const [config, setConfig] = useState<VideoConfig>({
    platform: 'tiktok',
    duration: '60',
    style: 'trendy',
    language: 'english',
    quality: 'high'
  });

  const [status, setStatus] = useState<ProcessingStatus>({
    isProcessing: false,
    progress: 0,
    currentStep: ''
  });

  const [script, setScript] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentJob, setCurrentJob] = useState<VideoJob | null>(null);

  // Poll for job updates when processing
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (status.isProcessing && status.jobId) {
      interval = setInterval(async () => {
        try {
          const job = await apiService.mockGetVideoJob(status.jobId!);
          setCurrentJob(job);
          
          setStatus(prev => ({
            ...prev,
            progress: job.progress,
            currentStep: job.currentStep,
            isProcessing: job.status === 'pending' || job.status === 'processing'
          }));

          if (job.status === 'completed' || job.status === 'failed') {
            setStatus(prev => ({ ...prev, isProcessing: false }));
            if (interval) clearInterval(interval);
          }
        } catch (err) {
          console.error('Failed to update job status:', err);
        }
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status.isProcessing, status.jobId]);

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    setMessage(null);
  };

  const handleFileRemove = () => {
    setUploadedFile(null);
  };

  const handleGenerateVideo = async () => {
    if (!script.trim() && !uploadedFile) {
      setMessage({
        type: 'error',
        text: 'Please provide a script or upload a file'
      });
      return;
    }

    try {
      setMessage(null);
      setStatus({
        isProcessing: true,
        progress: 0,
        currentStep: 'Creating video job...'
      });

      // Create video job
      const videoConfig: VideoConfig = {
        ...config,
        script: script.trim() || undefined
      };

      const job = await apiService.mockCreateVideoJob(videoConfig, uploadedFile || undefined);
      setCurrentJob(job);
      
      setStatus({
        isProcessing: true,
        progress: 0,
        currentStep: 'Job created, starting processing...',
        jobId: job.id
      });

      setMessage({
        type: 'success',
        text: `Video job created successfully! Job ID: ${job.id}`
      });

    } catch (err) {
      setStatus({
        isProcessing: false,
        progress: 0,
        currentStep: ''
      });
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to create video job'
      });
    }
  };

  const downloadVideo = () => {
    if (currentJob?.outputUrl) {
      const link = document.createElement('a');
      link.href = currentJob.outputUrl;
      link.download = `video_${currentJob.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetForm = () => {
    setScript('');
    setUploadedFile(null);
    setStatus({
      isProcessing: false,
      progress: 0,
      currentStep: ''
    });
    setCurrentJob(null);
    setMessage(null);
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create">Create Video</TabsTrigger>
            <TabsTrigger value="jobs">My Jobs</TabsTrigger>
            <TabsTrigger value="upload">Upload Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            {message && (
              <Card className={`border-${message.type === 'error' ? 'destructive' : 'green-200'}`}>
                <CardContent className="p-4">
                  <div className={`flex items-center ${message.type === 'error' ? 'text-destructive' : 'text-green-600'}`}>
                    {message.type === 'error' ? (
                      <AlertCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    {message.text}
                  </div>
                </CardContent>
              </Card>
            )}

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

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quality</label>
                    <Select value={config.quality} onValueChange={(value: string) => setConfig(prev => ({ ...prev, quality: value }))}>
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
                    <FileUpload
                      onFileSelect={handleFileSelect}
                      onFileRemove={handleFileRemove}
                      acceptedTypes={['video/*', 'image/*', 'audio/*']}
                      maxSize={100}
                      disabled={status.isProcessing}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Generate Button */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Button 
                    onClick={handleGenerateVideo}
                    disabled={status.isProcessing}
                    className="flex-1 h-12 text-lg"
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
                  
                  {!status.isProcessing && (script || uploadedFile) && (
                    <Button 
                      onClick={resetForm}
                      variant="outline"
                      size="lg"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <JobManager />
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
                <FileUpload
                  onFileSelect={handleFileSelect}
                  onFileRemove={handleFileRemove}
                  acceptedTypes={['video/*']}
                  maxSize={500}
                  multiple={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsManager />
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
        {!status.isProcessing && currentJob?.status === 'completed' && (
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
                <Button className="flex-1" onClick={downloadVideo}>
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

        {/* Error Results */}
        {!status.isProcessing && currentJob?.status === 'failed' && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Video Generation Failed
              </CardTitle>
              <CardDescription>
                {currentJob.error || 'An error occurred during video generation'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button 
                  onClick={handleGenerateVideo}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Retry Generation
                </Button>
                <Button 
                  onClick={resetForm}
                  variant="outline" 
                  className="flex-1"
                >
                  Start Over
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}