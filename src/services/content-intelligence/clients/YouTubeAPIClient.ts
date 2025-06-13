import { google, youtube_v3 } from 'googleapis';
import { Logger } from '../../../utils/logger';
import { YouTubeVideoData, ContentCategory } from '../types';

/**
 * YouTube kategória ID-k mapping
 */
const CATEGORY_MAPPING: Record<ContentCategory, string> = {
  'finance': '22', // People & Blogs (nincs külön pénzügyi kategória)
  'business': '22', // People & Blogs
  'motivation': '22', // People & Blogs
  'top-lists': '24', // Entertainment
  'education': '27', // Education
  'technology': '28', // Science & Technology
  'lifestyle': '26', // Howto & Style
  'entertainment': '24' // Entertainment
};

export class YouTubeAPIClient {
  private youtube: youtube_v3.Youtube;
  private logger: Logger;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.logger = new Logger('YouTubeAPIClient');
    this.youtube = google.youtube({
      version: 'v3',
      auth: apiKey
    });
  }

  /**
   * Trending videók lekérése kategória szerint
   */
  async getTrendingVideos(
    category: ContentCategory, 
    regionCode: string = 'US',
    limit: number = 50
  ): Promise<YouTubeVideoData[]> {
    try {
      const categoryId = CATEGORY_MAPPING[category];
      
      const response = await this.youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        chart: 'mostPopular',
        regionCode,
        videoCategoryId: categoryId,
        maxResults: limit
      });

      if (!response.data.items) {
        return [];
      }

      return response.data.items.map(item => this.mapVideoData(item));
    } catch (error) {
      this.logger.error('Failed to fetch trending videos', { error, category });
      throw error;
    }
  }

  /**
   * Videók keresése kulcsszavak alapján
   */
  async searchVideos(
    query: string,
    options: {
      order?: 'relevance' | 'viewCount' | 'date' | 'rating';
      publishedAfter?: Date;
      regionCode?: string;
      maxResults?: number;
    } = {}
  ): Promise<YouTubeVideoData[]> {
    try {
      const searchResponse = await this.youtube.search.list({
        part: ['snippet'],
        q: query,
        type: ['video'],
        order: options.order || 'relevance',
        publishedAfter: options.publishedAfter?.toISOString(),
        regionCode: options.regionCode || 'US',
        maxResults: options.maxResults || 50
      });

      if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
        return [];
      }

      // Videó ID-k gyűjtése
      const videoIds = searchResponse.data.items
        .map(item => item.id?.videoId)
        .filter(Boolean) as string[];

      // Részletes videó adatok lekérése
      const videosResponse = await this.youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: videoIds
      });

      return videosResponse.data.items?.map(item => this.mapVideoData(item)) || [];
    } catch (error) {
      this.logger.error('Failed to search videos', { error, query });
      throw error;
    }
  }

  /**
   * Csatorna adatok lekérése
   */
  async getChannelDetails(channelId: string): Promise<{
    channelId: string;
    channelName: string;
    subscriberCount: number;
    videoCount: number;
    viewCount: number;
  }> {
    try {
      const response = await this.youtube.channels.list({
        part: ['snippet', 'statistics'],
        id: [channelId]
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error(`Channel not found: ${channelId}`);
      }

      const channel = response.data.items[0];
      
      return {
        channelId,
        channelName: channel.snippet?.title || '',
        subscriberCount: parseInt(channel.statistics?.subscriberCount || '0'),
        videoCount: parseInt(channel.statistics?.videoCount || '0'),
        viewCount: parseInt(channel.statistics?.viewCount || '0')
      };
    } catch (error) {
      this.logger.error('Failed to fetch channel details', { error, channelId });
      throw error;
    }
  }

  /**
   * Csatorna videóinak lekérése
   */
  async getChannelVideos(
    channelId: string,
    limit: number = 50
  ): Promise<YouTubeVideoData[]> {
    try {
      const searchResponse = await this.youtube.search.list({
        part: ['snippet'],
        channelId,
        type: ['video'],
        order: 'date',
        maxResults: limit
      });

      if (!searchResponse.data.items) {
        return [];
      }

      const videoIds = searchResponse.data.items
        .map(item => item.id?.videoId)
        .filter(Boolean) as string[];

      const videosResponse = await this.youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: videoIds
      });

      return videosResponse.data.items?.map(item => this.mapVideoData(item)) || [];
    } catch (error) {
      this.logger.error('Failed to fetch channel videos', { error, channelId });
      throw error;
    }
  }

  /**
   * Kapcsolódó videók keresése
   */
  async getRelatedVideos(videoId: string): Promise<YouTubeVideoData[]> {
    try {
      const response = await this.youtube.search.list({
        part: ['snippet'],
        relatedToVideoId: videoId,
        type: ['video'],
        maxResults: 25
      });

      if (!response.data.items) {
        return [];
      }

      const videoIds = response.data.items
        .map(item => item.id?.videoId)
        .filter(Boolean) as string[];

      const videosResponse = await this.youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: videoIds
      });

      return videosResponse.data.items?.map(item => this.mapVideoData(item)) || [];
    } catch (error) {
      this.logger.error('Failed to fetch related videos', { error, videoId });
      // A relatedToVideoId paraméter deprecated, ezért alternatív megoldás
      return [];
    }
  }

  /**
   * YouTube API videó adat konvertálása belső formátumra
   */
  private mapVideoData(video: youtube_v3.Schema$Video): YouTubeVideoData {
    return {
      videoId: video.id || '',
      title: video.snippet?.title || '',
      description: video.snippet?.description || '',
      publishedAt: new Date(video.snippet?.publishedAt || ''),
      channelId: video.snippet?.channelId || '',
      channelTitle: video.snippet?.channelTitle || '',
      tags: video.snippet?.tags || [],
      categoryId: video.snippet?.categoryId || '',
      viewCount: parseInt(video.statistics?.viewCount || '0'),
      likeCount: parseInt(video.statistics?.likeCount || '0'),
      commentCount: parseInt(video.statistics?.commentCount || '0'),
      duration: video.contentDetails?.duration || '',
      thumbnailUrl: video.snippet?.thumbnails?.high?.url || 
                    video.snippet?.thumbnails?.default?.url || ''
    };
  }
}