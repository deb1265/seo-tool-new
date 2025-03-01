import { useState, useEffect } from 'react';
import { json } from '@remix-run/node';
import { useActionData, useSubmit, Form } from '@remix-run/react';
import type { MetaFunction, ActionFunctionArgs } from '@remix-run/node';
import Navbar from '~/components/layout/Navbar';
import Card from '~/components/ui/Card';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { analyzeBatchDomains, compareDomains } from '~/utils/api.server';
import { getCompetitorAnalyses, saveCompetitorAnalysis, generateId, getRecentAnalyses } from '~/utils/storage.client';
import { extractDomain } from '~/utils/seo-helpers';

export const meta: MetaFunction = () => {
  return [
    { title: "Competitor Analysis - SEO Toolkit Pro" },
    { name: "description", content: "Compare your website with competitors to identify content gaps and SEO opportunities" },
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const mainDomain = formData.get('mainDomain') as string;
  const competitorDomains = [
    formData.get('competitor1') as string,
    formData.get('competitor2') as string,
    formData.get('competitor3') as string,
  ].filter(Boolean);
  
  if (!mainDomain) {
    return json({ error: 'Please enter your website URL' });
  }
  
  if (competitorDomains.length === 0) {
    return json({ error: 'Please enter at least one competitor URL' });
  }
  
  try {
    // Analyze all domains together
    const allDomains = [mainDomain, ...competitorDomains];
    const tasksResponse = await analyzeBatchDomains(allDomains);
    
    // Extract task IDs
    const taskIds: string[] = [];
    if (tasksResponse?.tasks && tasksResponse.tasks.length > 0) {
      tasksResponse.tasks.forEach((task: any) => {
        if (task.id) {
          taskIds.push(task.id);
        }
      });
    }
    
    // If we have task IDs, compare the domains
    let comparisonResults = null;
    if (taskIds.length > 0) {
      comparisonResults = await compareDomains(taskIds);
    }
    
    return json({ 
      mainDomain,
      competitorDomains,
      taskIds,
      comparisonResults,
      error: null
    });
  } catch (error) {
    console.error('Error analyzing competitors:', error);
    return json({ error: 'Failed to analyze competitors. Please try again.' });
  }
};

export default function CompetitorAnalysis() {
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const [mainDomain, setMainDomain] = useState('');
  const [competitor1, setCompetitor1] = useState('');
  const [competitor2, setCompetitor2] = useState('');
  const [competitor3, setCompetitor3] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<any[]>([]);
  const [recentSites, setRecentSites] = useState<string[]>([]);
  const [comparisonResults, setComparisonResults] = useState<any>(null);
  
  useEffect(() => {
    // Load saved analyses from localStorage
    const savedCompetitorAnalyses = getCompetitorAnalyses();
    setSavedAnalyses(savedCompetitorAnalyses);
    
    // Get recent sites from analyses
    const analyses = getRecentAnalyses();
    const recentUrls = analyses.map(a => a.url).slice(0, 5);
    setRecentSites(recentUrls);
  }, []);
  
  useEffect(() => {
    if (actionData) {
      if (actionData.error) {
        setIsAnalyzing(false);
      } else {
        if (actionData.comparisonResults) {
          setComparisonResults(actionData.comparisonResults);
          
          // Save the analysis results
          const analysisId = generateId();
          saveCompetitorAnalysis({
            id: analysisId,
            dateCreated: new Date().toISOString(),
            mainDomain: actionData.mainDomain,
            competitorDomains: actionData.competitorDomains,
            taskIds: actionData.taskIds,
            results: actionData.comparisonResults
          });
          
          // Update local state with new analysis
          setSavedAnalyses(getCompetitorAnalyses());
        }
        
        setIsAnalyzing(false);
      }
    }
  }, [actionData]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mainDomain || (!competitor1 && !competitor2 && !competitor3)) {
      return;
    }
    
    setIsAnalyzing(true);
    
    // For demo purposes, simulate API call
    if (process.env.NODE_ENV === 'development') {
      // Generate mock data
      setTimeout(() => {
        // Create mock comparison data
        const domains = [mainDomain, competitor1, competitor2, competitor3].filter(Boolean);
        const mockResults = domains.map((domain) => {
          return {
            domain: domain,
            extractedDomain: extractDomain(domain),
            seoScore: Math.floor(Math.random() * 30) + 60,
            pageSpeed: Math.floor(Math.random() * 30) + 60,
            backlinks: Math.floor(Math.random() * 10000),
            keywordRankings: Math.floor(Math.random() * 100) + 10,
            contentMetrics: {
              wordCount: Math.floor(Math.random() * 1000) + 500,
              titleLength: Math.floor(Math.random() * 30) + 40,
              metaDescLength: Math.floor(Math.random() * 50) + 130,
              headingCount: Math.floor(Math.random() * 10) + 3,
              internalLinks: Math.floor(Math.random() * 20) + 5,
              externalLinks: Math.floor(Math.random() * 10) + 2,
            },
            topKeywords: [
              { keyword: "seo " + Math.random().toString(36).substring(7), position: Math.floor(Math.random() * 10) + 1 },
              { keyword: "analysis " + Math.random().toString(36).substring(7), position: Math.floor(Math.random() * 10) + 1 },
              { keyword: "competitor " + Math.random().toString(36).substring(7), position: Math.floor(Math.random() * 10) + 1 },
            ],
            strengths: [
              "Good page speed",
              "Well-structured content",
              "Strong internal linking"
            ],
            weaknesses: [
              "Limited keyword targeting",
              "Few backlinks",
              "Missing meta descriptions"
            ]
          };
        });
        
        setComparisonResults(mockResults);
        
        // Save the analysis results
        const analysisId = generateId();
        saveCompetitorAnalysis({
          id: analysisId,
          dateCreated: new Date().toISOString(),
          mainDomain: mainDomain,
          competitorDomains: [competitor1, competitor2, competitor3].filter(Boolean),
          results: mockResults
        });
        
        // Update local state with new analysis
        setSavedAnalyses(getCompetitorAnalyses());
        
        setIsAnalyzing(false);
      }, 2000);
    } else {
      // Real API call using Remix form submission
      const formData = new FormData();
      formData.append('mainDomain', mainDomain);
      if (competitor1) formData.append('competitor1', competitor1);
      if (competitor2) formData.append('competitor2', competitor2);
      if (competitor3) formData.append('competitor3', competitor3);
      
      submit(formData, { method: 'post' });
    }
  };
  
  const handleLoadAnalysis = (analysis: any) => {
    setMainDomain(analysis.mainDomain);
    
    if (analysis.competitorDomains.length > 0) {
      setCompetitor1(analysis.competitorDomains[0]);
    }
    
    if (analysis.competitorDomains.length > 1) {
      setCompetitor2(analysis.competitorDomains[1]);
    }
    
    if (analysis.competitorDomains.length > 2) {
      setCompetitor3(analysis.competitorDomains[2]);
    }
    
    setComparisonResults(analysis.results);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Competitor Analysis
          </h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <Form method="post" onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="mainDomain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Website URL
                  </label>
                  <input
                    type="text"
                    id="mainDomain"
                    name="mainDomain"
                    placeholder="https://example.com"
                    value={mainDomain}
                    onChange={(e) => setMainDomain(e.target.value)}
                    className="form-input"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="competitor1" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Competitor 1
                  </label>
                  <input
                    type="text"
                    id="competitor1"
                    name="competitor1"
                    placeholder="https://competitor1.com"
                    value={competitor1}
                    onChange={(e) => setCompetitor1(e.target.value)}
                    className="form-input"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="competitor2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Competitor 2
                  </label>
                  <input
                    type="text"
                    id="competitor2"
                    name="competitor2"
                    placeholder="https://competitor2.com"
                    value={competitor2}
                    onChange={(e) => setCompetitor2(e.target.value)}
                    className="form-input"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="competitor3" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Competitor 3
                  </label>
                  <input
                    type="text"
                    id="competitor3"
                    name="competitor3"
                    placeholder="https://competitor3.com"
                    value={competitor3}
                    onChange={(e) => setCompetitor3(e.target.value)}
                    className="form-input"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isAnalyzing || !mainDomain || (!competitor1 && !competitor2 && !competitor3)}
                  className="btn btn-primary w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    'Compare Sites'
                  )}
                </button>
                
                {actionData?.error && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{actionData.error}</p>
                )}
              </Form>
            </Card>
            
            <Card title="Recent Sites" className="mb-6">
              {recentSites.length > 0 ? (
                <div className="space-y-2">
                  {recentSites.map((site, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{site}</span>
                      <button 
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        onClick={() => setMainDomain(site)}
                      >
                        Use
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-2">No recent sites analyzed.</p>
              )}
            </Card>
            
            <Card title="Saved Analyses">
              {savedAnalyses.length > 0 ? (
                <div className="space-y-3">
                  {savedAnalyses.map((analysis) => (
                    <div 
                      key={analysis.id}
                      onClick={() => handleLoadAnalysis(analysis)}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-200"
                    >
                      <p className="font-medium text-gray-900 dark:text-white">{extractDomain(analysis.mainDomain)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        vs {analysis.competitorDomains.map(extractDomain).join(', ')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(analysis.dateCreated).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No saved analyses yet.</p>
              )}
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            {isAnalyzing ? (
              <Card>
                <div className="text-center py-12">
                  <LoadingSpinner size="large" />
                  <p className="text-gray-600 dark:text-gray-300 mt-6">
                    Analyzing and comparing websites...
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    This may take a minute as we gather data on multiple sites.
                  </p>
                </div>
              </Card>
            ) : comparisonResults ? (
              <div className="space-y-6">
                <Card title="Overview Comparison">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Metric</th>
                          {comparisonResults.map((result: any, index: number) => (
                            <th key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              {index === 0 ? 'Your Site' : `Competitor ${index}`}
                              <div className="font-normal text-gray-500 dark:text-gray-400 normal-case">
                                {extractDomain(result.domain)}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            SEO Score
                          </td>
                          {comparisonResults.map((result: any, index: number) => (
                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm">
                              <div className={`font-semibold ${
                                result.seoScore >= 70 ? 'text-green-600 dark:text-green-400' : 
                                result.seoScore >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 
                                'text-red-600 dark:text-red-400'
                              }`}>
                                {result.seoScore}/100
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            Page Speed
                          </td>
                          {comparisonResults.map((result: any, index: number) => (
                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm">
                              <div className={`font-semibold ${
                                result.pageSpeed >= 70 ? 'text-green-600 dark:text-green-400' : 
                                result.pageSpeed >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 
                                'text-red-600 dark:text-red-400'
                              }`}>
                                {result.pageSpeed}/100
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            Backlinks
                          </td>
                          {comparisonResults.map((result: any, index: number) => (
                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                              {result.backlinks.toLocaleString()}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            Ranked Keywords
                          </td>
                          {comparisonResults.map((result: any, index: number) => (
                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                              {result.keywordRankings.toLocaleString()}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
                
                <Card title="Content Metrics">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Metric</th>
                          {comparisonResults.map((result: any, index: number) => (
                            <th key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              {index === 0 ? 'Your Site' : `Competitor ${index}`}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            Word Count (avg)
                          </td>
                          {comparisonResults.map((result: any, index: number) => (
                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                              {result.contentMetrics.wordCount}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            Title Length (avg)
                          </td>
                          {comparisonResults.map((result: any, index: number) => (
                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                              {result.contentMetrics.titleLength} chars
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            Meta Description
                          </td>
                          {comparisonResults.map((result: any, index: number) => (
                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                              {result.contentMetrics.metaDescLength} chars
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            Headings (avg)
                          </td>
                          {comparisonResults.map((result: any, index: number) => (
                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                              {result.contentMetrics.headingCount}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            Internal Links (avg)
                          </td>
                          {comparisonResults.map((result: any, index: number) => (
                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                              {result.contentMetrics.internalLinks}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            External Links (avg)
                          </td>
                          {comparisonResults.map((result: any, index: number) => (
                            <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                              {result.contentMetrics.externalLinks}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
                
                {/* Top Keywords */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {comparisonResults.map((result: any, index: number) => (
                    <Card key={index} title={`${index === 0 ? 'Your Site' : `Competitor ${index}`} Top Keywords`}>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {extractDomain(result.domain)}
                      </div>
                      
                      <div className="space-y-2">
                        {result.topKeywords.map((keyword: any, kwIndex: number) => (
                          <div key={kwIndex} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <span className="text-gray-900 dark:text-white">{keyword.keyword}</span>
                            <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                              Position: {keyword.position}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
                
                {/* SWOT Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Your Site Analysis */}
                  <Card title="Your Site Analysis">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {extractDomain(comparisonResults[0].domain)}
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">Strengths</h3>
                        <ul className="space-y-1">
                          {comparisonResults[0].strengths.map((strength: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">Weaknesses</h3>
                        <ul className="space-y-1">
                          {comparisonResults[0].weaknesses.map((weakness: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span className="text-gray-700 dark:text-gray-300">{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Opportunities & Threats */}
                  <Card title="Opportunities & Threats">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">Opportunities</h3>
                        <ul className="space-y-1">
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-300">
                              {comparisonResults[0].contentMetrics.wordCount < Math.max(...comparisonResults.map(r => r.contentMetrics.wordCount)) 
                                ? 'Increase content length to match or exceed competitors' 
                                : 'Your content is already longer than competitors'}
                            </span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-300">
                              {comparisonResults[0].backlinks < Math.max(...comparisonResults.map(r => r.backlinks)) 
                                ? 'Focus on building more quality backlinks' 
                                : 'Continue leveraging your strong backlink profile'}
                            </span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-300">
                              Target competitor keywords that you're not currently ranking for
                            </span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">Threats</h3>
                        <ul className="space-y-1">
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-300">
                              {comparisonResults.slice(1).some(r => r.pageSpeed > comparisonResults[0].pageSpeed) 
                                ? 'Competitors have faster page load speeds' 
                                : 'Competitors might improve their page speeds'}
                            </span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-300">
                              {comparisonResults.slice(1).some(r => r.keywordRankings > comparisonResults[0].keywordRankings) 
                                ? 'Competitors rank for more keywords' 
                                : 'Competitors might expand their keyword targeting'}
                            </span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-300">
                              Competitors might be creating more comprehensive content
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </div>
                
                {/* Recommendations */}
                <Card title="Improvement Recommendations">
                  <div className="space-y-4">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
                      <h3 className="text-base font-medium text-indigo-800 dark:text-indigo-200 mb-2">Content Strategy</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300">
                            {comparisonResults[0].contentMetrics.wordCount < Math.max(...comparisonResults.map(r => r.contentMetrics.wordCount)) 
                              ? `Increase content length to at least ${Math.max(...comparisonResults.map(r => r.contentMetrics.wordCount))} words to be competitive` 
                              : 'Your content length is good, focus on improving quality and engagement'}
                          </span>
                        </li>
                        <li className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300">
                            Target these keywords your competitors rank for but you don't: {comparisonResults.slice(1).flatMap(r => r.topKeywords.map(k => k.keyword)).filter((value, index, self) => self.indexOf(value) === index).slice(0, 3).join(', ')}
                          </span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                      <h3 className="text-base font-medium text-green-800 dark:text-green-200 mb-2">Technical Improvements</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300">
                            {comparisonResults[0].pageSpeed < Math.max(...comparisonResults.map(r => r.pageSpeed)) 
                              ? 'Improve page speed to match or exceed competitors' 
                              : 'Maintain your excellent page speed performance'}
                          </span>
                        </li>
                        <li className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300">
                            {comparisonResults[0].contentMetrics.internalLinks < Math.max(...comparisonResults.map(r => r.contentMetrics.internalLinks)) 
                              ? 'Add more internal links to improve site navigation and SEO' 
                              : 'Your internal linking structure is good compared to competitors'}
                          </span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <h3 className="text-base font-medium text-blue-800 dark:text-blue-200 mb-2">Off-Page Strategy</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300">
                            {comparisonResults[0].backlinks < Math.max(...comparisonResults.map(r => r.backlinks)) 
                              ? `Build more quality backlinks to close the gap with competitors (target: ${Math.max(...comparisonResults.map(r => r.backlinks)).toLocaleString()})` 
                              : 'Continue your strong backlink acquisition strategy'}
                          </span>
                        </li>
                        <li className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300">
                            Monitor competitor backlink sources and target similar opportunities
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Compare your site with competitors</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                  Enter your website URL and up to three competitor websites to analyze and compare SEO performance.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
