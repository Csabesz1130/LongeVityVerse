// File: pages/api/integrations/index.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { Integration } from '@/types';

const integrations: Integration[] = [
  {
    id: 'fitbit',
    name: 'Fitbit',
    description: 'Connect your Fitbit device to sync activity and sleep data.',
    icon: '/icons/fitbit.png',
    isConnected: false,
    lastSynced: null,
    authType: 'oauth',
    authUrl: 'https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=YOUR_FITBIT_CLIENT_ID&scope=activity%20nutrition%20heartrate%20sleep&redirect_uri=YOUR_REDIRECT_URI',
  },
  {
    id: 'myfitnesspal',
    name: 'MyFitnessPal',
    description: 'Sync your nutrition data from MyFitnessPal.',
    icon: '/icons/myfitnesspal.png',
    isConnected: false,
    lastSynced: null,
    authType: 'apiKey',
  },
  {
    id: 'googlefit',
    name: 'Google Fit',
    description: 'Connect to Google Fit to sync your activity data.',
    icon: '/icons/googlefit.png',
    isConnected: false,
    lastSynced: null,
    authType: 'oauth',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=YOUR_GOOGLE_CLIENT_ID&scope=https://www.googleapis.com/auth/fitness.activity.read&redirect_uri=YOUR_REDIRECT_URI',
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json(integrations);
  } else {
    res.status(405).end();
  }
}