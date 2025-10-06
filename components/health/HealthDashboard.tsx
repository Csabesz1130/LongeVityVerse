"use client";
import React from "react";
import MetricCharts from "./MetricCharts";
import SleepAnalysis from "./SleepAnalysis";

type Props = {
  userId?: string;
};

export default function HealthDashboard({ userId }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Health Dashboard</h2>
      <MetricCharts userId={userId} />
      <SleepAnalysis userId={userId} />
    </div>
  );
}


