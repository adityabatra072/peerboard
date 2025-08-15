// File: frontend/src/App.jsx

import React, { useContext } from 'react';
import Whiteboard from './components/Whiteboard';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const AppContent = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className={`${theme} w-screen h-screen font-sans overflow-hidden`}>
      <div className="bg-white dark:bg-gray-900 text-black dark:text-white w-full h-full">
        <header className="absolute top-0 left-0 p-4 z-20 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" className="fill-blue-500"/>
              <path d="M10 10H22V12H10V10Z" fill="white"/>
              <path d="M10 15H22V17H10V15Z" fill="white"/>
              <path d="M10 20H18V22H10V20Z" fill="white"/>
            </svg>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">PeerBoard</h1>
          </div>
        </header>
        
        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>

        <Whiteboard />
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
