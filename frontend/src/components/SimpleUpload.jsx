import React, { useState } from "react";

const SimpleUpload = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
    }
  };

  // Function to convert CSV to JSON
  const csvToJson = (csv) => {
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    const jsonData = lines.slice(1).map((line) => {
      const values = line.split(",");
      return headers.reduce((acc, header, index) => {
        acc[header.trim()] = values[index].trim();
        return acc;
      }, {});
    });
    return jsonData;
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const text = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
      });

      const jsonData = csvToJson(text);
      console.log("Converted JSON:", jsonData); // Log the JSON data

      const response = await fetch("http://127.0.0.1:7861/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData), // Send JSON data
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data.data);
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* File Input */}
      <input type="file" accept=".csv" onChange={handleFileChange} />

      {/* Submit Button */}
      <button onClick={handleSubmit}>
        {loading ? "Processing..." : "Submit"}
      </button>

      {/* Error Message */}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {/* Result Display */}
      {result && (
        <div>
          <h3>Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default SimpleUpload;
