import React from 'react';
import { supabase } from '../supabaseClient';
import { Github, Chrome } from 'lucide-react';

const LoginPage = () => {
  const handleLogin = async (provider) => {
    await supabase.auth.signInWithOAuth({ provider });
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decorative shapes */}
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 dark:opacity-30 filter blur-3xl animate-blob"></div>
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-20 dark:opacity-30 filter blur-3xl animate-blob animation-delay-2000"></div>
      
      <div className="relative z-10 text-center">
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-gray-800 dark:text-white mb-3 tracking-tight">
            PeerBoard
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400">
            The modern canvas for real-time collaboration.
          </p>
        </div>

        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 p-8 rounded-2xl shadow-lg w-full max-w-sm transition-all duration-300">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-white mb-6">
            Sign In to Continue
          </h2>
          <div className="space-y-4">
            <button
              onClick={() => handleLogin('google')}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-white font-medium transition-all duration-200 shadow-sm border border-gray-200 dark:border-gray-600 transform hover:scale-105"
            >
              <Chrome size={20} />
              Continue with Google
            </button>
            <button
              onClick={() => handleLogin('github')}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-white font-medium transition-all duration-200 shadow-sm border border-gray-200 dark:border-gray-600 transform hover:scale-105"
            >
              <Github size={20} />
              Continue with GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
