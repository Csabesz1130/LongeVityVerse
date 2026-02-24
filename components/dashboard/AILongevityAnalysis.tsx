'use client';

import React, { useState, useEffect } from 'react';

interface AnalysisCategory {
  title: string;
  score: number;
  status: 'optimal' | 'good' | 'needs_attention' | 'critical';
  summary: string;
  recommendations: string[];
}

interface LongevityAnalysis {
  overallScore: number;
  categories: AnalysisCategory[];
  projectedLifespan: { years: number; comparison: string };
  biologicalAgeOffset: number;
  riskFactors: string[];
  longevityBoosters: string[];
  analysisDate: string;
  keyInsight: string;
}

const statusConfig = {
  optimal: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800', icon: '✓' },
  good: { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800', icon: '○' },
  needs_attention: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800', icon: '!' },
  critical: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-800', icon: '!!' },
};

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 80 ? '#059669' : score >= 60 ? '#2563eb' : score >= 40 ? '#d97706' : '#dc2626';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-gray-500">/ 100</span>
      </div>
    </div>
  );
}

function CategoryBar({ category }: { category: AnalysisCategory }) {
  const config = statusConfig[category.status];
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-lg border ${config.border} ${config.bg} p-4 transition-all`}>
      <button
        className="w-full text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${config.badge}`}>
              {config.icon}
            </span>
            <h4 className={`font-semibold ${config.color}`}>{category.title}</h4>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold ${config.color}`}>{category.score}/100</span>
            <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''} text-gray-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div className="w-full bg-white/60 rounded-full h-2 mb-2">
          <div
            className="h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${category.score}%`, backgroundColor: statusConfig[category.status].color.includes('emerald') ? '#059669' : statusConfig[category.status].color.includes('blue') ? '#2563eb' : statusConfig[category.status].color.includes('amber') ? '#d97706' : '#dc2626' }}
          />
        </div>
        <p className="text-sm text-gray-600">{category.summary}</p>
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-200/50">
          <p className="text-xs font-medium text-gray-500 mb-2">Recommendations:</p>
          <ul className="space-y-1.5">
            {category.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function AILongevityAnalysis() {
  const [analysis, setAnalysis] = useState<LongevityAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/dashboard/ai-analysis');
      if (!res.ok) {
        if (res.status === 401) {
          setError('Please sign in to view your longevity analysis.');
          return;
        }
        throw new Error('Failed to fetch analysis');
      }
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError('Unable to load analysis. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500">Analyzing your health data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <p className="text-gray-500">{error}</p>
        <button onClick={fetchAnalysis} className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium">
          Try Again
        </button>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <ScoreRing score={analysis.overallScore} />
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold mb-1">AI Longevity Analysis</h2>
            <p className="text-white/80 mb-3">{analysis.keyInsight}</p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="bg-white/15 rounded-lg px-4 py-2 backdrop-blur-sm">
                <p className="text-xs text-white/70">Projected Lifespan</p>
                <p className="text-lg font-bold">{analysis.projectedLifespan.years} years</p>
                <p className="text-xs text-white/60">{analysis.projectedLifespan.comparison}</p>
              </div>
              <div className="bg-white/15 rounded-lg px-4 py-2 backdrop-blur-sm">
                <p className="text-xs text-white/70">Bio Age Offset</p>
                <p className="text-lg font-bold">
                  {analysis.biologicalAgeOffset <= 0 ? '' : '+'}
                  {analysis.biologicalAgeOffset} years
                </p>
                <p className="text-xs text-white/60">
                  {analysis.biologicalAgeOffset <= 0 ? 'Younger than chronological age' : 'Older than chronological age'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Health Category Breakdown</h3>
        <div className="space-y-3">
          {analysis.categories
            .sort((a, b) => a.score - b.score)
            .map((category, i) => (
              <CategoryBar key={i} category={category} />
            ))}
        </div>
      </div>

      {/* Risk Factors & Boosters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-red-100 p-5">
          <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Risk Factors
          </h3>
          <ul className="space-y-2">
            {analysis.riskFactors.map((risk, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-red-700">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                {risk}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-5">
          <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Longevity Boosters
          </h3>
          <ul className="space-y-2">
            {analysis.longevityBoosters.map((booster, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                {booster}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Refresh */}
      <div className="text-center">
        <button
          onClick={fetchAnalysis}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Last analyzed: {new Date(analysis.analysisDate).toLocaleString()} — Click to refresh
        </button>
      </div>
    </div>
  );
}
