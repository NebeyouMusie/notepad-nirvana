
import React from "react";
import { cn } from "@/lib/utils";

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {}

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  ({ className, ...props }, ref) => {
    // Auto scroll to bottom on new messages
    const listRef = React.useRef<HTMLDivElement>(null);
    
    React.useEffect(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }, [props.children]);

    return (
      <div
        ref={listRef}
        className={cn("flex flex-col gap-4 p-4 overflow-y-auto", className)}
        {...props}
      />
    );
  }
);
ChatMessageList.displayName = "ChatMessageList";

export { ChatMessageList };
