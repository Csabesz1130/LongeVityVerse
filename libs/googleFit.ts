// Mock React Native dependencies for web environment
const GoogleSignin = {
  configure: () => Promise.resolve(),
  signIn: () => Promise.resolve({ accessToken: 'mock-token' }),
  signOut: () => Promise.resolve(),
  isSignedIn: () => Promise.resolve(false),
};

const GoogleFit = {
  authorize: () => Promise.resolve(),
  disconnect: () => Promise.resolve(),
  getSteps: () => Promise.resolve([]),
  getHeartRate: () => Promise.resolve([]),
  getSleepData: () => Promise.resolve([]),
};

const Scopes = {
  FITNESS_ACTIVITY_READ: 'https://www.googleapis.com/auth/fitness.activity.read',
  FITNESS_BODY_READ: 'https://www.googleapis.com/auth/fitness.body.read',
  FITNESS_HEART_RATE_READ: 'https://www.googleapis.com/auth/fitness.heart_rate.read',
  FITNESS_SLEEP_READ: 'https://www.googleapis.com/auth/fitness.sleep.read',
};

export { GoogleSignin, GoogleFit, Scopes };

// Mock health data functions
export const fetchGoogleFitData = async () => {
  try {
    // Mock data for web environment
    const mockSteps = [
      { steps: 5000, date: new Date().toISOString() },
      { steps: 6000, date: new Date().toISOString() },
    ];

    const mockHeartRate = [
      { value: 65, date: new Date().toISOString() },
      { value: 70, date: new Date().toISOString() },
    ];

    const mockSleep = [
      { duration: 7.5, date: new Date().toISOString() },
    ];

    return {
      steps: mockSteps.reduce((sum: number, dataset: any) => sum + dataset.steps, 0),
      heartRate: mockHeartRate.reduce((sum: number, dataset: any) => sum + dataset.value, 0) / mockHeartRate.length,
      sleepHours: mockSleep[0]?.duration || 0,
    };
  } catch (error) {
    console.error('Error fetching Google Fit data:', error);
    throw error;
  }
};