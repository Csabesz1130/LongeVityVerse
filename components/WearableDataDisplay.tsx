// File: components/WearableDataDisplay.tsx
import React from 'react';
import { WearableData } from '@/types';

interface WearableDataDisplayProps {
  data: WearableData;
}

const WearableDataDisplay: React.FC<WearableDataDisplayProps> = ({ data }) => {
  return (
    <div>
      <h2>Wearable Data</h2>
      {/* Implement the component logic here */}
    </div>
  );
};

export default WearableDataDisplay;