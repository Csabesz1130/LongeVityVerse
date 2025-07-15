"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { DashboardApi } from "@/libs/dashboardApi";

interface HealthDataUpdateModalProps {
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onDataUpdated: () => void;
}

interface HealthData {
    weight: number | '';
    height: number | '';
    restingHeartRate: number | '';
    sleepHours: number | '';
}

const HealthDataUpdateModal = ({
    isModalOpen,
    setIsModalOpen,
    onDataUpdated
}: HealthDataUpdateModalProps) => {
    const [healthData, setHealthData] = useState<HealthData>({
        weight: '',
        height: '',
        restingHeartRate: '',
        sleepHours: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (field: keyof HealthData, value: string) => {
        const numericValue = value === '' ? '' : parseFloat(value);
        setHealthData(prev => ({
            ...prev,
            [field]: numericValue
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Csak a kitöltött mezőket küldjük el
            const dataToUpdate: any = {};
            if (healthData.weight !== '') dataToUpdate.weight = Number(healthData.weight);
            if (healthData.height !== '') dataToUpdate.height = Number(healthData.height);
            if (healthData.restingHeartRate !== '') dataToUpdate.restingHeartRate = Number(healthData.restingHeartRate);
            if (healthData.sleepHours !== '') dataToUpdate.sleepHours = Number(healthData.sleepHours);

            if (Object.keys(dataToUpdate).length === 0) {
                setError('Kérjük, töltse ki legalább egy mezőt!');
                return;
            }

            await DashboardApi.updateHealthMetrics(dataToUpdate);

            // Sikeres frissítés után
            setHealthData({
                weight: '',
                height: '',
                restingHeartRate: '',
                sleepHours: ''
            });
            setIsModalOpen(false);
            onDataUpdated();
        } catch (error) {
            console.error('Hiba az egészségügyi adatok frissítésekor:', error);
            setError('Hiba történt az adatok mentésekor. Kérjük, próbálja újra!');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setHealthData({
            weight: '',
            height: '',
            restingHeartRate: '',
            sleepHours: ''
        });
        setError(null);
    };

    return (
        <Transition appear show={isModalOpen} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-50"
                onClose={handleClose}
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full overflow-hidden items-start md:items-center justify-center p-2">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                        Egészségügyi Adatok Frissítése
                                    </Dialog.Title>
                                    <button
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                        onClick={handleClose}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            className="w-5 h-5"
                                        >
                                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                        </svg>
                                    </button>
                                </div>

                                {error && (
                                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                                            Testsúly (kg)
                                        </label>
                                        <input
                                            type="number"
                                            id="weight"
                                            step="0.1"
                                            min="0"
                                            max="300"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={healthData.weight}
                                            onChange={(e) => handleInputChange('weight', e.target.value)}
                                            placeholder="pl. 70.5"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                                            Magasság (cm)
                                        </label>
                                        <input
                                            type="number"
                                            id="height"
                                            step="0.1"
                                            min="0"
                                            max="250"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={healthData.height}
                                            onChange={(e) => handleInputChange('height', e.target.value)}
                                            placeholder="pl. 175"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="restingHeartRate" className="block text-sm font-medium text-gray-700 mb-1">
                                            Nyugalmi Pulzus (bpm)
                                        </label>
                                        <input
                                            type="number"
                                            id="restingHeartRate"
                                            step="1"
                                            min="30"
                                            max="120"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={healthData.restingHeartRate}
                                            onChange={(e) => handleInputChange('restingHeartRate', e.target.value)}
                                            placeholder="pl. 65"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="sleepHours" className="block text-sm font-medium text-gray-700 mb-1">
                                            Alvás (óra/nap)
                                        </label>
                                        <input
                                            type="number"
                                            id="sleepHours"
                                            step="0.5"
                                            min="0"
                                            max="24"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={healthData.sleepHours}
                                            onChange={(e) => handleInputChange('sleepHours', e.target.value)}
                                            placeholder="pl. 8"
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                            onClick={handleClose}
                                            disabled={isLoading}
                                        >
                                            Mégse
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className={`px-6 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                                                isLoading 
                                                    ? 'bg-gray-400 cursor-not-allowed' 
                                                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                                            }`}
                                        >
                                            {isLoading ? "Mentés..." : "Mentés"}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default HealthDataUpdateModal; 