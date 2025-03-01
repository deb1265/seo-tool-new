// OpenAI API integration
import { getCredentials } from './storage.client';

// OpenAI configuration type
interface OpenAIConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
}

// Get OpenAI configuration
const getOpenAIConfig = (): OpenAIConfig => {
  // Try to get from environment variables first
  const envApiKey = process.env.OPENAI_API_KEY;
  const envModel = process.env.OPENAI_MODEL || 'gpt-4';
  const envBaseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  
  if (envApiKey) {
    return { 
      apiKey: envApiKey, 
      model: envModel,
      baseUrl: envBaseUrl
    };
  }
  
  // If not in environment, try to get from client storage
  try {
    if (typeof window !== 'undefined') {
      const credentials = getCredentials();
      const { apiKey, model, baseUrl } = credentials.openai;
      
      if (apiKey) {
        return { 
          apiKey, 
          model: model || 'gpt-4',
          baseUrl: baseUrl || 'https://api.openai.com/v1'
        };
      }
    }
  } catch (error) {
    console.error('Error getting OpenAI credentials from storage:', error);
  }
  
  throw new Error("OpenAI API key not found in environment variables or storage");
};

// Helper function to make OpenAI API requests
async function makeOpenAIRequest<T>(
  endpoint: string,
  body: object
): Promise<T> {
  const config = getOpenAIConfig();
  const url = `${config.baseUrl}${endpoint}`;
  
  const headers = {
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json'
  };
  
  const options: RequestInit = {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  };
  
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error('OpenAI API request failed:', error);
    throw error;
  }
}

// Use the dynamic model from settings
const getDynamicModel = () => {
  try {
    const config = getOpenAIConfig();
    return config.model;
  } catch (error) {
    console.error('Error getting model configuration:', error);
    return 'gpt-4'; // Fallback to a default model
  }
};

// Sample OpenAI API functions
export async function generateSeoSuggestions(url: string, content: string) {
  const model = getDynamicModel();
  
  const body = {
    model: model,
    messages: [
      {
        role: "system",
        content: "You are an expert SEO consultant. Analyze the content and provide actionable suggestions to improve SEO."
      },
      {
        role: "user",
        content: `Analyze the following content from ${url} and provide 3-5 specific SEO improvement suggestions:\n\n${content}`
      }
    ],
    temperature: 0.7,
    max_tokens: 800
  };
  
  return makeOpenAIRequest('/chat/completions', body);
}

export async function generateMetaDescription(title: string, content: string) {
  const model = getDynamicModel();
  
  const body = {
    model: model,
    messages: [
      {
        role: "system",
        content: "You are an expert SEO consultant. Generate optimized meta descriptions that are compelling and under 160 characters."
      },
      {
        role: "user",
        content: `Generate an SEO-optimized meta description for the following content:\nTitle: ${title}\nContent: ${content}`
      }
    ],
    temperature: 0.7,
    max_tokens: 200
  };
  
  return makeOpenAIRequest('/chat/completions', body);
}

export async function analyzeKeywordDifficulty(keyword: string, competitors: string[]) {
  const model = getDynamicModel();
  
  const body = {
    model: model,
    messages: [
      {
        role: "system",
        content: "You are an expert SEO and keyword research specialist. Analyze keywords and provide insights on difficulty and strategy."
      },
      {
        role: "user",
        content: `Analyze the keyword "${keyword}" and provide insights on its difficulty level, considering these competitors: ${competitors.join(', ')}`
      }
    ],
    temperature: 0.7,
    max_tokens: 500
  };
  
  return makeOpenAIRequest('/chat/completions', body);
}

export async function generateContentBrief(keyword: string, targetAudience: string) {
  const model = getDynamicModel();
  
  const body = {
    model: model,
    messages: [
      {
        role: "system",
        content: "You are an expert content strategist and SEO consultant. Create detailed content briefs to help writers create SEO-optimized content."
      },
      {
        role: "user",
        content: `Create a content brief for an article targeting the keyword "${keyword}" for ${targetAudience}. Include suggested headings, key points to cover, and relevant secondary keywords.`
      }
    ],
    temperature: 0.7,
    max_tokens: 1000
  };
  
  return makeOpenAIRequest('/chat/completions', body);
}
