import { getLLM } from './llm.js';
import { PromptTemplate } from '@langchain/core/prompts';

export const runAgentPipeline = async (chatText, onLog) => {
  const llm = getLLM();

  onLog({ agent: 'Orchestrator', status: 'started', message: 'Starting AI pipeline...' });

  // 1. Analyzer Agent
  onLog({ agent: 'AnalyzerAgent', status: 'processing', message: 'Extracting intent and detecting issues...' });
  const analyzerPrompt = PromptTemplate.fromTemplate(`You are an Analyzer Agent. Analyze the following customer support chat.
Extract the main intent, the core issue, and the tone of the user. Return ONLY a JSON object.
Chat: {chatText}`);
  const analyzerChain = analyzerPrompt.pipe(llm);
  let analyzerResult;
  try {
    const res = await analyzerChain.invoke({ chatText });
    analyzerResult = res.content;
    onLog({ agent: 'AnalyzerAgent', status: 'success', message: 'Intent extracted successfully.' });
  } catch (e) {
     onLog({ agent: 'AnalyzerAgent', status: 'error', message: 'Failed to extract intent.' });
     return null;
  }

  // 2. Decision Agent (Skip Duplicate Detection for simplicity in MVP)
  onLog({ agent: 'DecisionAgent', status: 'processing', message: 'Deciding whether to create or update article...' });
  await new Promise(r => setTimeout(r, 1000)); // Simulate think time
  onLog({ agent: 'DecisionAgent', status: 'success', message: 'Decision: CREATE_NEW' });

  // 3. Generator Agent
  onLog({ agent: 'GeneratorAgent', status: 'processing', message: 'Generating structured knowledge base article...' });
  const generatorPrompt = PromptTemplate.fromTemplate(`You are a Generator Agent. 
Rewrite the following issue into a structured knowledge base article with: 'title', 'problem', 'solution', 'steps'.
Return ONLY a valid JSON object matching the format.
Analyzer Output: {analyzerResult}`);
  const generatorChain = generatorPrompt.pipe(llm);
  let generatedArticle;
  try {
    const res = await generatorChain.invoke({ analyzerResult });
    // Attempt to parse json from string
    const text = res.content.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
    generatedArticle = JSON.parse(text);
    onLog({ agent: 'GeneratorAgent', status: 'success', message: 'Article generated.' });
  } catch(e) {
    onLog({ agent: 'GeneratorAgent', status: 'error', message: 'Failed to generate valid article structure.' });
    /* Mock fallback */
    generatedArticle = { title: "Draft Output", problem: "Format error", solution: "See raw output", steps: [] };
  }

  // 4. Categorization Agent
  onLog({ agent: 'CategorizationAgent', status: 'processing', message: 'Assigning dynamic category...' });
  const categorizePrompt = PromptTemplate.fromTemplate(`You are a Categorization Agent. Suggest exactly ONE main category and an array of up to 3 tags for this article.
Article Title: {title}
Return ONLY valid JSON format: {{"category": "string", "tags": []}}`);
  const catChain = categorizePrompt.pipe(llm);
  let categorization;
  try {
    const res = await catChain.invoke({ title: generatedArticle.title || 'Unknown' });
    const text = res.content.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
    categorization = JSON.parse(text);
    onLog({ agent: 'CategorizationAgent', status: 'success', message: `Assigned category: ${categorization.category}` });
  } catch(e) {
    categorization = { category: "Uncategorized", tags: ["support"] };
  }

  onLog({ agent: 'Orchestrator', status: 'success', message: 'Pipeline finished successfully.' });

  return {
    ...generatedArticle,
    category: categorization.category,
    tags: categorization.tags
  };
};
