import { getOpenAIClient } from '../../config/services';
import { Logger } from '../../utils/logger';
import { retryWithBackoff } from '../../utils/retry.js';

// Types for script generation
interface ScriptSection {
  section_title: string;
  content: string;
  retention_hook: string;
  visual_cues: string[];
  timing: number;
}

interface ScriptMetadata {
  estimated_length: number;
  reading_pace: number;
  retention_score: number;
  seo_keywords: string[];
  emotional_tone: string;
}

interface YouTubeScript {
  script: {
    title: string;
    hook: string;
    preview: string;
    main_sections: ScriptSection[];
    conclusion: string;
    call_to_action: string;
  };
  metadata: ScriptMetadata;
  optimization_notes: string[];
}

/**
 * YouTube Script Generator Service
 * 
 * This service is responsible for generating optimized YouTube scripts
 * with focus on viewer retention and engagement. It uses AI to create
 * compelling content structures and includes visual elements.
 */
export class YouTubeScriptGenerator {
  private readonly logger: Logger;
  private readonly openai;

  constructor() {
    this.logger = new Logger('YouTubeScriptGenerator');
    this.openai = getOpenAIClient();
  }

  /**
   * Generates an optimized YouTube script based on content and niche
   * 
   * @param topic - The main topic of the video
   * @param niche - The content niche (finance, motivation, etc.)
   * @param targetAudience - Description of the target audience
   * @param keywords - SEO keywords to include naturally
   * @returns A complete YouTube script with metadata and optimization notes
   */
  async generateScript(
    topic: string,
    niche: 'finance' | 'motivation' | 'top_lists' | 'education',
    targetAudience: string,
    keywords: string[]
  ): Promise<YouTubeScript> {
    try {
      this.logger.info('Starting script generation', { topic, niche, targetAudience });

      // Generate initial script structure
      const script = await this.createScriptStructure(topic, niche, targetAudience, keywords);
      
      // Optimize for retention and engagement
      const optimizedScript = await this.optimizeForRetention(script);
      
      // Add visual cues and timing
      const finalScript = await this.addVisualElements(optimizedScript);
      
      // Calculate metadata and optimization notes
      const metadata = await this.calculateMetadata(finalScript);
      const optimizationNotes = await this.generateOptimizationNotes(finalScript, metadata);

      return {
        script: finalScript,
        metadata,
        optimization_notes: optimizationNotes
      };
    } catch (error) {
      this.logger.error('Failed to generate script', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Creates the initial script structure based on niche and topic
   * 
   * @param topic - The main topic of the video
   * @param niche - The content niche
   * @param targetAudience - Description of the target audience
   * @param keywords - SEO keywords to include
   * @returns The initial script structure
   */
  private async createScriptStructure(
    topic: string,
    niche: string,
    targetAudience: string,
    keywords: string[]
  ): Promise<YouTubeScript['script']> {
    return retryWithBackoff(async () => {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert YouTube script writer specializing in ${niche} content.
            Create an engaging script following this structure:
            1. Hook (0-15s): Attention-grabbing opener
            2. Preview (15-30s): Content overview
            3. Main sections with retention hooks
            4. Conclusion with call-to-action
            
            Optimize for ${targetAudience} and include these keywords naturally: ${keywords.join(', ')}`
          },
          {
            role: "user",
            content: `Generate a script about: ${topic}`
          }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    });
  }

  /**
   * Optimizes script for viewer retention
   * 
   * @param script - The initial script structure
   * @returns Optimized script with retention hooks
   */
  private async optimizeForRetention(script: YouTubeScript['script']): Promise<YouTubeScript['script']> {
    return retryWithBackoff(async () => {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Optimize this script for maximum viewer retention by:\n" +
                    "1. Adding retention hooks every 30-45 seconds\n" +
                    "2. Strengthening the opening hook\n" +
                    "3. Creating suspense and curiosity\n" +
                    "4. Improving transitions between sections"
          },
          {
            role: "user",
            content: JSON.stringify(script, null, 2)
          }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    });
  }

  /**
   * Adds visual cues and timing to the script
   * 
   * @param script - The optimized script
   * @returns Script with visual elements and timing
   */
  private async addVisualElements(script: YouTubeScript['script']): Promise<YouTubeScript['script']> {
    return retryWithBackoff(async () => {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Add visual cues and timing to this script, including:\n" +
                    "1. Text overlays\n" +
                    "2. B-roll suggestions\n" +
                    "3. Graphics and animations\n" +
                    "4. Timing for each section"
          },
          {
            role: "user",
            content: JSON.stringify(script, null, 2)
          }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    });
  }

  /**
   * Calculates script metadata
   * 
   * @param script - The complete script
   * @returns Metadata including length, pace, and retention score
   */
  private async calculateMetadata(script: YouTubeScript['script']): Promise<ScriptMetadata> {
    return retryWithBackoff(async () => {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Calculate metadata for this script including:\n" +
                    "1. Estimated length\n" +
                    "2. Reading pace\n" +
                    "3. Retention score\n" +
                    "4. SEO keywords\n" +
                    "5. Emotional tone"
          },
          {
            role: "user",
            content: JSON.stringify(script, null, 2)
          }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    });
  }

  /**
   * Generates optimization notes for the script
   * 
   * @param script - The complete script
   * @param metadata - The script metadata
   * @returns Array of optimization suggestions
   */
  private async generateOptimizationNotes(
    script: YouTubeScript['script'],
    metadata: ScriptMetadata
  ): Promise<string[]> {
    return retryWithBackoff(async () => {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Generate optimization notes for this script, focusing on:\n" +
                    "1. Retention improvements\n" +
                    "2. SEO optimization\n" +
                    "3. Engagement opportunities\n" +
                    "4. Technical suggestions"
          },
          {
            role: "user",
            content: `Script: ${JSON.stringify(script, null, 2)}\nMetadata: ${JSON.stringify(metadata, null, 2)}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const notes = JSON.parse(response.choices[0].message.content || "[]");
      return Array.isArray(notes) ? notes : [notes];
    });
  }
} 