import React from 'react';
import { Bot, User } from 'lucide-react';
import { Message } from '../types';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex items-start space-x-3 ${isAssistant ? 'bg-green-50' : 'bg-blue-50'} p-4 rounded-lg`}>
      <div className={`w-8 h-8 rounded-full ${isAssistant ? 'bg-green-100' : 'bg-blue-100'} flex items-center justify-center`}>
        {isAssistant ? (
          <Bot className="w-5 h-5 text-green-600" />
        ) : (
          <User className="w-5 h-5 text-blue-600" />
        )}
      </div>
      <div className="flex-1">
        <div className="mb-1">
          <span className="text-sm font-medium text-gray-700">
            {isAssistant ? 'HR Assistant' : 'You'}
          </span>
          {isAssistant && (
            <span className="text-xs text-gray-500 ml-2">Always here to help</span>
          )}
        </div>
        <div className="prose prose-sm max-w-none text-gray-800">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}