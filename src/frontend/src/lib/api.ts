export interface VideoConfig {
  platform: string;
  duration: string;
  style: string;
  language: string;
  script?: string;
  quality?: string;
}

export interface VideoJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  config: VideoConfig;
  outputUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  apiKey?: string;
  outputQuality: string;
  defaultPlatform: string;
  defaultLanguage: string;
}

class ApiService {
  private baseUrl = '/api';

  // Video Generation
  async createVideoJob(config: VideoConfig, file?: File): Promise<VideoJob> {
    const formData = new FormData();
    formData.append('config', JSON.stringify(config));
    
    if (file) {
      formData.append('file', file);
    }

    const response = await fetch(`${this.baseUrl}/videos`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to create video job: ${response.statusText}`);
    }

    return response.json();
  }

  async getVideoJob(jobId: string): Promise<VideoJob> {
    const response = await fetch(`${this.baseUrl}/videos/${jobId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get video job: ${response.statusText}`);
    }

    return response.json();
  }

  async listVideoJobs(): Promise<VideoJob[]> {
    const response = await fetch(`${this.baseUrl}/videos`);
    
    if (!response.ok) {
      throw new Error(`Failed to list video jobs: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteVideoJob(jobId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/videos/${jobId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete video job: ${response.statusText}`);
    }
  }

  // File Upload
  async uploadFile(file: File, type: 'video' | 'image' | 'audio'): Promise<{ url: string; id: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }

    return response.json();
  }

  // User Settings
  async getUserSettings(): Promise<UserSettings> {
    const response = await fetch(`${this.baseUrl}/settings`);
    
    if (!response.ok) {
      throw new Error(`Failed to get user settings: ${response.statusText}`);
    }

    return response.json();
  }

  async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const response = await fetch(`${this.baseUrl}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user settings: ${response.statusText}`);
    }

    return response.json();
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; version: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Mock API for development/testing
  async mockCreateVideoJob(config: VideoConfig, file?: File): Promise<VideoJob> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: jobId,
      status: 'pending',
      progress: 0,
      currentStep: 'Initializing...',
      config,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async mockGetVideoJob(jobId: string): Promise<VideoJob> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate progress updates
    const progress = Math.min(100, Math.floor(Math.random() * 100));
    const status = progress === 100 ? 'completed' : 'processing';
    
    const steps = [
      'Analyzing content...',
      'Generating script...',
      'Creating video scenes...',
      'Adding effects and transitions...',
      'Rendering final video...',
      'Optimizing for platform...',
      'Video generation complete!'
    ];

    const currentStep = progress === 100 ? steps[steps.length - 1] : steps[Math.floor(progress / 20)];

    return {
      id: jobId,
      status,
      progress,
      currentStep,
      config: {
        platform: 'tiktok',
        duration: '60',
        style: 'trendy',
        language: 'english',
      },
      outputUrl: status === 'completed' ? 'https://example.com/video.mp4' : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export const apiService = new ApiService();