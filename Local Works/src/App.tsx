import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import LoadingIndicator from './components/LoadingIndicator';
import { Message, Chat } from './types';
import handbookData from './data/benefit.json';
import { generateResponse } from './lib/openai';

function App() {
  const [currentChatId, setCurrentChatId] = useState<string>('1');
  const [isLoading, setIsLoading] = useState(false);
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      title: 'HR Assistant Chat',
      lastMessage: "Hello! I'm your HR Assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your HR Assistant. How can I help you today?",
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;
      setShouldAutoScroll(isNearBottom);
    };

    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (shouldAutoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ block: 'end', behavior: 'smooth' });
    }
  }, [messages, isLoading, shouldAutoScroll]);

  const createNewChat = () => {
    const newChatId = Date.now().toString();
    const chatNumber = chats.length + 1;
    const newChat: Chat = {
      id: newChatId,
      title: `New Chat ${chatNumber}`,
      lastMessage: "Hello! I'm your HR Assistant. How can I help you today?",
      timestamp: new Date(),
    };

    setChats([...chats, newChat]);
    setCurrentChatId(newChatId);
    setMessages([
      {
        id: '1',
        content: "Hello! I'm your HR Assistant. How can I help you today?",
        role: 'assistant',
        timestamp: new Date(),
      },
    ]);
  };

  const deleteChat = (chatId: string) => {
    const newChats = chats.filter(chat => chat.id !== chatId);
    setChats(newChats);
    
    if (chatId === currentChatId) {
      const lastChat = newChats[newChats.length - 1];
      if (lastChat) {
        setCurrentChatId(lastChat.id);
      }
    }
  };

  const renameChat = (chatId: string, newTitle: string) => {
    setChats(chats.map(chat => 
      chat.id === chatId 
        ? { ...chat, title: newTitle }
        : chat
    ));
  };

  const processMessage = async (userMessage: string) => {
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: userMessage,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setShouldAutoScroll(true);

    // Prepare conversation history for OpenAI
    const conversationHistory = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add the new user message
    conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    try {
      const aiResponse = await generateResponse(conversationHistory, handbookData);
      
      const newAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newAssistantMessage]);

      // Update the chat's last message
      setChats(chats.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, lastMessage: userMessage, timestamp: new Date() }
          : chat
      ));
    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I encountered an error. Please try again.",
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          chats={chats}
          currentChatId={currentChatId}
          onChatSelect={setCurrentChatId}
          onNewChat={createNewChat}
          onDeleteChat={deleteChat}
          onRenameChat={renameChat}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="chat-wrapper flex flex-col flex-1 overflow-hidden">
            <div 
              ref={chatContainerRef}
              className="chat-body flex-1 overflow-y-auto p-6 space-y-4"
            >
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && <LoadingIndicator />}
              <div ref={bottomRef} />
            </div>
            <ChatInput onSendMessage={processMessage} isLoading={isLoading} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App