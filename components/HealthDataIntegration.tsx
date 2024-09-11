import React, { useState, useEffect } from 'react';
import { requestAuthorization as requestAppleHealthAuth, fetchHealthData as fetchAppleHealthData } from '@/libs/appleHealthKit';
// Import these once the files are created
// import { requestAuthorization as requestGoogleFitAuth, fetchHealthData as fetchGoogleFitData } from '@/libs/googleFit';
// import { requestAuthorization as requestFitbitAuth, fetchHealthData as fetchFitbitData } from '@/libs/fitbit';

import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface HealthData {
  steps: number;
  heartRate: number;
  sleepHours: number;
}

const HealthDataIntegration: React.FC = () => {
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [healthData, setHealthData] = useState<HealthData | null>(null);

  useEffect(() => {
    checkConnectedPlatforms();
  }, []);

  const checkConnectedPlatforms = async () => {
    // Implement logic to check which platforms are already connected
    // Update the connectedPlatforms state
  };

  const handleConnect = async (platform: string) => {
    let status = false;
    switch (platform) {
      case 'appleHealth':
        status = await requestAppleHealthAuth();
        break;
      case 'googleFit':
        // status = await requestGoogleFitAuth();
        console.log('Google Fit auth not implemented yet');
        break;
      case 'fitbit':
        // status = await requestFitbitAuth();
        console.log('Fitbit auth not implemented yet');
        break;
    }

    if (status) {
      setConnectedPlatforms(prev => [...prev, platform]);
      fetchHealthData(platform);
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
          // data = await fetchGoogleFitData();
          console.log('Google Fit data fetch not implemented yet');
          break;
        case 'fitbit':
          // data = await fetchFitbitData();
          console.log('Fitbit data fetch not implemented yet');
          break;
      }
      if (data) {
        setHealthData(prevData => ({ ...prevData, ...data }));
        // Send data to backend for storage and analysis
        await sendHealthDataToBackend(platform, data);
      }
    } catch (error) {
      console.error(`Error fetching health data from ${platform}:`, error);
    }
  };

  const sendHealthDataToBackend = async (platform: string, data: HealthData) => {
    // Implement API call to send data to backend
    console.log(`Sending ${platform} data to backend:`, data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Data Integration</CardTitle>
      </CardHeader>
      <CardContent>
        {['appleHealth', 'googleFit', 'fitbit'].map(platform => (
          <Button 
            key={platform}
            onClick={() => handleConnect(platform)}
            disabled={connectedPlatforms.includes(platform)}
          >
            Connect {platform}
          </Button>
        ))}
        {healthData && (
          <div>
            <h3>Aggregated Health Data</h3>
            <p>Steps: {healthData.steps}</p>
            <p>Heart Rate: {healthData.heartRate} bpm</p>
            <p>Sleep: {healthData.sleepHours} hours</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthDataIntegration;