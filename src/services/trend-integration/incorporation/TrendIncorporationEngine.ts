import { Trend, TrendIncorporationEngine as ITrendIncorporationEngine } from '../types';
import { Logger } from '../../../utils/logger';
import { retryWithBackoff } from '../../../utils/retry';
import { getOpenAIClient } from '../../../config/services';

export class TrendIncorporationEngine implements ITrendIncorporationEngine {
  private readonly logger: Logger;
  private readonly openai;

  constructor() {
    this.logger = new Logger('TrendIncorporationEngine');
    this.openai = getOpenAIClient();
  }

  public async generateScriptModifications(
    script: string,
    trend: Trend
  ): Promise<string> {
    return retryWithBackoff(async () => {
      this.logger.info('Generating script modifications', { trend: trend.name });

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert in incorporating social media trends into educational content.
            Modify the script to naturally incorporate the trend while maintaining educational value.
            Return the modified script.`
          },
          {
            role: "user",
            content: `Script: ${script}
Trend: ${JSON.stringify(trend, null, 2)}`
          }
        ]
      });

      return response.choices[0].message.content || script;
    });
  }

  public async createVisualElements(
    trend: Trend,
    content: string
  ): Promise<string[]> {
    return retryWithBackoff(async () => {
      this.logger.info('Creating visual elements', { trend: trend.name });

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Create visual elements that align with the trend while maintaining educational integrity.
            Return a JSON array of visual element descriptions.`
          },
          {
            role: "user",
            content: `Trend: ${JSON.stringify(trend, null, 2)}
Content: ${content}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const elements = JSON.parse(response.choices[0].message.content || "[]");
      this.validateVisualElements(elements);
      return elements;
    });
  }

  public async suggestSounds(
    trend: Trend,
    content: string
  ): Promise<string[]> {
    return retryWithBackoff(async () => {
      this.logger.info('Suggesting sounds', { trend: trend.name });

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Suggest trending sounds or music that would enhance the educational content.
            Return a JSON array of sound descriptions or identifiers.`
          },
          {
            role: "user",
            content: `Trend: ${JSON.stringify(trend, null, 2)}
Content: ${content}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const sounds = JSON.parse(response.choices[0].message.content || "[]");
      this.validateSounds(sounds);
      return sounds;
    });
  }

  public async recommendHashtags(
    trend: Trend,
    content: string
  ): Promise<string[]> {
    return retryWithBackoff(async () => {
      this.logger.info('Recommending hashtags', { trend: trend.name });

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Recommend trending hashtags that are relevant to both the trend and educational content.
            Return a JSON array of hashtags.`
          },
          {
            role: "user",
            content: `Trend: ${JSON.stringify(trend, null, 2)}
Content: ${content}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const hashtags = JSON.parse(response.choices[0].message.content || "[]");
      this.validateHashtags(hashtags);
      return hashtags;
    });
  }

  private validateVisualElements(elements: any): asserts elements is string[] {
    // Implementation would validate the structure and types
  }

  private validateSounds(sounds: any): asserts sounds is string[] {
    // Implementation would validate the structure and types
  }

  private validateHashtags(hashtags: any): asserts hashtags is string[] {
    // Implementation would validate the structure and types
  }
} 