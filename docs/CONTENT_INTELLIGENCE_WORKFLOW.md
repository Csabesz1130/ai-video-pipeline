# Content Intelligence Workflow Dokumentáció

## Áttekintés

A Content Intelligence workflow egy AI-alapú rendszer, amely automatikusan elemzi a YouTube trendeket, versenytársakat és azonosítja a magas potenciálú videó lehetőségeket.

## Főbb Funkciók

### 1. YouTube Trend Elemzés
- Valós idejű trend monitoring különböző kategóriákban
- Népszerű videók teljesítmény elemzése
- Virális tartalom mintázatok azonosítása

### 2. Google Trends Integráció
- Kulcsszó momentum elemzés
- Szezonális minták felismerése
- Növekedési potenciál előrejelzése

### 3. Versenytárs Elemzés
- Top csatornák teljesítmény vizsgálata
- Tartalom hiányosságok azonosítása
- Sikeres content stratégiák elemzése

### 4. Tartalom Lehetőség Pontozás
- Trend pontszám (1-100)
- Verseny szint értékelés
- Nézettség becslés
- Monetizációs potenciál

## Workflow Architektúra

```
┌─────────────────────┐
│   Content Request   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐     ┌─────────────────────┐
│  YouTube Trends API │ ────▶│  Google Trends API  │
└─────────────────────┘     └─────────────────────┘
           │                           │
           ▼                           ▼
┌─────────────────────┐     ┌─────────────────────┐
│Competitor Analysis  │ ────▶│ Cross-Reference     │
└─────────────────────┘     └─────────────────────┘
                                      │
                                      ▼
                            ┌─────────────────────┐
                            │ Content Scoring     │
                            └─────────────────────┘
                                      │
                                      ▼
                            ┌─────────────────────┐
                            │ Final Opportunities │
                            └─────────────────────┘
```

## Demo Futtatása

```bash
npm run demo
```

## Kimenet Formátum

### Content Opportunity
```json
{
  "topic": "AI Eszközök Passive Income Generálásra",
  "trendScore": 92,
  "competitionLevel": "medium",
  "estimatedViews": 150000,
  "targetKeywords": ["AI passive income", "AI pénzkeresés"],
  "optimalTiming": "2024-06-16",
  "contentAngle": "Gyakorlati útmutató konkrét példákkal",
  "audienceDemographics": {
    "ageRange": ["18-24", "25-34"],
    "interests": ["technológia", "vállalkozás"]
  },
  "monetizationPotential": 85
}
```

## Használati Példák

### 1. Alapértelmezett Demo
```typescript
import { runContentIntelligenceDemo } from './demos/contentIntelligenceDemo';

await runContentIntelligenceDemo();
```

### 2. Egyedi Paraméterekkel
```typescript
const customRequest = {
  niches: ['finance', 'crypto', 'AI'],
  targetAudience: {
    demographics: ['25-40'],
    interests: ['investing', 'technology']
  },
  competitorChannels: ['channel1', 'channel2'],
  focusOnFaceless: true
};

const result = await contentIntelligenceWorkflow(customRequest);
```

## Ajánlott Gyakorlatok

1. **Niche Fókusz**: Maximum 5 kapcsolódó niche egyidejű elemzése
2. **Versenytárs Limit**: 3-5 releváns csatorna elemzése
3. **Időzítés**: Heti rendszerességgel futtassa az elemzést
4. **Pontszám Küszöb**: 70+ pontszámú lehetőségekre fókuszáljon

## Integráció a Fő Pipeline-al

A Content Intelligence workflow könnyen integrálható a teljes videó generálási pipeline-ba:

1. Content Intelligence → azonosítja a témát
2. Script Generation → készít egy optimalizált forgatókönyvet
3. Visual Generation → létrehozza a vizuális elemeket
4. Audio Generation → generálja a narrációt
5. Platform Formatter → optimalizálja a végső videót

## Fejlesztési Lehetőségek

- Real-time YouTube API integráció
- Machine Learning alapú trend előrejelzés
- Többnyelvű támogatás
- Részletesebb ROI kalkuláció
- A/B testing támogatás