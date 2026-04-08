import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { runAgentPipeline } from './src/agents/orchestrator.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ─── In-memory article store (works without MongoDB) ──────────────────────────
const inMemoryArticles = [];
const inMemoryUsers = [];
let useInMemory = true;

// ─── Connect MongoDB (optional) ───────────────────────────────────────────────
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.log('ℹ️  No MONGO_URI — running in In-Memory Demo Mode (articles reset on restart)');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    useInMemory = false;
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.warn('⚠️  MongoDB failed — falling back to In-Memory Mode:', error.message);
  }
};
connectDB();

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: useInMemory ? 'demo' : 'production', port: PORT });
});

// ─── Auth Routes (In-Memory or MongoDB) ──────────────────────────────────────
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const JWT_SECRET = process.env.JWT_SECRET || 'agentic_ai_demo_secret_2024';

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'All fields required' });

  if (useInMemory) {
    const exists = inMemoryUsers.find(u => u.email === email);
    if (exists) return res.status(400).json({ error: 'User already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = { id: Date.now().toString(), email, name, password: hashed };
    inMemoryUsers.push(user);
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({ token, user: { id: user.id, email, name } });
  }

  try {
    const { default: User } = await import('./src/models/User.js');
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });
    user = new User({ email, password, name });
    await user.save();
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, email, name } });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  if (useInMemory) {
    const user = inMemoryUsers.find(u => u.email === email);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  }

  try {
    const { default: User } = await import('./src/models/User.js');
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── JWT Auth Middleware ──────────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
};

// ─── Articles Routes ──────────────────────────────────────────────────────────
app.get('/api/articles', async (req, res) => {
  const q = req.query.q?.toLowerCase() || '';
  if (useInMemory) {
    const filtered = q
      ? inMemoryArticles.filter(a => a.title?.toLowerCase().includes(q) || a.category?.toLowerCase().includes(q))
      : inMemoryArticles;
    return res.json([...filtered].reverse());
  }
  try {
    const { default: Article } = await import('./src/models/Article.js');
    const query = q ? { title: { $regex: q, $options: 'i' } } : {};
    res.json(await Article.find(query).sort({ createdAt: -1 }));
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/articles/save', authMiddleware, async (req, res) => {
  const article = { ...req.body, id: Date.now().toString(), userId: req.user.id, createdAt: new Date().toISOString() };
  if (useInMemory) {
    inMemoryArticles.push(article);
    return res.status(201).json(article);
  }
  try {
    const { default: Article } = await import('./src/models/Article.js');
    const saved = new Article({ ...req.body, userId: req.user.id });
    await saved.save();
    res.status(201).json(saved);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── AI Pipeline — Server-Sent Events ────────────────────────────────────────
app.post('/api/generate', async (req, res) => {
  const { chatText } = req.body;
  if (!chatText?.trim()) return res.status(400).json({ error: 'chatText is required' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const onLog = (logObj) => {
    res.write(`data: ${JSON.stringify(logObj)}\n\n`);
  };

  try {
    const generatedArticle = await runAgentPipeline(chatText, onLog);
    if (generatedArticle) {
      onLog({ type: 'FINAL_RESULT', payload: generatedArticle });
    } else {
      onLog({ type: 'ERROR', message: 'Pipeline failed to generate article.' });
    }
  } catch (error) {
    onLog({ type: 'ERROR', message: error.message });
  }

  res.end();
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Mode: ${process.env.MONGO_URI ? 'MongoDB' : 'In-Memory Demo'}`);
  console.log(`🤖 AI: ${process.env.GROQ_API_KEY ? 'Groq Llama3' : process.env.GEMINI_API_KEY ? 'Gemini' : 'Smart Demo Engine'}\n`);
});
