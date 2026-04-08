import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { runAgentPipeline } from './src/agents/orchestrator.js';

import authRoutes from './src/routes/auth.js';
import articleRoutes from './src/routes/articles.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect DB
const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB Connected');
    } else {
      console.warn('NO MONGO_URI PROVIDED. Database processes will fail unless provided.');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};
connectDB();

app.get('/api/health', (req, res) => {
  res.json({ status: 'Ok', message: 'Backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);

// Real-time Agent Pipeline SSE stream
app.post('/api/generate', async (req, res) => {
  const { chatText } = req.body;
  if (!chatText) return res.status(400).json({ error: 'chatText is required' });

  // Initiate SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const onLog = (logObj) => {
    res.write(`data: ${JSON.stringify(logObj)}\n\n`);
  };

  try {
    const generatedArticle = await runAgentPipeline(chatText, onLog);
    
    // Once finished, send final payload (Client will decide whether to save via POST /api/articles/save)
    if (generatedArticle) {
      onLog({ type: 'FINAL_RESULT', payload: generatedArticle });
    } else {
      onLog({ type: 'ERROR', message: 'Pipeline failed' });
    }
  } catch (error) {
    onLog({ type: 'ERROR', message: error.message });
  }

  res.end();
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
