export interface Message {
  id: string;
  content: string;
  role: 'assistant' | 'user';
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

export interface ChatHistory {
  messages: Message[];
}