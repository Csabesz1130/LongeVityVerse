import React, { useState } from 'react';
import { Toast } from '@/components/ui/toast';

export const useErrorHandling = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const handleSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 5000);
  };

  return { error, success, handleError, handleSuccess };
};

export const ErrorFeedback: React.FC<{ error: string | null; success: string | null }> = ({ error, success }) => {
  if (error) {
    return <Toast message={error} type="error" />;
  }
  if (success) {
    return <Toast message={success} type="success" />;
  }
  return null;
};