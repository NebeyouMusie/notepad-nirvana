
import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

type ChatBubbleVariant = "sent" | "received";

interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ChatBubbleVariant;
}

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ className, variant = "received", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-start gap-2.5 group",
          variant === "sent" ? "justify-end" : "justify-start",
          className
        )}
        {...props}
      />
    );
  }
);
ChatBubble.displayName = "ChatBubble";

interface ChatBubbleAvatarProps extends React.ComponentProps<typeof Avatar> {
  src?: string;
  fallback: string;
}

const ChatBubbleAvatar = React.forwardRef<
  React.ElementRef<typeof Avatar>,
  ChatBubbleAvatarProps
>(({ className, src, fallback, ...props }, ref) => {
  return (
    <Avatar ref={ref} className={className} {...props}>
      {src && <AvatarImage src={src} />}
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
});
ChatBubbleAvatar.displayName = "ChatBubbleAvatar";

interface ChatBubbleMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ChatBubbleVariant;
  isLoading?: boolean;
}

const ChatBubbleMessage = React.forwardRef<
  HTMLDivElement,
  ChatBubbleMessageProps
>(({ className, variant = "received", isLoading, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "py-2.5 px-4 rounded-lg max-w-[85%] break-words",
        variant === "sent"
          ? "bg-primary text-primary-foreground ml-auto"
          : "bg-muted",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="flex gap-1.5 items-center justify-center h-5">
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></span>
        </div>
      ) : (
        children
      )}
    </div>
  );
});
ChatBubbleMessage.displayName = "ChatBubbleMessage";

export { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage };
