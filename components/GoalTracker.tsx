// File: components/GoalTracker.tsx

import React from 'react';

interface Goal {
  id: string;
  title: string;
  currentValue: number;
  targetValue: number;
  unit: string;
}

interface GoalTrackerProps {
  goals: Goal[];
}

const GoalTracker: React.FC<GoalTrackerProps> = ({ goals }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Goal Tracker</h2>
      {goals.map(goal => (
        <div key={goal.id} className="mb-4">
          <h3 className="text-lg font-semibold">{goal.title}</h3>
          <p>Current: {goal.currentValue} {goal.unit}</p>
          <p>Target: {goal.targetValue} {goal.unit}</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${(goal.currentValue / goal.targetValue) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GoalTracker;