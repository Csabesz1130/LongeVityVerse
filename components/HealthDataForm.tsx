'use client';

import React, { useState } from 'react';
import { updateHealthData, HealthDataUpdate } from '@/libs/api';
import { toast } from 'react-hot-toast';

interface HealthDataFormProps {
    onSuccess?: () => void;
    initialData?: Partial<HealthDataUpdate>;
}

const HealthDataForm: React.FC<HealthDataFormProps> = ({ onSuccess, initialData = {} }) => {
    const [formData, setFormData] = useState<HealthDataUpdate>({
        steps: initialData.steps || undefined,
        heartRate: initialData.heartRate || undefined,
        sleepHours: initialData.sleepHours || undefined,
        weight: initialData.weight || undefined,
        height: initialData.height || undefined,
        bloodPressure: initialData.bloodPressure || undefined,
        bloodGlucose: initialData.bloodGlucose || undefined,
        bodyFatPercentage: initialData.bodyFatPercentage || undefined,
        muscleMass: initialData.muscleMass || undefined,
        hydrationLevel: initialData.hydrationLevel || undefined,
        stressLevel: initialData.stressLevel || undefined,
        mood: initialData.mood || undefined,
        energyLevel: initialData.energyLevel || undefined,
        temperature: initialData.temperature || undefined,
        oxygenSaturation: initialData.oxygenSaturation || undefined,
        respiratoryRate: initialData.respiratoryRate || undefined,
        activityLevel: initialData.activityLevel || undefined,
        nutritionData: initialData.nutritionData || undefined,
        sleepQuality: initialData.sleepQuality || undefined,
        sleepData: initialData.sleepData || undefined,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleBloodPressureChange = (type: 'systolic' | 'diastolic', value: number) => {
        setFormData(prev => ({
            ...prev,
            bloodPressure: {
                ...prev.bloodPressure,
                [type]: value
            }
        }));
    };

    const handleNutritionChange = (field: string, value: number) => {
        setFormData(prev => ({
            ...prev,
            nutritionData: {
                ...prev.nutritionData,
                [field]: value
            }
        }));
    };

    const handleSleepDataChange = (field: string, value: number) => {
        setFormData(prev => ({
            ...prev,
            sleepData: {
                ...prev.sleepData,
                [field]: value
            }
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Basic validation for required fields
        if (formData.weight && formData.weight < 20) {
            newErrors.weight = 'Weight must be at least 20 kg';
        }
        if (formData.height && formData.height < 50) {
            newErrors.height = 'Height must be at least 50 cm';
        }
        if (formData.heartRate && (formData.heartRate < 30 || formData.heartRate > 220)) {
            newErrors.heartRate = 'Heart rate must be between 30 and 220 bpm';
        }
        if (formData.sleepHours && (formData.sleepHours < 0 || formData.sleepHours > 24)) {
            newErrors.sleepHours = 'Sleep hours must be between 0 and 24';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the validation errors');
            return;
        }

        setIsSubmitting(true);

        try {
            // Remove undefined values before sending
            const cleanData = Object.fromEntries(
                Object.entries(formData).filter(([_, value]) => value !== undefined)
            );

            await updateHealthData(cleanData);
            toast.success('Health data updated successfully!');
            onSuccess?.();
        } catch (error) {
            console.error('Error updating health data:', error);
            // Error handling is already done in the updateHealthData function
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Update Health Data</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Steps (today)
                        </label>
                        <input
                            type="number"
                            value={formData.steps || ''}
                            onChange={(e) => handleInputChange('steps', e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 8500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Heart Rate (bpm)
                        </label>
                        <input
                            type="number"
                            value={formData.heartRate || ''}
                            onChange={(e) => handleInputChange('heartRate', e.target.value ? Number(e.target.value) : undefined)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.heartRate ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="e.g., 72"
                        />
                        {errors.heartRate && <p className="text-red-500 text-xs mt-1">{errors.heartRate}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sleep Hours
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.sleepHours || ''}
                            onChange={(e) => handleInputChange('sleepHours', e.target.value ? Number(e.target.value) : undefined)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.sleepHours ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="e.g., 7.5"
                        />
                        {errors.sleepHours && <p className="text-red-500 text-xs mt-1">{errors.sleepHours}</p>}
                    </div>
                </div>

                {/* Body Composition */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Body Composition</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Weight (kg)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.weight || ''}
                                onChange={(e) => handleInputChange('weight', e.target.value ? Number(e.target.value) : undefined)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.weight ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="e.g., 70.5"
                            />
                            {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Height (cm)
                            </label>
                            <input
                                type="number"
                                value={formData.height || ''}
                                onChange={(e) => handleInputChange('height', e.target.value ? Number(e.target.value) : undefined)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.height ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="e.g., 175"
                            />
                            {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Body Fat Percentage
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.bodyFatPercentage || ''}
                                onChange={(e) => handleInputChange('bodyFatPercentage', e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 18.5"
                            />
                        </div>
                    </div>
                </div>

                {/* Blood Pressure */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Blood Pressure</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Systolic (mmHg)
                            </label>
                            <input
                                type="number"
                                value={formData.bloodPressure?.systolic || ''}
                                onChange={(e) => handleBloodPressureChange('systolic', Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 120"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Diastolic (mmHg)
                            </label>
                            <input
                                type="number"
                                value={formData.bloodPressure?.diastolic || ''}
                                onChange={(e) => handleBloodPressureChange('diastolic', Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 80"
                            />
                        </div>
                    </div>
                </div>

                {/* Wellness Metrics */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Wellness Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Stress Level (1-10)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={formData.stressLevel || ''}
                                onChange={(e) => handleInputChange('stressLevel', e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 5"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Energy Level (1-10)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={formData.energyLevel || ''}
                                onChange={(e) => handleInputChange('energyLevel', e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 7"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mood
                            </label>
                            <select
                                value={formData.mood || ''}
                                onChange={(e) => handleInputChange('mood', e.target.value || undefined)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select mood</option>
                                <option value="excellent">Excellent</option>
                                <option value="good">Good</option>
                                <option value="fair">Fair</option>
                                <option value="poor">Poor</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Activity Level */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Activity Level</h3>
                    <div>
                        <select
                            value={formData.activityLevel || ''}
                            onChange={(e) => handleInputChange('activityLevel', e.target.value || undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select activity level</option>
                            <option value="sedentary">Sedentary (little or no exercise)</option>
                            <option value="lightly_active">Lightly Active (light exercise 1-3 days/week)</option>
                            <option value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</option>
                            <option value="very_active">Very Active (hard exercise 6-7 days/week)</option>
                            <option value="extremely_active">Extremely Active (very hard exercise, physical job)</option>
                        </select>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="border-t pt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Updating...' : 'Update Health Data'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HealthDataForm; 