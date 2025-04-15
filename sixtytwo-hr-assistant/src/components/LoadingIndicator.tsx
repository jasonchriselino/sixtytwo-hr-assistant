import React from 'react';
import { Bot } from 'lucide-react';

export default function LoadingIndicator() {
  return (
    <div className="flex items-start space-x-3 bg-green-50 p-4 rounded-lg">
      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
        <Bot className="w-5 h-5 text-green-600" />
      </div>
      <div className="flex-1">
        <div className="mb-1">
          <span className="text-sm font-medium text-gray-700">HR Assistant</span>
          <span className="text-xs text-gray-500 ml-2">Thinking...</span>
        </div>
        <div className="flex space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}