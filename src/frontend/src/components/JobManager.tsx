import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  Play, 
  Pause, 
  Trash2, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { VideoJob, apiService } from '../lib/api';

interface JobManagerProps {
  className?: string;
}

const getStatusIcon = (status: VideoJob['status']) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'processing':
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'failed':
      return <XCircle className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const getStatusColor = (status: VideoJob['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'processing':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

export function JobManager({ className }: JobManagerProps) {
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Load jobs on component mount
  useEffect(() => {
    loadJobs();
  }, []);

  // Set up polling for active jobs
  useEffect(() => {
    const hasActiveJobs = jobs.some(job => job.status === 'pending' || job.status === 'processing');
    
    if (hasActiveJobs) {
      const interval = setInterval(() => {
        updateActiveJobs();
      }, 2000); // Poll every 2 seconds
      
      setPollingInterval(interval);
      
      return () => {
        clearInterval(interval);
        setPollingInterval(null);
      };
    } else if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [jobs]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use mock API for now
      const mockJobs: VideoJob[] = [
        {
          id: 'job_1',
          status: 'completed',
          progress: 100,
          currentStep: 'Video generation complete!',
          config: {
            platform: 'tiktok',
            duration: '60',
            style: 'trendy',
            language: 'english',
          },
          outputUrl: 'https://example.com/video1.mp4',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'job_2',
          status: 'processing',
          progress: 65,
          currentStep: 'Adding effects and transitions...',
          config: {
            platform: 'instagram',
            duration: '30',
            style: 'professional',
            language: 'english',
          },
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'job_3',
          status: 'failed',
          progress: 0,
          currentStep: 'Failed to process video',
          config: {
            platform: 'youtube',
            duration: '90',
            style: 'educational',
            language: 'english',
          },
          error: 'Invalid input file format',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
      
      setJobs(mockJobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const updateActiveJobs = async () => {
    try {
      const activeJobs = jobs.filter(job => job.status === 'pending' || job.status === 'processing');
      
      const updatedJobs = await Promise.all(
        activeJobs.map(async (job) => {
          try {
            const updatedJob = await apiService.mockGetVideoJob(job.id);
            return updatedJob;
          } catch (err) {
            console.error(`Failed to update job ${job.id}:`, err);
            return job;
          }
        })
      );

      setJobs(prevJobs => 
        prevJobs.map(job => {
          const updatedJob = updatedJobs.find(u => u.id === job.id);
          return updatedJob || job;
        })
      );
    } catch (err) {
      console.error('Failed to update active jobs:', err);
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      await apiService.deleteVideoJob(jobId);
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job');
    }
  };

  const downloadVideo = (job: VideoJob) => {
    if (job.outputUrl) {
      const link = document.createElement('a');
      link.href = job.outputUrl;
      link.download = `video_${job.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const retryJob = async (jobId: string) => {
    try {
      const job = jobs.find(j => j.id === jobId);
      if (!job) return;

      const newJob = await apiService.mockCreateVideoJob(job.config);
      setJobs(prevJobs => [
        newJob,
        ...prevJobs.filter(j => j.id !== jobId)
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry job');
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading jobs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Video Jobs</h2>
          <p className="text-muted-foreground">
            Manage your video generation jobs
          </p>
        </div>
        <Button onClick={loadJobs} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center text-destructive">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No jobs yet</h3>
              <p>Create your first video to get started</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <CardTitle className="text-lg">
                        Video for {job.config.platform}
                      </CardTitle>
                      <CardDescription>
                        {job.config.style} • {job.config.duration}s • {job.config.language}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(job.status)}>
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress */}
                  {(job.status === 'pending' || job.status === 'processing') && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{job.currentStep}</span>
                        <span>{Math.round(job.progress)}%</span>
                      </div>
                      <Progress value={job.progress} />
                    </div>
                  )}

                  {/* Error */}
                  {job.status === 'failed' && job.error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <div className="flex items-center text-destructive">
                        <XCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm">{job.error}</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Created: {formatDate(job.createdAt)}
                    </div>
                    <div className="flex items-center space-x-2">
                      {job.status === 'completed' && job.outputUrl && (
                        <Button
                          size="sm"
                          onClick={() => downloadVideo(job)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                      
                      {job.status === 'failed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retryJob(job.id)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retry
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteJob(job.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}