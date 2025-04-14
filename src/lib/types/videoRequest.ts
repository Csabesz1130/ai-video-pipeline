export interface VideoGenerationRequest {
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

export interface VideoGenerationResult {
  videoId: string;
  videoUrl: string;
  thumbnailUrl: string;
  platform: string;
  generationStats: {
    executionTime: number;
    scriptTokens: number;
    visualAssetCount: number;
  };
}
