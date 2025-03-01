import { useState, useEffect, useRef } from 'react';
import { json } from '@remix-run/node';
import { useActionData, useSubmit, Form } from '@remix-run/react';
import type { MetaFunction, ActionFunctionArgs } from '@remix-run/node';
import Navbar from '~/components/layout/Navbar';
import Card from '~/components/ui/Card';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { analyzeContent, analyzeReadability } from '~/utils/api.server';
import { getSavedContent, saveContent, generateId } from '~/utils/storage.client';
import { calculateContentScore, calculateKeywordDensityScore } from '~/utils/seo-helpers';

export const meta: MetaFunction = () => {
  return [
    { title: "Content Optimization - SEO Toolkit Pro" },
    { name: "description", content: "Optimize your content with real-time SEO feedback and suggestions" },
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const content = formData.get('content') as string;
  const targetKeyword = formData.get('targetKeyword') as string;
  
  if (!content) {
    return json({ error: 'Please enter content to analyze' });
  }
  
  try {
    // Analyze content with DataForSEO API (readability + semantic analysis)
    const readabilityResponse = await analyzeReadability(content);
    
    let semanticResponse = null;
    if (targetKeyword) {
      semanticResponse = await analyzeContent(content, targetKeyword);
    }
    
    return json({ 
      content,
      targetKeyword,
      readabilityData: readabilityResponse,
      semanticData: semanticResponse,
      error: null
    });
  } catch (error) {
    console.error('Error analyzing content:', error);
    return json({ error: 'Failed to analyze content. Please try again.' });
  }
};

export default function ContentOptimization() {
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [additionalKeywords, setAdditionalKeywords] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [savedContents, setSavedContents] = useState<any[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [scoreComponents, setScoreComponents] = useState<any>({});
  const contentEditorRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    // Load saved content from localStorage
    const loadedContent = getSavedContent();
    setSavedContents(loadedContent);
  }, []);
  
  useEffect(() => {
    if (actionData) {
      if (actionData.error) {
        setIsAnalyzing(false);
      } else {
        // Process readability data
        let readabilityScore = 0;
        let readabilityLevel = 'N/A';
        let sentenceCount = 0;
        let wordCount = 0;
        
        if (actionData.readabilityData && actionData.readabilityData.tasks && actionData.readabilityData.tasks.length > 0) {
          const task = actionData.readabilityData.tasks[0];
          if (task.result && task.result.length > 0) {
            readabilityScore = task.result[0].readability_score || 0;
            readabilityLevel = task.result[0].readability_level || 'N/A';
            sentenceCount = task.result[0].sentence_count || 0;
            wordCount = task.result[0].word_count || 0;
          }
        }
        
        // Process semantic data
        let keywordDensity = 0;
        let recommendations: string[] = [];
        
        if (actionData.semanticData && actionData.semanticData.tasks && actionData.semanticData.tasks.length > 0) {
          const task = actionData.semanticData.tasks[0];
          if (task.result && task.result.length > 0) {
            keywordDensity = task.result[0].keyword_density || 0;
            // Sample recommendations - in a real implementation, these would come from the API
            recommendations = [
              'Add the keyword to the beginning of the content',
              'Use more related terms in your content',
              'Make the content longer for better depth',
              'Include the keyword in a heading'
            ];
          }
        }
        
        // Calculate content quality score
        const contentScore = calculateContentScore(actionData.content);
        const keywordScore = calculateKeywordDensityScore(actionData.content, actionData.targetKeyword);
        
        // Set the overall score
        const calculatedScore = Math.round((contentScore + keywordScore + readabilityScore) / 3);
        setScore(calculatedScore);
        
        // Set the score components
        setScoreComponents({
          contentScore,
          keywordScore,
          readabilityScore
        });
        
        // Set the analysis results
        setAnalysis({
          readabilityScore,
          readabilityLevel,
          sentenceCount,
          wordCount,
          keywordDensity,
          recommendations
        });
        
        setIsAnalyzing(false);
      }
    }
  }, [actionData]);
  
  const handleAnalyze = () => {
    if (!content) return;
    
    setIsAnalyzing(true);
    
    // For demo purposes, simulate API call
    if (process.env.NODE_ENV === 'development') {
      // Generate mock data
      setTimeout(() => {
        const mockReadabilityScore = Math.floor(Math.random() * 30) + 60;
        const mockReadabilityLevel = mockReadabilityScore > 80 ? 'Easy to read' : mockReadabilityScore > 60 ? 'Moderately difficult' : 'Difficult';
        const wordCount = content.split(/\s+/).filter(Boolean).length;
        const sentenceCount = content.split(/[.!?]+/).filter(Boolean).length;
        
        const mockKeywordDensity = targetKeyword ? 
          (content.toLowerCase().split(targetKeyword.toLowerCase()).length - 1) / wordCount * 100 : 0;
        
        const contentScore = calculateContentScore(content);
        const keywordScore = calculateKeywordDensityScore(content, targetKeyword);
        
        // Set the overall score
        const calculatedScore = Math.round((contentScore + keywordScore + mockReadabilityScore) / 3);
        setScore(calculatedScore);
        
        // Set the score components
        setScoreComponents({
          contentScore,
          keywordScore,
          readabilityScore: mockReadabilityScore
        });
        
        // Sample recommendations
        const recommendations = [
          'Add the keyword to the beginning of the content',
          'Use more related terms in your content',
          'Make the content longer for better depth',
          'Include the keyword in a heading'
        ];
        
        setAnalysis({
          readabilityScore: mockReadabilityScore,
          readabilityLevel: mockReadabilityLevel,
          sentenceCount,
          wordCount,
          keywordDensity: mockKeywordDensity.toFixed(2),
          recommendations
        });
        
        setIsAnalyzing(false);
      }, 1500);
    } else {
      // Real API call using Remix form submission
      const formData = new FormData();
      formData.append('content', content);
      if (targetKeyword) {
        formData.append('targetKeyword', targetKeyword);
      }
      submit(formData, { method: 'post' });
    }
  };
  
  const handleSaveContent = () => {
    if (!title || !content) return;
    
    const keywordsArray = targetKeyword ? 
      [targetKeyword, ...additionalKeywords.split(',').map(k => k.trim()).filter(Boolean)] :
      additionalKeywords.split(',').map(k => k.trim()).filter(Boolean);
    
    const newContent = {
      id: generateId(),
      title,
      content,
      targetKeywords: keywordsArray,
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
      score: score || undefined
    };
    
    saveContent(newContent);
    setSavedContents([...savedContents, newContent]);
    
    // Reset form
    setTitle('');
    setContent('');
    setTargetKeyword('');
    setAdditionalKeywords('');
    setAnalysis(null);
    setScore(null);
  };
  
  const handleLoadContent = (savedContent: any) => {
    setTitle(savedContent.title);
    setContent(savedContent.content);
    
    if (savedContent.targetKeywords && savedContent.targetKeywords.length > 0) {
      setTargetKeyword(savedContent.targetKeywords[0]);
      
      if (savedContent.targetKeywords.length > 1) {
        setAdditionalKeywords(savedContent.targetKeywords.slice(1).join(', '));
      } else {
        setAdditionalKeywords('');
      }
    }
    
    // Clear analysis
    setAnalysis(null);
    setScore(savedContent.score || null);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Content Optimization
          </h1>
          
          <div className="flex space-x-3">
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !content}
              className="btn btn-primary"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Analyzing...
                </>
              ) : (
                'Analyze Content'
              )}
            </button>
            
            <button
              onClick={handleSaveContent}
              disabled={!title || !content}
              className="btn btn-outline"
            >
              Save Content
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title for your content"
                  className="form-input"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="targetKeyword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Keyword
                </label>
                <input
                  type="text"
                  id="targetKeyword"
                  value={targetKeyword}
                  onChange={(e) => setTargetKeyword(e.target.value)}
                  placeholder="Primary keyword you want to rank for"
                  className="form-input"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="additionalKeywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Keywords (comma separated)
                </label>
                <input
                  type="text"
                  id="additionalKeywords"
                  value={additionalKeywords}
                  onChange={(e) => setAdditionalKeywords(e.target.value)}
                  placeholder="secondary, keyword, phrases"
                  className="form-input"
                />
              </div>
              
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  ref={contentEditorRef}
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your content here..."
                  className="form-input h-64 font-mono"
                ></textarea>
                <div className="mt-2 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>{content.length} characters</span>
                  <span>{content.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>
            </Card>
            
            {isAnalyzing ? (
              <Card>
                <div className="text-center py-8">
                  <LoadingSpinner />
                  <p className="text-gray-600 dark:text-gray-300 mt-4">Analyzing your content...</p>
                </div>
              </Card>
            ) : analysis ? (
              <Card title="Analysis Results">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                      <span className={`text-2xl font-bold ${
                        scoreComponents.readabilityScore >= 70 ? 'text-green-600 dark:text-green-400' : 
                        scoreComponents.readabilityScore >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {scoreComponents.readabilityScore}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Readability</h3>
                  </div>
                  
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                      <span className={`text-2xl font-bold ${
                        scoreComponents.keywordScore >= 70 ? 'text-green-600 dark:text-green-400' : 
                        scoreComponents.keywordScore >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {scoreComponents.keywordScore}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Keyword Usage</h3>
                  </div>
                  
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                      <span className={`text-2xl font-bold ${
                        scoreComponents.contentScore >= 70 ? 'text-green-600 dark:text-green-400' : 
                        scoreComponents.contentScore >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {scoreComponents.contentScore}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Content Quality</h3>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Content Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Words</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">{analysis.wordCount}</p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Sentences</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">{analysis.sentenceCount}</p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Keyword Density</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">{analysis.keywordDensity}%</p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Readability</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">{analysis.readabilityLevel}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Improvement Suggestions</h3>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((recommendation: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ) : null}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {score && (
              <Card className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                  <span className={`text-4xl font-bold ${
                    score >= 70 ? 'text-green-600 dark:text-green-400' : 
                    score >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {score}
                  </span>
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  {score >= 80 ? 'Excellent' : 
                   score >= 70 ? 'Good' : 
                   score >= 50 ? 'Average' : 
                   score >= 30 ? 'Poor' : 'Critical'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {score >= 70 
                    ? 'Your content is well-optimized for SEO.' 
                    : score >= 50 
                    ? 'Your content needs some improvements.' 
                    : 'Your content needs significant optimization.'}
                </p>
              </Card>
            )}
            
            <Card title="Content Tips">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Keyword Placement</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Place your primary keyword in the title, first paragraph, and at least one heading for best results.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Content Length</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Aim for at least 300 words for blog posts and 500+ words for in-depth articles.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Readability</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use shorter sentences and paragraphs. Break up content with headings and lists.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Keyword Density</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Keep keyword density between 1-3%. Too high or too low can hurt your SEO.
                  </p>
                </div>
              </div>
            </Card>
            
            <Card title="Saved Content">
              {savedContents.length > 0 ? (
                <div className="space-y-3">
                  {savedContents.map((savedContent) => (
                    <div 
                      key={savedContent.id}
                      onClick={() => handleLoadContent(savedContent)}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{savedContent.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(savedContent.dateUpdated).toLocaleDateString()}
                          </p>
                        </div>
                        {savedContent.score && (
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                            savedContent.score >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 
                            savedContent.score >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' : 
                            'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                          }`}>
                            {savedContent.score}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No saved content yet.</p>
              )}
            </Card>
            
            <Card title="AI Assistance">
              <div className="space-y-3">
                <button className="btn btn-outline w-full justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Improve Readability
                </button>
                
                <button className="btn btn-outline w-full justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Optimize Structure
                </button>
                
                <button className="btn btn-outline w-full justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Generate Meta Description
                </button>
                
                <button className="btn btn-outline w-full justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Suggest Title Variations
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
