import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MockBg from '../assets/bgbg.jpg';
import MiniNavbar from '../components/MiniNavbar';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.email === 'gdsc@gmail.com' && formData.password === '123456') {
      navigate('/dashboard');
    } else {
      alert('Invalid credentials! Please try again.');
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Full-page background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat "
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${MockBg})`
        }}
      />
      
      <MiniNavbar />
      
      {/* Centered content */}
      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="backdrop-blur-lg bg-white/10 rounded-xl border border-white/20 p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Sign in to DineFlow
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full bg-white/10 border-white/20 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-300"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="mt-1 block w-full bg-white/10 border-white/20 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-300"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember-me"
                    className="h-4 w-4 bg-white/10 border-white/20 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-200">
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm font-medium text-blue-400 hover:text-blue-300">
                  Forgot password?
                </Link>
              </div>
              
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105"
              >
                Sign in
              </button>
            </form>
            
            <p className="mt-4 text-center text-sm text-gray-300">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
