export interface ScriptRequest {
  topic: string;
  niche: 'finance' | 'motivation' | 'top_lists' | 'education';
  targetAudience: string;
  keywords: string[];
}

export interface ScriptSection {
  section_title: string;
  content: string;
  retention_hook: string;
}

export interface GeneratedScript {
  title: string;
  hook: string;
  preview: string;
  main_sections: ScriptSection[];
  conclusion: string;
  call_to_action: string;
}

export interface ScriptResponse {
  script: GeneratedScript;
  metadata: {
    estimated_duration: string;
    target_retention_rate: string;
    seo_score: number;
  };
}

export class YouTubeScriptGenerator {
  async generateScript(
    topic: string,
    niche: 'finance' | 'motivation' | 'top_lists' | 'education',
    targetAudience: string,
    keywords: string[]
  ): Promise<ScriptResponse> {
    // Simulált script generálás - később ezt AI API-val lehet helyettesíteni
    const mockScript: GeneratedScript = {
      title: `Ultimate Guide to ${topic} - ${this.getNicheTitle(niche)}`,
      hook: `"What if I told you that ${topic} could completely change your life? In this video, I'm revealing the ${niche === 'top_lists' ? 'top 10' : 'secrets'} that ${targetAudience} need to know right now!"`,
      preview: `Today we're diving deep into ${topic}. Whether you're a beginner or expert, this comprehensive guide will give you everything you need to succeed.`,
      main_sections: [
        {
          section_title: "Introduction to the Topic",
          content: `Let's start by understanding what ${topic} really means and why it's so important for ${targetAudience}. This foundational knowledge will set you up for success.`,
          retention_hook: "But here's the thing most people get wrong..."
        },
        {
          section_title: "Key Principles and Strategies",
          content: `Now let's explore the core principles that make ${topic} work. These strategies have been proven effective across different scenarios and audiences.`,
          retention_hook: "And the most powerful strategy of all is..."
        },
        {
          section_title: "Common Mistakes to Avoid",
          content: `Before we move forward, let's talk about the biggest mistakes people make with ${topic}. Avoiding these pitfalls will save you time and frustration.`,
          retention_hook: "This next mistake is what holds back 90% of people..."
        },
        {
          section_title: "Advanced Techniques",
          content: `For those ready to take it to the next level, here are some advanced techniques that will give you a competitive edge in ${topic}.`,
          retention_hook: "This technique alone can double your results..."
        }
      ],
      conclusion: `We've covered a lot today about ${topic}. Remember, success comes from consistent application of these principles.`,
      call_to_action: `If you found this video helpful, make sure to like, subscribe, and hit the notification bell. Drop a comment below with your biggest takeaway from this video!`
    };

    return {
      script: mockScript,
      metadata: {
        estimated_duration: "8-12 minutes",
        target_retention_rate: "75-85%",
        seo_score: 85
      }
    };
  }

  private getNicheTitle(niche: 'finance' | 'motivation' | 'top_lists' | 'education'): string {
    const titles = {
      finance: "Financial Freedom",
      motivation: "Personal Growth",
      top_lists: "Must-Know Facts",
      education: "Learning Made Simple"
    };
    return titles[niche] || "Essential Knowledge";
  }
} 