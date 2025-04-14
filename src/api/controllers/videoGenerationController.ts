import { Router, Request, Response } from 'express';
import { startVideoGenerationWorkflow } from '../../workflows/temporal/videoGeneration';
import { VideoGenerationRequest } from '../../lib/types/videoRequest';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const videoRequest: VideoGenerationRequest = req.body;
    
    // Start workflow
    const workflowId = await startVideoGenerationWorkflow(videoRequest);
    
    res.status(202).json({
      message: 'Video generation started',
      workflowId
    });
  } catch (error) {
    console.error('Error starting video generation:', error);
    res.status(500).json({
      message: 'Failed to start video generation',
      error: (error as Error).message
    });
  }
});

router.get('/:workflowId', async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    
    // TODO: Implement workflow status check
    
    res.status(200).json({
      workflowId,
      status: 'pending' // placeholder
    });
  } catch (error) {
    console.error('Error checking workflow status:', error);
    res.status(500).json({
      message: 'Failed to check workflow status',
      error: (error as Error).message
    });
  }
});

export const videoGenerationController = router;
