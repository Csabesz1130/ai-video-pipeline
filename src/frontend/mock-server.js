const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// In-memory storage for demo
let jobs = [
  {
    id: 'job_1',
    status: 'completed',
    progress: 100,
    currentStep: 'Video generation complete!',
    config: {
      platform: 'tiktok',
      duration: '60',
      style: 'trendy',
      language: 'english',
    },
    outputUrl: 'https://example.com/video1.mp4',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'job_2',
    status: 'processing',
    progress: 65,
    currentStep: 'Adding effects and transitions...',
    config: {
      platform: 'instagram',
      duration: '30',
      style: 'professional',
      language: 'english',
    },
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

let settings = {
  apiKey: 'sk-demo-key',
  outputQuality: 'high',
  defaultPlatform: 'tiktok',
  defaultLanguage: 'english',
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Video jobs endpoints
app.post('/api/videos', upload.single('file'), (req, res) => {
  try {
    const config = JSON.parse(req.body.config);
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newJob = {
      id: jobId,
      status: 'pending',
      progress: 0,
      currentStep: 'Initializing video generation...',
      config,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    jobs.unshift(newJob);
    
    res.json(newJob);
  } catch (error) {
    res.status(400).json({ error: 'Invalid request data' });
  }
});

app.get('/api/videos', (req, res) => {
  res.json(jobs);
});

app.get('/api/videos/:id', (req, res) => {
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  // Simulate progress updates for processing jobs
  if (job.status === 'processing') {
    job.progress = Math.min(100, job.progress + Math.random() * 10);
    job.updatedAt = new Date().toISOString();
    
    if (job.progress >= 100) {
      job.status = 'completed';
      job.currentStep = 'Video generation complete!';
      job.outputUrl = `https://example.com/video_${job.id}.mp4`;
    }
  }
  
  res.json(job);
});

app.delete('/api/videos/:id', (req, res) => {
  const index = jobs.findIndex(j => j.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  jobs.splice(index, 1);
  res.status(204).send();
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const fileUrl = `https://example.com/uploads/${fileId}_${req.file.originalname}`;

  res.json({
    id: fileId,
    url: fileUrl,
    filename: req.file.originalname,
    size: req.file.size,
    type: req.file.mimetype
  });
});

// Settings endpoints
app.get('/api/settings', (req, res) => {
  res.json(settings);
});

app.put('/api/settings', (req, res) => {
  settings = { ...settings, ...req.body };
  res.json(settings);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock API server running on http://localhost:${PORT}`);
  console.log(`📝 Available endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/videos`);
  console.log(`   GET  /api/videos`);
  console.log(`   GET  /api/videos/:id`);
  console.log(`   DELETE /api/videos/:id`);
  console.log(`   POST /api/upload`);
  console.log(`   GET  /api/settings`);
  console.log(`   PUT  /api/settings`);
  console.log(`\n🎯 Frontend should be running on http://localhost:3000`);
  console.log(`🔗 API proxy configured to forward /api requests to this server`);
});