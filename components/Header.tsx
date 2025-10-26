
import React from 'react';
import { BoltIcon } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-brand-surface/80 backdrop-blur-sm border-b border-gray-700 p-4 flex items-center shadow-lg h-16">
      <BoltIcon className="w-8 h-8 text-brand-blue" />
      <div className="ml-3">
        <h1 className="text-xl font-bold text-white tracking-wider">EV.AI</h1>
        <p className="text-xs text-brand-muted">Intelligent EV Conversion Copilot</p>
      </div>
    </header>
  );
};
