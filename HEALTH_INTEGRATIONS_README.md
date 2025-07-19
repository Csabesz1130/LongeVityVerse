# Health Integrations System

This document provides comprehensive information about the health integrations system implemented in LongevityVerse, including Apple HealthKit, Google Fit, and Fitbit integrations.

## 🚀 Features Implemented

### Core Integrations
- ✅ **Apple HealthKit**: Native iOS health data integration
- ✅ **Google Fit**: Android and web-based fitness data
- ✅ **Fitbit**: Wearable device and app integration
- ✅ **Unified Dashboard**: Aggregated health data view
- ✅ **Real-time Sync**: Automatic data synchronization
- ✅ **Sleep Analysis**: Advanced sleep stage tracking and insights
- ✅ **OAuth2 Authentication**: Secure platform connections

### Advanced Features
- ✅ **Data Aggregation**: Combine data from multiple sources
- ✅ **Sleep Quality Scoring**: AI-powered sleep analysis
- ✅ **Health Insights**: Personalized recommendations
- ✅ **Token Management**: Automatic token refresh and storage
- ✅ **Error Handling**: Comprehensive error recovery
- ✅ **Responsive UI**: Mobile-friendly interface

## 📁 File Structure

```
components/
├── Integrations.tsx                    # Main integrations dashboard
├── HealthDataIntegration.tsx           # Health data display component
└── ui/
    ├── Button.tsx                      # Reusable button component
    └── Card.tsx                        # Card layout component

libs/
├── appleHealthKit.ts                   # Apple HealthKit integration
├── googleFit.ts                        # Google Fit integration
└── fitbit.ts                           # Fitbit integration

app/
├── auth/
│   ├── google-fit/
│   │   └── callback/
│   │       └── page.tsx                # Google Fit OAuth callback
│   └── fitbit/
│       └── callback/
│           └── page.tsx                # Fitbit OAuth callback
└── integrations/
    └── page.tsx                        # Integrations page (if needed)
```

## 🔧 Setup Instructions

### 1. Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Google Fit Configuration
GOOGLE_FIT_CLIENT_ID=your-google-fit-client-id
GOOGLE_FIT_CLIENT_SECRET=your-google-fit-client-secret
GOOGLE_FIT_REDIRECT_URI=http://localhost:3000/auth/google-fit/callback

# Fitbit Configuration
FITBIT_CLIENT_ID=your-fitbit-client-id
FITBIT_CLIENT_SECRET=your-fitbit-client-secret
FITBIT_REDIRECT_URI=http://localhost:3000/auth/fitbit/callback

# MongoDB Configuration
MONGODB_URI=your-mongodb-connection-string
```

### 2. Google Fit Setup

1. **Create Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the Fitness API

2. **Configure OAuth2**:
   - Go to "APIs & Services" > "Credentials"
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URIs
   - Download client configuration

3. **Set Scopes**:
   - `https://www.googleapis.com/auth/fitness.activity.read`
   - `https://www.googleapis.com/auth/fitness.body.read`
   - `https://www.googleapis.com/auth/fitness.heart_rate.read`
   - `https://www.googleapis.com/auth/fitness.sleep.read`

### 3. Fitbit Setup

1. **Create Fitbit App**:
   - Go to [Fitbit Developer Portal](https://dev.fitbit.com/)
   - Create a new app
   - Set OAuth 2.0 settings

2. **Configure Scopes**:
   - `activity`
   - `heartrate`
   - `sleep`
   - `weight`
   - `nutrition`
   - `profile`

### 4. Apple HealthKit Setup

For iOS development, you'll need:
- Xcode with HealthKit capability
- React Native Health library
- Proper entitlements configuration

## 🔌 API Reference

### Apple HealthKit

#### `requestAuthorization()`
Requests permission to access HealthKit data.

```typescript
const success = await requestAuthorization();
```

#### `fetchHealthData()`
Fetches comprehensive health data from HealthKit.

```typescript
const healthData = await fetchHealthData();
// Returns: { steps, heartRate, sleepHours, weight, bloodPressure, sleepStages }
```

#### `calculateSleepQuality(sleepStages)`
Calculates sleep quality score based on sleep stages.

```typescript
const quality = calculateSleepQuality({
  deep: 2.5,
  light: 4.0,
  rem: 1.5,
  awake: 0.5
});
```

#### `getSleepInsights(sleepHours, sleepStages)`
Provides personalized sleep insights.

```typescript
const insights = getSleepInsights(7.5, sleepStages);
```

### Google Fit

#### `requestGoogleFitAuth()`
Initiates Google Fit OAuth flow.

```typescript
const success = await requestGoogleFitAuth();
```

#### `handleGoogleFitCallback(code)`
Handles OAuth callback from Google.

```typescript
const success = await handleGoogleFitCallback(authCode);
```

#### `fetchGoogleFitData(dateRange?)`
Fetches health data from Google Fit.

```typescript
const data = await fetchGoogleFitData({
  start: new Date('2024-01-01'),
  end: new Date('2024-01-02')
});
```

#### `isGoogleFitConnected()`
Checks if Google Fit is connected.

```typescript
const connected = isGoogleFitConnected();
```

#### `disconnectGoogleFit()`
Disconnects Google Fit integration.

```typescript
const success = await disconnectGoogleFit();
```

### Fitbit

#### `requestFitbitAuth()`
Initiates Fitbit OAuth flow.

```typescript
const success = await requestFitbitAuth();
```

#### `handleFitbitCallback(code)`
Handles OAuth callback from Fitbit.

```typescript
const success = await handleFitbitCallback(authCode);
```

#### `fetchFitbitData(dateRange?)`
Fetches health data from Fitbit.

```typescript
const data = await fetchFitbitData({
  start: new Date('2024-01-01'),
  end: new Date('2024-01-02')
});
```

#### `isFitbitConnected()`
Checks if Fitbit is connected.

```typescript
const connected = isFitbitConnected();
```

#### `disconnectFitbit()`
Disconnects Fitbit integration.

```typescript
const success = await disconnectFitbit();
```

## 📊 Data Models

### HealthData Interface

```typescript
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
```

### PlatformStatus Interface

```typescript
interface PlatformStatus {
  platform: string;
  connected: boolean;
  lastSync?: Date;
  data?: HealthData;
}
```

## 🎨 UI Components

### Integrations Component

The main integrations dashboard that allows users to:
- Connect/disconnect health platforms
- View connection status
- Sync data manually
- See integration statistics

### HealthDataIntegration Component

Displays health data with:
- Aggregated metrics from all platforms
- Individual platform data
- Sleep stage analysis
- Health insights and recommendations

## 🔄 Data Flow

1. **User initiates connection** → OAuth flow starts
2. **Platform authorization** → User grants permissions
3. **Callback handling** → Tokens stored securely
4. **Data fetching** → Health data retrieved from platform
5. **Data processing** → Raw data converted to standardized format
6. **Data aggregation** → Multiple sources combined
7. **Insights generation** → AI-powered analysis
8. **UI update** → Dashboard reflects new data

## 🛡️ Security Considerations

### Token Storage
- Access tokens stored in localStorage (for demo)
- In production, store in secure backend
- Implement token refresh mechanisms
- Handle token expiration gracefully

### Data Privacy
- Only request necessary permissions
- Implement data retention policies
- Provide user control over data sharing
- Comply with GDPR/CCPA regulations

### OAuth Security
- Use state parameter to prevent CSRF
- Validate redirect URIs
- Implement PKCE for mobile apps
- Secure client secrets

## 🚀 Usage Examples

### Basic Integration Setup

```typescript
import { Integrations } from '@/components/Integrations';

function App() {
  return (
    <div>
      <Integrations />
    </div>
  );
}
```

### Custom Health Data Component

```typescript
import { HealthDataIntegration } from '@/components/HealthDataIntegration';

function Dashboard() {
  return (
    <div>
      <h1>Health Dashboard</h1>
      <HealthDataIntegration />
    </div>
  );
}
```

### Programmatic Data Access

```typescript
import { fetchGoogleFitData } from '@/libs/googleFit';

async function getHealthData() {
  try {
    const data = await fetchGoogleFitData();
    console.log('Health data:', data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **OAuth Callback Errors**
   - Check redirect URI configuration
   - Verify client ID and secret
   - Ensure proper scopes are requested

2. **Data Not Syncing**
   - Check platform connection status
   - Verify API permissions
   - Review error logs

3. **Token Expiration**
   - Implement automatic token refresh
   - Handle refresh token rotation
   - Provide re-authentication flow

### Debug Mode

Enable debug logging:

```typescript
// Add to your environment
DEBUG=true

// Or enable in code
localStorage.setItem('debug', 'health-integrations:*');
```

## 🔮 Future Enhancements

### Planned Features
- [ ] **Garmin Connect Integration**
- [ ] **Strava Integration**
- [ ] **MyFitnessPal Integration**
- [ ] **Real-time Notifications**
- [ ] **Data Export/Import**
- [ ] **Advanced Analytics**
- [ ] **Machine Learning Insights**

### Technical Improvements
- [ ] **WebSocket Real-time Updates**
- [ ] **Offline Data Caching**
- [ ] **Background Sync**
- [ ] **Data Compression**
- [ ] **Advanced Error Recovery**

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests for new functionality
5. Update documentation
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

For more information or support, please refer to the main project documentation or contact the development team. 