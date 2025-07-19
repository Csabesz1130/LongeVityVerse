'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { handleGoogleFitCallback } from '@/libs/googleFit';

const GoogleFitCallback = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Processing Google Fit authorization...');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const code = searchParams.get('code');
                const error = searchParams.get('error');

                if (error) {
                    setStatus('error');
                    setMessage(`Authorization failed: ${error}`);
                    setTimeout(() => {
                        router.push('/integrations');
                    }, 3000);
                    return;
                }

                if (!code) {
                    setStatus('error');
                    setMessage('No authorization code received');
                    setTimeout(() => {
                        router.push('/integrations');
                    }, 3000);
                    return;
                }

                const success = await handleGoogleFitCallback(code);

                if (success) {
                    setStatus('success');
                    setMessage('Google Fit connected successfully! Redirecting...');
                    setTimeout(() => {
                        router.push('/integrations');
                    }, 2000);
                } else {
                    setStatus('error');
                    setMessage('Failed to connect Google Fit. Please try again.');
                    setTimeout(() => {
                        router.push('/integrations');
                    }, 3000);
                }
            } catch (error) {
                console.error('Google Fit callback error:', error);
                setStatus('error');
                setMessage('An error occurred while connecting Google Fit.');
                setTimeout(() => {
                    router.push('/integrations');
                }, 3000);
            }
        };

        handleCallback();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                <div className="text-center">
                    <div className="text-4xl mb-4">🤖</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Google Fit Authorization
                    </h1>

                    <div className="mb-6">
                        {status === 'loading' && (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                <span className="text-gray-600">Processing...</span>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="flex items-center justify-center space-x-2 text-green-600">
                                <span className="text-2xl">✅</span>
                                <span>Success!</span>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="flex items-center justify-center space-x-2 text-red-600">
                                <span className="text-2xl">❌</span>
                                <span>Error</span>
                            </div>
                        )}
                    </div>

                    <p className="text-gray-600 mb-6">{message}</p>

                    <button
                        onClick={() => router.push('/integrations')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Back to Integrations
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GoogleFitCallback; 