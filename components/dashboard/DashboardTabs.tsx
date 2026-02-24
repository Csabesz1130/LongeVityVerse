'use client';

import { useState } from 'react';
import DashboardContent from './DashboardContent';
import AILongevityAnalysis from './AILongevityAnalysis';
import WearableHealthSection from './WearableHealthSection';

const tabs = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'ai-analysis', label: 'AI Longevity Analysis', icon: '🧬' },
  { id: 'wearables', label: 'Wearable Health Data', icon: '⌚' },
];

export default function DashboardTabsClient() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex gap-1 -mb-px" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-all
                ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pb-12">
        {activeTab === 'overview' && <DashboardContent />}
        {activeTab === 'ai-analysis' && <AILongevityAnalysis />}
        {activeTab === 'wearables' && <WearableHealthSection />}
      </div>
    </>
  );
}
