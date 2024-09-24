'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FileText, Bell, LogOut } from 'lucide-react';

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <Reports />
    </div>
  );
}

export function Sidebar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/');
  };

  return (
    <div className="w-64 bg-white shadow-lg fixed h-full overflow-y-auto">
      <div className="h-16 flex items-center justify-between px-4 bg-indigo-600 text-white">
        <span className="text-2xl font-semibold">DWLR Dashboard</span>
      </div>
      <nav className="mt-5 px-2">
        <Link
          href="/dashboard"
          className="group flex items-center px-2 py-2 text-base leading-6 font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:text-gray-900 focus:bg-gray-100 transition-all duration-300 ease-in-out"
        >
          <LayoutDashboard className="mr-4 h-6 w-6" />
          Dashboard
        </Link>
        <Link
          href="/report"
          className="mt-1 group flex items-center px-2 py-2 text-base leading-6 font-medium rounded-md text-gray-900 bg-gray-100 focus:outline-none focus:bg-gray-200 transition-all duration-300 ease-in-out hover:bg-gray-200"
        >
          <FileText className="mr-4 h-6 w-6" />
          Reports
        </Link>
        <Link
          href="/notifications"
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
  );
}

export function Reports() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    if (!loggedIn) {
      router.push('/');
    }
  }, [router]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="flex-1 ml-64 overflow-auto">
      <main className="flex-1">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
            <div className="mt-4">
              {/* Add your reports content here */}
              <p className="text-gray-600">This is the Reports page. Add your reports content here.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}