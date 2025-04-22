import { LineChart } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const SentimentAnalysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/food_reviews.csv");
      if (!response.ok) {
        throw new Error("Failed to fetch CSV file");
      }

      const text = await response.text();
      const parsedData = parseCSV(text);
      setData(parsedData);

      const analyzedData = analyzeSentiment(parsedData);
      setResult(analyzedData);
    } catch (err) {
      setError(`Error loading data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = (text) => {
    const lines = text.split("\n");
    const headers = lines[0].split(",");

    return lines
      .slice(1)
      .map((line) => {
        const values = line.split(",");
        const row = {};
        headers.forEach((header, index) => {
          row[header.trim()] = values[index]?.trim();
        });
        return row;
      })
      .filter((row) => Object.values(row).some((value) => value));
  };

  const analyzeSentiment = (data) => {
    const keywords = {
      positive: ["good", "great", "excellent", "delicious", "love", "amazing"],
      negative: [
        "bad",
        "poor",
        "terrible",
        "horrible",
        "hate",
        "disappointing",
      ],
    };

    return data.map((row) => {
      const text = row.Review?.toLowerCase() || "";
      const positiveCount = keywords.positive.filter((word) =>
        text.includes(word)
      ).length;
      const negativeCount = keywords.negative.filter((word) =>
        text.includes(word)
      ).length;

      let sentiment;
      if (positiveCount > negativeCount) {
        sentiment = "Positive";
      } else if (negativeCount > positiveCount) {
        sentiment = "Negative";
      } else {
        sentiment = "Neutral";
      }

      return {
        ...row,
        Predicted_Sentiment: sentiment,
      };
    });
  };

  const getSentimentCounts = () => {
    if (!result) return { Positive: 0, Negative: 0, Neutral: 0 };

    const sentimentCounts = { Positive: 0, Negative: 0, Neutral: 0 };
    result.forEach((item) => sentimentCounts[item.Predicted_Sentiment]++);

    return sentimentCounts;
  };

  const sentimentCounts = getSentimentCounts();

  const getPieChartData = () => {
    return [
      { name: "Positive", value: sentimentCounts.Positive },
      { name: "Negative", value: sentimentCounts.Negative },
      { name: "Neutral", value: sentimentCounts.Neutral },
    ].filter((item) => item.value > 0);
  };

  const pieChartData = getPieChartData();

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <LineChart className="h-6 w-6" />
          Sentiment Distribution
        </h1>

        {loading && (
          <div className="text-blue-600 text-center">Loading data...</div>
        )}

        {error && (
          <div className="text-red-600 p-4 bg-red-50 rounded text-center">
            {error}
          </div>
        )}

        {result && (
          <>
            <table className="min-w-full mb-6">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Sentiment</th>
                  <th className="px-4 py-2 text-left">Count</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2">Positive</td>
                  <td className="border px-4 py-2">
                    {sentimentCounts.Positive}
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Negative</td>
                  <td className="border px-4 py-2">
                    {sentimentCounts.Negative}
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Neutral</td>
                  <td className="border px-4 py-2">
                    {sentimentCounts.Neutral}
                  </td>
                </tr>
              </tbody>
            </table>

            {pieChartData.length > 0 && (
              <div className="w-full">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={150}
                      fill="#8884d8"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={["#82ca9d", "#ff8042", "#ffc658"][index % 3]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SentimentAnalysis;
