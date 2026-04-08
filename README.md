# 🤖 Agentic AI Knowledge Base Generator

> Transform raw customer support chats into structured, professional knowledge base articles — automatically — using a multi-agent AI pipeline.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://github.com/VIJAYARAJAN06/ai-knowledge-base-)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Free Forever](https://img.shields.io/badge/Cost-100%25%20Free-green?style=for-the-badge)](https://github.com/VIJAYARAJAN06/ai-knowledge-base-)

---

## ✨ Features

- **5 Specialized AI Agents** — Analyzer, Generator, Categorization, Duplicate Detection & Decision
- **Real-time SSE Streaming** — Watch agents fire in real-time through a live React Flow graph
- **3D Neural Network Landing Page** — Three.js + GSAP powered cinematic hero
- **JWT Authentication** — Secure user login & signup with bcrypt password hashing
- **MongoDB Atlas** — Free-tier cloud database for persistent article storage
- **Edit-Before-Save** — Review and manually tweak AI output before committing
- **AI-Powered Search** — Fuzzy search across your entire knowledge base
- **Fully Free Deployment** — Vercel (frontend) + Render (backend)

---

## 🏗️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React, Vite, TailwindCSS v4, GSAP, Three.js |
| Backend | Node.js, Express, SSE |
| AI | LangChain + Groq (Llama3) or Google Gemini |
| Database | MongoDB Atlas (Free Tier) |
| Auth | JWT + bcrypt |
| Hosting | Vercel + Render (both free) |

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/VIJAYARAJAN06/ai-knowledge-base-.git
cd ai-knowledge-base-
```

### 2. Setup Backend
```bash
cd backend
npm install
```
Create a `.env` file in `/backend`:
```env
MONGO_URI=mongodb+srv://...
GROQ_API_KEY=gsk_...
JWT_SECRET=your_random_secret
```
Run:
```bash
node server.js
```

### 3. Setup Frontend
```bash
cd frontend
npm install
cmd.exe /c "npm run dev"
```
Open: `http://localhost:5173`

---

## 🌐 Free Deployment

1. Push to GitHub.
2. **Frontend → [Vercel](https://vercel.com/)**: Import repo → set Root Directory to `frontend`.
3. **Backend → [Render](https://render.com/)**: Import repo → set Root Directory to `backend` → Start Command: `node server.js`.
4. Add Environment Variables (MONGO_URI, GROQ_API_KEY, JWT_SECRET) in both platforms.

---

## 👨‍💻 Author

**VIJAYARAJAN** — [GitHub](https://github.com/VIJAYARAJAN06)

---

*Built with ❤️ and zero cloud bills.*
