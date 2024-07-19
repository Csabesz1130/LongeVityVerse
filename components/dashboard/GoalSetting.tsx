// File: components/dashboard/GoalSetting.tsx

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { setUserGoal } from '@/libs/api';
import ButtonGradient from "@/components/ButtonGradient";

interface GoalSettingProps {
  onGoalSet: () => void;
}

const GoalSetting: React.FC<GoalSettingProps> = ({ onGoalSet }) => {
  const [metric, setMetric] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setUserGoal({ metric, targetValue: parseFloat(targetValue), targetDate });
      toast.success('Goal set successfully!');
      onGoalSet();
    } catch (error) {
      toast.error('Failed to set goal. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="metric" className="block text-sm font-medium text-gray-700">Metric</label>
        <select
          id="metric"
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          required
        >
          <option value="">Select a metric</option>
          <option value="Weight">Weight</option>
          <option value="Sleep Hours">Sleep Hours</option>
          <option value="Resting Heart Rate">Resting Heart Rate</option>
        </select>
      </div>
      <div>
        <label htmlFor="targetValue" className="block text-sm font-medium text-gray-700">Target Value</label>
        <input
          type="number"
          id="targetValue"
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          required
        />
      </div>
      <div>
        <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700">Target Date</label>
        <input
          type="date"
          id="targetDate"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          required
        />
      </div>
      <ButtonGradient title="Set Goal" type="submit" />
    </form>
  );
};

export default GoalSetting;