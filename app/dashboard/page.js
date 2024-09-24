"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { LayoutDashboard, FileText, Bell, LogOut } from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

const lineChartData = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 500 },
  { name: "Jun", value: 700 },
];

const pieChartData = [
  { name: "Group A", value: 400 },
  { name: "Group B", value: 300 },
  { name: "Group C", value: 300 },
  { name: "Group D", value: 200 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
    if (!loggedIn) {
      router.push("/");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/");
  };

  const scrollToAnalytics = () => {
    const analyticsSection = document.getElementById("analytics-section");
    analyticsSection.scrollIntoView({ behavior: "smooth" });
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg fixed h-full overflow-y-auto">
        <div className="h-16 flex items-center justify-between px-4 bg-indigo-600 text-white">
          <span className="text-2xl font-semibold">DWLR Dashboard</span>
        </div>
        <nav className="mt-5 px-2">
          <Link
            href="#"
            className="group flex items-center px-2 py-2 text-base leading-6 font-medium rounded-md text-gray-900 bg-gray-100 focus:outline-none focus:bg-gray-200 transition-all duration-300 ease-in-out hover:bg-gray-200"
          >
            <LayoutDashboard className="mr-4 h-6 w-6" />
            Dashboard
          </Link>
          <Link
            href="#"
            className="mt-1 group flex items-center px-2 py-2 text-base leading-6 font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:text-gray-900 focus:bg-gray-100 transition-all duration-300 ease-in-out"
          >
            <FileText className="mr-4 h-6 w-6" />
            Reports
          </Link>
          <Link
            href="#"
            className="mt-1 group flex items-center px-2 py-2 text-base leading-6 font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:text-gray-900 focus:bg-gray-100 transition-all duration-300 ease-in-out"
          >
            <Bell className="mr-4 h-6 w-6" />
            Notifications
          </Link>
        </nav>
        <div className="absolute bottom-0 w-full">
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="flex-shrink-0 w-full group block"
            >
              <div className="flex items-center">
                <div>
                  <LogOut className="inline-block h-9 w-9 rounded-full" />
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                    Logout
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 ml-64 overflow-auto">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Statistics Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-center items-center">
                  <p className="text-gray-600 text-lg">Total DWLR Installed</p>
                  <p className="text-4xl font-bold">
                    14,000 <FaArrowUp className="inline-block text-green-500" />
                  </p>
                </div>
                <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-center items-center">
                  <p className="text-gray-600 text-lg">Running DWLR</p>
                  <p className="text-4xl font-bold">
                    13,300 <FaArrowDown className="inline-block text-red-500" />
                  </p>
                </div>
                <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-center items-center">
                  <p className="text-gray-600 text-lg">Refining DWLR</p>
                  <p className="text-4xl font-bold">
                    700 <FaArrowUp className="inline-block text-green-500" />
                  </p>
                </div>
              </div>

              {/* Form and Map Section */}
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                {/* Form Section */}
                <div className="bg-white shadow rounded-lg p-8 md:w-1/3">
                  <h2 className="text-center text-xl font-semibold mb-4">
                    Check Status Of DWLRs
                  </h2>
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
                    <button className="bg-blue-500 text-white rounded-full px-6 py-2 w-full">
                      Submit
                    </button>
                  </div>
                  {/* More Analytics Button */}
                  <div className="mt-6 text-center">
                    <button
                      onClick={scrollToAnalytics}
                      className="bg-red-500 text-white rounded-full px-6 py-2 w-1/2 mx-auto"
                    >
                      More Analytics
                    </button>
                  </div>
                </div>

                {/* Map Section */}
                <div
                  className="bg-white shadow rounded-lg p-6 flex justify-center items-center md:w-2/3"
                  style={{ height: "calc(100vh - 250px)" }}
                >
                  {/* <img src="/api/placeholder/800/600" alt="Map of India" className="w-full h-full object-cover rounded-lg" /> */}
                  {/* <Image src="/images/map.png" alt="Map of India" layout="fill" objectFit="cover" className="w-full h-full object-cover rounded-lg" /> */}
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d15043912.592331674!2d70.94172281419381!3d22.993269817843423!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1srivers%20in%20india!5e0!3m2!1sen!2sin!4v1727156240677!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0, borderRadius: "12px" }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>

              {/* Analytics Section */}
              <div id="analytics-section" className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Line Chart */}
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Monthly Installations
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={lineChartData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#8884d8"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Pie Chart */}
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      DWLR Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// 'use client';

// import { useState } from 'react';
// import Image from 'next/image';
// import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// const data = [
//   { name: 'Jan', value: 400 },
//   { name: 'Feb', value: 300 },
//   { name: 'Mar', value: 600 },
//   { name: 'Apr', value: 800 },
//   { name: 'May', value: 500 },
//   { name: 'Jun', value: 700 },
// ];

// export default function Dashboard() {
//   const [showAnalytics, setShowAnalytics] = useState(false);

//   const scrollToAnalytics = () => {
//     setShowAnalytics(true);
//     document.getElementById('analytics').scrollIntoView({ behavior: 'smooth' });
//   };

//   return (
//     <div className="py-6 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Statistics Section */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//           <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-center items-center">
//             <p className="text-gray-600 text-lg">Total DWLR Installed</p>
//             <p className="text-4xl font-bold">1,50,500 <FaArrowUp className="inline-block text-green-500" /></p>
//           </div>
//           <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-center items-center">
//             <p className="text-gray-600 text-lg">Running DWLR</p>
//             <p className="text-4xl font-bold">1,50,000 <FaArrowDown className="inline-block text-red-500" /></p>
//           </div>
//           <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-center items-center">
//             <p className="text-gray-600 text-lg">Refining DWLR</p>
//             <p className="text-4xl font-bold">500 <FaArrowUp className="inline-block text-green-500" /></p>
//           </div>
//         </div>

//         {/* Form and Map Section */}
//         <div className="flex flex-col md:flex-row gap-8 mb-8">
//           {/* Form Section */}
//           <div className="bg-white shadow rounded-lg p-8 md:w-1/3">
//             <h2 className="text-center text-xl font-semibold mb-4">Check Status Of DWLRs</h2>
//             <div className="space-y-4">
//               <select className="w-full border border-gray-300 rounded-md p-2">
//                 <option>Select State</option>
//                 {/* More options */}
//               </select>
//               <select className="w-full border border-gray-300 rounded-md p-2">
//                 <option>Select City</option>
//                 {/* More options */}
//               </select>
//               <select className="w-full border border-gray-300 rounded-md p-2">
//                 <option>Select Pincode</option>
//                 {/* More options */}
//               </select>
//             </div>
//             <div className="mt-6 text-center">
//               <button className="bg-blue-500 text-white rounded-full px-6 py-2 w-full">Submit</button>
//             </div>
//             {/* More Analytics Button */}
//             <div className="mt-6 text-center">
//               <button onClick={scrollToAnalytics} className="bg-red-500 text-white rounded-full px-6 py-2 w-1/2 mx-auto">More Analytics</button>
//             </div>
//           </div>

//           {/* Map Section */}
//           <div className="bg-white shadow rounded-lg p-6 flex justify-center items-center md:w-2/3" style={{ height: 'calc(100vh - 250px)' }}>
//             {/* <Image src="/images/map.png" alt="Map of India" layout="fill" objectFit="cover" className="rounded-lg" /> */}
//           </div>
//         </div>

//         {/* Analytics Section */}
//         <div id="analytics" className={`mt-8 ${showAnalytics ? 'block' : 'hidden'}`}>
//           <h2 className="text-2xl font-semibold mb-4">Analytics</h2>
//           <div className="bg-white shadow rounded-lg p-6" style={{ height: '400px' }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart data={data}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
