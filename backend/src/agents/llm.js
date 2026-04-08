import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatGroq } from '@langchain/groq';
import dotenv from 'dotenv';
dotenv.config();

export const getLLM = () => {
  if (process.env.GROQ_API_KEY) {
    return new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama3-8b-8192", // Groq free tier model mapping
      temperature: 0.2
    });
  } else if (process.env.GEMINI_API_KEY) {
    return new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      model: "gemini-1.5-flash", // Gemini free tier model
      temperature: 0.2
    });
  } else {
    console.warn("NO API KEY PROVIDED! Please set GROQ_API_KEY or GEMINI_API_KEY in backend/.env");
    // Throw error or handle gracefully
    // Returning dummy for scaffolding
    return {
      invoke: async () => ({ content: 'Placeholder LLM Response. Setup API Keys in .env' })
    };
  }
};
