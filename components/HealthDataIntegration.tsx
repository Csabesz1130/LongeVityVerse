import React, { useState, useEffect } from 'react';
import { requestAuthorization as requestAppleHealthAuth, fetchHealthData as fetchAppleHealthData, calculateSleepQuality, getSleepInsights } from '@/libs/appleHealthKit';
import { requestGoogleFitAuth, fetchGoogleFitData, handleGoogleFitCallback, isGoogleFitConnected, disconnectGoogleFit } from '@/libs/googleFit';
import { requestFitbitAuth, fetchFitbitData, handleFitbitCallback, isFitbitConnected, disconnectFitbit } from '@/libs/fitbit';

import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface HealthData {
  steps: number;
  heartRate: number;
  sleepHours: number;
  weight?: number;
  calories?: number;
  distance?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  sleepStages?: {
    deep: number;
    light: number;
    rem: number;
    awake: number;
  };
  sleepQuality?: number;
}

interface PlatformStatus {
  platform: string;
  connected: boolean;
  lastSync?: Date;
  data?: HealthData;
}

const HealthDataIntegration: React.FC = () => {
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([
    { platform: 'appleHealth', connected: false },
    { platform: 'googleFit', connected: false },
    { platform: 'fitbit', connected: false }
  ]);
  const [aggregatedData, setAggregatedData] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [sleepInsights, setSleepInsights] = useState<string[]>([]);

  useEffect(() => {
    checkConnectedPlatforms();
  }, []);

  useEffect(() => {
    // Check for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      handleOAuthCallback(state, code);
    }
  }, []);

  const checkConnectedPlatforms = async () => {
    const updatedPlatforms = platforms.map(platform => ({
      ...platform,
      connected: platform.platform === 'googleFit' ? isGoogleFitConnected() :
        platform.platform === 'fitbit' ? isFitbitConnected() :
          platform.connected // Apple Health status would be checked differently
    }));

    setPlatforms(updatedPlatforms);
  };

  const handleOAuthCallback = async (platform: string, code: string) => {
    setIsLoading(true);
    try {
      let success = false;

      if (platform === 'googleFit') {
        success = await handleGoogleFitCallback(code);
      } else if (platform === 'fitbit') {
        success = await handleFitbitCallback(code);
      }

      if (success) {
        await checkConnectedPlatforms();
        await fetchHealthData(platform);
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (platform: string) => {
    setIsLoading(true);
    setSelectedPlatform(platform);

    try {
      let success = false;

      switch (platform) {
        case 'appleHealth':
          success = await requestAppleHealthAuth();
          break;
        case 'googleFit':
          success = await requestGoogleFitAuth();
          break;
        case 'fitbit':
          success = await requestFitbitAuth();
          break;
      }

      if (success) {
        // For Apple Health, fetch data immediately
        // For OAuth platforms, data will be fetched after callback
        if (platform === 'appleHealth') {
          await fetchHealthData(platform);
        }
      }
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
    } finally {
      setIsLoading(false);
      setSelectedPlatform(null);
    }
  };

  const handleDisconnect = async (platform: string) => {
    try {
      let success = false;

      switch (platform) {
        case 'googleFit':
          success = await disconnectGoogleFit();
          break;
        case 'fitbit':
          success = await disconnectFitbit();
          break;
        case 'appleHealth':
          // Apple Health doesn't have a disconnect method in this implementation
          success = true;
          break;
      }

      if (success) {
        setPlatforms(prev => prev.map(p =>
          p.platform === platform
            ? { ...p, connected: false, data: undefined }
            : p
        ));
        updateAggregatedData();
      }
    } catch (error) {
      console.error(`Error disconnecting from ${platform}:`, error);
    }
  };

  const fetchHealthData = async (platform: string) => {
    try {
      let data: HealthData | null = null;

      switch (platform) {
        case 'appleHealth':
          data = await fetchAppleHealthData();
          break;
        case 'googleFit':
          data = await fetchGoogleFitData();
          break;
        case 'fitbit':
          data = await fetchFitbitData();
          break;
      }

      if (data) {
        // Calculate sleep quality if sleep stages are available
        if (data.sleepStages) {
          data.sleepQuality = calculateSleepQuality(data.sleepStages);
          setSleepInsights(getSleepInsights(data.sleepHours, data.sleepStages));
        }

        // Update platform data
        setPlatforms(prev => prev.map(p =>
          p.platform === platform
            ? { ...p, data, lastSync: new Date() }
            : p
        ));

        // Send data to backend for storage and analysis
        await sendHealthDataToBackend(platform, data);

        // Update aggregated data
        updateAggregatedData();
      }
    } catch (error) {
      console.error(`Error fetching health data from ${platform}:`, error);
    }
  };

  const updateAggregatedData = () => {
    const connectedPlatforms = platforms.filter(p => p.connected && p.data);

    if (connectedPlatforms.length === 0) {
      setAggregatedData(null);
      return;
    }

    // Aggregate data from all connected platforms
    const aggregated: HealthData = {
      steps: 0,
      heartRate: 0,
      sleepHours: 0,
      calories: 0,
      distance: 0
    };

    let heartRateCount = 0;
    let sleepCount = 0;
    let caloriesCount = 0;
    let distanceCount = 0;

    connectedPlatforms.forEach(({ data }) => {
      if (data) {
        aggregated.steps += data.steps || 0;
        if (data.heartRate) {
          aggregated.heartRate += data.heartRate;
          heartRateCount++;
        }
        if (data.sleepHours) {
          aggregated.sleepHours += data.sleepHours;
          sleepCount++;
        }
        if (data.calories) {
          aggregated.calories += data.calories;
          caloriesCount++;
        }
        if (data.distance) {
          aggregated.distance += data.distance;
          distanceCount++;
        }

        // Use the most recent weight and blood pressure data
        if (data.weight && !aggregated.weight) {
          aggregated.weight = data.weight;
        }
        if (data.bloodPressure && !aggregated.bloodPressure) {
          aggregated.bloodPressure = data.bloodPressure;
        }
        if (data.sleepStages && !aggregated.sleepStages) {
          aggregated.sleepStages = data.sleepStages;
        }
        if (data.sleepQuality && !aggregated.sleepQuality) {
          aggregated.sleepQuality = data.sleepQuality;
        }
      }
    });

    // Calculate averages
    if (heartRateCount > 0) {
      aggregated.heartRate = Math.round(aggregated.heartRate / heartRateCount);
    }
    if (sleepCount > 0) {
      aggregated.sleepHours = Math.round((aggregated.sleepHours / sleepCount) * 10) / 10;
    }
    if (caloriesCount > 0) {
      aggregated.calories = Math.round(aggregated.calories / caloriesCount);
    }
    if (distanceCount > 0) {
      aggregated.distance = Math.round((aggregated.distance / distanceCount) * 10) / 10;
    }

    setAggregatedData(aggregated);
  };

  const sendHealthDataToBackend = async (platform: string, data: HealthData) => {
    try {
      // In a real app, this would send data to your backend API
      console.log(`Sending ${platform} data to backend:`, data);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error sending data to backend:', error);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'appleHealth': return '🍎';
      case 'googleFit': return '🤖';
      case 'fitbit': return '⌚';
      default: return '📱';
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'appleHealth': return 'Apple Health';
      case 'googleFit': return 'Google Fit';
      case 'fitbit': return 'Fitbit';
      default: return platform;
    }
  };

  return (
    <div className="space-y-6">
      {/* Platform Connections */}
      <Card>
        <CardHeader>
          <CardTitle>Health Platform Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {platforms.map((platform) => (
              <div key={platform.platform} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getPlatformIcon(platform.platform)}</span>
                    <span className="font-medium">{getPlatformName(platform.platform)}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${platform.connected
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                    }`}>
                    {platform.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                {platform.lastSync && (
                  <p className="text-xs text-gray-500 mb-3">
                    Last sync: {platform.lastSync.toLocaleDateString()}
                  </p>
                )}

                <div className="space-y-2">
                  {platform.connected ? (
                    <>
                      <Button
                        onClick={() => fetchHealthData(platform.platform)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={isLoading}
                      >
                        Sync Now
                      </Button>
                      <Button
                        onClick={() => handleDisconnect(platform.platform)}
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        disabled={isLoading}
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleConnect(platform.platform)}
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading && selectedPlatform === platform.platform ? 'Connecting...' : 'Connect'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Aggregated Health Data */}
      {aggregatedData && (
        <Card>
          <CardHeader>
            <CardTitle>Aggregated Health Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{aggregatedData.steps.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Steps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{aggregatedData.heartRate}</div>
                <div className="text-sm text-gray-600">Heart Rate (bpm)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{aggregatedData.sleepHours}</div>
                <div className="text-sm text-gray-600">Sleep (hours)</div>
              </div>
              {aggregatedData.calories && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{aggregatedData.calories}</div>
                  <div className="text-sm text-gray-600">Calories</div>
                </div>
              )}
            </div>

            {/* Additional Metrics */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {aggregatedData.weight && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Weight</h4>
                  <div className="text-xl font-bold text-gray-800">{aggregatedData.weight} kg</div>
                </div>
              )}

              {aggregatedData.bloodPressure && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Blood Pressure</h4>
                  <div className="text-xl font-bold text-gray-800">
                    {aggregatedData.bloodPressure.systolic}/{aggregatedData.bloodPressure.diastolic} mmHg
                  </div>
                </div>
              )}

              {aggregatedData.distance && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Distance</h4>
                  <div className="text-xl font-bold text-gray-800">{aggregatedData.distance} km</div>
                </div>
              )}

              {aggregatedData.sleepQuality && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Sleep Quality</h4>
                  <div className="text-xl font-bold text-gray-800">{aggregatedData.sleepQuality}/100</div>
                </div>
              )}
            </div>

            {/* Sleep Stages */}
            {aggregatedData.sleepStages && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Sleep Stages</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{aggregatedData.sleepStages.deep}h</div>
                    <div className="text-xs text-gray-600">Deep</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{aggregatedData.sleepStages.light}h</div>
                    <div className="text-xs text-gray-600">Light</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{aggregatedData.sleepStages.rem}h</div>
                    <div className="text-xs text-gray-600">REM</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-600">{aggregatedData.sleepStages.awake}h</div>
                    <div className="text-xs text-gray-600">Awake</div>
                  </div>
                </div>
              </div>
            )}

            {/* Sleep Insights */}
            {sleepInsights.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Sleep Insights</h4>
                <div className="space-y-2">
                  {sleepInsights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">💡</span>
                      <p className="text-sm text-gray-700">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Individual Platform Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {platforms.filter(p => p.connected && p.data).map((platform) => (
          <Card key={platform.platform}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>{getPlatformIcon(platform.platform)}</span>
                <span>{getPlatformName(platform.platform)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {platform.data && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Steps:</span>
                    <span className="font-medium">{platform.data.steps.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Heart Rate:</span>
                    <span className="font-medium">{platform.data.heartRate} bpm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sleep:</span>
                    <span className="font-medium">{platform.data.sleepHours}h</span>
                  </div>
                  {platform.data.calories && (
                    <div className="flex justify-between">
                      <span>Calories:</span>
                      <span className="font-medium">{platform.data.calories}</span>
                    </div>
                  )}
                  {platform.data.weight && (
                    <div className="flex justify-between">
                      <span>Weight:</span>
                      <span className="font-medium">{platform.data.weight} kg</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HealthDataIntegration;