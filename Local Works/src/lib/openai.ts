import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Simple in-memory cache for common Q&As
const cache = new Map<string, { response: string; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour in milliseconds
const MAX_CACHE_SIZE = 100;

// Function to get semantic chunks from handbook data
const getRelevantChunks = (query: string, handbookData: any, maxChunks = 2) => {
  const chunks: { content: string; score: number }[] = [];
  
  // Process each page
  handbookData.pages.forEach((page: any) => {
    // Add page title and sections
    page.sections.forEach((section: any) => {
      if (section.content) {
        const chunk = {
          content: `${page.pageTitle} - ${section.heading}:\n${Array.isArray(section.content) ? section.content.join('\n') : section.content}`,
          score: 0
        };
        
        // Simple relevance scoring based on keyword matching
        const keywords = query.toLowerCase().split(' ');
        chunk.score = keywords.reduce((score, keyword) => {
          return score + (chunk.content.toLowerCase().includes(keyword) ? 1 : 0);
        }, 0);
        
        chunks.push(chunk);
      }
    });
  });
  
  // Sort by relevance score and take top chunks
  return chunks
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks)
    .map(chunk => chunk.content)
    .join('\n\n');
};

// Function to normalize text for cache key generation
const normalizeText = (text: string): string => {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
};

// Function to clean up old cache entries
const cleanCache = () => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
  
  // If still too large, remove oldest entries
  if (cache.size > MAX_CACHE_SIZE) {
    const sortedEntries = Array.from(cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const entriesToRemove = sortedEntries.slice(0, sortedEntries.length - MAX_CACHE_SIZE);
    entriesToRemove.forEach(([key]) => cache.delete(key));
  }
};

export const generateResponse = async (
  messages: { role: 'user' | 'assistant'; content: string }[],
  handbookData: any
): Promise<string> => {
  try {
    // Get the current user message
    const userMessage = messages[messages.length - 1].content;
    const normalizedMessage = normalizeText(userMessage);
    
    // Check cache first
    const cachedResponse = cache.get(normalizedMessage);
    if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_TTL) {
      return cachedResponse.response;
    }
    
    // Clean up cache periodically
    cleanCache();
    
    // Get relevant chunks from handbook
    const relevantContent = getRelevantChunks(userMessage, handbookData);
    
    // Limit conversation history to last 3 messages
    const recentMessages = messages.slice(-3);
    
    const systemPrompt = `You are an internal HR assistant for Sixty Two. You help team members understand their benefits by answering questions based on official documentation.

🎯 Your Role
- "Only use the provided documentation. Never invent or assume information."
- "If something is not found, respond with:
  'I couldn't find that in the handbook. You may want to reach out to HR for this one.'"
- "You may interpret user questions using synonymous terms.
  E.g., "day off benefit" = "types of leave", "leave entitlement""

🧠 Reasoning & Interpretation
- "You may break down and interpret questions that involve:"
  - "Dates, durations, or month-based calculations"
  - "Basic math (e.g., monthly allocation × remaining months)"
- "If the handbook gives a clear formula, you may compute and show the exact outcome.
  E.g., "Joining in October = 3 months remaining × Rp 1.000.000 = Rp 3.000.000""
- "Always be transparent in how you calculate. If you're unsure of the edge case (e.g., join mid-month), suggest checking with HR."

📝 Response Format
1. "Start with a short summary paragraph that directly answers the question in plain language. This should appear even for vague or indirect questions."
   - "For yes/no questions, clearly say whether it's allowed or not."
2. "Use bullet points or labeled sections to explain eligibility, limitations, steps, or conditions."

✨ Markdown Formatting
- "Use markdown for:"
  - "Bold headings"
  - "Bulleted lists"
  - "Short readable sections"
- "Do not include any links in your answers."

Relevant handbook sections:
${relevantContent}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        ...recentMessages
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const generatedResponse = response.choices[0].message.content || 
      "I apologize, but I couldn't generate a response.";
    
    // Cache the response
    cache.set(normalizedMessage, {
      response: generatedResponse,
      timestamp: Date.now()
    });

    return generatedResponse;
  } catch (error) {
    console.error('Error generating response:', error);
    return "I apologize, but I encountered an error while processing your request. Please try again.";
  }
};