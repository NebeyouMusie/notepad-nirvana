
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fetchNotes, Note } from '@/services/noteService';

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
  const [userNotes, setUserNotes] = useState<Note[]>([]);

  // Fetch user notes
  useEffect(() => {
    const loadNotes = async () => {
      try {
        // Fetch all notes including archived and trashed
        const allNotes = await fetchNotes({ includeAll: true });
        setUserNotes(allNotes);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };

    // Only load notes if user is authenticated (will return empty array if not)
    loadNotes();

    // Refresh notes every 5 minutes
    const intervalId = setInterval(loadNotes, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

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

  // Generate context about user's notes
  const generateNotesContext = () => {
    if (userNotes.length === 0) {
      return "You don't have any notes yet.";
    }

    const notesSummary = userNotes.map(note => {
      let status = "";
      if (note.is_archived) status = " (archived)";
      if (note.is_trashed) status = " (in trash)";
      if (note.is_favorite) status += " (favorite)";
      
      return `- "${note.title}"${status}: ${note.content?.substring(0, 100)}${note.content && note.content.length > 100 ? '...' : ''}`;
    }).join('\n');

    return `Here are your notes:\n${notesSummary}`;
  };

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
      
      // Create system prompt with notes information
      const notesContext = generateNotesContext();
      const systemPrompt = `You are a helpful note-taking assistant. You have access to the user's notes and can help them find information, summarize notes, and answer questions about their content.

${notesContext}

When the user asks about their notes, you should reference the above information to help them. If they ask a question that's not about their notes, you can answer generally as a helpful assistant.`;
      
      // Initialize session with notes context
      const session = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: "Please be my note-taking assistant." }],
          },
          {
            role: "model",
            parts: [{ text: "I'd be happy to be your note-taking assistant! I can help you manage and organize your notes, find specific information, and answer questions about your content. What would you like help with today?" }],
          },
        ],
        systemInstruction: systemPrompt,
      });
      
      setChatSession(session);
      
      // Add initial welcome message
      if (messages.length === 0) {
        setMessages([
          {
            id: Date.now().toString(),
            content: "Hello! I'm your personal note-taking assistant. How can I help you today?",
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
      // Before sending, regenerate the notes context in case it's changed
      if (userNotes.length > 0) {
        const notesContext = generateNotesContext();
        
        // Update the system instruction with fresh notes data
        await chatSession.sendMessage(`I'm going to update you with the current state of the user's notes. Use this information when the user asks about their notes:

${notesContext}

Please respond with "I've updated my knowledge of your notes." and nothing else.`);
        
        // Skip adding this response to the chat UI
        await chatSession.sendMessage(content);
      } else {
        // Just send the user's message if there are no notes
        await chatSession.sendMessage(content);
      }
      
      const result = await chatSession.getLastResponse();
      const aiResponse = result.text();
      
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
