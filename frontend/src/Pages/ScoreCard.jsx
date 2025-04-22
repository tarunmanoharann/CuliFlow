import { Client } from "@gradio/client";
import html2pdf from "html2pdf.js";
import { ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const STORAGE_PREFIX = "inventory_csv_";

// Utility function to load data from localStorage
const loadFromStorage = () => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(STORAGE_PREFIX)) {
        const fileData = JSON.parse(localStorage.getItem(key));
        // Check if the data is less than 24 hours old
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

const ScoreCard = () => {
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState("daily");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [localData, setLocalData] = useState(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedData = loadFromStorage();
    if (storedData) {
      setLocalData(storedData);
      processAnalysis(storedData);
    } else {
      setError("No inventory data found in local storage or data has expired");
    }
  }, []);

  // Helper functions for calculations
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

  const processAnalysis = async (storedData) => {
    if (!storedData) return;

    setLoading(true);
    setError(null);

    try {
      const client = await Client.connect("http://127.0.0.1:7863/");

      // Create a Blob from the CSV string
      const csvBlob = new Blob([storedData.csvContent], { type: "text/csv" });

      const result = await client.predict("/predict", {
        csv_file: csvBlob,
      });

      setData(result.data[0]);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to process file: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const element = document.getElementById("report-container");
    html2pdf().from(element).save("sales-report.pdf");
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
        maxMetric: Math.max(accuracy, reliability),
        mae: safeToFixed(metrics.mae, 3),
        rmse: safeToFixed(metrics.rmse, 3),
        r2: safeToFixed(metrics.r2, 3),
        mape: safeToFixed(metrics.mape, 1),
      };
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>

      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Performance Analysis</h2>
        {localData && (
          <p className="text-sm text-gray-600 mt-2">
            Using data from file: {localData.fileName}
          </p>
        )}
        {data && (
          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Download PDF
          </button>
        )}
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">
        Understanding Your Performance Scores
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">Accuracy Score</h4>
          <p className="text-sm text-gray-600">
            Think of this like a grade on a test. A score of 70% or higher means our
            predictions are doing well, just like getting a B or better on an exam.
            The closer to 100%, the more accurate our predictions are.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Reliability Score</h4>
          <p className="text-sm text-gray-600">
            This is like measuring how dependable something is. If your friend is on
            time 90% of the time, they're very reliable. Similarly, a higher
            percentage here means our predictions are more consistent and
            trustworthy.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Average Error</h4>
          <p className="text-sm text-gray-600">
            Imagine guessing how many jelly beans are in a jar. This number shows
            how far off our guesses typically are. The smaller this number, the
            closer our predictions are to the actual values. It's like being off by
            just 2 jelly beans versus being off by 20.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Error Range</h4>
          <p className="text-sm text-gray-600">
            Think of this as measuring how consistent our guesses are. Like a
            weather forecast being off by 1-2 degrees versus sometimes being off by
            1 degree and other times by 10 degrees. Lower numbers mean our
            predictions stay consistently close to the actual values.
          </p>
        </div>
      </div>
    </div>
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {data && (
        <div id="report-container" className="space-y-6">
          {/* Rest of the component remains the same */}
          {/* Timeframe Selector */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex space-x-2">
              {["daily", "weekly", "monthly"].map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedTimeframe === timeframe
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {transformMetrics(data)?.map((metric) => (
              <div
                key={metric.item}
                className="bg-white rounded-lg shadow-md p-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{metric.item}</h3>
                  <span
                    className={`text-lg font-semibold rounded-full px-3 py-1 ${
                      metric.accuracy > metric.reliability
                        ? metric.accuracy >= 70
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                        : metric.reliability >= 70
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {metric.accuracy > metric.reliability
                      ? `${metric.accuracy}%`
                      : `${metric.reliability}%`}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reliability:</span>
                    <span className="font-medium">{metric.reliability}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg. Error:</span>
                    <span className="font-medium">{metric.mae}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Error Spread:</span>
                    <span className="font-medium">{metric.rmse}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-4">Performance Radar</h3>
              <div className="h-96">
                <ResponsiveContainer>
                  <RadarChart data={transformMetrics(data)}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="item" />
                    <Radar
                      name="Performance"
                      dataKey="maxMetric"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-4">Metric Comparison</h3>
              <div className="h-96">
                <ResponsiveContainer>
                  <BarChart data={transformMetrics(data)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="item" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="accuracy" fill="#82ca9d" />
                    <Bar dataKey="reliability" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Metrics Understanding Section */}
          
        </div>
      )}
    </div>
  );
};

export default ScoreCard;