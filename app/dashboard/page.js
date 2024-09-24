'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    if (!loggedIn) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/login');
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-white shadow-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-800">
                NerdDev
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 flex flex-col`} style={{ top: '64px', height: 'calc(100vh - 64px)' }}>
          <div className="flex-shrink-0 h-16 flex items-center justify-between px-4 bg-indigo-600 text-white">
            <span className="text-2xl font-semibold">DWLR Dashboard</span>
            <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}></button>
          </div>
          <nav className="flex-1 mt-5 px-2 overflow-y-auto">
            <a href="#" className="group flex items-center px-2 py-2 text-base leading-6 font-medium rounded-md text-gray-900 bg-gray-100 focus:outline-none focus:bg-gray-200 transition ease-in-out duration-150">
              Dashboard
            </a>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {/* Statistics Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-center items-center">
                    <p className="text-gray-600 text-lg">Total DWLR Installed</p>
                    <p className="text-4xl font-bold">1,50,500 <FaArrowUp className="inline-block text-green-500" /></p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-center items-center">
                    <p className="text-gray-600 text-lg">Running DWLR</p>
                    <p className="text-4xl font-bold">1,50,000 <FaArrowDown className="inline-block text-red-500" /></p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-center items-center">
                    <p className="text-gray-600 text-lg">Refining DWLR</p>
                    <p className="text-4xl font-bold">500 <FaArrowUp className="inline-block text-green-500" /></p>
                  </div>
                </div>

                {/* Form and Map Section */}
                <div className="flex flex-col md:flex-row gap-8 mb-8">
                  {/* Form Section */}
                  <div className="bg-white shadow rounded-lg p-8 md:w-1/3">
                    <h2 className="text-center text-xl font-semibold mb-4">Check Status Of DWLRs</h2>
                    <div className="space-y-4">
                      <select className="w-full border border-gray-300 rounded-md p-2">
                        <option>Select State</option>
                        {/* More options */}
                      </select>
                      <select className="w-full border border-gray-300 rounded-md p-2">
                        <option>Select City</option>
                        {/* More options */}
                      </select>
                      <select className="w-full border border-gray-300 rounded-md p-2">
                        <option>Select Pincode</option>
                        {/* More options */}
                      </select>
                    </div>
                    <div className="mt-6 text-center">
                      <button className="bg-blue-500 text-white rounded-full px-6 py-2 w-full">Submit</button>
                    </div>
                    {/* More Analytics Button */}
                    <div className="mt-6 text-center">
                      <button className="bg-red-500 text-white rounded-full px-6 py-2 w-full">More Analytics</button>
                    </div>
                  </div>

                  {/* Map Section */}
                  <div className="bg-white shadow rounded-lg p-6 flex justify-center items-center md:w-2/3" style={{ height: 'calc(100vh - 250px)' }}>
                    <img src="/api/placeholder/800/600" alt="Map of India" className="w-full h-full object-cover rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}