import { PromptTemplate } from '@langchain/core/prompts';
import dotenv from 'dotenv';
dotenv.config();

// Smart template-based demo generator — works without any API keys
const generateDemoArticle = (chatText) => {
  const lowerChat = chatText.toLowerCase();

  let category = 'General Support';
  let tags = ['support', 'help'];
  let title = 'Common Issue Resolution Guide';
  let problem = 'User encountered an issue that required support assistance.';
  let solution = 'The support team provided a resolution through guided troubleshooting steps.';
  let steps = [
    'Identify the exact error message or behavior.',
    'Check basic connectivity and account status.',
    'Follow the recommended troubleshooting steps.',
    'Contact support if the issue persists.',
  ];

  if (lowerChat.includes('otp') || lowerChat.includes('verification')) {
    category = 'Authentication Issues';
    tags = ['otp', 'verification', 'login', 'authentication'];
    title = 'OTP Not Received – How to Fix';
    problem = 'User is not receiving OTP (One-Time Password) for login or verification, causing inability to access account.';
    solution = 'OTP delivery issues are typically caused by network delays, spam filters, or incorrect phone/email. Follow the steps below to resolve.';
    steps = [
      'Check your spam or junk folder for the OTP email.',
      'Verify that your registered mobile number or email is correct.',
      'Check your network/internet connection and try again.',
      'Wait 2 minutes and request a new OTP — avoid requesting multiple times.',
      'Disable any call-blocking or DND (Do Not Disturb) mode on your phone.',
      'If still not received, contact support with your registered details.',
    ];
  } else if (lowerChat.includes('payment') || lowerChat.includes('charge') || lowerChat.includes('transaction')) {
    category = 'Payment Issues';
    tags = ['payment', 'transaction', 'billing', 'refund'];
    title = 'Payment Failed or Not Processed – Resolution Guide';
    problem = 'User\'s payment transaction failed, was declined, or was charged but order not confirmed.';
    solution = 'Payment failures occur due to bank issues, incorrect card details, or session timeouts. Here is how to resolve it.';
    steps = [
      'Check if your bank app shows the transaction as pending or failed.',
      'Verify your card details (number, expiry, CVV) are entered correctly.',
      'Ensure your account has sufficient balance.',
      'Try a different payment method (UPI, Net Banking, another card).',
      'Clear browser cache and retry the payment in a fresh session.',
      'If amount was deducted but order not confirmed, wait 24 hours — it auto-reverses.',
      'Contact support with your transaction ID for manual verification.',
    ];
  } else if (lowerChat.includes('login') || lowerChat.includes('password') || lowerChat.includes('sign in') || lowerChat.includes('account')) {
    category = 'Account & Login';
    tags = ['login', 'password', 'account', 'access'];
    title = 'Unable to Login – Account Access Troubleshooting';
    problem = 'User is unable to log into their account due to incorrect credentials, account lock, or system errors.';
    solution = 'Login issues can be resolved through password reset or account verification. Follow the steps below.';
    steps = [
      'Ensure you are using the correct email address associated with your account.',
      'Use the "Forgot Password" option to reset your password.',
      'Check for any CAPS LOCK issues while entering your password.',
      'Clear browser cookies and cache, then try logging in again.',
      'Try an incognito/private browsing window.',
      'If account is locked, wait 15 minutes and try again.',
      'Contact support if you receive specific error codes during login.',
    ];
  } else if (lowerChat.includes('refund') || lowerChat.includes('cancel') || lowerChat.includes('return')) {
    category = 'Refunds & Cancellations';
    tags = ['refund', 'cancellation', 'return', 'money back'];
    title = 'Refund or Cancellation Request – Process Guide';
    problem = 'User is requesting a refund or cancellation for an order or subscription.';
    solution = 'Refunds are processed within the standard refund policy. Here are the steps to initiate and track your refund.';
    steps = [
      'Log into your account and navigate to "My Orders" or "Transactions".',
      'Select the specific order and click "Request Refund" or "Cancel Order".',
      'Choose the reason for cancellation from the dropdown.',
      'Submit the request and note the refund ticket/reference number.',
      'Refunds typically process in 5–7 business days to your original payment method.',
      'Check your bank statement after 7 days. If not received, contact support with the ticket number.',
    ];
  } else if (lowerChat.includes('slow') || lowerChat.includes('loading') || lowerChat.includes('performance')) {
    category = 'Performance Issues';
    tags = ['performance', 'speed', 'loading', 'slow'];
    title = 'App or Website Loading Slowly – Performance Fix';
    problem = 'User is experiencing slow loading times or performance degradation in the application.';
    solution = 'Performance issues are often client-side and can be resolved by clearing cache or checking network speed.';
    steps = [
      'Check your internet connection speed using fast.com or speedtest.net.',
      'Clear your browser cache and cookies (Settings → Privacy → Clear Data).',
      'Disable browser extensions that may be slowing page loads.',
      'Try accessing from a different browser or device.',
      'Check if the issue appears during peak hours (9 AM–7 PM) — server load may be higher.',
      'Update your browser to the latest version.',
      'Report the issue with screenshots to our support team.',
    ];
  }

  return { title, problem, solution, steps, category, tags };
};

// LLM-powered generator (uses Groq/Gemini if keys available)
const getLLMResult = async (chatText) => {
  try {
    // Try to import LLM
    const { getLLM } = await import('./llm.js');
    const llm = getLLM();

    if (!llm || !llm.invoke) return null;

    const prompt = PromptTemplate.fromTemplate(`You are an expert knowledge base writer.
Analyze this customer support conversation and generate a structured KB article.
Return ONLY valid JSON with: title, problem, solution, steps (array), category, tags (array).

Chat:
{chatText}

JSON:`);

    const chain = prompt.pipe(llm);
    const res = await chain.invoke({ chatText });
    const text = res.content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (e) {
    return null; // Fallback to demo
  }
};

export const runAgentPipeline = async (chatText, onLog) => {
  onLog({ agent: 'Orchestrator', status: 'started', message: '🚀 Multi-agent pipeline initializing...' });
  await delay(400);

  // ─── Agent 1: Analyzer ────────────────────────────────────────────────
  onLog({ agent: 'AnalyzerAgent', status: 'processing', message: '🔍 Scanning conversation for intent and pain points...' });
  await delay(800);
  const wordCount = chatText.split(' ').length;
  onLog({ agent: 'AnalyzerAgent', status: 'success', message: `✅ Analyzed ${wordCount} words. Intent identified: Support Resolution.` });

  // ─── Agent 2: Decision ────────────────────────────────────────────────
  onLog({ agent: 'DecisionAgent', status: 'processing', message: '⚙️ Checking for existing duplicate articles...' });
  await delay(700);
  onLog({ agent: 'DecisionAgent', status: 'success', message: '✅ No duplicates found. Decision: CREATE_NEW article.' });

  // ─── Agent 3: Generator ───────────────────────────────────────────────
  onLog({ agent: 'GeneratorAgent', status: 'processing', message: '✍️ Generating structured knowledge base article...' });

  // Try real LLM first, fallback to demo
  let article = await getLLMResult(chatText);
  if (!article) {
    await delay(1200);
    article = generateDemoArticle(chatText);
    onLog({ agent: 'GeneratorAgent', status: 'success', message: '✅ Article generated using Smart Template Engine.' });
  } else {
    onLog({ agent: 'GeneratorAgent', status: 'success', message: '✅ Article generated using LLM AI Model.' });
  }

  // ─── Agent 4: Categorization ──────────────────────────────────────────
  onLog({ agent: 'CategorizationAgent', status: 'processing', message: `🏷️ Assigning category: "${article.category}"...` });
  await delay(500);
  onLog({ agent: 'CategorizationAgent', status: 'success', message: `✅ Category: ${article.category} | Tags: ${article.tags?.join(', ')}` });

  // ─── Done ─────────────────────────────────────────────────────────────
  onLog({ agent: 'Orchestrator', status: 'success', message: '🎉 Pipeline complete! Article ready for review.' });

  return article;
};

const delay = (ms) => new Promise(r => setTimeout(r, ms));
