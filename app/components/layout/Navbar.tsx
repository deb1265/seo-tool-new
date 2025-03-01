import { Link, useLocation } from "@remix-run/react";
import { useTheme } from "~/root";

export default function Navbar() {
  const { theme = "light", toggleTheme } = useTheme();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.includes(path) ? "text-indigo-600 dark:text-indigo-400" : "text-gray-600 dark:text-gray-300";
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">SEO Toolkit Pro</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:items-center md:space-x-4">
              <Link 
                to="/dashboard" 
                className={`px-3 py-2 rounded-md text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 ${isActive('/dashboard')}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/analyzer" 
                className={`px-3 py-2 rounded-md text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 ${isActive('/analyzer')}`}
              >
                SEO Analyzer
              </Link>
              <Link 
                to="/keywords" 
                className={`px-3 py-2 rounded-md text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 ${isActive('/keywords')}`}
              >
                Keyword Research
              </Link>
              <Link 
                to="/content" 
                className={`px-3 py-2 rounded-md text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 ${isActive('/content')}`}
              >
                Content Optimization
              </Link>
              <Link 
                to="/competitors" 
                className={`px-3 py-2 rounded-md text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 ${isActive('/competitors')}`}
              >
                Competitor Analysis
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/settings" 
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              aria-label="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            <div className="relative">
              <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span className="inline-flex h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 items-center justify-center">
                  <span className="text-sm font-medium leading-none text-indigo-700 dark:text-indigo-300">U</span>
                </span>
              </button>
            </div>
          </div>
          
          <div className="md:hidden">
            <button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div className="hidden md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link 
            to="/dashboard" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard')}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/analyzer" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/analyzer')}`}
          >
            SEO Analyzer
          </Link>
          <Link 
            to="/keywords" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/keywords')}`}
          >
            Keyword Research
          </Link>
          <Link 
            to="/content" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/content')}`}
          >
            Content Optimization
          </Link>
          <Link 
            to="/competitors" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/competitors')}`}
          >
            Competitor Analysis
          </Link>
          <Link 
            to="/settings" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/settings')}`}
          >
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
}
