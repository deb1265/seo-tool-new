import { useEffect, useState } from 'react';
import { useParams, Link } from '@remix-run/react';
import { json } from '@remix-run/node';
import type { MetaFunction } from '@remix-run/node';
import Navbar from '~/components/layout/Navbar';
import Card from '~/components/ui/Card';
import ScoreGauge from '~/components/ui/ScoreGauge';
import { getRecentAnalyses } from '~/utils/storage.client';
import { getScoreLevel, generateRecommendation, getScoreClass, extractDomain } from '~/utils/seo-helpers';

export const meta: MetaFunction = () => {
  return [
    { title: "Analysis Results - SEO Toolkit Pro" },
    { name: "description", content: "View detailed SEO analysis results and recommendations" },
  ];
};

export default function AnalysisResults() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    if (!id) return;
    
    // Load the analysis from localStorage
    const analyses = getRecentAnalyses();
    const found = analyses.find(a => a.id === id);
    
    if (found) {
      // Generate mock detailed results since we don't have real data
      const mockResults = generateMockResults(found);
      setAnalysis({ ...found, ...mockResults });
    }
    
    setLoading(false);
  }, [id]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center">
            <div className="spinner-lg"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-3xl mx-auto p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Analysis Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The analysis you're looking for doesn't exist or has been deleted.
            </p>
            <Link to="/analyzer" className="btn btn-primary">
              Start New Analysis
            </Link>
          </Card>
        </div>
      </div>
    );
  }
  
  const scoreLevel = getScoreLevel(analysis.score);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                SEO Analysis Results
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {analysis.url}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Link 
                to="/analyzer" 
                className="btn btn-outline mr-3"
              >
                New Analysis
              </Link>
              <button className="btn btn-primary">
                Download Report
              </button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex flex-col md:flex-row items-center">
              <div className="mb-6 md:mb-0 md:mr-8">
                <ScoreGauge score={analysis.score} size={150} />
              </div>
              
              <div className="flex-grow">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    SEO Score: <span className={getScoreClass(analysis.score)}>{analysis.score}/100</span>
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {analysis.url} has a {scoreLevel.label.toLowerCase()} SEO score. 
                    {analysis.score < 70 ? " There are several opportunities for improvement." : " Keep up the good work!"}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Analyzed on</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(analysis.dateAnalyzed).toLocaleDateString()} at {new Date(analysis.dateAnalyzed).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Issues Found</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {analysis.issues.critical} critical, {analysis.issues.warning} warnings
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Passed Checks</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {analysis.passedChecks}/{analysis.totalChecks} checks
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('on-page')}
              className={`tab ${activeTab === 'on-page' ? 'tab-active' : ''}`}
            >
              On-Page SEO
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`tab ${activeTab === 'performance' ? 'tab-active' : ''}`}
            >
              Performance
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`tab ${activeTab === 'recommendations' ? 'tab-active' : ''}`}
            >
              Recommendations
            </button>
          </nav>
        </div>
        
        {/* Tab content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area - changes based on active tab */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <OverviewTab analysis={analysis} />
            )}
            
            {activeTab === 'on-page' && (
              <OnPageSeoTab analysis={analysis} />
            )}
            
            {activeTab === 'performance' && (
              <PerformanceTab analysis={analysis} />
            )}
            
            {activeTab === 'recommendations' && (
              <RecommendationsTab analysis={analysis} />
            )}
          </div>
          
          {/* Sidebar - consistent across tabs */}
          <div className="space-y-6">
            <Card title="Quick Actions">
              <div className="space-y-3">
                <button className="btn btn-outline w-full justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Save as PDF
                </button>
                
                <button className="btn btn-outline w-full justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reanalyze
                </button>
                
                <Link to="/competitors/new" className="btn btn-outline w-full justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Compare with Competitors
                </Link>
              </div>
            </Card>
            
            <Card title="Top Issues">
              <div className="space-y-4">
                {analysis.topIssues.map((issue: any, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className={`flex-shrink-0 h-5 w-5 mt-0.5 ${issue.severity === 'critical' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                      {issue.severity === 'critical' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{issue.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{issue.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card title="Keyword Opportunities">
              <div className="space-y-3">
                {analysis.keywordOpportunities.map((keyword: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-900 dark:text-white">{keyword.term}</span>
                    <span className="badge badge-success">{keyword.volume}</span>
                  </div>
                ))}
                
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Link 
                    to={`/keywords?url=${encodeURIComponent(analysis.url)}`}
                    className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:text-indigo-800 dark:hover:text-indigo-300"
                  >
                    Explore all keyword opportunities
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>  );
}

// Overview Tab Component
function OverviewTab({ analysis }: { analysis: any }) {
  return (
    <div className="space-y-6">
      <Card title="Analysis Summary">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          This analysis of <strong>{analysis.url}</strong> was completed on {new Date(analysis.dateAnalyzed).toLocaleDateString()}.
          The website received an overall SEO score of <strong className={getScoreClass(analysis.score)}>{analysis.score}/100</strong>.
        </p>
        
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Key Findings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Strengths</h4>
            <ul className="space-y-1 text-sm">
              {analysis.strengths.map((strength: string, index: number) => (
                <li key={index} className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Areas for Improvement</h4>
            <ul className="space-y-1 text-sm">
              {analysis.improvements.map((improvement: string, index: number) => (
                <li key={index} className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
      
      <Card title="SEO Score Breakdown">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {analysis.factors.map((factor: any) => (
            <div key={factor.name} className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="relative w-20 h-20 mb-3">
                <svg viewBox="0 0 36 36" className="w-20 h-20 transform -rotate-90">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                    strokeDasharray="100, 100"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={factor.score >= 80 ? '#10b981' : factor.score >= 50 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="3"
                    strokeDasharray={`${factor.score}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold">
                  {factor.score}
                </div>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white text-center">{factor.name}</h4>
            </div>
          ))}
        </div>
      </Card>
      
      <Card title="Page Information">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</h3>
            <p className="mt-1 text-gray-900 dark:text-white">{analysis.pageInfo.title}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Meta Description</h3>
            <p className="mt-1 text-gray-900 dark:text-white">{analysis.pageInfo.description || '(No meta description found)'}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Content Words</h3>
              <p className="mt-1 text-gray-900 dark:text-white">{analysis.pageInfo.wordCount}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Load Time</h3>
              <p className="mt-1 text-gray-900 dark:text-white">{analysis.pageInfo.loadTime} seconds</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Internal Links</h3>
              <p className="mt-1 text-gray-900 dark:text-white">{analysis.pageInfo.internalLinks}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">External Links</h3>
              <p className="mt-1 text-gray-900 dark:text-white">{analysis.pageInfo.externalLinks}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// On-Page SEO Tab Component
function OnPageSeoTab({ analysis }: { analysis: any }) {
  return (
    <div className="space-y-6">
      <Card title="Meta Information">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-medium text-gray-900 dark:text-white">Title Tag</h3>
              <span className={`badge ${analysis.onPageData.titleScore >= 70 ? 'badge-success' : analysis.onPageData.titleScore >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                {analysis.onPageData.titleScore}/100
              </span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-2">
              <p className="text-gray-900 dark:text-white font-medium">{analysis.pageInfo.title}</p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {analysis.onPageData.titleScore >= 70 
                ? 'Your title tag is well-optimized for search engines.' 
                : `Your title is ${analysis.pageInfo.title.length} characters. Ideal length is between 50-60 characters.`}
            </p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-medium text-gray-900 dark:text-white">Meta Description</h3>
              <span className={`badge ${analysis.onPageData.descriptionScore >= 70 ? 'badge-success' : analysis.onPageData.descriptionScore >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                {analysis.onPageData.descriptionScore}/100
              </span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-2">
              <p className="text-gray-900 dark:text-white">{analysis.pageInfo.description || '(No meta description found)'}</p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {!analysis.pageInfo.description 
                ? 'Your page is missing a meta description. Add a description between 150-160 characters.'
                : analysis.onPageData.descriptionScore >= 70 
                  ? 'Your meta description is well-optimized for search engines.'
                  : `Your description is ${analysis.pageInfo.description.length} characters. Ideal length is between 150-160 characters.`}
            </p>
          </div>
        </div>
      </Card>
      
      <Card title="Headings Structure">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-medium text-gray-900 dark:text-white">Heading Tags</h3>
            <span className={`badge ${analysis.onPageData.headingsScore >= 70 ? 'badge-success' : analysis.onPageData.headingsScore >= 50 ? 'badge-warning' : 'badge-danger'}`}>
              {analysis.onPageData.headingsScore}/100
            </span>
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          {analysis.onPageData.headings.map((heading: any, index: number) => (
            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center mb-1">
                <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-medium px-2 py-0.5 rounded mr-2">
                  {heading.type.toUpperCase()}
                </span>
                <p className="font-medium text-gray-900 dark:text-white">{heading.content}</p>
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {analysis.onPageData.headingsScore >= 70 
            ? 'Your heading structure is well-organized and follows best practices.'
            : 'Improve your heading structure by using one H1 tag and creating a logical hierarchy.'}
        </p>
      </Card>
      
      <Card title="Content Analysis">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-medium text-gray-900 dark:text-white">Content Quality</h3>
              <span className={`badge ${analysis.onPageData.contentScore >= 70 ? 'badge-success' : analysis.onPageData.contentScore >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                {analysis.onPageData.contentScore}/100
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Word Count</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{analysis.pageInfo.wordCount}</p>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Readability Score</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{analysis.onPageData.readabilityScore}/100</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {analysis.pageInfo.wordCount < 300 
                ? 'Your content is too short. Aim for at least 300 words for better SEO performance.'
                : analysis.onPageData.contentScore >= 70 
                  ? 'Your content appears to be comprehensive and well-structured.'
                  : 'Consider improving your content quality by adding more detailed information.'}
            </p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-medium text-gray-900 dark:text-white">Keyword Usage</h3>
              <span className={`badge ${analysis.onPageData.keywordScore >= 70 ? 'badge-success' : analysis.onPageData.keywordScore >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                {analysis.onPageData.keywordScore}/100
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Keyword
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Occurrences
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Density
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {analysis.onPageData.keywords.map((keyword: any, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {keyword.term}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {keyword.occurrences}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {keyword.density}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
      
      <Card title="Link Analysis">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-medium text-gray-900 dark:text-white">Internal Links</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Total: {analysis.pageInfo.internalLinks}
              </span>
            </div>
            
            <div className="max-h-60 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <ul className="space-y-2">
                {analysis.onPageData.internalLinksData.map((link: any, index: number) => (
                  <li key={index} className="text-sm">
                    <p className="truncate text-indigo-600 dark:text-indigo-400">{link.url}</p>
                    <p className="text-gray-500 dark:text-gray-400">{link.text || '(No anchor text)'}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-medium text-gray-900 dark:text-white">External Links</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Total: {analysis.pageInfo.externalLinks}
              </span>
            </div>
            
            <div className="max-h-60 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <ul className="space-y-2">
                {analysis.onPageData.externalLinksData.map((link: any, index: number) => (
                  <li key={index} className="text-sm">
                    <p className="truncate text-indigo-600 dark:text-indigo-400">{link.url}</p>
                    <p className="text-gray-500 dark:text-gray-400">{link.text || '(No anchor text)'}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Performance Tab Component
function PerformanceTab({ analysis }: { analysis: any }) {
  return (
    <div className="space-y-6">
      <Card title="Performance Overview">
        <div className="flex items-center justify-center mb-6">
          <div className="w-64 h-64 relative">
            <svg viewBox="0 0 36 36" className="w-64 h-64 transform -rotate-90">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="2"
                strokeDasharray="100, 100"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={analysis.performanceData.score >= 80 ? '#10b981' : analysis.performanceData.score >= 50 ? '#f59e0b' : '#ef4444'}
                strokeWidth="2"
                strokeDasharray={`${analysis.performanceData.score}, 100`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">{analysis.performanceData.score}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Performance</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Page Load Time</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{analysis.pageInfo.loadTime} seconds</p>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Page Size</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{analysis.performanceData.pageSize}</p>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Requests</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{analysis.performanceData.requests}</p>
          </div>
        </div>
      </Card>
      
      <Card title="Core Web Vitals">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <p className="font-medium text-gray-900 dark:text-white mb-2">Largest Contentful Paint</p>
            <div className={`text-xl font-bold mb-1 ${analysis.performanceData.lcp <= 2.5 ? 'text-green-600 dark:text-green-400' : analysis.performanceData.lcp <= 4 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
              {analysis.performanceData.lcp} s
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {analysis.performanceData.lcp <= 2.5 ? 'Good' : analysis.performanceData.lcp <= 4 ? 'Needs Improvement' : 'Poor'}
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <p className="font-medium text-gray-900 dark:text-white mb-2">First Input Delay</p>
            <div className={`text-xl font-bold mb-1 ${analysis.performanceData.fid <= 100 ? 'text-green-600 dark:text-green-400' : analysis.performanceData.fid <= 300 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
              {analysis.performanceData.fid} ms
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {analysis.performanceData.fid <= 100 ? 'Good' : analysis.performanceData.fid <= 300 ? 'Needs Improvement' : 'Poor'}
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <p className="font-medium text-gray-900 dark:text-white mb-2">Cumulative Layout Shift</p>
            <div className={`text-xl font-bold mb-1 ${analysis.performanceData.cls <= 0.1 ? 'text-green-600 dark:text-green-400' : analysis.performanceData.cls <= 0.25 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
              {analysis.performanceData.cls}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {analysis.performanceData.cls <= 0.1 ? 'Good' : analysis.performanceData.cls <= 0.25 ? 'Needs Improvement' : 'Poor'}
            </p>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Core Web Vitals are a set of metrics that measure user experience on web pages. They are important ranking factors for Google search results.
        </p>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">Mobile Usability</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className={`flex-shrink-0 h-6 w-6 ${analysis.performanceData.mobileUsability.viewportSet ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {analysis.performanceData.mobileUsability.viewportSet ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Viewport Meta Tag</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className={`flex-shrink-0 h-6 w-6 ${analysis.performanceData.mobileUsability.legibleFontSizes ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {analysis.performanceData.mobileUsability.legibleFontSizes ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Legible Font Sizes</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className={`flex-shrink-0 h-6 w-6 ${analysis.performanceData.mobileUsability.tapTargetsAppropriateSize ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {analysis.performanceData.mobileUsability.tapTargetsAppropriateSize ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Tap Targets Appropriate Size</p>
              </div>            </div>
            
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className={`flex-shrink-0 h-6 w-6 ${analysis.performanceData.mobileUsability.contentWidthToViewport ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {analysis.performanceData.mobileUsability.contentWidthToViewport ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Content Width to Viewport</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <Card title="Resource Optimization">
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">Image Optimization</h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Properly sized images</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {analysis.performanceData.imageOptimization.properSizedImages}/{analysis.performanceData.imageOptimization.totalImages}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full"
                  style={{ 
                    width: `${(analysis.performanceData.imageOptimization.properSizedImages / analysis.performanceData.imageOptimization.totalImages) * 100}%`
                  }}
                ></div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Images with alt text</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {analysis.performanceData.imageOptimization.imagesWithAlt}/{analysis.performanceData.imageOptimization.totalImages}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full"
                  style={{ 
                    width: `${(analysis.performanceData.imageOptimization.imagesWithAlt / analysis.performanceData.imageOptimization.totalImages) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">JavaScript and CSS Files</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      File Type
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Size
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Files
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      JavaScript
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {analysis.performanceData.jsSize}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {analysis.performanceData.jsFiles}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${analysis.performanceData.jsOptimized ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'}`}>
                        {analysis.performanceData.jsOptimized ? 'Optimized' : 'Needs Optimization'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      CSS
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {analysis.performanceData.cssSize}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {analysis.performanceData.cssFiles}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${analysis.performanceData.cssOptimized ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'}`}>
                        {analysis.performanceData.cssOptimized ? 'Optimized' : 'Needs Optimization'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">Server Response Time</h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Time to First Byte (TTFB)</p>
                  <p className={`text-lg font-medium ${analysis.performanceData.ttfb <= 200 ? 'text-green-600 dark:text-green-400' : analysis.performanceData.ttfb <= 500 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                    {analysis.performanceData.ttfb} ms
                  </p>
                </div>
                <div>
                  {analysis.performanceData.ttfb <= 200 ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                      Good
                    </span>
                  ) : analysis.performanceData.ttfb <= 500 ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                      Improve
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                      Poor
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Recommendations Tab Component
function RecommendationsTab({ analysis }: { analysis: any }) {
  return (
    <div className="space-y-6">
      <Card title="Action Items">
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Based on our analysis of {analysis.url}, here are the key actions you should take to improve your SEO performance.
        </p>
        
        <div className="space-y-6">
          {analysis.recommendations.map((item: any, index: number) => (
            <div key={index} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
              <div className="flex items-start">
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center mr-4 ${item.priority === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' : item.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400' : 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'}`}>
                  {item.priority === 'high' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : item.priority === 'medium' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    {item.description}
                  </p>
                  
                  {item.steps && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">How to fix:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        {item.steps.map((step: string, stepIndex: number) => (
                          <li key={stepIndex}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {item.example && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Example:</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                        {item.example}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-between items-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                      {item.priority === 'high' ? 'High Priority' : item.priority === 'medium' ? 'Medium Priority' : 'Low Priority'}
                    </span>
                    
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Estimated impact: {item.impact}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      <Card title="SEO Checklist">
        <div className="space-y-4">
          {analysis.checklist.map((category: any, index: number) => (
            <div key={index} className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                {category.name}
              </h3>
              
              <div className="space-y-3">
                {category.items.map((item: any, itemIndex: number) => (
                  <div key={itemIndex} className="flex items-start">
                    <div className={`flex-shrink-0 h-5 w-5 mt-0.5 ${item.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {item.passed ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Function to generate mock detailed results for the analysis
function generateMockResults(analysis: any) {
  return {
    issues: {
      critical: Math.floor(Math.random() * 3),
      warning: Math.floor(Math.random() * 5) + 2,
    },
    passedChecks: Math.floor(Math.random() * 20) + 15,
    totalChecks: 35,
    strengths: [
      "Proper use of HTTPS",
      "Good mobile responsiveness",
      "Fast server response time",
      "Effective use of heading tags",
    ],
    improvements: [
      "Meta description could be more descriptive",
      "Some images are missing alt text",
      "Consider adding more internal links",
      "Content could use more keywords naturally",
    ],
    factors: [
      { name: "Meta Tags", score: Math.floor(Math.random() * 30) + 60 },
      { name: "Headings", score: Math.floor(Math.random() * 30) + 60 },
      { name: "Content", score: Math.floor(Math.random() * 30) + 60 },
      { name: "Images", score: Math.floor(Math.random() * 30) + 60 },
      { name: "Links", score: Math.floor(Math.random() * 30) + 60 },
      { name: "Mobile", score: Math.floor(Math.random() * 30) + 60 },
    ],
    pageInfo: {
      title: `${extractDomain(analysis.url)} - Home Page | Example Website`,
      description: "This is an example meta description for the analyzed website that describes its services and offerings.",
      wordCount: Math.floor(Math.random() * 1000) + 500,
      loadTime: (Math.random() * 3 + 1).toFixed(1),
      internalLinks: Math.floor(Math.random() * 20) + 10,
      externalLinks: Math.floor(Math.random() * 10) + 3,
    },
    onPageData: {
      titleScore: Math.floor(Math.random() * 30) + 60,
      descriptionScore: Math.floor(Math.random() * 30) + 60,
      headingsScore: Math.floor(Math.random() * 30) + 60,
      contentScore: Math.floor(Math.random() * 30) + 60,
      keywordScore: Math.floor(Math.random() * 30) + 60,
      headings: [
        { type: "h1", content: "Welcome to Our Website" },
        { type: "h2", content: "Our Services" },
        { type: "h2", content: "About Us" },
        { type: "h3", content: "Why Choose Us" },
        { type: "h3", content: "Our Team" },
      ],
      readabilityScore: Math.floor(Math.random() * 30) + 60,
      keywords: [
        { term: "example", occurrences: 12, density: "1.2%" },
        { term: "website", occurrences: 10, density: "1.0%" },
        { term: "services", occurrences: 8, density: "0.8%" },
        { term: "quality", occurrences: 6, density: "0.6%" },
      ],
      internalLinksData: [
        { url: "/about", text: "About Us" },
        { url: "/services", text: "Our Services" },
        { url: "/contact", text: "Contact Us" },
        { url: "/blog", text: "Blog" },
      ],
      externalLinksData: [
        { url: "https://twitter.com/example", text: "Twitter" },
        { url: "https://facebook.com/example", text: "Facebook" },
        { url: "https://linkedin.com/example", text: "LinkedIn" },
      ],
    },
    performanceData: {
      score: Math.floor(Math.random() * 30) + 60,
      pageSize: (Math.random() * 2 + 0.5).toFixed(1) + " MB",
      requests: Math.floor(Math.random() * 50) + 30,
      lcp: (Math.random() * 4 + 1).toFixed(1),
      fid: Math.floor(Math.random() * 200) + 50,
      cls: (Math.random() * 0.3).toFixed(2),
      ttfb: Math.floor(Math.random() * 400) + 100,
      mobileUsability: {
        viewportSet: true,
        legibleFontSizes: Math.random() > 0.3,
        tapTargetsAppropriateSize: Math.random() > 0.4,
        contentWidthToViewport: Math.random() > 0.2,
      },
      imageOptimization: {
        totalImages: Math.floor(Math.random() * 20) + 10,
        properSizedImages: Math.floor(Math.random() * 15) + 5,
        imagesWithAlt: Math.floor(Math.random() * 15) + 5,
      },
      jsSize: (Math.random() * 500 + 100).toFixed(1) + " KB",
      jsFiles: Math.floor(Math.random() * 10) + 5,
      jsOptimized: Math.random() > 0.5,
      cssSize: (Math.random() * 200 + 50).toFixed(1) + " KB",
      cssFiles: Math.floor(Math.random() * 5) + 2,
      cssOptimized: Math.random() > 0.5,
    },
    topIssues: [
      {
        title: "Missing meta description",
        description: "Your page doesn't have a meta description, which search engines use to understand your content.",
        severity: "critical",
      },
      {
        title: "Images missing alt text",
        description: "Several images on your page don't have alt text, which helps search engines understand the content of the images.",
        severity: "warning",
      },
      {
        title: "Slow page load time",
        description: "Your page takes too long to load, which can negatively impact user experience and SEO.",
        severity: "warning",
      },
    ],
    keywordOpportunities: [
      { term: "best " + extractDomain(analysis.url).split('.')[0] + " services", volume: "1.2K/mo" },
      { term: extractDomain(analysis.url).split('.')[0] + " reviews", volume: "900/mo" },
      { term: "affordable " + extractDomain(analysis.url).split('.')[0], volume: "750/mo" },
      { term: extractDomain(analysis.url).split('.')[0] + " alternatives", volume: "600/mo" },
    ],
    recommendations: [
      {
        title: "Optimize meta description",
        description: "Add a compelling meta description that accurately summarizes your page content and includes your target keywords.",
        priority: "high",
        impact: "Medium",
        steps: [
          "Keep it between 150-160 characters",
          "Include your primary keyword naturally",
          "Make it compelling with a call to action",
        ],
        example: "<meta name=\"description\" content=\"Your compelling description here with target keywords. Keep it under 160 characters and make it enticing for users to click.\">"
      },
      {
        title: "Add alt text to images",
        description: "Add descriptive alt text to all images to improve accessibility and help search engines understand your content.",
        priority: "medium",
        impact: "Medium",
        steps: [
          "Be descriptive but concise",
          "Include relevant keywords when appropriate",
          "Ensure all images have alt attributes",
        ],
        example: "<img src=\"example.jpg\" alt=\"Descriptive text about the image with keyword\">"
      },
      {
        title: "Improve page load speed",
        description: "Your page takes too long to load, which can negatively impact user experience and SEO ranking.",
        priority: "high",
        impact: "High",
        steps: [
          "Optimize and compress images",
          "Minify CSS and JavaScript files",
          "Implement browser caching",
          "Consider using a content delivery network (CDN)",
        ]
      },
      {
        title: "Add more internal links",
        description: "Including more internal links will help distribute page authority and help visitors navigate your site.",
        priority: "medium",
        impact: "Medium",
        steps: [
          "Link to relevant pages within your content",
          "Use descriptive anchor text",
          "Create a logical site structure",
        ]
      },
      {
        title: "Improve mobile usability",
        description: "Some elements on your page may be difficult to use on mobile devices.",
        priority: "medium",
        impact: "Medium",
        steps: [
          "Ensure tap targets are at least 48px by 48px",
          "Make sure text is legible without zooming",
          "Test your site on various mobile devices",
        ]
      },
    ],
    checklist: [
      {
        name: "Basic SEO",
        items: [
          { name: "HTTPS Enabled", passed: true, description: "Your site is securely delivered over HTTPS" },
          { name: "Mobile Friendly", passed: Math.random() > 0.3, description: "Your site adapts well to mobile devices" },
          { name: "Meta Title", passed: Math.random() > 0.4, description: "Your page has an optimized title tag" },
          { name: "Meta Description", passed: Math.random() > 0.5, description: "Your page has an optimized meta description" },
        ]
      },
      {
        name: "Content",
        items: [
          { name: "Quality Content", passed: Math.random() > 0.3, description: "Your content is comprehensive and valuable" },
          { name: "Heading Structure", passed: Math.random() > 0.4, description: "Your page uses a logical heading structure" },
          { name: "Keyword Usage", passed: Math.random() > 0.5, description: "Keywords are used naturally throughout the content" },
          { name: "Content Length", passed: Math.random() > 0.4, description: "Content is long enough to provide value" },
        ]
      },
      {
        name: "Technical",
        items: [
          { name: "Page Speed", passed: Math.random() > 0.5, description: "Your page loads quickly" },
          { name: "Mobile Viewport", passed: true, description: "Your page has a proper viewport meta tag" },
          { name: "Robots.txt", passed: Math.random() > 0.3, description: "Your site has a valid robots.txt file" },
          { name: "XML Sitemap", passed: Math.random() > 0.4, description: "Your site has an XML sitemap" },
        ]
      },
    ]
  };
}
