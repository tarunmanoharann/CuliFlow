'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Bell, LogOut } from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  const handleLogout = () => {
    // Implement logout logic here
    console.log('Logout clicked');
  };

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed">
      <div className="h-16 flex items-center justify-center bg-indigo-600 text-white">
        <span className="text-2xl font-semibold">DWLR Dashboard</span>
      </div>
      <nav className="mt-5 px-2">
        <Link href="/dashboard" className={`group flex items-center px-2 py-2 text-base leading-6 font-medium rounded-md ${pathname === '/dashboard' ? 'text-gray-900 bg-gray-100' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'} transition-all duration-300 ease-in-out`}>
          <LayoutDashboard className="mr-4 h-6 w-6" />
          Dashboard
        </Link>
        <Link href="/reports" className={`mt-1 group flex items-center px-2 py-2 text-base leading-6 font-medium rounded-md ${pathname === '/reports' ? 'text-gray-900 bg-gray-100' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'} transition-all duration-300 ease-in-out`}>
          <FileText className="mr-4 h-6 w-6" />
          Reports
        </Link>
        <Link href="/notifications" className={`mt-1 group flex items-center px-2 py-2 text-base leading-6 font-medium rounded-md ${pathname === '/notifications' ? 'text-gray-900 bg-gray-100' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'} transition-all duration-300 ease-in-out`}>
          <Bell className="mr-4 h-6 w-6" />
          Notifications
        </Link>
      </nav>
      <div className="absolute bottom-0 w-full">
        <button onClick={handleLogout} className="flex items-center px-2 py-2 text-base leading-6 font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 w-full transition-all duration-300 ease-in-out">
          <LogOut className="mr-4 h-6 w-6" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;