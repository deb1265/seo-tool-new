import { useState, useEffect } from 'react';
import { json } from '@remix-run/node';
import { useSearchParams, useActionData, useSubmit, Form } from '@remix-run/react';
import type { MetaFunction, ActionFunctionArgs } from '@remix-run/node';
import Navbar from '~/components/layout/Navbar';
import Card from '~/components/ui/Card';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { searchKeywords, getKeywordSuggestions } from '~/utils/api.server';
import { getSavedKeywords, saveKeyword, generateId } from '~/utils/storage.client';
import { formatNumber } from '~/utils/seo-helpers';

export const meta: MetaFunction = () => {
  return [
    { title: "Keyword Research - SEO Toolkit Pro" },
    { name: "description", content: "Research keywords to find the best opportunities for your SEO strategy" },
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const keyword = formData.get('keyword') as string;
  
  if (!keyword) {
    return json({ error: 'Please enter a keyword' });
  }
  
  try {
    // Search for the keyword to get volume data
    const searchResponse = await searchKeywords(keyword);
    
    // Get keyword suggestions/related keywords
    const suggestionsResponse = await getKeywordSuggestions(keyword);
    
    return json({ 
      keyword: keyword,
      searchData: searchResponse,
      suggestionsData: suggestionsResponse,
      error: null
    });
  } catch (error) {
    console.error('Error researching keywords:', error);
    return json({ error: 'Failed to research keywords. Please try again.' });
  }
};

export default function KeywordResearch() {
  const [searchParams] = useSearchParams();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [savedKeywords, setSavedKeywords] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('search');
  
  // For filtering and sorting suggestions
  const [sortField, setSortField] = useState('volume');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterMinVolume, setFilterMinVolume] = useState('');
  
  useEffect(() => {
    // Load saved keywords from localStorage
    const loadedKeywords = getSavedKeywords();
    setSavedKeywords(loadedKeywords);
    
    // If URL has a keyword parameter, use it
    const keywordParam = searchParams.get('keyword');
    if (keywordParam) {
      setKeyword(keywordParam);
      handleSubmit({ preventDefault: () => {} } as React.FormEvent, keywordParam);
    }
  }, [searchParams]);
  
  useEffect(() => {
    if (actionData) {
      if (actionData.error) {
        setIsLoading(false);
      } else {
        // Process search data
        if (actionData.searchData && actionData.searchData.tasks && actionData.searchData.tasks.length > 0) {
          const task = actionData.searchData.tasks[0];
          if (task.result && task.result.length > 0) {
            setSearchResults(task.result[0]);
          }
        }
        
        // Process suggestions data
        if (actionData.suggestionsData && actionData.suggestionsData.tasks && actionData.suggestionsData.tasks.length > 0) {
          const task = actionData.suggestionsData.tasks[0];
          if (task.result && task.result.length > 0 && task.result[0].keywords) {
            setSuggestions(task.result[0].keywords);
          }
        }
        
        setIsLoading(false);
      }
    }
  }, [actionData]);
  
  const handleSubmit = (e: React.FormEvent, customKeyword?: string) => {
    e.preventDefault();
    
    const searchKeyword = customKeyword || keyword;
    
    if (!searchKeyword) return;
    
    setIsLoading(true);
    
    // For demo purposes, simulate API call
    if (process.env.NODE_ENV === 'development') {
      // Generate mock data
      setTimeout(() => {
        const mockSearchResult = {
          keyword: searchKeyword,
          search_volume: Math.floor(Math.random() * 10000) + 100,
          cpc: (Math.random() * 5).toFixed(2),
          competition: Math.random().toFixed(2),
          categories: ['Category 1', 'Category 2'],
        };
        
        const mockSuggestions = Array.from({ length: 20 }, (_, i) => ({
          keyword: `${searchKeyword} ${['tips', 'guide', 'best', 'vs', 'how to', 'for beginners', 'free', 'online'][i % 8]}`,
          search_volume: Math.floor(Math.random() * 5000) + 50,
          cpc: (Math.random() * 3).toFixed(2),
          competition: Math.random().toFixed(2),
        }));
        
        setSearchResults(mockSearchResult);
        setSuggestions(mockSuggestions);
        setIsLoading(false);
      }, 1500);
    } else {
      // Real API call using Remix form submission
      const formData = new FormData();
      formData.append('keyword', searchKeyword);
      submit(formData, { method: 'post' });
    }
  };
  
  const handleSaveKeyword = (keyword: string, volume?: number, cpc?: number, competition?: number) => {
    const newKeyword = {
      id: generateId(),
      keyword,
      dateAdded: new Date().toISOString(),
      volume,
      cpc,
      difficulty: competition ? Math.round(competition * 100) : undefined,
    };
    
    saveKeyword(newKeyword);
    setSavedKeywords([...savedKeywords, newKeyword]);
  };
  
  // Filter and sort suggestions
  const filteredSuggestions = suggestions
    .filter(suggestion => {
      if (!filterMinVolume) return true;
      return suggestion.search_volume >= parseInt(filterMinVolume);
    })
    .sort((a, b) => {
      const fieldA = sortField === 'keyword' ? a[sortField] : parseFloat(a[sortField]);
      const fieldB = sortField === 'keyword' ? b[sortField] : parseFloat(b[sortField]);
      
      if (sortDirection === 'asc') {
        return fieldA > fieldB ? 1 : -1;
      } else {
        return fieldA < fieldB ? 1 : -1;
      }
    });
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Keyword Research
          </h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <Form method="post" onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enter Keyword
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      id="keyword"
                      name="keyword"
                      placeholder="e.g., seo tools"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="form-input flex-grow"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !keyword}
                      className="btn btn-primary ml-3 flex items-center justify-center min-w-[120px]"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Searching...
                        </>
                      ) : (
                        'Search'
                      )}
                    </button>
                  </div>
                  {actionData?.error && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{actionData.error}</p>
                  )}
                </div>
              </Form>
            </Card>
            
            <Card title="Saved Keywords" className="mb-6">
              {savedKeywords.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {savedKeywords.slice(0, 10).map((keyword) => (
                    <div key={keyword.id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{keyword.keyword}</p>
                        {keyword.volume && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{formatNumber(keyword.volume)} monthly searches</p>
                        )}
                      </div>
                      <button 
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        onClick={() => {
                          setKeyword(keyword.keyword);
                          handleSubmit({ preventDefault: () => {} } as React.FormEvent, keyword.keyword);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No saved keywords yet.</p>
              )}
            </Card>
            
            <Card title="Filters">
              <div className="space-y-4">
                <div>
                  <label htmlFor="minVolume" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Monthly Volume
                  </label>
                  <input
                    type="number"
                    id="minVolume"
                    placeholder="e.g., 100"
                    value={filterMinVolume}
                    onChange={(e) => setFilterMinVolume(e.target.value)}
                    className="form-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select 
                    value={`${sortField}-${sortDirection}`}
                    onChange={(e) => {
                      const [field, direction] = e.target.value.split('-');
                      setSortField(field);
                      setSortDirection(direction);
                    }}
                    className="form-select"
                  >
                    <option value="search_volume-desc">Volume: High to Low</option>
                    <option value="search_volume-asc">Volume: Low to High</option>
                    <option value="competition-desc">Competition: High to Low</option>
                    <option value="competition-asc">Competition: Low to High</option>
                    <option value="cpc-desc">CPC: High to Low</option>
                    <option value="cpc-asc">CPC: Low to High</option>
                    <option value="keyword-asc">Keyword: A to Z</option>
                    <option value="keyword-desc">Keyword: Z to A</option>
                  </select>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
                <LoadingSpinner />
                <p className="text-gray-600 dark:text-gray-300 mt-4">Researching keywords...</p>
              </div>
            ) : searchResults ? (
              <div className="space-y-6">
                <Card>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {searchResults.keyword}
                      </h2>
                      {searchResults.categories && searchResults.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {searchResults.categories.map((category: string, index: number) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              {category}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleSaveKeyword(
                        searchResults.keyword,
                        searchResults.search_volume,
                        searchResults.cpc,
                        searchResults.competition
                      )}
                      className="mt-3 md:mt-0 btn btn-outline flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      Save Keyword
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Monthly Search Volume</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {formatNumber(searchResults.search_volume)}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Competition</p>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-3">
                          <div 
                            className={`h-2 rounded-full ${
                              searchResults.competition < 0.33 
                                ? 'bg-green-500' 
                                : searchResults.competition < 0.66 
                                  ? 'bg-yellow-500' 
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${searchResults.competition * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {searchResults.competition < 0.33 
                            ? 'Low' 
                            : searchResults.competition < 0.66 
                              ? 'Medium' 
                              : 'High'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Cost Per Click (CPC)</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        ${searchResults.cpc}
                      </p>
                    </div>
                  </div>
                </Card>
                
                <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab('search')}
                      className={`tab ${activeTab === 'search' ? 'tab-active' : ''}`}
                    >
                      Related Keywords
                    </button>
                    <button
                      onClick={() => setActiveTab('questions')}
                      className={`tab ${activeTab === 'questions' ? 'tab-active' : ''}`}
                    >
                      Questions
                    </button>
                    <button
                      onClick={() => setActiveTab('analysis')}
                      className={`tab ${activeTab === 'analysis' ? 'tab-active' : ''}`}
                    >
                      Keyword Analysis
                    </button>
                  </nav>
                </div>
                
                {activeTab === 'search' && (
                  <Card>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                          <tr>
                            <th 
                              scope="col" 
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('keyword')}
                            >
                              <div className="flex items-center">
                                Keyword
                                {sortField === 'keyword' && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                  </svg>
                                )}
                              </div>
                            </th>
                            <th 
                              scope="col" 
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('search_volume')}
                            >
                              <div className="flex items-center">
                                Volume
                                {sortField === 'search_volume' && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                  </svg>
                                )}
                              </div>
                            </th>
                            <th 
                              scope="col" 
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('competition')}
                            >
                              <div className="flex items-center">
                                Competition
                                {sortField === 'competition' && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                  </svg>
                                )}
                              </div>
                            </th>
                            <th 
                              scope="col" 
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('cpc')}
                            >
                              <div className="flex items-center">
                                CPC
                                {sortField === 'cpc' && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                  </svg>
                                )}
                              </div>
                            </th>
                            <th scope="col" className="relative px-4 py-3">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredSuggestions.map((suggestion, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {suggestion.keyword}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {formatNumber(suggestion.search_volume)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center">
                                  <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mr-2">
                                    <div 
                                      className={`h-1.5 rounded-full ${
                                        suggestion.competition < 0.33 
                                          ? 'bg-green-500' 
                                          : suggestion.competition < 0.66 
                                            ? 'bg-yellow-500' 
                                            : 'bg-red-500'
                                      }`}
                                      style={{ width: `${suggestion.competition * 100}%` }}
                                    ></div>
                                  </div>
                                  <span>
                                    {suggestion.competition < 0.33 
                                      ? 'Low' 
                                      : suggestion.competition < 0.66 
                                        ? 'Medium' 
                                        : 'High'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                ${suggestion.cpc}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleSaveKeyword(
                                    suggestion.keyword,
                                    suggestion.search_volume,
                                    suggestion.cpc,
                                    suggestion.competition
                                  )}
                                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                                >
                                  Save
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {filteredSuggestions.length === 0 && (
                      <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                        No related keywords found matching your filters.
                      </p>
                    )}
                  </Card>
                )}
                
                {activeTab === 'questions' && (
                  <Card>
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Question-based keywords that people are searching for related to "{searchResults.keyword}".
                      </p>
                      
                      {/* Generate mock questions based on the keyword */}
                      {['what', 'how', 'why', 'when', 'where', 'which'].map((questionWord) => (
                        <div key={questionWord} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex justify-between items-center">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {questionWord} {searchResults.keyword.includes('is') || searchResults.keyword.includes('are') ? '' : 'is'} {searchResults.keyword}
                            </p>
                            <button
                              onClick={() => handleSaveKeyword(
                                `${questionWord} ${searchResults.keyword.includes('is') || searchResults.keyword.includes('are') ? '' : 'is'} ${searchResults.keyword}`,
                                Math.floor(Math.random() * 500) + 50
                              )}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                            >
                              Save
                            </button>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {formatNumber(Math.floor(Math.random() * 500) + 50)} monthly searches
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
                
                {activeTab === 'analysis' && (
                  <Card>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Keyword Difficulty</h3>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="mb-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty</span>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {Math.round(searchResults.competition * 100)}/100
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  searchResults.competition < 0.33 
                                    ? 'bg-green-500' 
                                    : searchResults.competition < 0.66 
                                      ? 'bg-yellow-500' 
                                      : 'bg-red-500'
                                }`}
                                style={{ width: `${searchResults.competition * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {searchResults.competition < 0.33 
                              ? 'This keyword has low competition. It should be relatively easy to rank for.' 
                              : searchResults.competition < 0.66 
                                ? 'This keyword has moderate competition. With good content and SEO, you could rank for it.' 
                                : 'This keyword has high competition. It may be difficult to rank for without significant effort.'}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Search Intent</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2">Likely Intent</h4>
                            <div className="space-y-2">
                              {['Informational', 'Commercial', 'Transactional', 'Navigational'].map((intent, index) => (
                                <div key={index} className="flex items-center">
                                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mr-2">
                                    <div 
                                      className="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full"
                                      style={{ 
                                        width: index === 0 ? '75%' : 
                                               index === 1 ? '60%' : 
                                               index === 2 ? '40%' : '25%' 
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-600 dark:text-gray-400 ">{intent}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2">Content Recommendations</h4>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                              <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Create comprehensive guides or tutorials
                              </li>
                              <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Include comparisons with alternatives
                              </li>
                              <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Address common questions
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Trend Analysis</h3>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center">
                          <p className="text-gray-500 dark:text-gray-400">
                            Trend chart would be displayed here, showing search volume over time.
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">SERP Features</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {['Featured Snippet', 'Knowledge Panel', 'People Also Ask', 'Local Pack', 'Images', 'Videos'].map((feature, index) => (
                            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center">
                              <div className={`h-4 w-4 rounded-full mr-2 ${index < 3 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Start your keyword research</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                  Enter a keyword to discover search volume, competition, and related keywords to boost your SEO strategy.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
