// File: components/Integrations.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import HealthDataIntegration from './HealthDataIntegration';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastSync?: Date;
  dataTypes: string[];
}

const Integrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'apple-health',
      name: 'Apple Health',
      description: 'Connect your iPhone and Apple Watch to sync health data',
      icon: '🍎',
      status: 'disconnected',
      dataTypes: ['Steps', 'Heart Rate', 'Sleep', 'Weight', 'Blood Pressure']
    },
    {
      id: 'google-fit',
      name: 'Google Fit',
      description: 'Sync data from Android devices and Google Fit compatible apps',
      icon: '🤖',
      status: 'disconnected',
      dataTypes: ['Steps', 'Heart Rate', 'Sleep', 'Weight', 'Calories']
    },
    {
      id: 'fitbit',
      name: 'Fitbit',
      description: 'Connect your Fitbit device to track activity and health metrics',
      icon: '⌚',
      status: 'disconnected',
      dataTypes: ['Steps', 'Heart Rate', 'Sleep', 'Weight', 'Calories', 'Distance']
    },
    {
      id: 'garmin',
      name: 'Garmin Connect',
      description: 'Sync data from Garmin fitness devices and watches',
      icon: '🏃',
      status: 'disconnected',
      dataTypes: ['Steps', 'Heart Rate', 'Sleep', 'Weight', 'Calories', 'Distance', 'VO2 Max']
    },
    {
      id: 'strava',
      name: 'Strava',
      description: 'Import your workout and activity data from Strava',
      icon: '🏃‍♂️',
      status: 'disconnected',
      dataTypes: ['Workouts', 'Distance', 'Calories', 'Heart Rate', 'GPS Routes']
    },
    {
      id: 'myfitnesspal',
      name: 'MyFitnessPal',
      description: 'Sync nutrition and calorie data from MyFitnessPal',
      icon: '🍽️',
      status: 'disconnected',
      dataTypes: ['Calories', 'Macronutrients', 'Weight', 'Water Intake']
    }
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load saved integration status from localStorage or backend
    loadIntegrationStatus();
  }, []);

  const loadIntegrationStatus = async () => {
    try {
      // In a real app, this would fetch from your backend
      const savedStatus = localStorage.getItem('integrations-status');
      if (savedStatus) {
        const statusData = JSON.parse(savedStatus);
        setIntegrations(prev => prev.map(integration => ({
          ...integration,
          status: statusData[integration.id]?.status || 'disconnected',
          lastSync: statusData[integration.id]?.lastSync ? new Date(statusData[integration.id].lastSync) : undefined
        })));
      }
    } catch (error) {
      console.error('Error loading integration status:', error);
    }
  };

  const handleConnect = async (integrationId: string) => {
    setIsLoading(true);
    setSelectedIntegration(integrationId);

    try {
      // Update status to connecting
      setIntegrations(prev => prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, status: 'connecting' }
          : integration
      ));

      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update status to connected
      setIntegrations(prev => prev.map(integration =>
        integration.id === integrationId
          ? {
            ...integration,
            status: 'connected',
            lastSync: new Date()
          }
          : integration
      ));

      // Save status to localStorage (in real app, save to backend)
      saveIntegrationStatus(integrationId, 'connected');

      // Trigger data sync
      await syncIntegrationData(integrationId);

    } catch (error) {
      console.error(`Error connecting to ${integrationId}:`, error);
      setIntegrations(prev => prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, status: 'error' }
          : integration
      ));
    } finally {
      setIsLoading(false);
      setSelectedIntegration(null);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    try {
      setIntegrations(prev => prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, status: 'disconnected' }
          : integration
      ));

      saveIntegrationStatus(integrationId, 'disconnected');
    } catch (error) {
      console.error(`Error disconnecting from ${integrationId}:`, error);
    }
  };

  const handleSync = async (integrationId: string) => {
    try {
      await syncIntegrationData(integrationId);

      setIntegrations(prev => prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, lastSync: new Date() }
          : integration
      ));

      saveIntegrationStatus(integrationId, 'connected');
    } catch (error) {
      console.error(`Error syncing ${integrationId}:`, error);
    }
  };

  const syncIntegrationData = async (integrationId: string) => {
    // In a real app, this would call your backend API to sync data
    console.log(`Syncing data from ${integrationId}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const saveIntegrationStatus = (integrationId: string, status: string) => {
    try {
      const savedStatus = localStorage.getItem('integrations-status') || '{}';
      const statusData = JSON.parse(savedStatus);
      statusData[integrationId] = {
        status,
        lastSync: new Date().toISOString()
      };
      localStorage.setItem('integrations-status', JSON.stringify(statusData));
    } catch (error) {
      console.error('Error saving integration status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'connecting': return 'text-blue-600 bg-blue-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Error';
      default: return 'Disconnected';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Integrations</h1>
        <p className="text-gray-600">
          Connect your wearable devices and health apps to automatically sync your data and get personalized insights.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Integrations */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Integrations</h2>

          {integrations.map((integration) => (
            <Card key={integration.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{integration.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {integration.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {integration.description}
                      </p>

                      {/* Data Types */}
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 mb-1">Data Types:</p>
                        <div className="flex flex-wrap gap-1">
                          {integration.dataTypes.map((type, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Status and Last Sync */}
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                          {getStatusText(integration.status)}
                        </span>

                        {integration.lastSync && (
                          <span className="text-xs text-gray-500">
                            Last sync: {integration.lastSync.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex space-x-2">
                  {integration.status === 'disconnected' && (
                    <Button
                      onClick={() => handleConnect(integration.id)}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading && selectedIntegration === integration.id ? 'Connecting...' : 'Connect'}
                    </Button>
                  )}

                  {integration.status === 'connected' && (
                    <>
                      <Button
                        onClick={() => handleSync(integration.id)}
                        variant="outline"
                        className="flex-1"
                      >
                        Sync Now
                      </Button>
                      <Button
                        onClick={() => handleDisconnect(integration.id)}
                        variant="secondary"
                        size="sm"
                      >
                        Disconnect
                      </Button>
                    </>
                  )}

                  {integration.status === 'error' && (
                    <>
                      <Button
                        onClick={() => handleConnect(integration.id)}
                        variant="outline"
                        className="flex-1"
                      >
                        Retry
                      </Button>
                      <Button
                        onClick={() => handleDisconnect(integration.id)}
                        variant="secondary"
                        size="sm"
                      >
                        Disconnect
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Health Data Integration Component */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Health Data Overview</h2>
          <HealthDataIntegration />

          {/* Integration Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Integration Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {integrations.filter(i => i.status === 'connected').length}
                  </div>
                  <div className="text-sm text-gray-600">Connected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {integrations.filter(i => i.status === 'disconnected').length}
                  </div>
                  <div className="text-sm text-gray-600">Available</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>💡 Tips for Better Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Connect multiple devices for comprehensive health tracking</li>
                <li>• Sync your data regularly to get the most accurate insights</li>
                <li>• Ensure your devices are properly configured and updated</li>
                <li>• Check app permissions to allow data sharing</li>
                <li>• Contact support if you experience connection issues</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Integrations;

