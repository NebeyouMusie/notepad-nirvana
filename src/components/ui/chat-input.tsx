
import React from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps extends React.ComponentProps<typeof Textarea> {}

const ChatInput = React.forwardRef<
  React.ElementRef<typeof Textarea>,
  ChatInputProps
>(({ className, ...props }, ref) => {
  // Handle Enter key to submit the form
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true })
        );
      }
    }
  };

  return (
    <Textarea
      ref={ref}
      rows={1}
      className={cn("resize-none", className)}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
});
ChatInput.displayName = "ChatInput";

export { ChatInput };
