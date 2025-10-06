"use client";
import React, { useEffect, useState } from "react";

type Props = { userId?: string };

export default function SleepAnalysis({ userId }: Props) {
  const [data, setData] = useState<{ date: string; hours: number }[]>([]);
  useEffect(() => {
    // Placeholder: random sleep data
    const days = Array.from({ length: 7 }).map((_, i) => ({
      date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
      hours: Math.round((6 + Math.random() * 2) * 10) / 10,
    }));
    setData(days.reverse());
  }, [userId]);

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-medium mb-2">Sleep Analysis (7 days)</h3>
      <div className="grid grid-cols-7 gap-2 text-center text-sm">
        {data.map((d) => (
          <div key={d.date} className="flex flex-col items-center">
            <span className="text-xs text-gray-500">{d.date.slice(5)}</span>
            <span className="font-semibold">{d.hours}h</span>
          </div>
        ))}
      </div>
    </div>
  );
}


