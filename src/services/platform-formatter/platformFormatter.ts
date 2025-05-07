/**
 * Service for formatting videos according to platform-specific requirements
 */
export class PlatformFormatter {
  private platformSpecs = {
    tiktok: { 
      aspectRatio: '9:16', 
      maxDuration: 60, 
      captionStyle: 'large-centered',
      safeZones: {
        text: { top: 0.15, bottom: 0.15, left: 0.05, right: 0.05 }
      }
    },
    reels: { 
      aspectRatio: '9:16', 
      maxDuration: 90, 
      captionStyle: 'bottom-aligned',
      safeZones: {
        text: { top: 0.05, bottom: 0.2, left: 0.05, right: 0.05 }
      }
    },
    shorts: { 
      aspectRatio: '9:16', 
      maxDuration: 60, 
      captionStyle: 'side-aligned',
      safeZones: {
        text: { top: 0.07, bottom: 0.15, left: 0.05, right: 0.05 }
      }
    }
  };
  
  /**
   * Formats a video for a specific platform
   */
  async formatForPlatform(
    assembledVideo: any,
    platform: 'tiktok' | 'reels' | 'shorts',
    metadata: any
  ) {
    // console.log(Formatting video for );
    
    const spec = this.platformSpecs[platform];
    
    // Apply platform-specific formatting
    // This would use FFmpeg or similar tools to actually process the video
    return {
      video: assembledVideo,
      formatted: {
        aspectRatio: spec.aspectRatio,
        duration: Math.min(assembledVideo.durationSecs, spec.maxDuration),
        captionStyle: spec.captionStyle,
        brandPosition: this.getBrandSafePosition(platform),
        textSafeZone: spec.safeZones.text,
        metadata: this.optimizeMetadata(metadata, platform)
      }
    };
  }
  
  /**
   * Gets the safe position for brand elements based on platform
   */
  private getBrandSafePosition(platform: string) {
    const positions = {
      'tiktok': { x: 0.05, y: 0.9 },  // Bottom left
      'reels': { x: 0.95, y: 0.05 },  // Top right
      'shorts': { x: 0.05, y: 0.05 }  // Top left
    };
    
    return positions[platform as keyof typeof positions] || positions.tiktok;
  }
  
  /**
   * Optimizes metadata for specific platforms
   */
  private optimizeMetadata(metadata: any, platform: string) {
    // Platform-specific metadata formatting (hashtags, descriptions, etc.)
    const platformMetadata = { ...metadata };
    
    // Adjust hashtag count and format based on platform
    if (platform === 'tiktok') {
      platformMetadata.hashtags = (metadata.hashtags || []).slice(0, 5);
    } else if (platform === 'reels') {
      platformMetadata.hashtags = (metadata.hashtags || []).slice(0, 15);
    } else if (platform === 'shorts') {
      platformMetadata.hashtags = (metadata.hashtags || []).slice(0, 10);
    }
    
    return platformMetadata;
  }
}
