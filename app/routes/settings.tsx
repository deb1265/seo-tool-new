import { useState, useEffect } from 'react';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/node';
import Navbar from '~/components/layout/Navbar';
import Card from '~/components/ui/Card';
import { 
  getUserSettings, 
  saveUserSettings, 
  getCredentials, 
  saveCredentials, 
  getApiEndpoints,
  saveApiEndpoints,
  Credentials,
  ApiEndpoints
} from '~/utils/storage.client';

export const meta: MetaFunction = () => {
  return [
    { title: "Settings - SEO Toolkit Pro" },
    { name: "description", content: "Configure your SEO Toolkit Pro settings and API credentials" },
  ];
};

export const loader = async () => {
  return json({
    serverDate: new Date().toISOString(),
  });
};

// Define models directly in the component to avoid server-side rendering issues
const DEFAULT_OPENAI_MODELS = [
  { id: 'gpt-4', name: 'GPT-4', description: 'Most powerful model for complex tasks' },
  { id: 'gpt-4-1106-preview', name: 'GPT-4 Turbo', description: 'Best performance-to-cost model, newer knowledge' },
  { id: 'gpt-4-vision-preview', name: 'GPT-4 Vision', description: 'Supports image understanding' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Good balance of capability and cost' },
  { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16K', description: 'Extended context window' }
];

export default function Settings() {
  const { serverDate } = useLoaderData<typeof loader>();
  
  // Initialize with default values
  const [settings, setSettings] = useState({
    language: 'en',
    country: 'US',
    defaultKeywordLocation: '2840',
    theme: 'light'
  });
  
  const [credentials, setCredentials] = useState<Credentials>({
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
  
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoints>({
    dataForSeo: {
      baseUrl: 'https://api.dataforseo.com/v3',
      serpEndpoint: '/serp',
      onPageEndpoint: '/on_page',
      contentAnalysisEndpoint: '/content_analysis',
      keywordDataEndpoint: '/keywords_data'
    }
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showEndpoints, setShowEndpoints] = useState(false);
  const [openaiModels, setOpenaiModels] = useState(DEFAULT_OPENAI_MODELS);

  // Load settings, credentials, and endpoints ONLY on client-side after component mounts
  useEffect(() => {
    try {
      // Load user settings
      const userSettings = getUserSettings();
      setSettings(userSettings);
      
      // Load credentials
      const storedCredentials = getCredentials();
      setCredentials(storedCredentials);
      
      // Load API endpoints
      const storedEndpoints = getApiEndpoints();
      setApiEndpoints(storedEndpoints);
      
      // Check if we need to import the models from storage.client
      // This is only needed if the models could change dynamically,
      // otherwise the DEFAULT_OPENAI_MODELS is sufficient
      import('~/utils/storage.client').then(module => {
        if (module.OPENAI_MODELS) {
          setOpenaiModels(module.OPENAI_MODELS);
        }
      });
    } catch (error) {
      console.error('Error loading settings data:', error);
    }
  }, []);

  const handleCredentialsChange = (
    service: 'dataForSeo' | 'openai',
    field: string,
    value: string
  ) => {
    setCredentials((prev) => ({
      ...prev,
      [service]: {
        ...prev[service],
        [field]: value
      }
    }));
  };

  const handleEndpointsChange = (
    field: string,
    value: string
  ) => {
    setApiEndpoints((prev) => ({
      ...prev,
      dataForSeo: {
        ...prev.dataForSeo,
        [field]: value
      }
    }));
  };

  const handleSettingsChange = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Save credentials
      saveCredentials(credentials);
      
      // Save API endpoints
      saveApiEndpoints(apiEndpoints);
      
      // Save other settings
      saveUserSettings(settings);
      
      setSaveMessage('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your SEO Toolkit Pro settings and API credentials
          </p>
        </div>
        
        {/* API Credentials */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <Card title="API Credentials">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                DataForSEO API
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dataForSeoUsername" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username (API Login)
                  </label>
                  <input
                    type="text"
                    id="dataForSeoUsername"
                    className="form-input"
                    value={credentials.dataForSeo.username}
                    onChange={(e) => handleCredentialsChange('dataForSeo', 'username', e.target.value)}
                    placeholder="Enter DataForSEO username"
                  />
                </div>
                <div>
                  <label htmlFor="dataForSeoPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password (API Password)
                  </label>
                  <input
                    type="password"
                    id="dataForSeoPassword"
                    className="form-input"
                    value={credentials.dataForSeo.password}
                    onChange={(e) => handleCredentialsChange('dataForSeo', 'password', e.target.value)}
                    placeholder="Enter DataForSEO password"
                  />
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Get your API credentials from <a href="https://app.dataforseo.com/api-dashboard" className="text-indigo-600 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">DataForSEO Dashboard</a>
              </p>
              
              <div className="mt-4">
                <button
                  type="button"
                  className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  onClick={() => setShowEndpoints(!showEndpoints)}
                >
                  {showEndpoints ? 'Hide API Endpoints' : 'Show API Endpoints'}
                </button>
                
                {showEndpoints && (
                  <div className="mt-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      DataForSEO API Endpoints
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label htmlFor="baseUrl" className="block text-xs font-medium text-gray-700 dark:text-gray-400">
                          Base URL
                        </label>
                        <input
                          type="text"
                          id="baseUrl"
                          className="form-input text-sm mt-1"
                          value={apiEndpoints.dataForSeo.baseUrl}
                          onChange={(e) => handleEndpointsChange('baseUrl', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="serpEndpoint" className="block text-xs font-medium text-gray-700 dark:text-gray-400">
                            SERP Endpoint
                          </label>
                          <input
                            type="text"
                            id="serpEndpoint"
                            className="form-input text-sm mt-1"
                            value={apiEndpoints.dataForSeo.serpEndpoint}
                            onChange={(e) => handleEndpointsChange('serpEndpoint', e.target.value)}
                          />
                        </div>
                        <div>
                          <label htmlFor="onPageEndpoint" className="block text-xs font-medium text-gray-700 dark:text-gray-400">
                            On-Page Endpoint
                          </label>
                          <input
                            type="text"
                            id="onPageEndpoint"
                            className="form-input text-sm mt-1"
                            value={apiEndpoints.dataForSeo.onPageEndpoint}
                            onChange={(e) => handleEndpointsChange('onPageEndpoint', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="contentAnalysisEndpoint" className="block text-xs font-medium text-gray-700 dark:text-gray-400">
                            Content Analysis Endpoint
                          </label>
                          <input
                            type="text"
                            id="contentAnalysisEndpoint"
                            className="form-input text-sm mt-1"
                            value={apiEndpoints.dataForSeo.contentAnalysisEndpoint}
                            onChange={(e) => handleEndpointsChange('contentAnalysisEndpoint', e.target.value)}
                          />
                        </div>
                        <div>
                          <label htmlFor="keywordDataEndpoint" className="block text-xs font-medium text-gray-700 dark:text-gray-400">
                            Keyword Data Endpoint
                          </label>
                          <input
                            type="text"
                            id="keywordDataEndpoint"
                            className="form-input text-sm mt-1"
                            value={apiEndpoints.dataForSeo.keywordDataEndpoint}
                            onChange={(e) => handleEndpointsChange('keywordDataEndpoint', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Only modify these endpoints if DataForSEO changes their API structure or you're using a proxy.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                OpenAI API
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="openaiApiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    id="openaiApiKey"
                    className="form-input"
                    value={credentials.openai.apiKey}
                    onChange={(e) => handleCredentialsChange('openai', 'apiKey', e.target.value)}
                    placeholder="Enter OpenAI API Key"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="openaiModel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      LLM Model
                    </label>
                    <select
                      id="openaiModel"
                      className="form-select"
                      value={credentials.openai.model}
                      onChange={(e) => handleCredentialsChange('openai', 'model', e.target.value)}
                    >
                      {openaiModels.map(model => (
                        <option key={model.id} value={model.id}>
                          {model.name} - {model.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="openaiBaseUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Base URL (Optional)
                    </label>
                    <input
                      type="text"
                      id="openaiBaseUrl"
                      className="form-input"
                      value={credentials.openai.baseUrl}
                      onChange={(e) => handleCredentialsChange('openai', 'baseUrl', e.target.value)}
                      placeholder="https://api.openai.com/v1"
                    />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Get your API key from <a href="https://platform.openai.com/api-keys" className="text-indigo-600 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">OpenAI Dashboard</a>. 
                  Custom Base URL is only needed for self-hosted or proxy deployments.
                </p>
              </div>
            </div>
          </Card>
          
          {/* General Settings */}
          <Card title="General Settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Default Language
                </label>
                <select
                  id="language"
                  className="form-select"
                  value={settings.language}
                  onChange={(e) => handleSettingsChange('language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Default Country
                </label>
                <select
                  id="country"
                  className="form-select"
                  value={settings.country}
                  onChange={(e) => handleSettingsChange('country', e.target.value)}
                >
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="flex justify-end items-center gap-4">
          {saveMessage && (
            <div className={`text-sm ${saveMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
              {saveMessage}
            </div>
          )}
          <button 
            className="btn btn-primary"
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
