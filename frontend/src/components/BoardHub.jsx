import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';

const BoardHub = () => {
  const [boardIdInput, setBoardIdInput] = useState('');
  const navigate = useNavigate();

  const handleCreateBoard = () => {
    const newBoardId = crypto?.randomUUID?.() || Math.random().toString(36).substring(2, 10);
    navigate(`/board/${newBoardId}`);
  };

  const handleJoinBoard = (e) => {
    e.preventDefault();
    const input = boardIdInput.trim();
    if (!input) return;

    try {
      const url = new URL(input);
      const pathParts = url.pathname.split('/');
      const id = pathParts[pathParts.length - 1];
      navigate(`/board/${id.toLowerCase()}`);
    } catch (_) {
      // Assume it's just an ID
      navigate(`/board/${input.toLowerCase()}`);
    }
    setBoardIdInput(''); // reset input
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decorative shapes */}
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-20 dark:opacity-30 filter blur-3xl animate-blob"></div>
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-r from-teal-400 to-green-500 rounded-full opacity-20 dark:opacity-30 filter blur-3xl animate-blob animation-delay-2000"></div>

      <div className="relative z-10 text-center w-full max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-12 tracking-tight">
          Dashboard
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Create New Board Card */}
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 p-8 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-white mb-4">Create a New Board</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Start with a blank canvas and bring your ideas to life.</p>
            <button
              onClick={handleCreateBoard}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Plus size={20} />
              New Board
            </button>
          </div>

          {/* Join Existing Board Card */}
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 p-8 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-white mb-4">Join a Board</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Enter a board link or ID to join an existing session.</p>
            <form onSubmit={handleJoinBoard} className="w-full flex gap-2">
              <input
                type="text"
                value={boardIdInput}
                onChange={(e) => setBoardIdInput(e.target.value)}
                placeholder="Enter board link or ID"
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="p-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-semibold transition-colors"
              >
                <ArrowRight size={24} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardHub;
