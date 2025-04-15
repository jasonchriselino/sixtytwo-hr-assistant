// trigger redeploy 2025-04-14
import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Simple in-memory rate limiting
const rateLimits = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

const isRateLimited = (ip: string): boolean => {
  const now = Date.now();
  const userLimit = rateLimits.get(ip);

  if (!userLimit) {
    rateLimits.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (now - userLimit.timestamp > RATE_LIMIT_WINDOW) {
    rateLimits.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (userLimit.count >= MAX_REQUESTS) {
    return true;
  }

  userLimit.count++;
  return false;
};

// Clean up old rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimits.entries()) {
    if (now - data.timestamp > RATE_LIMIT_WINDOW) {
      rateLimits.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

export const handler: Handler = async (event, context) => {
  // Enable CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Verify API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error('Missing OpenAI API key');
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Configuration Error',
          message: 'OpenAI API key is not configured'
        })
      };
    }

    // Get client IP
    const clientIP = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';

    // Check rate limit
    if (isRateLimited(clientIP)) {
      return {
        statusCode: 429,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Too Many Requests',
          message: 'Please wait before sending more requests'
        })
      };
    }

    const body = JSON.parse(event.body || '{}');
    const { messages, handbookData } = body;

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid messages format');
    }

    // Get relevant chunks from handbook
    const userMessage = messages[messages.length - 1].content;
    const recentMessages = messages.slice(-3);

    const systemPrompt = `You are an internal HR assistant for Sixty Two. You help team members understand their benefits by answering questions based on official documentation.

🎯 Your Role
- Only use the provided documentation. Never invent or assume information.
- If something is not found, respond with:
  'I couldn't find that in the handbook. You may want to reach out to HR for this one.'
- You may interpret user questions using synonymous terms.
  E.g., "day off benefit" = "types of leave", "leave entitlement"

🧠 Reasoning & Interpretation
- You may break down and interpret questions that involve:
  - Dates, durations, or month-based calculations
  - Basic math (e.g., monthly allocation × remaining months)
- If the handbook gives a clear formula, you may compute and show the exact outcome.
  E.g., "Joining in October = 3 months remaining × Rp 1.000.000 = Rp 3.000.000"
- Always be transparent in how you calculate. If you're unsure of the edge case (e.g., join mid-month), suggest checking with HR.

📝 Response Format
1. Start with a short summary paragraph that directly answers the question in plain language. This should appear even for vague or indirect questions.
   - For yes/no questions, clearly say whether it's allowed or not.
2. Use bullet points or labeled sections to explain eligibility, limitations, steps, or conditions.

✨ Markdown Formatting
- Use markdown for:
  - Bold headings
  - Bulleted lists
  - Short readable sections
- Do not include any links in your answers.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        ...recentMessages
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        response: response.choices[0].message.content
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An error occurred while processing your request'
      })
    };
  }
};