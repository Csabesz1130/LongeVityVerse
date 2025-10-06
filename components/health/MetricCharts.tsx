"use client";
import React, { useEffect, useState } from "react";

type Props = { userId?: string };

export default function MetricCharts({ userId }: Props) {
  const [metrics, setMetrics] = useState<{ steps: number; heartRate: number; calories: number } | null>(null);
  useEffect(() => {
    // Placeholder: random metrics
    setMetrics({
      steps: Math.floor(5000 + Math.random() * 5000),
      heartRate: Math.floor(60 + Math.random() * 30),
      calories: Math.floor(1600 + Math.random() * 600),
    });
  }, [userId]);

  if (!metrics) return null;
  return (
    <div className="rounded-lg border p-4 grid grid-cols-3 gap-4">
      <Stat label="Steps" value={metrics.steps.toLocaleString()} />
      <Stat label="Heart Rate" value={`${metrics.heartRate} bpm`} />
      <Stat label="Calories" value={`${metrics.calories}`} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-xl font-semibold">{value}</span>
    </div>
  );
}


