import { Client } from "@gradio/client";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ArrowLeft, Download, LineChart } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
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

const EnhancedDemandForecast = () => {
  const [numDays, setNumDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [localData, setLocalData] = useState(null);
  const [chartWidth, setChartWidth] = useState(800);
  const [downloading, setDownloading] = useState(false);
  
  const chartRef = useRef(null);
  const tableRef = useRef(null);
  const contentRef = useRef(null);

  const dayOptions = [7, 10, 14, 30, 60, 90, 100];

  useEffect(() => {
    const storedData = loadFromStorage();
    if (storedData) {
      setLocalData(storedData);
      processPrediction(storedData);
    } else {
      setError("No inventory data found in local storage or data has expired");
    }
  }, []);

  useEffect(() => {
    if (localData) {
      processPrediction(localData);
    }
  }, [numDays]);

  useEffect(() => {
    if (predictions) {
      const dataLength = Object.keys(predictions).length;
      const calculatedWidth = Math.max(800, dataLength * 120);
      setChartWidth(calculatedWidth);
    }
  }, [predictions]);

  const processPrediction = async (storedData) => {
    if (!storedData) return;

    setLoading(true);
    setError(null);

    try {
      const client = await Client.connect("http://127.0.0.1:7861/");
      const csvBlob = new Blob([storedData.csvContent], { type: "text/csv" });
      const result = await client.predict("/predict", {
        csv_file: csvBlob,
        num_days: numDays,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      setPredictions(result.data[0].predictions);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setPredictions(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!contentRef.current) return;
    
    setDownloading(true);
    try {
      // Create PDF in landscape orientation
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Get PDF dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Capture the entire content
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        windowWidth: contentRef.current.scrollWidth,
        windowHeight: contentRef.current.scrollHeight
      });

      // Calculate scaling to fit the page width while maintaining aspect ratio
      const imgWidth = pageWidth - 20; // Leave 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If content is too tall for one page, create multiple pages
      let remainingHeight = canvas.height;
      let currentPosition = 0;
      
      while (remainingHeight > 0) {
        // Convert to the PDF's coordinate system
        const pageImgHeight = Math.min((pageWidth * canvas.height) / canvas.width, pageHeight - 20);
        const sourceHeight = (pageImgHeight * canvas.width) / pageWidth;
        
        // Create new page if not the first page
        if (currentPosition > 0) {
          pdf.addPage();
        }
        
        // Add image portion to current page
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 1.0),
          'JPEG',
          10, // x position (10mm margin)
          10, // y position (10mm margin)
          imgWidth,
          imgHeight,
          '',
          'FAST'
        );
        
        // Update remaining height and position
        remainingHeight -= sourceHeight;
        currentPosition += sourceHeight;
      }

      pdf.save('sales-forecast.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const formattedData = predictions
    ? Object.entries(predictions).map(([name, prediction]) => ({
        name,
        prediction: Math.round(prediction),
      }))
    : [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button and Download Button */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 bg-white rounded-lg px-4 py-2 shadow-sm hover:shadow"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to Dashboard</span>
          </button>
          
          {predictions && (
            <button
              onClick={downloadPDF}
              disabled={downloading}
              className="flex items-center text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 rounded-lg px-4 py-2 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4 mr-2" />
              {downloading ? 'Generating PDF...' : 'Download Report'}
            </button>
          )}
        </div>

        {/* Main Content Card */}
        <div ref={contentRef} className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                  <LineChart className="h-6 w-6 text-blue-600" />
                  Sales Forecast
                </h1>
                {localData && (
                  <p className="text-sm text-gray-500">
                    Using data from: {localData.fileName}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Day Selector */}
              <div className="max-w-xs space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Forecast Period
                </label>
                <select
                  value={numDays}
                  onChange={(e) => setNumDays(parseInt(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors duration-200"
                >
                  {dayOptions.map((days) => (
                    <option key={days} value={days}>
                      {days} Days
                    </option>
                  ))}
                </select>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-8 text-gray-600">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                  <span>Processing data...</span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {error}
                </div>
              )}

              {/* Predictions Chart and Table */}
              {predictions && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Forecast Chart
                    </h2>
                    <div ref={chartRef} className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
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
                            angle={-45}
                            textAnchor="end"
                            interval={0}
                            height={60}
                          />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="prediction" fill="#3490dc" barSize={60}>
                            <LabelList dataKey="prediction" position="top" />
                          </Bar>
                        </BarChart>
                      </div>
                    </div>
                  </div>

                  {/* Predictions Table */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Forecast Data
                    </h2>
                    <div ref={tableRef} className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Item Name
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Predicted Quantity
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {formattedData.map((item, index) => (
                            <tr key={item.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {item.prediction.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDemandForecast;