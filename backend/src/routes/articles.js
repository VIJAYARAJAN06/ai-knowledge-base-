import express from 'express';
import jwt from 'jsonwebtoken';
import Article from '../models/Article.js';

const router = express.Router();

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// GET all articles
router.get('/', async (req, res) => {
  try {
    const search = req.query.q;
    let query = {};
    if (search) {
      query = { title: { $regex: search, $options: 'i' } };
    }
    const articles = await Article.find(query).sort({ createdAt: -1 });
    res.json(articles);
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// POST save generated article
router.post('/save', authMiddleware, async (req, res) => {
  try {
    const articleData = req.body;
    const newArticle = new Article({
      ...articleData,
      userId: req.user.id
    });
    await newArticle.save();
    res.status(201).json(newArticle);
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
