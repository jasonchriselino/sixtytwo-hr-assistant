import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export default function ChatInput({ onSendMessage, isLoading = false }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [cooldown, setCooldown] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && !cooldown) {
      onSendMessage(input);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      // Enable cooldown
      setCooldown(true);
      setTimeout(() => setCooldown(false), 2000); // 2 second cooldown
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading && !cooldown) {
        handleSubmit(e);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      // Here you can add any debounced actions
      // For example, typing indicators or search suggestions
    }, 500); // 500ms debounce delay
  };

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 bg-white">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <div className="flex-1 min-h-[40px] flex items-center">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your question here..."
            className="w-full py-2 resize-none overflow-y-auto max-h-32 focus:outline-none"
            rows={1}
            disabled={isLoading || cooldown}
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim() || isLoading || cooldown}
          className="flex-shrink-0 text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed p-2"
        >
          <Send className={`w-5 h-5 ${isLoading || cooldown ? 'animate-pulse' : ''}`} />
        </button>
      </div>
      {cooldown && (
        <div className="text-xs text-gray-500 mt-1 text-right">
          Please wait a moment before sending another message...
        </div>
      )}
    </form>
  );
}