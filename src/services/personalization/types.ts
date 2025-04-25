import { Trend } from '../trend-integration/types'; // Assuming Trend type might be relevant
import { Platform } from '../trend-integration/types';

// --- Configuration & Base Types ---

/**
 * Configuration for voiceover
 * (Matches PersonalizationRule['voice'] structure for merging)
 */
export interface VoiceConfig {
  language?: string; // e.g., 'en-US'
  accent?: string; // Specific identifier for TTS service (e.g., 'en-US-Standard-A' or 'british-male')
  style?: string; // e.g., 'professional', 'casual', 'energetic'
  voiceId?: string; // Specific voice model ID if applicable
}

/**
 * Configuration for background music
 * (Matches PersonalizationRule['music'] structure for merging)
 */
export interface MusicConfig {
  genre?: string; // e.g., 'HipHop', 'Cinematic'
  mood?: string; // e.g., 'Uplifting', 'Tense'
  tempo?: 'slow' | 'medium' | 'fast';
  bpm?: { min?: number; max?: number };
  volume?: number; // Relative volume (e.g., 0.0 to 1.0)
}

/**
 * Represents a single scene in the visual plan
 */
export interface SceneConfig {
  index: number;
  prompt?: string; // Prompt for AI generation
  assetType: 'ai_image' | 'ai_video' | 'stock_footage' | 'graphic' | 'screen_recording';
  duration: number; // In seconds
  baseAssetUrl?: string; // URL to the non-personalized asset for this scene
  // Add other scene-specific details like transitions, text overlays placeholders, etc.
}

/**
 * Structure for the video script, potentially segmented
 */
export interface VideoScript {
  fullText: string; // Complete script for reference
  segments?: Array<{ text: string; timing: number }>; // Optional: Timed segments for precise control
  estimatedDuration: number; // In seconds
  baseCta: {
    text: string;
    url?: string;
    timing?: 'start' | 'end' | number; // Timing in seconds or relative position
  };
  textElementIds?: string[]; // IDs for replaceable text overlays within the template
}

/**
 * Base configuration for video generation - Represents the *result* of initial planning
 */
export interface BaseVideoConfig {
  jobId: string; // Unique ID for this generation job/request
  script: VideoScript;
  visualPlan: {
    scenes: SceneConfig[];
    styleReference?: string; // URL or ID for visual consistency (e.g., image URL for Runway Gen-4)
  };
  audio: {
    baseVoice: VoiceConfig; // Default voice settings
    baseMusic?: MusicConfig; // Default music settings
    assets: { // Paths/URLs to the *base* generated assets
      baseVoiceoverPath?: string;
      baseMusicPath?: string;
      baseVisualPaths: (string | null)[]; // Array of URLs/paths corresponding to scenes
    };
  };
  branding?: {
    baseLogoPath?: string;
    baseIntroPath?: string;
    baseOutroPath?: string;
    baseColorPaletteId?: string;
  };
  assemblyTemplate: string; // ID/Name of the Remotion/FFmpeg template to use
  targetPlatforms: Platform[];
  metadata?: Record<string, any>; // Other relevant metadata
}

// --- Personalization Specific Types ---

/**
 * Defines how to replace/regenerate a visual for a specific scene
 */
export interface VisualRule {
  sceneIndex: number; // Target scene index
  type: 'replace_stock' | 'replace_graphic' | 'regenerate_prompt';
  replacementValue: string; // URL for replace_*, prompt string for regenerate_*
}

/**
 * Defines how to replace text overlay content
 */
export interface TextOverlayRule {
  elementId: string; // Matches ID in VideoScript.textElementIds
  newText: string;
}

/**
 * Rules for personalizing a video variant for a segment
 */
export interface PersonalizationRules {
  voice?: VoiceConfig; // Overrides fields in BaseVideoConfig.audio.baseVoice
  music?: MusicConfig; // Overrides fields in BaseVideoConfig.audio.baseMusic
  visuals?: VisualRule[]; // Array of specific scene modifications
  textOverlays?: TextOverlayRule[]; // Array of text element replacements
  cta?: Partial<BaseVideoConfig['script']['baseCta']>; // Override specific CTA fields
  branding?: {
    logoVariantUrl?: string; // URL to a different logo
    colorPaletteId?: string; // Identifier for a different color scheme
  };
  // Add other dimensions as needed
}

/**
 * Represents an audience segment and its personalization rules
 */
export interface AudienceSegment {
  id: string; // Unique identifier, e.g., "uk_under30_finance"
  name: string; // Human-readable name
  description?: string;
  criteria?: Record<string, any>; // Optional: Criteria used to define the segment
  rules: PersonalizationRules; // Specific override rules for this segment
}

/**
 * Represents the result of generating a personalized video variant
 */
export interface PersonalizedVariantResult {
  segmentId: string;
  status: 'pending' | 'assets_generating' | 'assembling' | 'completed' | 'failed';
  videoUrl?: string | null; // URL of the generated video
  thumbnailUrl?: string | null; // URL of the generated thumbnail
  error?: string; // Error message if generation failed
}

/**
 * Structure holding the generated/selected asset paths for a specific variant
 */
export interface PersonalizedAssetPaths {
  voiceoverPath: string;
  musicPath: string | null; // Music might be optional
  visualPaths: (string | null)[]; // Must be in correct scene order, matching visualPlan.scenes
}

/**
 * Structure for the configuration passed to the final video assembly step
 */
export interface VideoAssemblyConfig {
  templateId: string;
  duration: number;
  assets: PersonalizedAssetPaths;
  textOverrides?: TextOverlayRule[];
  ctaConfig: BaseVideoConfig['script']['baseCta']; // Merged CTA config
  brandingConfig?: PersonalizationRules['branding'] & { baseLogoPath?: string }; // Merged branding
  // Add any other parameters needed by Remotion/FFmpeg
} 