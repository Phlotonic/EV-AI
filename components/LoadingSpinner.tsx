
import React from 'react';
import { BoltIcon } from './Icons';

interface LoadingSpinnerProps {
  message: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-brand-muted animate-fade-in">
      <div className="relative">
        <BoltIcon className="w-16 h-16 text-brand-blue animate-pulse-fast" />
      </div>
      <p className="mt-4 text-lg font-semibold text-gray-300">{message}</p>
    </div>
  );
};
