export interface ContentOpportunity {
  topic: string;
  trendScore: number; // 1-100
  competitionLevel: 'low' | 'medium' | 'high';
  estimatedViews: number;
  targetKeywords: string[];
  optimalTiming: Date;
  contentAngle: string;
  audienceDemographics: {
    ageRange: string[];
    interests: string[];
    geoLocations?: string[];
  };
  monetizationPotential: number; // 1-100
}

export interface MarketInsight {
  category: string;
  insight: string;
  confidence: number; // 0-1
  dataPoints: string[];
}

export interface TrendingVideo {
  id: string;
  title: string;
  channelId: string;
  channelName: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: Date;
  tags?: string[];
  categoryId?: string;
  duration?: string;
}

export interface GoogleTrendData {
  keyword: string;
  currentInterest: number;
  previousInterest: number;
  growthRate: number;
  relatedQueries: string[];
  risingQueries: string[];
  seasonalPattern?: boolean;
}

export interface CompetitorChannel {
  channelId: string;
  channelName: string;
  subscriberCount: number;
  totalViews: number;
  averageViewsPerVideo: number;
  uploadFrequency: number; // videos per week
  topPerformingTopics: string[];
  contentStrategy: {
    primaryFormat: string;
    averageDuration: number;
    postingSchedule: string[];
  };
}

export interface CompetitorAnalysis {
  channels: CompetitorChannel[];
  contentGaps: string[];
  performancePatterns: {
    topFormats: string[];
    optimalLength: number;
    bestPostingTimes: string[];
    successfulHooks: string[];
  };
}

export interface EnrichedData {
  trendingVideos: TrendingVideo[];
  googleTrends: GoogleTrendData[];
  competitorData: CompetitorAnalysis | null;
  contentGaps: string[];
  performancePatterns: {
    topFormats: string[];
    viralFactors: string[];
  };
}

export interface YouTubeTrendsQuery {
  categories: string[];
  region: string;
  maxResults: number;
}

export interface GoogleTrendsQuery {
  keywords: string[];
  timeRange: string;
  compareWithLastPeriod: boolean;
}

export interface CompetitorQuery {
  channelIds: string[];
  analyzeLastNVideos: number;
}

export interface CrossReferenceInput {
  trendingVideos: TrendingVideo[];
  googleTrends: GoogleTrendData[];
  competitorData: CompetitorAnalysis | null;
  targetAudience: {
    demographics: string[];
    interests: string[];
  };
}

export interface GenerateOpportunitiesInput {
  enrichedData: EnrichedData;
  focusOnFaceless: boolean;
  minimumScore: number;
}