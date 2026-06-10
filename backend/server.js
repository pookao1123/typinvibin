import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import topicsRouter from './routes/topics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/topics', topicsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TypinVibin Backend is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'TypinVibin Backend API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      topics: 'GET /api/topics',
      topic: 'GET /api/topics/:id'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ TypinVibin Backend running on http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}`);
  console.log(`🎯 Topics: http://localhost:${PORT}/api/topics`);
});
