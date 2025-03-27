
import { useState, FormEvent, useRef, useEffect } from "react";
import { Send, Bot, Paperclip, Trash2, ArrowDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble";
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat";
import { ChatMessageList } from "@/components/ui/chat-message-list";
import { useChat } from "@/context/ChatContext";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";

export function AIAssistant() {
  const { messages, isLoading, sendMessage, clearMessages, apiKeySet, setApiKey } = useChat();
  const [input, setInput] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(!apiKeySet);
  const [apiKey, setApiKeyInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Check if we need to show the scroll down button
  const handleScroll = () => {
    if (!chatBodyRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatBodyRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Submit handler
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  // Save API key
  const handleSaveApiKey = () => {
    setApiKey(apiKey);
    setShowApiKeyDialog(false);
  };

  // Check if user has scrolled
  useEffect(() => {
    const chatBody = chatBodyRef.current;
    if (chatBody) {
      chatBody.addEventListener("scroll", handleScroll);
      return () => chatBody.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (!showScrollButton) {
      scrollToBottom();
    }
  }, [messages, showScrollButton]);

  return (
    <>
      <ExpandableChat
        size={isMobile ? "full" : "md"}
        position="bottom-right"
        icon={<Bot className="h-6 w-6" />}
      >
        <ExpandableChatHeader className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Note Assistant</h2>
            <p className="text-xs text-muted-foreground">
              Powered by Google Gemini
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowApiKeyDialog(true)}
              title="Configure API Key"
            >
              <Bot className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={clearMessages} 
              title="Clear chat"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </ExpandableChatHeader>

        <ExpandableChatBody ref={chatBodyRef} onScroll={handleScroll}>
          <ChatMessageList>
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                variant={message.role === "user" ? "sent" : "received"}
              >
                {message.role === "ai" && (
                  <ChatBubbleAvatar
                    className="h-8 w-8 shrink-0"
                    fallback="AI"
                  />
                )}
                <ChatBubbleMessage
                  variant={message.role === "user" ? "sent" : "received"}
                >
                  {message.content}
                </ChatBubbleMessage>
                {message.role === "user" && (
                  <ChatBubbleAvatar
                    className="h-8 w-8 shrink-0"
                    fallback="You"
                  />
                )}
              </ChatBubble>
            ))}

            {isLoading && (
              <ChatBubble variant="received">
                <ChatBubbleAvatar
                  className="h-8 w-8 shrink-0"
                  fallback="AI"
                />
                <ChatBubbleMessage isLoading />
              </ChatBubble>
            )}

            <div ref={messagesEndRef} />
          </ChatMessageList>

          {showScrollButton && (
            <Button
              className="absolute bottom-16 right-4 rounded-full h-10 w-10 p-0"
              onClick={scrollToBottom}
              variant="secondary"
            >
              <ArrowDown className="h-5 w-5" />
            </Button>
          )}
        </ExpandableChatBody>

        <ExpandableChatFooter>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                apiKeySet
                  ? "Ask about your notes..."
                  : "Please set your API key first"
              }
              disabled={!apiKeySet || isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!apiKeySet || isLoading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </ExpandableChatFooter>
      </ExpandableChat>

      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter your Gemini API Key</DialogTitle>
            <DialogDescription>
              This key is required to communicate with the Google Gemini AI service.
              Your key will be stored securely in your browser's local storage.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="api-key">Gemini API Key</Label>
              <Input
                id="api-key"
                value={apiKey}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Enter your API key..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveApiKey} disabled={!apiKey.trim()}>
              Save API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
