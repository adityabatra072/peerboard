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
