import { Client } from "@gradio/client";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const STORAGE_PREFIX = "inventory_csv_";
const DEFAULT_DAYS = 30;

// Utility function to parse CSV content
const parseCSV = (content) => {
  const lines = content.split("\n").filter((line) => line.trim());
  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index] || "";
      return obj;
    }, {});
  });
};

// Function to load data from localStorage
const loadFromStorage = () => {
  try {
    const files = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(STORAGE_PREFIX)) {
        const fileData = JSON.parse(localStorage.getItem(key));
        // Check if the data is less than 24 hours old
        const oneDay = 24 * 60 * 60 * 1000;
        if (new Date().getTime() - fileData.timestamp < oneDay) {
          return parseCSV(fileData.csvContent);
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return null;
  }
};

const DemandForecast = () => {
  const [numDays, setNumDays] = useState(DEFAULT_DAYS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [localData, setLocalData] = useState(null);

  const fetchPredictions = async (data, days) => {
    setLoading(true);
    setError(null);

    try {
      const client = await Client.connect("http://127.0.0.1:7861/");

      // Convert local data to CSV string
      const headers = Object.keys(data[0]).join(",");
      const rows = data.map((row) => Object.values(row).join(","));
      const csvString = [headers, ...rows].join("\n");

      // Create a Blob from the CSV string
      const csvBlob = new Blob([csvString], { type: "text/csv" });

      const result = await client.predict("/predict", {
        csv_file: csvBlob,
        num_days: days,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      const predictionData = Object.entries(result.data[0].predictions).map(
        ([name, value]) => ({
          name,
          value,
        })
      );

      setPredictions(predictionData);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setPredictions(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const data = loadFromStorage();
    setLocalData(data);
    if (!data) {
      setError("No inventory data found in local storage or data has expired");
    } else {
      // Automatically fetch predictions when data is loaded
      fetchPredictions(data, DEFAULT_DAYS);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!localData) {
      setError("No inventory data available");
      return;
    }
    await fetchPredictions(localData, numDays);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Sales Forecast</h1>
          {localData && (
            <p className="text-sm text-gray-600 mt-2">
              Using locally stored inventory data with {localData.length} records
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prediction Period
            </label>
            <select
              value={numDays}
              onChange={(e) => setNumDays(parseInt(e.target.value))}
              className="w-full p-2 border rounded-md"
            >
              <option value={7}>7 Days</option>
              <option value={14}>14 Days</option>
              <option value={30}>30 Days</option>
              <option value={60}>60 Days</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !localData}
            className="w-full text-white bg-blue-600 p-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? "Processing..." : "Predict Sales"}
          </button>
        </form>

        {predictions && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold">Predictions Line Chart:</h2>
            <div className="mt-4 overflow-x-auto">
              <div className="min-w-[800px]" style={{ height: "400px" }}>
                <ResponsiveContainer>
                  <LineChart data={predictions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      height={100}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="mt-6">
          <Link to="/demanda" className="text-blue-500 hover:underline">
            More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DemandForecast;