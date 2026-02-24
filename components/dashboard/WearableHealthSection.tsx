'use client';

import React, { useState } from 'react';

interface WearableDevice {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'connected' | 'disconnected' | 'syncing';
  lastSync?: string;
  dataTypes: string[];
  color: string;
}

interface SyncedMetric {
  label: string;
  value: string;
  icon: string;
  color: string;
}

const initialDevices: WearableDevice[] = [
  {
    id: 'apple-health',
    name: 'Apple Health',
    icon: '🍎',
    description: 'iPhone & Apple Watch',
    status: 'disconnected',
    dataTypes: ['Steps', 'Heart Rate', 'Sleep', 'Blood Oxygen', 'ECG'],
    color: 'from-gray-800 to-gray-900',
  },
  {
    id: 'google-fit',
    name: 'Google Fit',
    icon: '💚',
    description: 'Android & Wear OS',
    status: 'disconnected',
    dataTypes: ['Steps', 'Heart Rate', 'Sleep', 'Weight', 'Calories'],
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    icon: '⌚',
    description: 'Fitbit Trackers & Watches',
    status: 'disconnected',
    dataTypes: ['Steps', 'Heart Rate', 'Sleep Stages', 'SpO2', 'Stress'],
    color: 'from-teal-500 to-cyan-600',
  },
  {
    id: 'garmin',
    name: 'Garmin',
    icon: '🏔️',
    description: 'Garmin Devices',
    status: 'disconnected',
    dataTypes: ['Steps', 'Heart Rate', 'Sleep', 'VO2 Max', 'Body Battery'],
    color: 'from-blue-600 to-blue-800',
  },
  {
    id: 'samsung-health',
    name: 'Samsung Health',
    icon: '📱',
    description: 'Galaxy Watch & Phones',
    status: 'disconnected',
    dataTypes: ['Steps', 'Heart Rate', 'Sleep', 'Blood Pressure', 'Body Composition'],
    color: 'from-indigo-500 to-blue-600',
  },
  {
    id: 'oura',
    name: 'Oura Ring',
    icon: '💍',
    description: 'Oura Smart Ring',
    status: 'disconnected',
    dataTypes: ['Sleep Stages', 'Readiness', 'Heart Rate', 'HRV', 'Temperature'],
    color: 'from-purple-600 to-violet-700',
  },
];

const demoMetrics: SyncedMetric[] = [
  { label: 'Steps Today', value: '8,432', icon: '👣', color: 'text-blue-600' },
  { label: 'Heart Rate', value: '72 bpm', icon: '❤️', color: 'text-red-500' },
  { label: 'Sleep Last Night', value: '7.5 hrs', icon: '😴', color: 'text-purple-600' },
  { label: 'Calories Burned', value: '2,180', icon: '🔥', color: 'text-orange-500' },
  { label: 'Active Minutes', value: '45 min', icon: '🏃', color: 'text-green-600' },
  { label: 'Blood Oxygen', value: '98%', icon: '🫁', color: 'text-cyan-600' },
];

export default function WearableHealthSection() {
  const [devices, setDevices] = useState<WearableDevice[]>(initialDevices);
  const [showAllDevices, setShowAllDevices] = useState(false);
  const [syncingDevice, setSyncingDevice] = useState<string | null>(null);

  const connectedCount = devices.filter(d => d.status === 'connected').length;
  const visibleDevices = showAllDevices ? devices : devices.slice(0, 3);

  const handleConnect = async (deviceId: string) => {
    setSyncingDevice(deviceId);
    setDevices(prev => prev.map(d =>
      d.id === deviceId ? { ...d, status: 'syncing' as const } : d
    ));

    await new Promise(resolve => setTimeout(resolve, 2000));

    setDevices(prev => prev.map(d =>
      d.id === deviceId ? { ...d, status: 'connected' as const, lastSync: new Date().toISOString() } : d
    ));
    setSyncingDevice(null);
  };

  const handleDisconnect = (deviceId: string) => {
    setDevices(prev => prev.map(d =>
      d.id === deviceId ? { ...d, status: 'disconnected' as const, lastSync: undefined } : d
    ));
  };

  const handleSync = async (deviceId: string) => {
    setSyncingDevice(deviceId);
    setDevices(prev => prev.map(d =>
      d.id === deviceId ? { ...d, status: 'syncing' as const } : d
    ));

    await new Promise(resolve => setTimeout(resolve, 1500));

    setDevices(prev => prev.map(d =>
      d.id === deviceId ? { ...d, status: 'connected' as const, lastSync: new Date().toISOString() } : d
    ));
    setSyncingDevice(null);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
              Wearable Health Data
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              Connect your smart devices to automatically sync health metrics
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{connectedCount}</p>
            <p className="text-xs text-slate-400">{connectedCount === 1 ? 'device' : 'devices'} connected</p>
          </div>
        </div>

        {/* Quick Stats from connected devices */}
        {connectedCount > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
            {demoMetrics.map((metric, i) => (
              <div key={i} className="bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm text-center">
                <span className="text-lg">{metric.icon}</span>
                <p className="text-sm font-bold mt-0.5">{metric.value}</p>
                <p className="text-[10px] text-slate-400">{metric.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Device Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Available Devices & Platforms</h3>
          {devices.length > 3 && (
            <button
              onClick={() => setShowAllDevices(!showAllDevices)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showAllDevices ? 'Show less' : `Show all (${devices.length})`}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleDevices.map((device) => (
            <div
              key={device.id}
              className={`rounded-xl border-2 transition-all ${
                device.status === 'connected'
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : device.status === 'syncing'
                  ? 'border-blue-200 bg-blue-50/30'
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
            >
              {/* Device Header */}
              <div className={`bg-gradient-to-r ${device.color} rounded-t-[10px] p-3 flex items-center gap-3`}>
                <span className="text-2xl">{device.icon}</span>
                <div className="text-white">
                  <p className="font-bold text-sm">{device.name}</p>
                  <p className="text-xs text-white/70">{device.description}</p>
                </div>
              </div>

              <div className="p-4">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    device.status === 'connected' ? 'bg-emerald-100 text-emerald-700' :
                    device.status === 'syncing' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {device.status === 'syncing' && (
                      <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    )}
                    {device.status === 'connected' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    {device.status === 'connected' ? 'Connected' : device.status === 'syncing' ? 'Syncing...' : 'Not connected'}
                  </span>
                  {device.lastSync && (
                    <span className="text-[10px] text-gray-400">
                      {new Date(device.lastSync).toLocaleTimeString()}
                    </span>
                  )}
                </div>

                {/* Data Types */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {device.dataTypes.map((type, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] rounded-full border border-gray-100">
                      {type}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                {device.status === 'disconnected' && (
                  <button
                    onClick={() => handleConnect(device.id)}
                    disabled={syncingDevice !== null}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Connect Device
                  </button>
                )}

                {device.status === 'connected' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSync(device.id)}
                      disabled={syncingDevice !== null}
                      className="flex-1 py-2 px-3 bg-white border border-gray-200 hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                    >
                      Sync Now
                    </button>
                    <button
                      onClick={() => handleDisconnect(device.id)}
                      className="py-2 px-3 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-400 text-sm rounded-lg transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {device.status === 'syncing' && (
                  <div className="w-full py-2 text-center text-sm text-blue-600 font-medium">
                    Fetching health data...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">📲</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">1. Connect</h4>
            <p className="text-sm text-gray-500">
              Link your wearable device or health app with one click via secure OAuth.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">🔄</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">2. Sync</h4>
            <p className="text-sm text-gray-500">
              Your health data is automatically synced and securely stored in your account.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">🧬</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">3. Analyze</h4>
            <p className="text-sm text-gray-500">
              Our AI analyzes your data to generate personalized longevity insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
