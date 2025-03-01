import { useState } from 'react';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Link } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/node';
import Navbar from '~/components/layout/Navbar';
import Card from '~/components/ui/Card';
import ScoreGauge from '~/components/ui/ScoreGauge';
import { useEffect } from 'react';
import { getProjects, getRecentAnalyses, getSavedKeywords, getSavedContent, getCompetitorAnalyses } from '~/utils/storage.client';
import { formatNumber } from '~/utils/seo-helpers';

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard - SEO Toolkit Pro" },
    { name: "description", content: "Dashboard for SEO Toolkit Pro with recent analyses, saved projects, and key metrics." },
  ];
};

export const loader = async () => {
  return json({
    // Server-side data could be loaded here
    serverDate: new Date().toISOString(),
  });
};

export default function Dashboard() {
  const { serverDate } = useLoaderData<typeof loader>();
  const [projects, setProjects] = useState<any[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const [savedKeywords, setSavedKeywords] = useState<any[]>([]);
  const [savedContent, setSavedContent] = useState<any[]>([]);
  const [competitorAnalyses, setCompetitorAnalyses] = useState<any[]>([]);
  
  // Sample metrics data
  const metrics = {
    averageScore: 76,
    keywordRankingUp: 12,
    keywordRankingDown: 5,
    totalKeywords: 45,
    trafficEstimate: 2850
  };

  useEffect(() => {
    // Load data from localStorage
    setProjects(getProjects());
    setRecentAnalyses(getRecentAnalyses());
    setSavedKeywords(getSavedKeywords());
    setSavedContent(getSavedContent());
    setCompetitorAnalyses(getCompetitorAnalyses());
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 md:mb-0">
            Dashboard
          </h1>
          
          <div className="flex space-x-3">
            <Link 
              to="/analyzer" 
              className="btn btn-primary"
            >
              New Analysis
            </Link>
            
            <Link 
              to="/keywords" 
              className="btn btn-outline"
            >
              Research Keywords
            </Link>
          </div>
        </div>
        
        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <ScoreGauge score={metrics.averageScore} className="mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-300">Average SEO Score</p>
          </Card>
          
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Keywords</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.totalKeywords}</p>
              </div>
              <div>
                <div className="flex items-center text-green-600 dark:text-green-400 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{metrics.keywordRankingUp}</span>
                </div>
                <div className="flex items-center text-red-600 dark:text-red-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{metrics.keywordRankingDown}</span>
                </div>
              </div>
            </div>
          </Card>
          
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Traffic Estimate</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(metrics.trafficEstimate)}</p>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Monthly visitors</p>
          </Card>
          
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Next Steps</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Optimize meta descriptions
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Improve page speed
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Add internal links
              </li>
            </ul>
          </Card>
        </div>
        
        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card title="Recent Analyses">
            {recentAnalyses.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentAnalyses.slice(0, 5).map((analysis) => (
                  <Link 
                    key={analysis.id}
                    to={`/analyzer/results/${analysis.id}`}
                    className="flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-gray-800 px-2 -mx-2 rounded"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{analysis.url}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(analysis.dateAnalyzed).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`text-lg font-semibold ${analysis.score >= 70 ? 'score-high' : analysis.score >= 50 ? 'score-medium' : 'score-low'}`}>
                      {analysis.score}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No analyses yet. Start by analyzing a website.</p>
            )}
            
            {recentAnalyses.length > 0 && (
              <div className="mt-4 text-center">
                <Link 
                  to="/analyzer/history" 
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium"
                >
                  View all analyses
                </Link>
              </div>
            )}
          </Card>
          
          <Card title="Saved Content">
            {savedContent.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {savedContent.slice(0, 5).map((content) => (
                  <Link 
                    key={content.id}
                    to={`/content/${content.id}`}
                    className="flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-gray-800 px-2 -mx-2 rounded"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{content.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Updated {new Date(content.dateUpdated).toLocaleDateString()}
                      </p>
                    </div>
                    {content.score && (
                      <div className={`text-lg font-semibold ${content.score >= 70 ? 'score-high' : content.score >= 50 ? 'score-medium' : 'score-low'}`}>
                        {content.score}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No saved content yet. Start optimizing your content.</p>
            )}
            
            {savedContent.length > 0 && (
              <div className="mt-4 text-center">
                <Link 
                  to="/content" 
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium"
                >
                  View all content
                </Link>
              </div>
            )}
          </Card>
        </div>
        
        {/* Projects & Keywords */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Projects" className="md:col-span-2">
            {projects.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {projects.slice(0, 5).map((project) => (
                  <Link 
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-gray-800 px-2 -mx-2 rounded"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{project.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{project.url}</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No projects yet. Create a project to track your SEO progress.</p>
            )}
            
            <div className="mt-4 text-center">
              <Link 
                to="/projects" 
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium"
              >
                {projects.length > 0 ? "View all projects" : "Create a project"}
              </Link>
            </div>
          </Card>
          
          <Card title="Saved Keywords">
            {savedKeywords.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {savedKeywords.slice(0, 5).map((keyword) => (
                  <Link 
                    key={keyword.id}
                    to={`/keywords/${keyword.id}`}
                    className="flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-gray-800 px-2 -mx-2 rounded"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">{keyword.keyword}</p>
                    {keyword.volume && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatNumber(keyword.volume)} vol
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No saved keywords yet. Start researching keywords.</p>
            )}
            
            <div className="mt-4 text-center">
              <Link 
                to="/keywords" 
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium"
              >
                {savedKeywords.length > 0 ? "View all keywords" : "Research keywords"}
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
