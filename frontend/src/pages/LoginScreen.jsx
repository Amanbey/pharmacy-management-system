import React, { useState } from 'react';
import { Lock, User as UserIcon } from 'lucide-react';
import axios from 'axios';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // DEBUG: Track the login attempt in the browser console
    console.log(`[FRONTEND] Attempting login for: ${email}`);

    try {
      console.log(`[FRONTEND] Sending request to http://localhost:5000/api/auth/login...`);
      
      // Connect to our real backend Authentication API
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      console.log(`[FRONTEND] ✅ Backend accepted the password! Token received.`);

      // Securely store the digital token in the browser
      localStorage.setItem('token', response.data.token);
      
      // Tell App.jsx who just logged in
      onLogin(response.data.user);
      
    } catch (err) {
      console.error(`[FRONTEND] ❌ Backend rejected the login:`, err);
      // Display the exact error from the backend (e.g., "Invalid password")
      setError(err.response?.data?.message || 'Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-[#1E3A8A] p-8 text-center">
          <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
            <span className="text-[#0F766E]">✚</span> PharmaSys
          </h1>
          <p className="text-blue-200 mt-2 text-sm">Enterprise Management Portal</p>
        </div>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">System Login</h2>
          
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center border border-red-200 font-medium">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" required 
                  value={email} onChange={(e) => setEmail(e.target.value)} 
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] outline-none" 
                  placeholder="admin@pharmasys.com" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" required 
                  value={password} onChange={(e) => setPassword(e.target.value)} 
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] outline-none" 
                  placeholder="••••••••" 
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition-colors shadow-md ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Authenticating...' : 'Authenticate'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
