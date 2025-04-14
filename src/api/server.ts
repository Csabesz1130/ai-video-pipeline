import express, { Express, Request, Response } from 'express';
import { videoGenerationController } from './controllers/videoGenerationController';

const PORT = process.env.PORT || 3000;

export function startApiServer(app: Express): void {
  // Middleware
  app.use(express.json());
  
  // Routes
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });
  
  // API routes
  app.use('/api/v1/videos', videoGenerationController);
  
  // Start server
  app.listen(PORT, () => {
    console.log(Server is running on port );
  });
}
