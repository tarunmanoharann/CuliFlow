'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FileText, Bell, LogOut } from 'lucide-react';
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
import { Button, Box, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { CSVLink } from 'react-csv';
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
                <LogOut className="inline-block h-6 w-6 rounded-full" />
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
// Sample data for the report table
const generateReportData = () => {
    const statuses = ['Normal', 'Missing data', 'Abnormal data', 'Battery low'];
    const data = [];
  
    for (let i = 0; i < 30; i++) {
      data.push({
        id: i + 1,
        timestamp: new Date(Date.now() - i * 86400000).toLocaleString(), // Generating timestamps
        dwlrId: `DWLR-${i + 1}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
      });
    }
    return data;
  };

  export function Reports() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [reportData, setReportData] = useState(generateReportData());
    const [selectedDate, setSelectedDate] = useState('');
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
  
    const columns = [
      { field: 'timestamp', headerName: 'Timestamp', width: 250 },
      { field: 'dwlrId', headerName: 'DWLR ID', width: 150 },
      { field: 'status', headerName: 'Status', width: 200 },
    ];
  
    return (
      <div className="flex-1 ml-64 overflow-auto">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
              <div className="mt-4 flex justify-between items-center">
                <TextField
                  label="Select Date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <Box ml={2}>
                  <CSVLink
                    data={reportData}
                    filename="dwlrs_report.csv"
                    className="btn"
                    style={{ textDecoration: 'none' }}
                  >
                    <Button variant="contained" color="primary">
                      Download Report
                    </Button>
                  </CSVLink>
                </Box>
              </div>
              <div className="mt-4" style={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={reportData}
                  columns={columns}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10, 20]}
                  sortingOrder={['asc', 'desc']}
                  getRowId={(row) => row.id}
                  disableSelectionOnClick
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }