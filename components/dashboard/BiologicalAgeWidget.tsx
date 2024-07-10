// File: components/dashboard/BiologicalAgeWidget.tsx

import React from 'react';

interface BiologicalAgeWidgetProps {
  biologicalAge: number;
  chronologicalAge: number;
}

const BiologicalAgeWidget: React.FC<BiologicalAgeWidgetProps> = ({ biologicalAge, chronologicalAge }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Biological Age</h2>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-3xl font-bold text-primary">{biologicalAge} years</p>
          <p className="text-sm text-gray-500">Biological Age</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-gray-700">{chronologicalAge} years</p>
          <p className="text-sm text-gray-500">Chronological Age</p>
        </div>
      </div>
    </div>
  );
};

export default BiologicalAgeWidget;