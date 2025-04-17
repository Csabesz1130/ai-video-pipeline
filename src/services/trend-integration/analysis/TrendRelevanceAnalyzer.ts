import { Trend, TrendAnalysis, TrendRelevanceAnalyzer as ITrendRelevanceAnalyzer } from '../types';
import { Logger } from '../../../utils/logger';
import { retryWithBackoff } from '../../../utils/retry';
import { getOpenAIClient } from '../../../config/services';

export class TrendRelevanceAnalyzer implements ITrendRelevanceAnalyzer {
  private readonly logger: Logger;
  private readonly openai;

  constructor() {
    this.logger = new Logger('TrendRelevanceAnalyzer');
    this.openai = getOpenAIClient();
  }

  public async analyzeTrendRelevance(
    trend: Trend,
    contentTopic: string
  ): Promise<TrendAnalysis> {
    return retryWithBackoff(async () => {
      this.logger.info('Analyzing trend relevance', { trend: trend.name, contentTopic });

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert in analyzing social media trends and their relevance to educational content.
            Analyze the trend and content topic, and provide a detailed analysis in the following JSON format:
            {
              "relevanceScore": number, // 0-1 score of how relevant the trend is to the content
              "longevityScore": number, // 0-1 score of how long the trend will remain relevant
              "growthPotential": number, // 0-1 score of the trend's growth potential
              "riskScore": number, // 0-1 score of potential risks (0 = safe, 1 = high risk)
              "integrationPoints": [{
                "timestamp": number,
                "confidence": number,
                "suggestedModifications": string[]
              }],
              "recommendations": {
                "scriptModifications": string[],
                "visualElements": string[],
                "sounds": string[],
                "hashtags": string[]
              }
            }`
          },
          {
            role: "user",
            content: `Trend: ${JSON.stringify(trend, null, 2)}
Content Topic: ${contentTopic}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");
      this.validateTrendAnalysis(analysis);
      return analysis;
    });
  }

  public async predictTrendLongevity(trend: Trend): Promise<number> {
    return retryWithBackoff(async () => {
      this.logger.info('Predicting trend longevity', { trend: trend.name });

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Predict how long this trend will remain relevant (0-1 score, where 1 means it will last a long time). Return only the number."
          },
          {
            role: "user",
            content: JSON.stringify(trend, null, 2)
          }
        ]
      });

      const score = parseFloat(response.choices[0].message.content || "0");
      return Math.min(Math.max(score, 0), 1);
    });
  }

  public async identifyIntegrationPoints(
    trend: Trend,
    content: string
  ): Promise<number[]> {
    return retryWithBackoff(async () => {
      this.logger.info('Identifying integration points', { trend: trend.name });

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Identify timestamps (in seconds) where the trend could be naturally integrated into the content. Return a JSON array of numbers."
          },
          {
            role: "user",
            content: `Trend: ${JSON.stringify(trend, null, 2)}
Content: ${content}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const timestamps = JSON.parse(response.choices[0].message.content || "[]");
      this.validateTimestamps(timestamps);
      return timestamps;
    });
  }

  public async filterTrends(
    trends: Trend[],
    contentTopic: string
  ): Promise<Trend[]> {
    return retryWithBackoff(async () => {
      this.logger.info('Filtering trends', { contentTopic, trendCount: trends.length });

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Filter out trends that are not relevant or appropriate for the content topic.
            Return a JSON array of the filtered trends.`
          },
          {
            role: "user",
            content: `Trends: ${JSON.stringify(trends, null, 2)}
Content Topic: ${contentTopic}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const filteredTrends = JSON.parse(response.choices[0].message.content || "[]");
      this.validateTrends(filteredTrends);
      return filteredTrends;
    });
  }

  private validateTrendAnalysis(analysis: any): asserts analysis is TrendAnalysis {
    // Implementation would validate the structure and types
  }

  private validateTimestamps(timestamps: any): asserts timestamps is number[] {
    // Implementation would validate the structure and types
  }

  private validateTrends(trends: any): asserts trends is Trend[] {
    // Implementation would validate the structure and types
  }
} 