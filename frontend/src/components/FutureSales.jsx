import { Client } from "@gradio/client";
import { CalendarDays, Sun } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const STORAGE_PREFIX = "inventory_csv_";

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
};

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

const MetadataCard = ({ title, children, icon }) => (
  <div className="bg-white rounded-lg shadow p-4 flex items-start space-x-3">
    <div className="text-blue-600">{icon}</div>
    <div>
      <h3 className="font-medium text-gray-900">{title}</h3>
      <div className="text-gray-600">{children}</div>
    </div>
  </div>
);

const FutureSales = () => {
  const [predictionDate, setPredictionDate] = useState(getTomorrowDate());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [localData, setLocalData] = useState(null);
  const chartWidth = window.innerWidth; // Set chartWidth dynamically or use a fixed value

  const fetchPredictions = async (data, date) => {
    setLoading(true);
    setError(null);

    try {
      const client = await Client.connect("http://127.0.0.1:7860/");
      
      const csvBlob = new Blob([data.csvContent], { type: "text/csv" });
      const result = await client.predict("/predict", {
        csv_file: csvBlob,
        prediction_date: date,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      setPredictions(result.data[0].predictions);
      setMetadata(result.data[0].metadata);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setPredictions(null);
      setMetadata(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const data = loadFromStorage();
    if (data) {
      setLocalData(data);
      setError(null);
      fetchPredictions(data, getTomorrowDate());
    } else {
      setError("No inventory data found in local storage or data has expired");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!localData || !predictionDate) {
      setError("Please ensure data is loaded and enter a prediction date");
      return;
    }
    await fetchPredictions(localData, predictionDate);
  };

  const formatDataForChart = (predictions) => {
    return Object.entries(predictions).map(([key, value]) => {
      return { name: key.toString(), predictedSales: value };
    });
  };

  const formattedData = predictions ? formatDataForChart(predictions) : [];

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Future Sales Prediction</h1>
          {localData && (
            <p className="text-sm text-gray-600 mt-2">
              Using data from file: {localData.fileName}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prediction Date (yyyy-mm-dd)
            </label>
            <input
              type="date"
              value={predictionDate}
              onChange={(e) => setPredictionDate(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !localData || !predictionDate}
            className="w-full text-white bg-blue-600 p-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? "Processing..." : "Predict Sales"}
          </button>
        </form>

        {metadata && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetadataCard
              title="Date Information"
              icon={<CalendarDays size={24} />}
            >
              <p>Date: {metadata.date}</p>
              <p>{metadata.is_weekend ? "Weekend" : "Weekday"}</p>
              {metadata.is_holiday && (
                <p className="text-green-600">
                  Holiday: {metadata.holiday_name}
                </p>
              )}
            </MetadataCard>

            <MetadataCard title="Season & Climate" icon={<Sun size={24} />}>
              <p>Season: {metadata.season}</p>
              {metadata.weather && (
                <>
                  <p>Weather: {metadata.weather.weather_main}</p>
                  <p>Temperature: {metadata.weather.temperature}°C</p>
                  <p>Humidity: {metadata.weather.humidity}%</p>
                </>
              )}
            </MetadataCard>
          </div>
        )}

        {predictions && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Forecast Results
            </h2>
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <div style={{ width: `${chartWidth}px` }} className="p-4">
                <BarChart
                  width={chartWidth - 40}
                  height={400}
                  data={formattedData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      padding: "0.75rem",
                      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                    }}
                  />
                  
                  <Bar
                    dataKey="predictedSales"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  >
                    <LabelList dataKey="predictedSales" position="top" />
                  </Bar>
                </BarChart>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default FutureSales;
