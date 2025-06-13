import { runContentIntelligenceDemo } from './demos/contentIntelligenceDemo';

async function main() {
  try {
    console.log('═'.repeat(70));
    console.log('🎬 AI VIDEO PIPELINE - CONTENT INTELLIGENCE DEMO');
    console.log('═'.repeat(70));
    
    await runContentIntelligenceDemo();
    
  } catch (error) {
    console.error('Hiba történt:', error);
  }
}

// Futtassuk a demót
main();