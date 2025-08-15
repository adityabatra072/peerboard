// File: frontend/src/components/BoardPage.jsx

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Whiteboard from './Whiteboard';
import { supabase } from '../supabaseClient';
import { LogOut, Link as LinkIcon, Check } from 'lucide-react';

const BoardPage = ({ session }) => {
  const { boardId } = useParams();
  const [copied, setCopied] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-screen h-screen font-sans overflow-hidden relative">
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
        {/* Active Users Display */}
        <div className="flex items-center -space-x-2">
          {activeUsers.map(user => (
            <div 
              key={user.id} 
              className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm border-2 border-white dark:border-gray-800"
              title={user.email}
            >
              {user.email.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>

        <button onClick={handleCopyLink} className="flex items-center gap-2 py-2 px-4 rounded-lg bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
          {copied ? <Check size={16} className="text-green-500" /> : <LinkIcon size={16} />}
          {copied ? 'Copied!' : 'Share Link'}
        </button>
        
        <div className="flex items-center gap-3 p-1.5 rounded-lg bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-300 px-2">
            {session.user.email}
          </div>
          <button onClick={handleLogout} className="p-2 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
      
      <Whiteboard boardId={boardId} session={session} setActiveUsers={setActiveUsers} />
    </div>
  );
};

export default BoardPage;
