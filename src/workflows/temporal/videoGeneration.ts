import { proxyActivities } from '@temporalio/workflow';
import { VideoGenerationRequest, VideoGenerationResult } from '../../lib/types/videoRequest';
import * as activities from './activities';

// Activity interface
const { 
  analyzeTrends,
  generateScript,
  generateVisuals,
  generateAudio,
  assembleVideo,
  distributeContent
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 minutes',
});

export async function videoGenerationWorkflow(
  request: VideoGenerationRequest
): Promise<VideoGenerationResult> {
  // 1. Analyze trends and generate brief
  const brief = await analyzeTrends(request);
  
  // 2. Generate script with hooks
  const script = await generateScript(brief);
  
  // 3. Generate visual assets (parallel)
  const visualsPromise = generateVisuals(script);
  
  // 4. Generate audio assets (parallel)
  const audioPromise = generateAudio(script);
  
  // 5. Wait for all assets to be ready
  const [visuals, audio] = await Promise.all([visualsPromise, audioPromise]);
  
  // 6. Assemble final video
  const video = await assembleVideo({
    script,
    visuals,
    audio,
    platform: request.platforms[0] // Use first platform as primary
  });
  
  // 7. Distribute to platforms if requested
  if (request.autoDistribute) {
    await distributeContent(video, request.platforms);
  }
  
  return {
    videoId: video.id,
    videoUrl: video.url,
    thumbnailUrl: video.thumbnailUrl,
    platform: request.platforms[0],
    generationStats: {
      executionTime: "", // Will be calculated by Temporal
      scriptTokens: script.tokenCount,
      visualAssetCount: visuals.length
    }
  };
}

// Function to start the workflow
export async function startVideoGenerationWorkflow(
  request: VideoGenerationRequest
): Promise<string> {
  // This would be implemented in the actual code to start the workflow
  // using the Temporal client
  return "workflow-started"; // Placeholder
}
