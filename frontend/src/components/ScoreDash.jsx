import { Client } from "@gradio/client";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const STORAGE_PREFIX = "inventory_csv_";

const loadFromStorage = () => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(STORAGE_PREFIX)) {
        const fileData = JSON.parse(localStorage.getItem(key));
        const oneDay = 24 * 60 * 60 * 1000;
        if (new Date().getTime() - fileData.timestamp < oneDay) {
          return {
            csvContent: fileData.csvContent,
            fileName: fileData.fileName,
          };
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return null;
  }
};

const EnhancedScoreDash = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("daily");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [localData, setLocalData] = useState(null);

  useEffect(() => {
    const storedData = loadFromStorage();
    if (storedData) {
      setLocalData(storedData);
      processStoredData(storedData);
    } else {
      setError("No inventory data found in local storage or data has expired");
    }
  }, []);

  const processStoredData = async (storedData) => {
    if (!storedData) return;

    try {
      setLoading(true);
      setError(null);

      const client = await Client.connect("http://127.0.0.1:7863/");
      const csvBlob = new Blob([storedData.csvContent], { type: "text/csv" });

      const result = await client.predict("/predict", {
        csv_file: csvBlob,
      });

      setData(result.data[0]);
    } catch (err) {
      setError("Failed to process file: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const safeToFixed = (value, decimals = 1) => {
    if (value === null || value === undefined || isNaN(value)) {
      return "0.0";
    }
    return Number(value).toFixed(decimals);
  };

  const calculateAccuracy = (r2) => {
    if (r2 === null || r2 === undefined || isNaN(r2)) {
      return "0.0";
    }
    return Math.max(0, Math.min(100, (r2 + 1) * 50)).toFixed(1);
  };

  const calculateReliability = (mape) => {
    if (mape === null || mape === undefined || isNaN(mape)) {
      return "0.0";
    }
    return Math.max(0, Math.min(100, 100 - mape)).toFixed(1);
  };

  const transformMetrics = (data) => {
    if (!data?.item_performance) return [];

    return Object.entries(data.item_performance).map(([item, performance]) => {
      const metrics = performance[`${selectedTimeframe}_metrics`] || {};
      const accuracy = calculateAccuracy(metrics.r2);
      const reliability = calculateReliability(metrics.mape);

      return {
        item,
        accuracy,
        reliability,
      };
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Performance Analysis</h2>
        {localData && (
          <p className="text-sm text-gray-600 mb-4">
            Using data from file: {localData.fileName}
          </p>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeframe
          </label>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        {loading && (
          <div className="text-center text-gray-600">Processing data...</div>
        )}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </div>

      {data && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold mb-4">Performance Radar</h3>
          <div className="h-96">
            <ResponsiveContainer>
              <RadarChart data={transformMetrics(data)}>
                <PolarGrid />
                <PolarAngleAxis
                  dataKey="item"
                  tick={{ fontSize: 12 }} // Smaller font size for ticks
                  tickLine={false} // Hide tick lines for clarity
                  angle={30} // Rotate labels for better spacing
                />
                <Radar
                  name="Performance"
                  dataKey="accuracy"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 text-right">
            <Link to="/score" className="text-blue-600 hover:underline">
              More
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedScoreDash;
