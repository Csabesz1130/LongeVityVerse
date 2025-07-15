"use client";

import React from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
    const getToastClasses = () => {
        const baseClasses = "fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm";
        switch (type) {
            case 'success':
                return `${baseClasses} bg-green-500 text-white`;
            case 'error':
                return `${baseClasses} bg-red-500 text-white`;
            case 'warning':
                return `${baseClasses} bg-yellow-500 text-black`;
            case 'info':
            default:
                return `${baseClasses} bg-blue-500 text-white`;
        }
    };

    return (
        <div className={getToastClasses()}>
            <div className="flex items-center justify-between">
                <span>{message}</span>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="ml-4 text-white hover:text-gray-200"
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    );
}; 