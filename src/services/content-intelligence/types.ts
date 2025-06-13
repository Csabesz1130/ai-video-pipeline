/**
 * Content Intelligence Agent típusdefiníciók
 * AI-alapú YouTube tartalmi elemzés és lehetőség azonosítás
 */

/**
 * Verseny szintje a témában
 */
export type CompetitionLevel = 'low' | 'medium' | 'high';

/**
 * Tartalom kategóriák
 */
export type ContentCategory = 
  | 'finance' 
  | 'business' 
  | 'motivation' 
  | 'top-lists' 
  | 'education'
  | 'technology'
  | 'lifestyle'
  | 'entertainment';

/**
 * Célközönség demográfiai adatok
 */
export interface AudienceDemographics {
  ageRange: {
    min: number;
    max: number;
  };
  gender: {
    male: number;
    female: number;
    other: number;
  };
  geographicDistribution: Record<string, number>;
  interests: string[];
  deviceUsage: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
}

/**
 * Tartalmi lehetőség
 */
export interface ContentOpportunity {
  /**
   * Téma neve
   */
  topic: string;

  /**
   * Trend pontszám (1-100)
   */
  trendScore: number;

  /**
   * Verseny szintje
   */
  competitionLevel: CompetitionLevel;

  /**
   * Becsült nézettség
   */
  estimatedViews: number;

  /**
   * Cél kulcsszavak
   */
  targetKeywords: string[];

  /**
   * Optimális időzítés
   */
  optimalTiming: Date;

  /**
   * Tartalom megközelítési szög
   */
  contentAngle: string;

  /**
   * Célközönség demográfiai adatok
   */
  audienceDemographics: AudienceDemographics;

  /**
   * Monetizációs potenciál (1-100)
   */
  monetizationPotential: number;

  /**
   * Kategória
   */
  category: ContentCategory;
}

/**
 * Piaci elemzés
 */
export interface MarketInsights {
  /**
   * Általános piaci trend
   */
  overallTrend: string;

  /**
   * Feltörekvő témák
   */
  emergingTopics: string[];

  /**
   * Telítődő témák
   */
  saturatedTopics: string[];

  /**
   * Szezonális hatások
   */
  seasonalFactors: string[];

  /**
   * Algoritmus változások
   */
  algorithmChanges: string[];
}

/**
 * Content Intelligence válasz formátum
 */
export interface ContentIntelligenceResponse {
  /**
   * Azonosított tartalmi lehetőségek
   */
  contentOpportunities: ContentOpportunity[];

  /**
   * Piaci elemzések
   */
  marketInsights: MarketInsights;

  /**
   * Javasolt lépések
   */
  recommendedActions: string[];

  /**
   * Generálás időpontja
   */
  generatedAt: Date;
}

/**
 * YouTube videó adatok
 */
export interface YouTubeVideoData {
  videoId: string;
  title: string;
  description: string;
  publishedAt: Date;
  channelId: string;
  channelTitle: string;
  tags: string[];
  categoryId: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
  thumbnailUrl: string;
}

/**
 * Versenytárs csatorna adatok
 */
export interface CompetitorChannel {
  channelId: string;
  channelName: string;
  subscriberCount: number;
  videoCount: number;
  averageViews: number;
  contentFrequency: number; // videók száma per hét
  topPerformingVideos: YouTubeVideoData[];
  contentPatterns: string[];
}

/**
 * Google Trends adat
 */
export interface GoogleTrendsData {
  keyword: string;
  interest: number; // 0-100
  relatedQueries: string[];
  relatedTopics: string[];
  geoDistribution: Record<string, number>;
  timelineData: {
    date: Date;
    value: number;
  }[];
}

/**
 * Tartalom elemzési konfiguráció
 */
export interface ContentAnalysisConfig {
  /**
   * Elemzendő kategóriák
   */
  categories: ContentCategory[];

  /**
   * Minimum trend pontszám
   */
  minTrendScore: number;

  /**
   * Maximum verseny szint
   */
  maxCompetitionLevel: CompetitionLevel;

  /**
   * Időablak napokban
   */
  timeWindowDays: number;

  /**
   * Nyelv
   */
  language: string;

  /**
   * Régió
   */
  region: string;

  /**
   * Versenytárs csatornák
   */
  competitorChannels: string[];

  /**
   * Kulcsszó lista
   */
  seedKeywords: string[];
}

/**
 * Content Intelligence Agent interfész
 */
export interface ContentIntelligenceAgent {
  /**
   * Tartalmi lehetőségek elemzése
   */
  analyzeContentOpportunities(config: ContentAnalysisConfig): Promise<ContentIntelligenceResponse>;

  /**
   * Trending témák lekérése
   */
  getTrendingTopics(category: ContentCategory, limit?: number): Promise<YouTubeVideoData[]>;

  /**
   * Versenytárs elemzés
   */
  analyzeCompetitors(channelIds: string[]): Promise<CompetitorChannel[]>;

  /**
   * Kulcsszó elemzés
   */
  analyzeKeywords(keywords: string[]): Promise<GoogleTrendsData[]>;

  /**
   * Tartalmi rés azonosítás
   */
  identifyContentGaps(competitorChannels: string[], category: ContentCategory): Promise<string[]>;

  /**
   * Pontszámítás tartalmi ötlethez
   */
  scoreContentIdea(topic: string, keywords: string[]): Promise<ContentOpportunity>;
}