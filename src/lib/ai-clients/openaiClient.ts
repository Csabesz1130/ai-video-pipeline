import { OpenAI } from 'openai';
import { getOpenAIClient } from '../../config/services';

/**
 * Helper for interacting with OpenAI API
 */
export class OpenAIHelper {
  private client: OpenAI;
  
  constructor() {
    this.client = getOpenAIClient();
  }
  
  /**
   * Analyzes trends for a specific topic and platform
   */
  async analyzeTrendsForContent(topic: string, platforms: string[]) {
    // Analyze current trending content on  related to .
    // 1. Popular hashtags and keywords
    // 2. Trending formats and styles
    // 3. Key audience demographics engaging with this content
    // 4. Hook styles that are performing well
    // 5. Optimal content length and pacing for each platform
    // Provide a structured analysis that can inform content creation.
    
    // const prompt = 
    //   Analyze current trending content on  related to .
    //   1. Popular hashtags and keywords
    //   2. Trending formats and styles
    //   3. Key audience demographics engaging with this content
    //   4. Hook styles that are performing well
    //   5. Optimal content length and pacing for each platform
    //   Provide a structured analysis that can inform content creation.
    // ;
    
    const response = await this.client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert in social media trends and content strategy."
        },
        // {
        //   role: "user",
        //   content: prompt
        // }
      ]
    });
    
    return response.choices[0].message.content;
  }
  
  /**
   * Generates a script for a short-form video
   */
  async generateOptimizedScript(brief: any, platform: string) {
    const hookTemplates = {
      'tiktok': ['question', 'surprise_fact', 'challenge', 'controversial_statement'],
      'reels': ['visual_hook', 'trending_sound_integration', 'curiosity_gap'],
      'shorts': ['value_proposition', 'problem_solution', 'tutorial_preview']
    };
    
    // Select appropriate hook types for the platform
    const platformHooks = hookTemplates[platform as keyof typeof hookTemplates] || hookTemplates.tiktok;
    const selectedHooks = [platformHooks[0], platformHooks[1]];
    
    const prompt = "Create a short-form video script for TikTok about [TOPIC]. Target audience: [AUDIENCE]. Style: [STYLE]. Hook type: question (primary), surprise_fact (secondary). The script should: 1. Open with an extremely engaging hook (first 3 seconds) 2. Deliver key message clearly and concisely 3. Include appropriate pacing for TikTok 4. End with a strong call to action. Format the script with timing guidance and visual cues.";
    
    const response = await this.client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert scriptwriter for short-form social media videos."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });
    
    return response.choices[0].message.content;
  }
}
