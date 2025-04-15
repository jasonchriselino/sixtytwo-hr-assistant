// Simple in-memory cache for common Q&As
const cache = new Map<string, { response: string; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour in milliseconds
const MAX_CACHE_SIZE = 100;

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

    // Get the base URL for the API
    const baseUrl = import.meta.env.DEV 
      ? `${window.location.protocol}//${window.location.hostname}:8888`
      : window.location.origin;

    // Use the /api/chat endpoint which will be redirected to the Netlify function
    const functionUrl = `${baseUrl}/api/chat`;
    
    // Set up request options with proper headers and timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          messages,
          handbookData
        }),
        signal: controller.signal,
        credentials: 'omit' // Explicitly disable credentials
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details available');
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment before sending another message.');
        }
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      if (!data || !data.response) {
        throw new Error('Invalid response from server');
      }

      // Cache the successful response
      cache.set(normalizedMessage, {
        response: data.response,
        timestamp: Date.now()
      });

      return data.response;
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    // Enhanced error logging in development
    if (import.meta.env.DEV) {
      console.error('Error generating response:', {
        error,
        messages,
        timestamp: new Date().toISOString()
      });
    }
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : "An unexpected error occurred while processing your request. Please try again.";
    throw new Error(errorMessage);
  }
};