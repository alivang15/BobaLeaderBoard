import React, { useEffect, useState } from 'react'
import io from 'socket.io-client';

const socket = io('http://localhost:5001');

function App() {
  const [connected, setConnected] = useState(false);
  const [apiHealth, setApiHealth] = useState(null);

  useEffect(() => {
    // Check API health
    fetch('http://localhost:5001/api/health')
      .then(res => res.json())
      .then(data => setApiHealth(data))
      .catch(err => console.error('API Error:', err));

      // Socket connection
      socket.on('connect', () => {
        setConnected(true);
      });

      socket.on('disconnect', () => {
        setConnected(false);
      });

      return () => {
        socket.off('connect');
        socket.off('disconnect');
      };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
            Boba Leaderboard
          </h1>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">API Status:</span>
              <span className={`font-semibold ${apiHealth ? 'text-green-600' : 'text-red-600'}`}>
                {apiHealth ? '✅ Connected' : '❌ Disconnected'}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Socket Status:</span>
              <span className={`font-semibold ${connected ? 'text-green-600' : 'text-red-600'}`}>
                {connected ? '✅ Connected' : '❌ Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
