import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import LoginPage from './components/LoginPage';
import BoardPage from './components/BoardPage';
import BoardHub from './components/BoardHub'; // Import the new hub
import { Sun, Moon } from 'lucide-react';

const AppContent = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null; // Prevent flicker while checking auth state

  return (
    <div className={`${theme} w-screen h-screen font-sans overflow-hidden`}>
      <div className="bg-white dark:bg-gray-900 text-black dark:text-white w-full h-full">
        <div className="absolute top-4 right-4 z-20">
          <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
        
        <Routes>
          <Route path="/" element={!session ? <LoginPage /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={!session ? <Navigate to="/" /> : <BoardHub />} />
          <Route path="/board/:boardId" element={!session ? <Navigate to="/" /> : <BoardPage session={session} />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
