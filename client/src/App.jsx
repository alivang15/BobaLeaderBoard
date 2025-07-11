import React, { useEffect, useState } from 'react'
import io from 'socket.io-client';
import BobaCupDisplay from './components/BobaCupDisplay.jsx';

const socket = io('http://localhost:5001');

function App() {
  const [connected, setConnected] = useState(false);
  const [apiHealth, setApiHealth] = useState(null);
  const [customers, setCustomers] = useState([]);

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

  // Initialize with mock data
  useEffect(() => {
    const mockCustomers = [
      { id: 1, name: 'John Doe', bobaType: 'Classic Milk Tea', points: 120 },
      { id: 2, name: 'Jane Smith', bobaType: 'Taro Milk Tea', points: 150 },
      { id: 3, name: 'Sam Green', bobaType: 'Matcha Milk Tea', points: 90 },
    ];
    setCustomers(mockCustomers);
  }, []);

  // Function to add a new customer (for testing live updates)
  const addCustomer = () => {
    const newCustomer = {
      id: customers.length + 1,
      name: `Customer ${customers.length + 1}`,
      bobaType: 'Random Tea',
      points: Math.floor(Math.random() * 200) + 50
    };
    setCustomers([...customers, newCustomer]);
  };

  // Function to remove a customer (for testing)
  const removeCustomer = () => {
    if (customers.length > 0) {
      setCustomers(customers.slice(0, -1));
    }
  };

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

            {/* Live Update Test Buttons */}
            <div className="flex gap-4 p-4 bg-blue-50 rounded-lg">
              <button 
                onClick={addCustomer}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Add Customer (+)
              </button>
              <button 
                onClick={removeCustomer}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                disabled={customers.length === 0}
              >
                Remove Customer (-)
              </button>
              <div className="flex items-center">
                <span className="font-medium text-gray-700">
                  Total: {customers.length} customers
                </span>
              </div>
            </div>
          </div>

          {/* Boba Cup Display Component */}
          <BobaCupDisplay customers={customers} />
        </div>
      </div>
    </div>
  )
}

export default App
