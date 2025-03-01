// Storage keys
const STORAGE_KEYS = {
  PROJECTS: 'seo-toolkit-projects',
  RECENT_ANALYSES: 'seo-toolkit-recent-analyses',
  SAVED_KEYWORDS: 'seo-toolkit-saved-keywords',
  SAVED_CONTENT: 'seo-toolkit-saved-content',
  COMPETITOR_ANALYSES: 'seo-toolkit-competitor-analyses',
  SETTINGS: 'seo-toolkit-settings',
  CREDENTIALS: 'seo-toolkit-credentials',
  API_ENDPOINTS: 'seo-toolkit-api-endpoints'
};

// Project interface
export interface Project {
  id: string;
  name: string;
  url: string;
  dateCreated: string;
  dateUpdated: string;
}

// Analysis result interface
export interface AnalysisResult {
  id: string;
  url: string;
  dateAnalyzed: string;
  score: number;
  taskId?: string;
  summaryData?: any;
}

// Keyword interface
export interface SavedKeyword {
  id: string;
  keyword: string;
  dateAdded: string;
  volume?: number;
  difficulty?: number;
  cpc?: number;
  related?: string[];
}

// Content interface
export interface SavedContent {
  id: string;
  title: string;
  content: string;
  targetKeywords: string[];
  dateCreated: string;
  dateUpdated: string;
  score?: number;
}

// Competitor analysis interface
export interface CompetitorAnalysis {
  id: string;
  dateCreated: string;
  mainDomain: string;
  competitorDomains: string[];
  results?: any;
}

// Credentials interface
export interface Credentials {
  dataForSeo: {
    username: string;
    password: string;
  };
  openai: {
    apiKey: string;
    model: string;
    baseUrl: string;
  };
}

// API Endpoints interface
export interface ApiEndpoints {
  dataForSeo: {
    baseUrl: string;
    serpEndpoint: string;
    onPageEndpoint: string;
    contentAnalysisEndpoint: string;
    keywordDataEndpoint: string;
  };
}

// Settings interface
export interface UserSettings {
  language: string;
  country: string;
  defaultKeywordLocation?: string;
  theme?: 'light' | 'dark';
}

// OpenAI LLM Models
export const OPENAI_MODELS = [
  { id: 'gpt-4', name: 'GPT-4', description: 'Most powerful model for complex tasks' },
  { id: 'gpt-4-1106-preview', name: 'GPT-4 Turbo', description: 'Best performance-to-cost model, newer knowledge' },
  { id: 'gpt-4-vision-preview', name: 'GPT-4 Vision', description: 'Supports image understanding' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Good balance of capability and cost' },
  { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16K', description: 'Extended context window' }
];

// Generic get function for local storage
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return defaultValue;
  }
}

// Generic set function for local storage
function setInStorage(key: string, value: any): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    throw error; // Re-throw to alert the caller of the issue
  }
}

// Project storage functions
export function getProjects(): Project[] {
  return getFromStorage<Project[]>(STORAGE_KEYS.PROJECTS, []);
}

export function saveProject(project: Project): void {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === project.id);
  
  if (index >= 0) {
    // Update existing project
    projects[index] = { ...project, dateUpdated: new Date().toISOString() };
  } else {
    // Add new project
    projects.push({
      ...project,
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString()
    });
  }
  
  setInStorage(STORAGE_KEYS.PROJECTS, projects);
}

export function deleteProject(projectId: string): void {
  const projects = getProjects();
  setInStorage(STORAGE_KEYS.PROJECTS, projects.filter(p => p.id !== projectId));
}

// Analysis storage functions
export function getRecentAnalyses(): AnalysisResult[] {
  return getFromStorage<AnalysisResult[]>(STORAGE_KEYS.RECENT_ANALYSES, []);
}

export function saveAnalysisResult(analysis: AnalysisResult): void {
  const analyses = getRecentAnalyses();
  const index = analyses.findIndex(a => a.id === analysis.id);
  
  if (index >= 0) {
    // Update existing analysis
    analyses[index] = analysis;
  } else {
    // Add new analysis
    analyses.unshift(analysis);
    
    // Keep only the 10 most recent analyses
    if (analyses.length > 10) {
      analyses.pop();
    }
  }
  
  setInStorage(STORAGE_KEYS.RECENT_ANALYSES, analyses);
}

export function deleteAnalysisResult(analysisId: string): void {
  const analyses = getRecentAnalyses();
  setInStorage(STORAGE_KEYS.RECENT_ANALYSES, analyses.filter(a => a.id !== analysisId));
}

// Keyword storage functions
export function getSavedKeywords(): SavedKeyword[] {
  return getFromStorage<SavedKeyword[]>(STORAGE_KEYS.SAVED_KEYWORDS, []);
}

export function saveKeyword(keyword: SavedKeyword): void {
  const keywords = getSavedKeywords();
  const index = keywords.findIndex(k => k.id === keyword.id);
  
  if (index >= 0) {
    // Update existing keyword
    keywords[index] = keyword;
  } else {
    // Add new keyword
    keywords.push({
      ...keyword,
      dateAdded: new Date().toISOString()
    });
  }
  
  setInStorage(STORAGE_KEYS.SAVED_KEYWORDS, keywords);
}

export function deleteKeyword(keywordId: string): void {
  const keywords = getSavedKeywords();
  setInStorage(STORAGE_KEYS.SAVED_KEYWORDS, keywords.filter(k => k.id !== keywordId));
}

// Content storage functions
export function getSavedContent(): SavedContent[] {
  return getFromStorage<SavedContent[]>(STORAGE_KEYS.SAVED_CONTENT, []);
}

export function saveContent(content: SavedContent): void {
  const contents = getSavedContent();
  const index = contents.findIndex(c => c.id === content.id);
  
  if (index >= 0) {
    // Update existing content
    contents[index] = {
      ...content,
      dateUpdated: new Date().toISOString()
    };
  } else {
    // Add new content
    contents.push({
      ...content,
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString()
    });
  }
  
  setInStorage(STORAGE_KEYS.SAVED_CONTENT, contents);
}

export function deleteContent(contentId: string): void {
  const contents = getSavedContent();
  setInStorage(STORAGE_KEYS.SAVED_CONTENT, contents.filter(c => c.id !== contentId));
}

// Competitor analysis storage functions
export function getCompetitorAnalyses(): CompetitorAnalysis[] {
  return getFromStorage<CompetitorAnalysis[]>(STORAGE_KEYS.COMPETITOR_ANALYSES, []);
}

export function saveCompetitorAnalysis(analysis: CompetitorAnalysis): void {
  const analyses = getCompetitorAnalyses();
  const index = analyses.findIndex(a => a.id === analysis.id);
  
  if (index >= 0) {
    // Update existing analysis
    analyses[index] = analysis;
  } else {
    // Add new analysis
    analyses.push({
      ...analysis,
      dateCreated: new Date().toISOString()
    });
  }
  
  setInStorage(STORAGE_KEYS.COMPETITOR_ANALYSES, analyses);
}

export function deleteCompetitorAnalysis(analysisId: string): void {
  const analyses = getCompetitorAnalyses();
  setInStorage(STORAGE_KEYS.COMPETITOR_ANALYSES, analyses.filter(a => a.id !== analysisId));
}

// Credentials storage functions
export function getCredentials(): Credentials {
  return getFromStorage<Credentials>(STORAGE_KEYS.CREDENTIALS, {
    dataForSeo: {
      username: '',
      password: ''
    },
    openai: {
      apiKey: '',
      model: 'gpt-4',
      baseUrl: 'https://api.openai.com/v1'
    }
  });
}

export function saveCredentials(credentials: Credentials): void {
  setInStorage(STORAGE_KEYS.CREDENTIALS, credentials);
}

// API Endpoints storage functions
export function getApiEndpoints(): ApiEndpoints {
  return getFromStorage<ApiEndpoints>(STORAGE_KEYS.API_ENDPOINTS, {
    dataForSeo: {
      baseUrl: 'https://api.dataforseo.com/v3',
      serpEndpoint: '/serp',
      onPageEndpoint: '/on_page',
      contentAnalysisEndpoint: '/content_analysis',
      keywordDataEndpoint: '/keywords_data'
    }
  });
}

export function saveApiEndpoints(endpoints: ApiEndpoints): void {
  setInStorage(STORAGE_KEYS.API_ENDPOINTS, endpoints);
}

// Settings storage functions
export function getUserSettings(): UserSettings {
  return getFromStorage<UserSettings>(STORAGE_KEYS.SETTINGS, {
    language: 'en',
    country: 'US',
    defaultKeywordLocation: '2840', // Default to United States
    theme: 'light'
  });
}

export function saveUserSettings(settings: UserSettings): void {
  setInStorage(STORAGE_KEYS.SETTINGS, settings);
}

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
