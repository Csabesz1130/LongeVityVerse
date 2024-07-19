// File: components/DataVisualization.tsx

import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';

interface HealthMetric {
  name: string;
  data: { date: string; value: number }[];
}

interface DataVisualizationProps {
  data: HealthMetric[];
}

const DataVisualization: React.FC<DataVisualizationProps> = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState(data[0]);

  const chartData = {
    labels: selectedMetric.data.map(d => d.date),
    datasets: [
      {
        label: selectedMetric.name,
        data: selectedMetric.data.map(d => d.value),
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Health Metrics Visualization</h2>
      <select
        className="mb-4 p-2 border rounded"
        onChange={(e) => setSelectedMetric(data.find(m => m.name === e.target.value) || data[0])}
      >
        {data.map(metric => (
          <option key={metric.name} value={metric.name}>{metric.name}</option>
        ))}
      </select>
      <Line data={chartData} />
    </div>
  );
};

export default DataVisualization;