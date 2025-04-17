# Social Media Trend Monitoring Service

A production-ready service for monitoring trends across multiple social media platforms including TikTok, YouTube, Instagram, and Twitter.

## Features

- **Multi-platform Support**: Monitor trends from TikTok, YouTube, Instagram, and Twitter with a unified interface
- **Real-time Updates**: Get trend data with configurable polling intervals for each platform
- **Fault Tolerance**: Built-in retry with exponential backoff for API failures
- **Trend Aggregation**: Combine and analyze trends across all platforms
- **Event-based Architecture**: Subscribe to trend updates using event listeners

## Requirements

- Node.js 14+
- TypeScript 4+
- API keys for the platforms you want to monitor

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env` and fill in your API credentials:

```bash
cp .env.example .env
```

## Configuration

Edit the `.env` file to configure the application:

```
# Application Settings
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
TREND_POLLING_ENABLED=true

# Platform API Credentials
TIKTOK_API_KEY=your_tiktok_api_key
TIKTOK_API_SECRET=your_tiktok_api_secret

YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret

INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret

TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
```

## Usage

### Starting the Service

```bash
npm start
```

### Development Mode

```bash
npm run dev
```

### Using the Trend Monitoring Service in Your Code

```typescript
import { TrendMonitoringServiceImpl, TrendAggregator } from './services/trend-integration';
import config from './config';

// Initialize the service
const trendService = new TrendMonitoringServiceImpl(config);

// Start monitoring
await trendService.startMonitoring();

// Get the aggregator to access trends
const aggregator = trendService.getAggregator();

// Subscribe to trend updates
aggregator.on('trends', ({ platform, trends, timestamp }) => {
  console.log(`Received ${trends.length} trends from ${platform}`);
});

// Get platform-specific trends
const tiktokTrends = aggregator.getLatestTrendsByPlatform('tiktok');

// Get top trends across all platforms
const topTrends = aggregator.getTopTrends(5);

// Search for trends
const searchResults = aggregator.searchTrends('AI');

// Clean up when done
await trendService.stopMonitoring();
```

## Platform-Specific Monitors

### TikTok

The TikTok trend monitor polls the TikTok API every 2 minutes to get the latest hashtag, sound, and effect trends.

### YouTube

The YouTube trend monitor checks for trending topics, videos, and challenges every 5 minutes.

### Instagram

The Instagram trend monitor retrieves trending hashtags, filters, and effects every 4 minutes.

### Twitter

The Twitter trend monitor tracks hashtags, topics, and conversations every 3 minutes with built-in rate limit handling.

## Error Handling

The service includes comprehensive error handling with:

- Automatic retries with exponential backoff
- Rate limit detection and management
- Detailed error logging and categorization

## Architecture

The trend monitoring service follows a modular architecture:

- **BasePlatformTrendMonitor**: Abstract base class for all platform monitors
- **Platform-specific Monitors**: Implementations for each social media platform
- **TrendAggregator**: Collects and manages trends from all platforms
- **TrendMonitoringService**: Main service interface for consumers

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
