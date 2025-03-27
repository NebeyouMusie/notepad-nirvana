
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Define the types for our messages
export type MessageRole = 'user' | 'ai';

export interface ChatMessage {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
}

// Interface for our context
interface ChatContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  apiKeySet: boolean;
  setApiKey: (key: string) => void;
}

// Create the context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [genAI, setGenAI] = useState<any>(null);
  const [apiKeySet, setApiKeySet] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);

  // Check if API key exists in localStorage
  useEffect(() => {
    const storedApiKey = localStorage.getItem('gemini-api-key');
    if (storedApiKey) {
      try {
        initializeGemini(storedApiKey);
        setApiKeySet(true);
      } catch (error) {
        console.error('Failed to initialize Gemini with stored key:', error);
        localStorage.removeItem('gemini-api-key');
      }
    }
  }, []);

  // Initialize Gemini API
  const initializeGemini = (apiKey: string) => {
    try {
      const ai = new GoogleGenerativeAI(apiKey);
      const model = ai.getGenerativeModel({
        model: "gemini-1.5-pro",
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 8192,
        },
      });
      
      setGenAI(ai);
      const session = model.startChat({
        history: [],
      });
      setChatSession(session);
      
      // Add initial welcome message
      if (messages.length === 0) {
        setMessages([
          {
            id: Date.now().toString(),
            content: "Hi there! 👋 I'm your AI assistant. Ask me anything, and I'll do my best to help!",
            role: 'ai',
            timestamp: new Date(),
          },
        ]);
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing Gemini:', error);
      toast.error('Failed to initialize AI. Please check your API key.');
      return false;
    }
  };

  // Set API key
  const setApiKey = (key: string) => {
    if (!key.trim()) {
      toast.error('API key cannot be empty');
      return;
    }

    const success = initializeGemini(key);
    if (success) {
      localStorage.setItem('gemini-api-key', key);
      setApiKeySet(true);
      toast.success('API key set successfully');
    }
  };

  // Send message to Gemini API
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    if (!chatSession) {
      toast.error('AI service not initialized. Please set your API key.');
      return;
    }

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const result = await chatSession.sendMessage(content);
      const aiResponse = result.response.text();
      
      // Add AI response to chat
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      toast.error('Failed to get a response from the AI service.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all messages
  const clearMessages = () => {
    setMessages([]);
    // Reinitialize chat session
    if (genAI) {
      const storedApiKey = localStorage.getItem('gemini-api-key');
      if (storedApiKey) {
        initializeGemini(storedApiKey);
      }
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        sendMessage,
        clearMessages,
        apiKeySet,
        setApiKey,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
