import { proxyActivities } from '@temporalio/workflow';
import { ContentOpportunity, MarketInsight } from '../../lib/types/contentIntelligence';
import * as activities from './contentIntelligenceActivities';

// Activity interface
const { 
  queryYouTubeTrends,
  analyzeGoogleTrends,
  examineCompetitorChannels,
  crossReferenceMetrics,
  generateContentOpportunities
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 minutes',
});

export interface ContentIntelligenceRequest {
  niches: string[];
  targetAudience: {
    demographics: string[];
    interests: string[];
  };
  competitorChannels?: string[];
  focusOnFaceless: boolean;
}

export interface ContentIntelligenceResult {
  contentOpportunities: ContentOpportunity[];
  marketInsights: string;
  recommendedActions: string[];
  generatedAt: Date;
}

export async function contentIntelligenceWorkflow(
  request: ContentIntelligenceRequest
): Promise<ContentIntelligenceResult> {
  
  // 1. Query YouTube Data API for trending videos
  const trendingVideos = await queryYouTubeTrends({
    categories: request.niches,
    region: 'US',
    maxResults: 50
  });
  
  // 2. Analyze Google Trends data (parallel)
  const googleTrendsPromise = analyzeGoogleTrends({
    keywords: extractKeywordsFromTrends(trendingVideos),
    timeRange: '7d',
    compareWithLastPeriod: true
  });
  
  // 3. Examine competitor channels (parallel)
  const competitorAnalysisPromise = request.competitorChannels?.length 
    ? examineCompetitorChannels({
        channelIds: request.competitorChannels,
        analyzeLastNVideos: 10
      })
    : Promise.resolve(null);
  
  // 4. Wait for parallel analyses
  const [googleTrends, competitorData] = await Promise.all([
    googleTrendsPromise,
    competitorAnalysisPromise
  ]);
  
  // 5. Cross-reference all data sources
  const enrichedData = await crossReferenceMetrics({
    trendingVideos,
    googleTrends,
    competitorData,
    targetAudience: request.targetAudience
  });
  
  // 6. Generate scored content opportunities
  const opportunities = await generateContentOpportunities({
    enrichedData,
    focusOnFaceless: request.focusOnFaceless,
    minimumScore: 70
  });
  
  // Generate market insights
  const marketInsights = generateMarketInsights(enrichedData);
  
  // Generate recommended actions
  const recommendedActions = generateRecommendedActions(opportunities);
  
  return {
    contentOpportunities: opportunities,
    marketInsights,
    recommendedActions,
    generatedAt: new Date()
  };
}

// Helper functions
function extractKeywordsFromTrends(trendingVideos: any[]): string[] {
  // Extract top keywords from trending video titles and tags
  const keywords = new Set<string>();
  
  trendingVideos.forEach(video => {
    // Extract words from title
    const titleWords = video.title.toLowerCase()
      .split(/\s+/)
      .filter((word: string) => word.length > 3);
    
    titleWords.forEach((word: string) => keywords.add(word));
    
    // Add tags if available
    if (video.tags) {
      video.tags.forEach((tag: string) => keywords.add(tag.toLowerCase()));
    }
  });
  
  return Array.from(keywords).slice(0, 20);
}

function generateMarketInsights(enrichedData: any): string {
  const insights = [];
  
  // Analyze trend momentum
  const risingTrends = enrichedData.googleTrends
    .filter((trend: any) => trend.growthRate > 0.2)
    .map((trend: any) => trend.keyword);
  
  if (risingTrends.length > 0) {
    insights.push(`Gyorsan növekvő trendek: ${risingTrends.slice(0, 3).join(', ')}`);
  }
  
  // Analyze content gaps
  if (enrichedData.contentGaps?.length > 0) {
    insights.push(`Azonosított tartalom hiányosságok: ${enrichedData.contentGaps.length} témában`);
  }
  
  // Analyze best performing formats
  const topFormats = enrichedData.performancePatterns?.topFormats || [];
  if (topFormats.length > 0) {
    insights.push(`Legjobban teljesítő formátumok: ${topFormats.slice(0, 3).join(', ')}`);
  }
  
  return insights.join('. ');
}

function generateRecommendedActions(opportunities: ContentOpportunity[]): string[] {
  const actions = [];
  
  // Prioritize high-score opportunities
  const highScoreOpps = opportunities.filter(opp => opp.trendScore >= 85);
  if (highScoreOpps.length > 0) {
    actions.push(`Azonnali cselekvés ajánlott: "${highScoreOpps[0].topic}" téma (${highScoreOpps[0].trendScore}/100 pontszám)`);
  }
  
  // Look for evergreen content
  const evergreenOpps = opportunities.filter(opp => opp.contentAngle.includes('evergreen'));
  if (evergreenOpps.length > 0) {
    actions.push(`Evergreen tartalom létrehozása: ${evergreenOpps.length} hosszú távú lehetőség azonosítva`);
  }
  
  // Check for seasonal opportunities
  const seasonalOpps = opportunities.filter(opp => opp.optimalTiming);
  if (seasonalOpps.length > 0) {
    actions.push(`Időzítés kritikus: ${seasonalOpps.length} tartalom optimális közzétételi idővel rendelkezik`);
  }
  
  // Competition analysis
  const lowCompetition = opportunities.filter(opp => opp.competitionLevel === 'low');
  if (lowCompetition.length > 0) {
    actions.push(`Alacsony verseny kihasználása: ${lowCompetition.length} téma minimális versennyel`);
  }
  
  return actions;
}

// Demo workflow execution
export async function runContentIntelligenceDemo(): Promise<ContentIntelligenceResult> {
  const demoRequest: ContentIntelligenceRequest = {
    niches: ['finance', 'business', 'motivation', 'education'],
    targetAudience: {
      demographics: ['18-34', 'entrepreneurs', 'students'],
      interests: ['self-improvement', 'investing', 'productivity']
    },
    competitorChannels: ['UCqcbQf6gFuBBbNIgBJrxfKA'], // Example channel ID
    focusOnFaceless: true
  };
  
  return contentIntelligenceWorkflow(demoRequest);
}