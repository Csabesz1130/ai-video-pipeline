import dotenv from 'dotenv';
import express from 'express';
import { startApiServer } from './api/server';
import { initializeServices } from './config/services';

// Load environment variables
dotenv.config();

async function main() {
  console.log('Initializing AI Video Pipeline...');
  
  // Initialize services
  await initializeServices();
  
  // Start API server
  const app = express();
  startApiServer(app);
  
  console.log('AI Video Pipeline is running');
}

main().catch(error => {
  console.error('Failed to start AI Video Pipeline:', error);
  process.exit(1);
});
