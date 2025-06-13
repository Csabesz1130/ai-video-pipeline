# AI Video Pipeline - YouTube Automatizálási Platform

Egy fejlett AI-alapú rendszer, amely automatizálja a YouTube videó tartalom létrehozását trend elemzéstől a végső videó generálásig.

## 🚀 Főbb Funkciók

### Content Intelligence Agent
- **YouTube Trend Elemzés**: Valós idejű trend monitoring és elemzés
- **Versenytárs Analízis**: Top csatornák teljesítmény vizsgálata
- **Google Trends Integráció**: Kulcsszó momentum és szezonalitás elemzés
- **Tartalom Pontozás**: AI-alapú lehetőség értékelés (1-100 skálán)

### Videó Generálási Pipeline
- **Script Generálás**: Hook-optimalizált forgatókönyvek AI-val
- **Vizuális Generálás**: AI képgenerálás (Runway Gen-4, DALL-E 3)
- **Audio Generálás**: Természetes hangú narráció (ElevenLabs)
- **Platform Optimalizálás**: Automatikus formázás különböző platformokra

## 📦 Telepítés

1. Repository klónozása:
```bash
git clone <repository-url>
cd ai-video-pipeline
```

2. Függőségek telepítése:
```bash
npm install
```

3. Környezeti változók beállítása:
```bash
cp .env.example .env
# Töltse ki az API kulcsokat a .env fájlban
```

## 🎮 Demo Futtatása

### Content Intelligence Demo

A Content Intelligence Agent képességeinek bemutatása:

```bash
npm run demo
```

Ez a demo:
- Elemzi a YouTube trendeket 5 kategóriában
- Vizsgálja a Google Trends adatokat
- Elemzi a versenytárs csatornákat
- Generál 3 magas potenciálú videó ötletet
- Részletes pontszámokkal és ajánlásokkal

### Demo Kimenet Példa

```
🎯 TOP 1 LEHETŐSÉG:
📌 Téma: AI Eszközök Passive Income Generálásra - Teljes Útmutató
📊 Trend Pontszám: 92/100
🏁 Verseny Szint: 🟡 Közepes
👁️ Becsült Nézettség: 150,000
💰 Monetizációs Potenciál: 85/100
```

## 📁 Projekt Struktúra

```
ai-video-pipeline/
├── src/
│   ├── workflows/          # Temporal workflow definíciók
│   ├── services/           # Üzleti logika szolgáltatások
│   ├── lib/               # Közös könyvtárak és típusok
│   └── demos/             # Demo alkalmazások
├── docs/                  # Dokumentáció
└── tests/                 # Tesztek
```

## 🔧 Konfigurálás

### Szükséges API Kulcsok

```env
# YouTube Data API
YOUTUBE_API_KEY=your_youtube_api_key

# Google Trends
GOOGLE_TRENDS_API_KEY=your_google_trends_key

# OpenAI (Script generáláshoz)
OPENAI_API_KEY=your_openai_api_key

# Képgenerálás
RUNWAY_API_KEY=your_runway_api_key

# Hang generálás
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

## 💡 Használati Példák

### Egyedi Content Intelligence Elemzés

```typescript
import { contentIntelligenceWorkflow } from './workflows/temporal/contentIntelligence';

const request = {
  niches: ['finance', 'crypto', 'AI'],
  targetAudience: {
    demographics: ['25-40'],
    interests: ['investing', 'technology']
  },
  competitorChannels: ['channel1', 'channel2'],
  focusOnFaceless: true
};

const result = await contentIntelligenceWorkflow(request);
```

### Teljes Videó Generálási Pipeline

```typescript
import { videoGenerationWorkflow } from './workflows/temporal/videoGeneration';

const request = {
  topic: 'AI Tools for Beginners',
  platforms: ['youtube', 'tiktok'],
  targetAudience: {
    age: '18-34',
    interests: ['technology', 'productivity']
  },
  style: 'educational',
  autoDistribute: true
};

const video = await videoGenerationWorkflow(request);
```

## 📊 Workflow Architektúra

```
Content Intelligence → Script Generation → Visual Generation
                                      ↓
Distribution ← Platform Formatting ← Audio Generation
```

## 🛠️ Fejlesztés

### Fejlesztői Mód

```bash
npm run dev
```

### Tesztek Futtatása

```bash
npm test
```

### Linting

```bash
npm run lint
```

## 📚 További Dokumentáció

- [Content Intelligence Workflow](docs/CONTENT_INTELLIGENCE_WORKFLOW.md)
- [API Referencia](docs/API_REFERENCE.md)
- [Fejlesztői Útmutató](docs/DEVELOPER_GUIDE.md)

## 🤝 Közreműködés

1. Fork-olja a repository-t
2. Hozzon létre egy feature branch-et (`git checkout -b feature/amazing-feature`)
3. Commit-olja a változtatásokat (`git commit -m 'Add amazing feature'`)
4. Push-olja a branch-et (`git push origin feature/amazing-feature`)
5. Nyisson egy Pull Request-et

## 📄 Licensz

MIT

## 🙏 Köszönetnyilvánítás

- Temporal.io a workflow orchestration-ért
- OpenAI a természetes nyelv feldolgozásért
- Runway és DALL-E a képgenerálásért
- ElevenLabs a hang szintézisért
