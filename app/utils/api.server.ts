// DataForSEO API integration
import { getCredentials, getApiEndpoints } from './storage.client';

export interface DataForSEOAuth {
  username: string;
  password: string;
}

// Get DataForSEO API URLs from storage or defaults
const getDataForSEOUrls = () => {
  try {
    if (typeof window !== 'undefined') {
      const endpoints = getApiEndpoints();
      const { baseUrl, serpEndpoint, onPageEndpoint, contentAnalysisEndpoint, keywordDataEndpoint } = endpoints.dataForSeo;
      
      return {
        API_BASE_URL: baseUrl,
        SERP_API_URL: `${baseUrl}${serpEndpoint}`,
        ONPAGE_API_URL: `${baseUrl}${onPageEndpoint}`,
        CONTENT_ANALYSIS_API_URL: `${baseUrl}${contentAnalysisEndpoint}`,
        KEYWORD_API_URL: `${baseUrl}${keywordDataEndpoint}`
      };
    }
  } catch (error) {
    console.error('Error getting DataForSEO endpoints from storage:', error);
  }
  
  // Fallback to defaults if storage access fails
  return {
    API_BASE_URL: "https://api.dataforseo.com/v3",
    SERP_API_URL: "https://api.dataforseo.com/v3/serp",
    ONPAGE_API_URL: "https://api.dataforseo.com/v3/on_page",
    CONTENT_ANALYSIS_API_URL: "https://api.dataforseo.com/v3/content_analysis",
    KEYWORD_API_URL: "https://api.dataforseo.com/v3/keywords_data"
  };
};

// Get API credentials from environment variables or storage
const getAuth = (): DataForSEOAuth => {
  // Try to get from environment variables first
  const envUsername = process.env.DATAFORSEO_USERNAME;
  const envPassword = process.env.DATAFORSEO_PASSWORD;
  
  if (envUsername && envPassword) {
    return { username: envUsername, password: envPassword };
  }
  
  // If not in environment, try to get from client storage
  try {
    if (typeof window !== 'undefined') {
      const credentials = getCredentials();
      const { username, password } = credentials.dataForSeo;
      
      if (username && password) {
        return { username, password };
      }
    }
  } catch (error) {
    console.error('Error getting DataForSEO credentials from storage:', error);
  }
  
  throw new Error("DataForSEO API credentials not found in environment variables or storage");
};

// Helper function to make DataForSEO API requests
async function makeDataForSEORequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: object
): Promise<T> {
  const auth = getAuth();
  const credentials = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
  const urls = getDataForSEOUrls();
  
  const headers = {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json'
  };
  
  const options: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  };
  
  try {
    const response = await fetch(endpoint, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`DataForSEO API error: ${errorData.error_message || 'Unknown error'}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error('DataForSEO API request failed:', error);
    throw error;
  }
}

// API Functions for SEO Analyzer
export async function analyzeSite(url: string) {
  const urls = getDataForSEOUrls();
  const body = [
    {
      "target": url,
      "max_crawl_pages": 10,
      "load_resources": true,
      "enable_javascript": true,
      "enable_browser_rendering": true,
      "custom_js": "meta = {}; meta.title = document.title; meta;"
    }
  ];
  
  return makeDataForSEORequest(
    `${urls.ONPAGE_API_URL}/task_post`,
    'POST',
    body
  );
}

export async function getSiteAnalysis(taskId: string) {
  const urls = getDataForSEOUrls();
  return makeDataForSEORequest(
    `${urls.ONPAGE_API_URL}/summary/${taskId}`
  );
}

// API Functions for Keyword Research
export async function searchKeywords(keyword: string, language_code = "en", location_code = 2840) {
  const urls = getDataForSEOUrls();
  const body = [
    {
      "keyword": keyword,
      "language_code": language_code,
      "location_code": location_code,
      "calculate_rectangles": true
    }
  ];
  
  return makeDataForSEORequest(
    `${urls.KEYWORD_API_URL}/google/search_volume/live`,
    'POST',
    body
  );
}

export async function getKeywordSuggestions(keyword: string, language_code = "en", location_code = 2840) {
  const urls = getDataForSEOUrls();
  const body = [
    {
      "keyword": keyword,
      "language_code": language_code,
      "location_code": location_code,
      "include_seed_keyword": true,
      "depth": 2
    }
  ];
  
  return makeDataForSEORequest(
    `${urls.KEYWORD_API_URL}/google/keyword_ideas/live`,
    'POST',
    body
  );
}

// API Functions for Content Optimization
export async function analyzeContent(content: string, target_keyword: string) {
  const urls = getDataForSEOUrls();
  const body = [
    {
      "content": content,
      "target_keyword": target_keyword,
      "check_spell": true,
      "check_grammar": true,
      "content_info": {
        "content_type": "text"
      }
    }
  ];
  
  return makeDataForSEORequest(
    `${urls.CONTENT_ANALYSIS_API_URL}/semantic_analysis/live`,
    'POST',
    body
  );
}

export async function analyzeReadability(content: string) {
  const urls = getDataForSEOUrls();
  const body = [
    {
      "content": content,
      "content_info": {
        "content_type": "text"
      }
    }
  ];
  
  return makeDataForSEORequest(
    `${urls.CONTENT_ANALYSIS_API_URL}/text_metrics/live`,
    'POST',
    body
  );
}

// API Functions for Competitor Analysis
export async function analyzeBatchDomains(domains: string[], language_code = "en", location_code = 2840) {
  const urls = getDataForSEOUrls();
  const body = domains.map(domain => ({
    "target": domain,
    "language_code": language_code,
    "location_code": location_code,
    "load_resources": true,
    "enable_javascript": true
  }));
  
  return makeDataForSEORequest(
    `${urls.ONPAGE_API_URL}/task_post`,
    'POST',
    body
  );
}

export async function compareDomains(taskIds: string[]) {
  const urls = getDataForSEOUrls();
  // Fetch all domain data in parallel
  const promises = taskIds.map(taskId => 
    makeDataForSEORequest(`${urls.ONPAGE_API_URL}/summary/${taskId}`)
  );
  
  return Promise.all(promises);
}
