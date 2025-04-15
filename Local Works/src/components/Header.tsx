import React from 'react';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-900">Sixty Two HR Assistant</h1>
          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
            AI Powered
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </header>
  );
}