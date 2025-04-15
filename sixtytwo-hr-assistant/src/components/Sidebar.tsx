import { Plus, Users, BookOpen, Briefcase, Building2, Gift, Target, PartyPopper, MessageSquare, Trash2, MoreVertical, Edit } from 'lucide-react';
import React, { useState } from 'react';
import { Chat } from '../types';

interface SidebarProps {
  chats: Chat[];
  currentChatId: string;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
}

export default function Sidebar({ chats, currentChatId, onChatSelect, onNewChat, onDeleteChat, onRenameChat }: SidebarProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleRenameSubmit = (chatId: string) => {
    if (editTitle.trim()) {
      onRenameChat(chatId, editTitle.trim());
      setEditingChatId(null);
      setEditTitle('');
      setMenuOpenId(null);
    }
  };

  return (
    <div className="w-72 bg-white border-r border-gray-200 h-screen p-6">
      <div className="space-y-8">
        {/* Recent Chats */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500">Recent Chats</h2>
            <button 
              className="p-1 hover:bg-gray-100 rounded-full" 
              title="New Chat"
              onClick={onNewChat}
            >
              <Plus className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex items-center justify-between w-full ${
                  currentChatId === chat.id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-50'
                } rounded-lg relative`}
              >
                {editingChatId === chat.id ? (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRenameSubmit(chat.id);
                    }}
                    className="flex-1 px-3 py-1"
                  >
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded"
                      autoFocus
                      onBlur={() => handleRenameSubmit(chat.id)}
                    />
                  </form>
                ) : (
                  <button
                    onClick={() => onChatSelect(chat.id)}
                    className="flex items-center space-x-3 flex-1 px-3 py-2 text-left"
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{chat.title}</span>
                  </button>
                )}
                <div className="relative px-2">
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === chat.id ? null : chat.id)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded-full transition-opacity"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                  {menuOpenId === chat.id && (
                    <>
                      <div 
                        className="fixed inset-0" 
                        onClick={() => setMenuOpenId(null)}
                      />
                      <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                        <button
                          onClick={() => {
                            setEditingChatId(chat.id);
                            setEditTitle(chat.title);
                            setMenuOpenId(null);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Rename</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(chat.id);
                            setMenuOpenId(null);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-4">RESOURCES</h2>
          <div className="space-y-1">
            <a 
              href="https://sites.google.com/sixtytwo.co/62teamhandbook/home?authuser=0"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 text-gray-700 hover:bg-gray-50 w-full px-3 py-2 rounded-lg"
            >
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-sm">Team Portal</span>
            </a>
            
            <a 
              href="https://sites.google.com/sixtytwo.co/62teamhandbook/onboarding?authuser=0"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 text-gray-700 hover:bg-gray-50 w-full px-3 py-2 rounded-lg"
            >
              <BookOpen className="w-5 h-5 text-gray-400" />
              <span className="text-sm">Onboarding</span>
            </a>
            
            <a 
              href="https://sites.google.com/sixtytwo.co/62teamhandbook/working-processes?authuser=0"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 text-gray-700 hover:bg-gray-50 w-full px-3 py-2 rounded-lg"
            >
              <Briefcase className="w-5 h-5 text-gray-400" />
              <span className="text-sm">Working Processes</span>
            </a>
            
            <a 
              href="https://sites.google.com/sixtytwo.co/62teamhandbook/organization-talent?authuser=0"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 text-gray-700 hover:bg-gray-50 w-full px-3 py-2 rounded-lg"
            >
              <Building2 className="w-5 h-5 text-gray-400" />
              <span className="text-sm">Organization & Talents</span>
            </a>
            
            <a 
              href="https://sites.google.com/sixtytwo.co/62teamhandbook/benefits?authuser=0"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 text-gray-700 hover:bg-gray-50 w-full px-3 py-2 rounded-lg"
            >
              <Gift className="w-5 h-5 text-gray-400" />
              <span className="text-sm">Benefits</span>
            </a>
            
            <a 
              href="https://sites.google.com/sixtytwo.co/62teamhandbook/performance-management?authuser=0"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 text-gray-700 hover:bg-gray-50 w-full px-3 py-2 rounded-lg"
            >
              <Target className="w-5 h-5 text-gray-400" />
              <span className="text-sm">Performance Management</span>
            </a>
            
            <a 
              href="https://sites.google.com/sixtytwo.co/62teamhandbook/team-events?authuser=0"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 text-gray-700 hover:bg-gray-50 w-full px-3 py-2 rounded-lg"
            >
              <PartyPopper className="w-5 h-5 text-gray-400" />
              <span className="text-sm">Team Events</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}