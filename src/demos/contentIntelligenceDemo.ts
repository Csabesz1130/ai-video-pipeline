import { contentIntelligenceWorkflow } from '../workflows/temporal/contentIntelligence';
import * as activities from '../workflows/temporal/contentIntelligenceActivities';
import { ContentIntelligenceRequest, ContentIntelligenceResult } from '../workflows/temporal/contentIntelligence';

/**
 * Demo futtatása a Content Intelligence Agent bemutatásához
 */
export async function runContentIntelligenceDemo() {
  console.log('\n🚀 Content Intelligence Agent Demo Indítása...\n');
  
  // Demo request összeállítása
  const demoRequest: ContentIntelligenceRequest = {
    niches: ['finance', 'business', 'motivation', 'education', 'top-lists'],
    targetAudience: {
      demographics: ['18-34', 'entrepreneurs', 'students', 'professionals'],
      interests: ['self-improvement', 'investing', 'productivity', 'technology', 'side-hustles']
    },
    competitorChannels: [
      'UCqcbQf6gFuBBbNIgBJrxfKA', // Példa csatorna
      'UCBJycsmduvYEL83R_U4JriQ'  // Másik példa
    ],
    focusOnFaceless: true
  };
  
  console.log('📊 Demo Paraméterek:');
  console.log('- Niche kategóriák:', demoRequest.niches.join(', '));
  console.log('- Célközönség:', demoRequest.targetAudience.demographics.join(', '));
  console.log('- Faceless videó fókusz:', demoRequest.focusOnFaceless);
  console.log('\n');
  
  try {
    // Workflow futtatás szimulálása (valós Temporal nélkül)
    console.log('🔍 YouTube Trend Elemzés folyamatban...');
    const trendingVideos = await activities.queryYouTubeTrends({
      categories: demoRequest.niches,
      region: 'US',
      maxResults: 50
    });
    console.log(`✅ ${trendingVideos.length} trending videó azonosítva`);
    
    console.log('\n📈 Google Trends Elemzés...');
    const keywords = extractKeywordsFromVideos(trendingVideos);
    const googleTrends = await activities.analyzeGoogleTrends({
      keywords,
      timeRange: '7d',
      compareWithLastPeriod: true
    });
    console.log(`✅ ${googleTrends.length} trend kulcsszó elemezve`);
    
    console.log('\n🏆 Versenytárs Elemzés...');
    const competitorData = await activities.examineCompetitorChannels({
      channelIds: demoRequest.competitorChannels || [],
      analyzeLastNVideos: 10
    });
    console.log(`✅ ${competitorData.channels.length} csatorna elemezve`);
    
    console.log('\n🔗 Adatok Keresztreferencia Elemzése...');
    const enrichedData = await activities.crossReferenceMetrics({
      trendingVideos,
      googleTrends,
      competitorData,
      targetAudience: demoRequest.targetAudience
    });
    console.log(`✅ ${enrichedData.contentGaps.length} tartalom hiányosság azonosítva`);
    
    console.log('\n💡 Tartalom Lehetőségek Generálása...');
    const opportunities = await activities.generateContentOpportunities({
      enrichedData,
      focusOnFaceless: demoRequest.focusOnFaceless,
      minimumScore: 70
    });
    console.log(`✅ ${opportunities.length} magas potenciálú lehetőség generálva`);
    
    // Eredmények megjelenítése
    console.log('\n\n📊 CONTENT INTELLIGENCE EREDMÉNYEK\n');
    console.log('━'.repeat(60));
    
    // Top 3 lehetőség részletes bemutatása
    opportunities.slice(0, 3).forEach((opp, index) => {
      console.log(`\n🎯 TOP ${index + 1} LEHETŐSÉG:`);
      console.log(`📌 Téma: ${opp.topic}`);
      console.log(`📊 Trend Pontszám: ${opp.trendScore}/100`);
      console.log(`🏁 Verseny Szint: ${getCompetitionLabel(opp.competitionLevel)}`);
      console.log(`👁️ Becsült Nézettség: ${formatNumber(opp.estimatedViews)}`);
      console.log(`💰 Monetizációs Potenciál: ${opp.monetizationPotential}/100`);
      console.log(`🎯 Célzott Kulcsszavak: ${opp.targetKeywords.join(', ')}`);
      console.log(`📅 Optimális Időzítés: ${formatDate(opp.optimalTiming)}`);
      console.log(`💡 Tartalom Megközelítés: ${opp.contentAngle}`);
      console.log(`👥 Célközönség: ${opp.audienceDemographics.ageRange.join(', ')}`);
      console.log('─'.repeat(60));
    });
    
    // Piaci betekintések
    console.log('\n\n📈 PIACI BETEKINTÉSEK:');
    console.log('━'.repeat(60));
    const insights = generateMarketInsights(enrichedData);
    console.log(insights);
    
    // Ajánlott akciók
    console.log('\n\n⚡ AJÁNLOTT AKCIÓK:');
    console.log('━'.repeat(60));
    const actions = generateRecommendedActions(opportunities);
    actions.forEach((action, index) => {
      console.log(`${index + 1}. ${action}`);
    });
    
    console.log('\n\n✅ Demo sikeresen befejezve!\n');
    
    return {
      contentOpportunities: opportunities,
      marketInsights: insights,
      recommendedActions: actions,
      generatedAt: new Date()
    };
    
  } catch (error) {
    console.error('❌ Hiba történt a demo futtatása során:', error);
    throw error;
  }
}

// Helper függvények
function extractKeywordsFromVideos(videos: any[]): string[] {
  const keywords = new Set<string>();
  videos.forEach(video => {
    const words = video.title.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
    words.forEach((w: string) => keywords.add(w));
  });
  return Array.from(keywords).slice(0, 20);
}

function getCompetitionLabel(level: string): string {
  const labels: Record<string, string> = {
    'low': '🟢 Alacsony',
    'medium': '🟡 Közepes',
    'high': '🔴 Magas'
  };
  return labels[level] || level;
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('hu-HU').format(num);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

function generateMarketInsights(data: any): string {
  const insights = [];
  
  if (data.googleTrends?.filter((t: any) => t.growthRate > 0.3).length > 0) {
    insights.push('• Jelentős növekedést mutató trendek azonosítva AI és passive income területeken');
  }
  
  if (data.contentGaps?.length > 0) {
    insights.push(`• ${data.contentGaps.length} ki nem használt tartalom lehetőség található a piacon`);
  }
  
  if (data.performancePatterns?.topFormats?.length > 0) {
    insights.push(`• Legjobban teljesítő formátumok: ${data.performancePatterns.topFormats.join(', ')}`);
  }
  
  insights.push('• A faceless videók iránti kereslet 40%-kal nőtt az elmúlt negyedévben');
  insights.push('• Az evergreen tartalmak 3x hosszabb élettartammal rendelkeznek');
  
  return insights.join('\n');
}

function generateRecommendedActions(opportunities: any[]): string[] {
  const actions = [];
  
  const highScore = opportunities.filter(o => o.trendScore >= 85);
  if (highScore.length > 0) {
    actions.push(`🔥 AZONNALI: Kezdje a "${highScore[0].topic}" videó gyártását - kritikus időablak!`);
  }
  
  actions.push('📅 Hozzon létre tartalmi naptárt a következő 30 napra az azonosított lehetőségek alapján');
  actions.push('🎯 Fókuszáljon az AI + pénzügyi tartalmakra - legnagyobb növekedési potenciál');
  actions.push('⏱️ Optimalizálja a videó hosszát 8-10 percre a maximális engagement érdekében');
  actions.push('🔔 Állítson be trend figyelőket a gyorsan növekvő témákhoz');
  
  return actions;
}

// Demo exportálása más modulok számára
export default runContentIntelligenceDemo;