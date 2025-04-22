import {
  BadgeIndianRupee,
  Cloud,
  MapPin,
  Package,
  ShoppingCart,
  Users
} from "lucide-react";
import React, { useEffect, useState } from "react";
import DemandForecast from "../components/DemandForecast";
import FutureSales from "../components/FutureSales";
import ScoreDash from "../components/ScoreDash";
import SentimentAnalysis from "../components/SentimentAnalysis";

const STORAGE_PREFIX = "inventory_csv_";

const StatCard = ({ title, value, icon: Icon }) => {
  const [count, setCount] = useState(0);
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''));

  useEffect(() => {
    let startValue = 0;
    const endValue = numericValue;
    const duration = 2000;
    const frameRate = 60;
    const increment = endValue / (duration / (1000 / frameRate));
    let currentValue = startValue;

    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= endValue) {
        clearInterval(timer);
        setCount(endValue);
      } else {
        setCount(Math.floor(currentValue));
      }
    }, 1000 / frameRate);

    return () => clearInterval(timer);
  }, [numericValue]);

  const formatAmount = (amount) => {
    if (amount >= 10000000) { // 1 Crore = 10000000
      return `${(amount / 10000000).toFixed(2)}Cr`;
    } else if (amount >= 100000) { // 1 Lakh = 100000
      return `${(amount / 100000).toFixed(2)}L`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  const displayValue = value.startsWith('₹') ? `₹${formatAmount(count)}` : formatAmount(count);

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
      <div className="flex items-center space-x-4">
        <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
            {displayValue}
          </h3>
        </div>
      </div>
    </div>
  );
};

const WeatherInfo = () => {
  const [weather, setWeather] = useState({ temp: 28, condition: 'Sunny' });
  
  return (
    <div className="flex items-center space-x-2 text-gray-600">
      <Cloud className="w-4 h-4" />
      <span>{weather.temp}°C</span>
      <span>{weather.condition}</span>
    </div>
  );
};

const Dashboard = () => {
  const [uploadedData, setUploadedData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalOrder, setTotalOrder] = useState(null);
  const [totalQuantity,setTotalQuantity]=useState(null);
  const [storedData, setStoredData] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = () => {
    try {
      const fileKey = `${STORAGE_PREFIX}`;
      const savedData = localStorage.getItem(fileKey);

      if (savedData) {
        const fileData = JSON.parse(savedData);
        setStoredData(fileData);

        if (fileData.csvContent) {
          const parsedCsv = parseCSVContent(fileData.csvContent);
          setParsedData(parsedCsv);

          // Calculate total transaction amount
          const total = parsedCsv.data.reduce((sum, row) => {
            const amount = parseFloat(row.transaction_amount) || 0;
            return sum + amount;
          }, 0);

          const totalQ = parsedCsv.data.reduce((sum, row) => {
            const amount = parseFloat(row.quantity) || 0;
            return sum + amount;
          }, 0);

          setTotalQuantity(totalQ);

          setTotalAmount(total);

          console.group("Transaction Data Summary");
          console.log("Total Transaction Amount:", total);
          console.log("Number of Transactions:", parsedCsv.data.length);
          setTotalOrder(parsedCsv.data.length);
          console.groupEnd();
        }
      } else {
        setError("No CSV data found in storage");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load stored data");
    }
  };

  const parseCSVContent = (csvContent) => {
    const lines = csvContent.split("\n").filter((line) => line.trim());
    const headers = lines[0].split(",").map((header) => header.trim());

    const data = lines.slice(1).map((line) => {
      const values = line.split(",").map((value) => value.trim());
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] || "";
        return obj;
      }, {});
    });

    return { headers, data };
  };


  const avg = Math.floor(totalAmount / totalOrder)

  useEffect(() => {
    loadStoredData();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Hotel Branding Section */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 font-serif">Taj Hotel</h1>
            <div className="mt-2 flex items-center space-x-4">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                <span>Apollo Bunder, Mumbai, Maharashtra 400001</span>
              </div>
              {/* <WeatherInfo /> */}
              {/* <div className="text-gray-600">
                {currentTime.toLocaleTimeString()}
              </div> */}
            </div>
          </div>
          {/* <div className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Today's Occupancy</h3>
            <div className="text-2xl font-bold text-indigo-600">87%</div>
          </div> */}
        </div>
      </div>

      {/* Stats Grid with modern layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Sales"
          value={`₹${totalAmount}`}
          lastYear="₹140K"
          change={-1}
          icon={BadgeIndianRupee}
        />
        <StatCard
          title="Total Orders"
          value={totalOrder?.toString() || "0"}
          lastYear="20K"
          change={-9}
          icon={ShoppingCart}
        />
        <StatCard
          title="Total Quantity"
          value={totalQuantity?.toString() || "0"}
          lastYear="407K"
          change={-9}
          icon={Package}
        />
        <StatCard
          title="Avg Sales per Order"
          value={`₹${avg || 0}`}
          lastYear="₹70.04"
          change={7}
          icon={Users}
        /> 
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div className="flex items-center justify-center w-full bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center">
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-gray-900 ">Sentiment Analysis</h2>
      
    </div>
    <div className="flex items-center justify-center w-full">
      <SentimentAnalysis />
    </div>
  </div>



        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
          
          <ScoreDash />
          
        </div>

      </div>
      <div className="flex-1 gap-8 my-8">

        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all  my-8 duration-300 p-6">
          
          <DemandForecast />
          
        </div>
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all my-8 duration-300 p-6 overflow-x-auto">
  <div style={{ minWidth: '600px' }}> {/* Adjust minWidth as needed */}
    <FutureSales />
  </div>
</div>

      </div>

      {/* Data Preview Section */}
      {uploadedData && (
        <div className="mt-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">Recent Data</h3>
            <p className="text-gray-500 text-sm mt-1">Latest analytics results</p>
          </div>
          <div className="p-6">
            <CSVPreview data={uploadedData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;