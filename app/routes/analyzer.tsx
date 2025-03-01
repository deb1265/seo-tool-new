import { useState } from 'react';
import { json } from '@remix-run/node';
import { Link, Outlet, useLocation } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/node';
import Navbar from '~/components/layout/Navbar';

export const meta: MetaFunction = () => {
  return [
    { title: "SEO Analyzer - SEO Toolkit Pro" },
    { name: "description", content: "Analyze websites for SEO factors and get actionable recommendations" },
  ];
};

export default function Analyzer() {
  const location = useLocation();
  const isRoot = location.pathname === '/analyzer';
  
  // Don't render the form if we're on a sub-route
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      {isRoot ? (
        <AnalyzerForm />
      ) : (
        <Outlet />
      )}
    </div>
  );
}

function AnalyzerForm() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      setError('Please enter a URL to analyze');
      return;
    }
    
    // Basic URL validation
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch (err) {
      setError('Please enter a valid URL');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    // Redirect to the analysis page
    window.location.href = `/analyzer/new?url=${encodeURIComponent(url)}`;
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            SEO Analyzer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Get a comprehensive SEO analysis of any webpage with actionable recommendations
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter Website URL
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="form-input flex-grow"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary ml-3 flex items-center justify-center min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    'Analyze'
                  )}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Enter a full URL including https:// for best results
              </p>
            </div>
          </form>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            What Our SEO Analyzer Checks
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 text-indigo-600 dark:text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-base font-medium text-gray-900 dark:text-white">Meta Tags</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Title, description, and other important meta tags</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 text-indigo-600 dark:text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-base font-medium text-gray-900 dark:text-white">Heading Structure</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Proper use of H1, H2, and other heading tags</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 text-indigo-600 dark:text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-base font-medium text-gray-900 dark:text-white">Content Quality</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Word count, keyword density, and readability</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 text-indigo-600 dark:text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-base font-medium text-gray-900 dark:text-white">Image Optimization</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Alt attributes, size, and compression</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 text-indigo-600 dark:text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-base font-medium text-gray-900 dark:text-white">Link Structure</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Internal links, external links, and anchor text</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 text-indigo-600 dark:text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-base font-medium text-gray-900 dark:text-white">Mobile Compatibility</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Responsive design and mobile-friendliness</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 text-indigo-600 dark:text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-base font-medium text-gray-900 dark:text-white">Page Speed</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Loading time and performance metrics</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 text-indigo-600 dark:text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-base font-medium text-gray-900 dark:text-white">Social Tags</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Open Graph and Twitter Card meta tags</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <Link to="/analyzer/history" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium">
              View previous analyses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
