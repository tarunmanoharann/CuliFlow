import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MiniNavbar from '../components/MiniNavbar';
import BgImage from '../assets/bgbg.jpg'; 

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MiniNavbar />
      <Sidebar />
      <div className="md:ml-64 pt-16 min-h-screen">
        <div 
          className="p-6 min-h-screen bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: `linear-gradient(rgba(249, 250, 251, 0.9), rgba(249, 250, 251, 0.9)), url(${BgImage})`,
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}