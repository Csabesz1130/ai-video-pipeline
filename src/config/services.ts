import { OpenAI } from 'openai';
// import { Temporal } from '@temporalio/client';
import AWS from 'aws-sdk';
import { v2 as cloudinary } from 'cloudinary';
import { Connection, Client } from '@temporalio/client';

// Service instances
let openaiClient: OpenAI;
let s3Client: AWS.S3;
let temporalClient: Client;

export async function initializeServices(): Promise<void> {
  // Initialize OpenAI
  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  
  // Initialize AWS S3
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });
  s3Client = new AWS.S3();
  
  // Initialize Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  
  // Initialize Temporal client
  const connection = await Connection.connect({
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7233'
  });
  temporalClient = new Client({ connection });
  
  console.log('All services initialized successfully');
}

// Export service clients
export function getOpenAIClient(): OpenAI {
  return openaiClient;
}

export function getS3Client(): AWS.S3 {
  return s3Client;
}

export function getTemporalClient(): Client {
  return temporalClient;
}
