import React, { useState, useEffect } from 'react';
import { requestAuthorization, fetchHealthData } from '@/libs/appleHealthKit';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface HealthData {
  steps: number;
  heartRate: number;
  sleepHours: number;
}

const AppleHealthKitIntegration: React.FC = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [healthData, setHealthData] = useState<HealthData | null>(null);

  useEffect(() => {
    checkAuthorizationStatus();
  }, []);

  const checkAuthorizationStatus = async () => {
    const status = await requestAuthorization();
    setIsAuthorized(status);
  };

  const handleConnect = async () => {
    const status = await requestAuthorization();
    setIsAuthorized(status);
    if (status) {
      fetchHealthKitData();
    }
  };

  const fetchHealthKitData = async () => {
    try {
      const data = await fetchHealthData();
      setHealthData(data);
    } catch (error) {
      console.error('Error fetching health data:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apple Health Integration</CardTitle>
      </CardHeader>
      <CardContent>
        {!isAuthorized ? (
          <Button onClick={handleConnect}>Connect Apple Health</Button>
        ) : (
          <div>
            <p>Connected to Apple Health</p>
            {healthData ? (
              <div>
                <p>Steps: {healthData.steps}</p>
                <p>Heart Rate: {healthData.heartRate} bpm</p>
                <p>Sleep: {healthData.sleepHours} hours</p>
              </div>
            ) : (
              <Button onClick={fetchHealthKitData}>Fetch Health Data</Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppleHealthKitIntegration;