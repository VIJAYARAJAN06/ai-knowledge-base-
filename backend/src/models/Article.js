import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  problem: { type: String, required: true },
  solution: { type: String, required: true },
  steps: [{ type: String }],
  category: { type: String, default: 'Uncategorized' },
  tags: [{ type: String }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The author/creator
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Article', articleSchema);
