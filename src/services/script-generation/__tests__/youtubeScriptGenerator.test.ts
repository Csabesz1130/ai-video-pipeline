import { YouTubeScriptGenerator } from '../youtubeScriptGenerator';

/**
 * Test suite for YouTubeScriptGenerator
 * 
 * Tests the functionality of script generation, including:
 * - Complete script structure
 * - Retention hooks
 * - Niche optimization
 * - SEO keyword integration
 */
describe('YouTubeScriptGenerator', () => {
  let generator: YouTubeScriptGenerator;

  beforeEach(() => {
    generator = new YouTubeScriptGenerator();
  });

  /**
   * Test complete script structure generation
   * Verifies that all required sections are present
   */
  it('should generate a complete script with all required sections', async () => {
    const script = await generator.generateScript(
      'How to Start Investing in Stocks',
      'finance',
      'Beginner investors aged 25-35',
      ['stock market', 'investing', 'beginners', 'portfolio']
    );

    expect(script).toBeDefined();
    expect(script.script).toHaveProperty('title');
    expect(script.script).toHaveProperty('hook');
    expect(script.script).toHaveProperty('preview');
    expect(script.script).toHaveProperty('main_sections');
    expect(script.script).toHaveProperty('conclusion');
    expect(script.script).toHaveProperty('call_to_action');
    expect(script.metadata).toBeDefined();
    expect(script.optimization_notes).toBeInstanceOf(Array);
  });

  /**
   * Test retention hooks in main sections
   * Verifies that each section has proper retention elements
   */
  it('should include retention hooks in main sections', async () => {
    const script = await generator.generateScript(
      '5 Morning Habits of Successful People',
      'motivation',
      'Young professionals',
      ['success', 'habits', 'morning routine', 'productivity']
    );

    script.script.main_sections.forEach(section => {
      expect(section).toHaveProperty('retention_hook');
      expect(section).toHaveProperty('visual_cues');
      expect(section).toHaveProperty('timing');
    });
  });

  /**
   * Test niche optimization
   * Verifies that the generator works correctly for all supported niches
   */
  it('should optimize for different niches', async () => {
    const niches = ['finance', 'motivation', 'top_lists', 'education'] as const;
    
    for (const niche of niches) {
      const script = await generator.generateScript(
        'Test Topic',
        niche,
        'General audience',
        ['test']
      );

      expect(script.metadata).toHaveProperty('emotional_tone');
      expect(script.metadata).toHaveProperty('retention_score');
      expect(script.metadata.retention_score).toBeGreaterThanOrEqual(0);
      expect(script.metadata.retention_score).toBeLessThanOrEqual(100);
    }
  });

  /**
   * Test SEO keyword integration
   * Verifies that keywords are naturally included in the content
   */
  it('should include SEO keywords naturally in the content', async () => {
    const keywords = ['cryptocurrency', 'blockchain', 'bitcoin', 'trading'];
    const script = await generator.generateScript(
      'Understanding Cryptocurrency',
      'finance',
      'Tech-savvy investors',
      keywords
    );

    const content = JSON.stringify(script.script).toLowerCase();
    keywords.forEach(keyword => {
      expect(content).toContain(keyword.toLowerCase());
    });
  });
}); 