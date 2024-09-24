'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 700 },
];

export default function Dashboard() {
  const [showAnalytics, setShowAnalytics] = useState(false);

  const scrollToAnalytics = () => {
    setShowAnalytics(true);
    document.getElementById('analytics').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-center items-center">
            <p className="text-gray-600 text-lg">Total DWLR Installed</p>
            <p className="text-4xl font-bold">14,000 <FaArrowUp className="inline-block text-green-500" /></p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-center items-center">
            <p className="text-gray-600 text-lg">Running DWLR</p>
            <p className="text-4xl font-bold">13,300 <FaArrowDown className="inline-block text-red-500" /></p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-center items-center">
            <p className="text-gray-600 text-lg">Refining DWLR</p>
            <p className="text-4xl font-bold">700 <FaArrowUp className="inline-block text-green-500" /></p>
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
              <button onClick={scrollToAnalytics} className="bg-red-500 text-white rounded-full px-6 py-2 w-1/2 mx-auto">More Analytics</button>
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white shadow rounded-lg p-6 flex justify-center items-center md:w-2/3" style={{ height: 'calc(100vh - 250px)' }}>
            <Image src="/map.png" alt="Map of India" layout="fill" objectFit="cover" className="rounded-lg" />
          </div>
        </div>

        {/* Analytics Section */}
        <div id="analytics" className={`mt-8 ${showAnalytics ? 'block' : 'hidden'}`}>
          <h2 className="text-2xl font-semibold mb-4">Analytics</h2>
          <div className="bg-white shadow rounded-lg p-6" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}