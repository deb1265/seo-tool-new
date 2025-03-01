import { useEffect, useState } from 'react';
import { useSearchParams, Link } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import Navbar from '~/components/layout/Navbar';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import Card from '~/components/ui/Card';
import { analyzeSite } from '~/utils/api.server';
import { saveAnalysisResult, generateId } from '~/utils/storage.client';

export const meta: MetaFunction = () => {
  return [
    { title: "Analyzing Website - SEO Toolkit Pro" },
    { name: "description", content: "SEO analysis in progress" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');
  
  if (!targetUrl) {
    return redirect('/analyzer');
  }
  
  try {
    // Start the analysis task
    const normalizedUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
    const response = await analyzeSite(normalizedUrl);
    
    if (response?.tasks && response.tasks.length > 0 && response.tasks[0].id) {
      const taskId = response.tasks[0].id;
      return json({ taskId, url: normalizedUrl });
    } else {
      return json({ error: 'Failed to start analysis task' });
    }
  } catch (error) {
    console.error('Error analyzing site:', error);
    return json({ error: 'Failed to analyze site. Please try again.' });
  }
};

export default function AnalyzerNew() {
  const [searchParams] = useSearchParams();
  const [taskId, setTaskId] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('initializing');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  
  // For the progress animation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (status === 'analyzing') {
      interval = setInterval(() => {
        setProgress(prev => {
          // Increase progress by random amount between 1-5%
          const increment = Math.random() * 4 + 1;
          // Cap at 90% - the rest will happen when task completes
          return Math.min(prev + increment, 90);
        });
      }, 1500);
    } else if (status === 'complete') {
      setProgress(100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);
  
  // Initialize from loader data
  useEffect(() => {
    const initializationData = window.__remixContext?.routeData?.['routes/analyzer.new'];
    
    if (initializationData) {
      if (initializationData.error) {
        setError(initializationData.error);
        setStatus('error');
      } else {
        setTaskId(initializationData.taskId);
        setUrl(initializationData.url);
        setStatus('analyzing');
      }
    } else {
      // Fallback for client-side navigation
      const urlParam = searchParams.get('url');
      if (urlParam) {
        setUrl(urlParam);
      } else {
        setError('No URL provided');
        setStatus('error');
      }
    }
  }, [searchParams]);
  
  // Poll the task status
  useEffect(() => {
    if (!taskId || status !== 'analyzing') return;
    
    const pollInterval = setInterval(async () => {
      try {
        // This would normally be a server call, but for demo we'll simulate completion
        // In a real app, you'd poll the API for task status
        
        // Simulate completion after 10 seconds
        setTimeout(() => {
          clearInterval(pollInterval);
          
          const id = generateId();
          
          // Save the analysis result to local storage
          if (url) {
            saveAnalysisResult({
              id,
              url,
              dateAnalyzed: new Date().toISOString(),
              score: Math.floor(Math.random() * 30) + 55, // Random score between 55-85
              taskId: taskId,
            });
          }
          
          setAnalysisId(id);
          setStatus('complete');
        }, 10000);
      } catch (err) {
        console.error('Error polling task status:', err);
        setError('Failed to check analysis status');
        setStatus('error');
        clearInterval(pollInterval);
      }
    }, 3000);
    
    return () => clearInterval(pollInterval);
  }, [taskId, status, url]);
  
  // Redirect when complete
  useEffect(() => {
    if (status === 'complete' && analysisId) {
      setTimeout(() => {
        window.location.href = `/analyzer/results/${analysisId}`;
      }, 1500);
    }
  }, [status, analysisId]);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {status === 'complete' 
                  ? 'Analysis Complete!' 
                  : status === 'error' 
                    ? 'Analysis Failed' 
                    : 'Analyzing Website'}
              </h1>
              
              {url && (
                <p className="text-lg text-gray-600 dark:text-gray-300">{url}</p>
              )}
            </div>
            
            {status === 'analyzing' && (
              <div className="space-y-6">
                <div className="relative">
                  <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
                    <div 
                      style={{ width: `${progress}%` }} 
                      className="animate-pulse shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
                    ></div>
                  </div>
                  <p className="text-center text-gray-600 dark:text-gray-300">{Math.round(progress)}% complete</p>
                </div>
                
                <div className="space-y-4">
                  <AnalysisStage status="complete" label="Initializing analysis" />
                  <AnalysisStage status="complete" label="Crawling website" />
                  <AnalysisStage status="in-progress" label="Analyzing SEO factors" />
                  <AnalysisStage status="pending" label="Generating recommendations" />
                  <AnalysisStage status="pending" label="Preparing report" />
                </div>
                
                <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-4">
                  This process may take up to a minute. Please don't close this page.
                </p>
              </div>
            )}
            
            {status === 'complete' && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-green-100 dark:bg-green-900 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Your analysis is complete! Redirecting to the results...
                </p>
                <LoadingSpinner size="small" />
              </div>
            )}
            
            {status === 'error' && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-red-100 dark:bg-red-900 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-red-600 dark:text-red-400 mb-6">
                  {error || 'An error occurred during the analysis'}
                </p>
                <Link to="/analyzer" className="btn btn-primary">
                  Try Again
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper component for showing analysis stages
function AnalysisStage({ status, label }: { status: 'pending' | 'in-progress' | 'complete'; label: string }) {
  return (
    <div className="flex items-center">
      {status === 'complete' && (
        <div className="flex-shrink-0 h-6 w-6 text-green-600 dark:text-green-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      
      {status === 'in-progress' && (
        <div className="flex-shrink-0 h-6 w-6">
          <svg className="animate-spin h-6 w-6 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      
      {status === 'pending' && (
        <div className="flex-shrink-0 h-6 w-6 text-gray-300 dark:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}
      
      <div className="ml-3">
        <p className={`
          text-sm font-medium 
          ${status === 'complete' ? 'text-gray-900 dark:text-white' : ''} 
          ${status === 'in-progress' ? 'text-indigo-600 dark:text-indigo-400' : ''} 
          ${status === 'pending' ? 'text-gray-500 dark:text-gray-400' : ''}
        `}>
          {label}
        </p>
      </div>
    </div>
  );
}
