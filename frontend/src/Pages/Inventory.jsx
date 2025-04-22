import React, { useState, useEffect } from "react";
import { Upload, X, FileText } from "lucide-react";

// Utility functions for storage
const STORAGE_PREFIX = "inventory_csv_";

const saveToStorage = (fileName, csvContent) => {
  try {
    const fileKey = `${STORAGE_PREFIX}`;
    localStorage.setItem(
      fileKey,
      JSON.stringify({
        timestamp: new Date().getTime(),
        fileName: fileName,
        csvContent: csvContent,
      })
    );
    return true;
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    return false;
  }
};

const getAllStoredFiles = () => {
  try {
    const files = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(STORAGE_PREFIX)) {
        const fileData = JSON.parse(localStorage.getItem(key));
        files.push({
          fileName: fileData.fileName,
          timestamp: fileData.timestamp,
        });
      }
    }
    return files.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Error getting stored files:", error);
    return [];
  }
};

const loadFileFromStorage = (fileName) => {
  try {
    const fileKey = `${STORAGE_PREFIX}${fileName}`;
    const saved = localStorage.getItem(fileKey);
    if (saved) {
      const fileData = JSON.parse(saved);
      const oneDay = 24 * 60 * 60 * 1000;
      if (new Date().getTime() - fileData.timestamp < oneDay) {
        return fileData.csvContent;
      }
    }
    return null;
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return null;
  }
};

const clearFile = (fileName) => {
  try {
    const fileKey = `${STORAGE_PREFIX}`;
    localStorage.removeItem(fileKey);
    localStorage.clear();
    location.reload();
    return true;
  } catch (error) {
    console.error("Error clearing file from localStorage:", error);
    return false;
  }
};

const clearAllFiles = () => {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
    localStorage.clear();
    return true;
  } catch (error) {
    console.error("Error clearing all files from localStorage:", error);
    return false;
  }
};

// Convert JSON data back to CSV
const convertToCSV = (jsonData) => {
  if (!jsonData || !jsonData.length) return "";
  const headers = Object.keys(jsonData[0]);
  const csvRows = [headers.join(",")];

  jsonData.forEach((row) => {
    const values = headers.map((header) => {
      const val = row[header] || "";
      return `"${val.toString().replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  });

  return csvRows.join("\n");
};

// Custom Alert Component
const CustomAlert = ({ children, type = "error" }) => (
  <div
    className={`p-4 rounded-lg flex items-start space-x-3 ${
      type === "error"
        ? "bg-red-50 border border-red-200 text-red-700"
        : "bg-blue-50 border border-blue-200 text-blue-700"
    }`}
  >
    <div className="flex-1">{children}</div>
  </div>
);

// Custom Button Component
const CustomButton = ({
  children,
  onClick,
  disabled,
  variant = "primary",
  className = "",
}) => {
  const baseStyles =
    "px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// CSV Preview Component
const CSVPreview = ({ data }) => {
  if (!data || !data.length) return null;

  const headers = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto mt-4 rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gray-50">
            {headers.map((header) => (
              <th
                key={header}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.slice(0, 5).map((row, idx) => (
            <tr
              key={idx}
              className="hover:bg-gray-50 transition-colors duration-150"
            >
              {headers.map((header) => (
                <td
                  key={header}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                >
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-6 py-3 bg-gray-50 text-xs text-gray-500">
        Showing first 5 rows of {data.length} total rows
      </div>
    </div>
  );
};

// StoredFiles Component
const StoredFiles = ({ onFileSelect, onFileDelete }) => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    setFiles(getAllStoredFiles());
  }, []);

  if (!files.length) return null;

  return (
    <div className="mt-4 space-y-2">
      <h4 className="text-sm font-medium text-gray-700">Stored Files</h4>
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.fileName}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{file.fileName}</span>
              <span className="text-xs text-gray-500">
                {new Date(file.timestamp).toLocaleDateString()}
              </span>
            </div>
            <div className="flex space-x-2">
              <CustomButton
                onClick={() => onFileSelect(file.fileName)}
                variant="secondary"
                className="text-sm"
              >
                Load
              </CustomButton>
              <CustomButton
                onClick={() => onFileDelete(file.fileName)}
                variant="danger"
                className="text-sm"
              >
                Delete
              </CustomButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Inventory Component
const Inventory = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gradioResults, setGradioResults] = useState(null);
  const [csvContent, setCsvContent] = useState(null);

  const validateCSV = (content) => {
    const lines = content.split("\n").filter((line) => line.trim());
    if (lines.length < 2) {
      throw new Error(
        "File must contain at least a header row and one data row"
      );
    }

    const headers = lines[0].split(",");
    if (headers.length < 1) {
      throw new Error("File must contain at least one column");
    }

    return headers;
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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError(null);

    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        validateCSV(content);
        const parsedData = parseCSV(content);
        setFile(selectedFile);
        setPreview(parsedData);
        setCsvContent(content);

        if (!saveToStorage(selectedFile.name, content)) {
          setError("Warning: Failed to save data locally.");
        }
      } catch (err) {
        setError(err.message);
        setFile(null);
        setPreview(null);
        setCsvContent(null);
      }
    };

    reader.onerror = () => {
      setError("Error reading file");
      setFile(null);
      setPreview(null);
      setCsvContent(null);
    };

    reader.readAsText(selectedFile);
  };

  const handleStoredFileSelect = (fileName) => {
    const content = loadFileFromStorage(fileName);
    if (content) {
      try {
        const parsedData = parseCSV(content);
        setFile({ name: fileName });
        setPreview(parsedData);
        setCsvContent(content);
        setError(null);
      } catch (err) {
        setError(`Error loading file: ${err.message}`);
      }
    } else {
      setError("File not found or expired");
    }
  };

  const handleStoredFileDelete = (fileName) => {
    if (clearFile(fileName)) {
      if (file?.name === fileName) {
        clearCurrentFile();
      }
      // Force update of StoredFiles component
      forceUpdate();
      setError(null);
    } else {
      setError("Error deleting file");
    }
  };

  const clearCurrentFile = () => {
    setFile(null);
    setPreview(null);
    setCsvContent(null);
    setError(null);
    setGradioResults(null);
  };

  const handleClearAllFiles = () => {
    if (clearAllFiles()) {
      clearCurrentFile();
      // Force update of StoredFiles component
      forceUpdate();
    } else {
      setError("Error clearing all files");
    }
  };

  // Force update helper
  const [, updateState] = useState();
  const forceUpdate = () => updateState({});

  const handleSubmit = async () => {
    if (!preview) {
      setError("Please upload a CSV file first");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:7860/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: preview }),
      });

      if (!response.ok) {
        throw new Error("Failed to process data");
      }

      const result = await response.json();
      setGradioResults(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">
            Inventory Management
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Upload and manage your CSV files
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {/* Upload Area */}
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">CSV files only</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* Stored Files */}
            <StoredFiles
              onFileSelect={handleStoredFileSelect}
              onFileDelete={handleStoredFileDelete}
            />

            {/* Error Display */}
            {error && <CustomAlert type="error">{error}</CustomAlert>}

            {/* File Preview */}
            {file && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-medium">{file.name}</div>
                    <button
                      onClick={clearCurrentFile}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* CSV Preview */}
                {preview && <CSVPreview data={preview} />}

                {/* Submit Button */}
                {/* <div className="flex justify-end space-x-4">
                  <CustomButton
                    onClick={handleSubmit}
                    disabled={isLoading}
                    variant="primary"
                  >
                    {isLoading ? "Processing..." : "Process Inventory Data"}
                  </CustomButton>
                </div> */}
              </div>
            )}

            {preview && (
              <div className="pt-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Manage your stored CSV files
                  </p>
                  <CustomButton
                    onClick={handleClearAllFiles}
                    variant="danger"
                    className="ml-4"
                  >
                    Clear All Stored Files
                  </CustomButton>
                </div>
              </div>
            )}

            {/* Gradio Results */}
            {gradioResults && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4">Analysis Results</h4>
                <div className="border rounded-lg overflow-hidden">
                  <iframe
                    srcDoc={`
                      <html>
                        <body style="margin:0; font-family: system-ui, -apple-system, sans-serif;">
                          <div style="padding: 1rem;">
                            <table style="width: 100%; border-collapse: collapse;">
                              <thead>
                                <tr style="background-color: #f3f4f6;">
                                  ${Object.keys(gradioResults)
                                    .map(
                                      (key) =>
                                        `<th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb;">${key}</th>`
                                    )
                                    .join("")}
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  ${Object.values(gradioResults)
                                    .map(
                                      (value) =>
                                        `<td style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb;">${value}</td>`
                                    )
                                    .join("")}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </body>
                      </html>
                    `}
                    className="w-full h-32 border-0"
                    title="Analysis Results"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
