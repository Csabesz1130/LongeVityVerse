import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HealthDataIntegration from '../HealthDataIntegration';
import * as appleHealthKit from '@/libs/appleHealthKit';

// Mock the external libraries
jest.mock('@/libs/appleHealthKit');

describe('HealthDataIntegration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { getByText } = render(<HealthDataIntegration />);
    expect(getByText('Health Data Integration')).toBeInTheDocument();
  });

  it('displays connect buttons for each platform', () => {
    const { getByText } = render(<HealthDataIntegration />);
    expect(getByText('Connect appleHealth')).toBeInTheDocument();
    expect(getByText('Connect googleFit')).toBeInTheDocument();
    expect(getByText('Connect fitbit')).toBeInTheDocument();
  });

  it('calls the correct authorization function when connecting a platform', async () => {
    const { getByText } = render(<HealthDataIntegration />);
    
    fireEvent.click(getByText('Connect appleHealth'));
    await waitFor(() => {
      expect(appleHealthKit.requestAuthorization).toHaveBeenCalled();
    });
  });

  it('fetches and displays health data after successful connection', async () => {
    const mockHealthData = {
      steps: 10000,
      heartRate: 70,
      sleepHours: 8,
    };

    (appleHealthKit.requestAuthorization as jest.Mock).mockResolvedValue(true);
    (appleHealthKit.fetchHealthData as jest.Mock).mockResolvedValue(mockHealthData);

    const { getByText } = render(<HealthDataIntegration />);
    
    fireEvent.click(getByText('Connect appleHealth'));

    await waitFor(() => {
      expect(getByText('Steps: 10000')).toBeInTheDocument();
      expect(getByText('Heart Rate: 70 bpm')).toBeInTheDocument();
      expect(getByText('Sleep: 8 hours')).toBeInTheDocument();
    });
  });
});