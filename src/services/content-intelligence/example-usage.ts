import { ContentIntelligenceAgentImpl } from './ContentIntelligenceAgent';
import { ContentAnalysisConfig } from './types';

/**
 * Példa a Content Intelligence Agent használatára
 */
async function exampleUsage() {
  // Inicializálás YouTube API kulccsal
  const agent = new ContentIntelligenceAgentImpl(process.env.YOUTUBE_API_KEY || '');

  // Elemzési konfiguráció
  const config: ContentAnalysisConfig = {
    categories: ['finance', 'business', 'motivation', 'education'],
    minTrendScore: 50,
    maxCompetitionLevel: 'medium',
    timeWindowDays: 30,
    language: 'en',
    region: 'US',
    competitorChannels: [
      'UCqWNJOs1bpo8rHr3WqJjmcg', // Példa csatorna ID
      'UCY30JRSgfhZBnpKFM9HdTkw'  // Példa csatorna ID
    ],
    seedKeywords: [
      'passive income 2024',
      'ai business ideas',
      'motivation monday',
      'learn programming fast'
    ]
  };

  try {
    // Tartalmi lehetőségek elemzése
    console.log('🔍 Tartalmi lehetőségek elemzése...');
    const response = await agent.analyzeContentOpportunities(config);

    // Eredmények megjelenítése
    console.log('\n📊 TOP TARTALMI LEHETŐSÉGEK:');
    response.contentOpportunities.forEach((opp, index) => {
      console.log(`\n${index + 1}. ${opp.topic}`);
      console.log(`   - Trend pontszám: ${opp.trendScore}/100`);
      console.log(`   - Verseny: ${opp.competitionLevel}`);
      console.log(`   - Becsült nézettség: ${opp.estimatedViews.toLocaleString()}`);
      console.log(`   - Monetizációs potenciál: ${opp.monetizationPotential}/100`);
      console.log(`   - Optimális időzítés: ${opp.optimalTiming.toLocaleDateString()}`);
      console.log(`   - Megközelítés: ${opp.contentAngle}`);
      console.log(`   - Kulcsszavak: ${opp.targetKeywords.slice(0, 5).join(', ')}`);
    });

    console.log('\n📈 PIACI ELEMZÉSEK:');
    console.log(`- ${response.marketInsights.overallTrend}`);
    console.log(`- Feltörekvő témák: ${response.marketInsights.emergingTopics.join(', ')}`);
    console.log(`- Telítődött témák: ${response.marketInsights.saturatedTopics.join(', ')}`);
    console.log(`- Szezonális tényezők: ${response.marketInsights.seasonalFactors.join(', ')}`);

    console.log('\n💡 JAVASOLT LÉPÉSEK:');
    response.recommendedActions.forEach((action, index) => {
      console.log(`${index + 1}. ${action}`);
    });

    // Specifikus funkciók tesztelése

    // 1. Trending témák lekérése
    console.log('\n🔥 TRENDING TÉMÁK (Finance):');
    const trendingFinance = await agent.getTrendingTopics('finance', 5);
    trendingFinance.forEach(video => {
      console.log(`- ${video.title} (${video.viewCount.toLocaleString()} megtekintés)`);
    });

    // 2. Versenytárs elemzés
    console.log('\n🏆 VERSENYTÁRS ELEMZÉS:');
    const competitors = await agent.analyzeCompetitors(config.competitorChannels);
    competitors.forEach(comp => {
      console.log(`\n${comp.channelName}:`);
      console.log(`- Feliratkozók: ${comp.subscriberCount.toLocaleString()}`);
      console.log(`- Átlag nézettség: ${comp.averageViews.toLocaleString()}`);
      console.log(`- Tartalom gyakoriság: ${comp.contentFrequency} videó/hét`);
      console.log(`- Tartalom minták: ${comp.contentPatterns.join(', ')}`);
    });

    // 3. Tartalmi rések azonosítása
    console.log('\n🎯 TARTALMI RÉSEK:');
    const gaps = await agent.identifyContentGaps(
      config.competitorChannels,
      'finance'
    );
    console.log(`Azonosított rések: ${gaps.slice(0, 10).join(', ')}`);

    // 4. Egyedi ötlet pontozása
    console.log('\n💭 EGYEDI ÖTLET ÉRTÉKELÉSE:');
    const customIdea = await agent.scoreContentIdea(
      'AI tools for small business 2024',
      ['ai tools', 'small business', 'productivity', 'automation']
    );
    console.log(`Téma: ${customIdea.topic}`);
    console.log(`Pontszám: ${customIdea.trendScore}/100`);
    console.log(`Verseny: ${customIdea.competitionLevel}`);
    console.log(`Becsült nézettség: ${customIdea.estimatedViews.toLocaleString()}`);

  } catch (error) {
    console.error('❌ Hiba történt:', error);
  }
}

// Környezeti változók ellenőrzése
if (!process.env.YOUTUBE_API_KEY) {
  console.log('⚠️  Figyelem: YOUTUBE_API_KEY környezeti változó nincs beállítva!');
  console.log('Állítsd be a .env fájlban vagy exportáld:');
  console.log('export YOUTUBE_API_KEY="your-api-key-here"');
}

// Példa futtatása
if (require.main === module) {
  exampleUsage();
}