// File: frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// --- Environment Variables ---
const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:4000';

function App() {
  // --- State Management ---
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // --- Effect Hook for Socket Connection ---
  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to backend server!');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from backend server.');
      setIsConnected(false);
    });

    // --- Cleanup Function ---
    return () => {
      newSocket.disconnect();
    };
  }, []); // Empty dependency array ensures this effect runs only once.

  // --- Component Rendering ---
  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center font-sans">
      <header className="text-center">
        <h1 className="text-5xl font-bold mb-4">
          PeerBoard
        </h1>
        <p className="text-lg text-gray-400">
          Real-Time Collaborative Whiteboard
        </p>
      </header>
      
      <div className="mt-8 p-4 rounded-lg shadow-lg" style={{backgroundColor: '#1a1a1a'}}>
        <p className="text-xl">
          Connection Status:
          <span className={`ml-2 font-semibold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </p>
      </div>

      <footer className="absolute bottom-4 text-gray-500 text-sm">
      </footer>
    </div>
  );
}

export default App;
