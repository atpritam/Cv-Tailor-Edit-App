import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Bot } from "lucide-react";
import type { ChatMessage } from "@/hooks/useCVTailor";

type ChatProps = {
  chatHistory: ChatMessage[];
  sendChatMessage: (message: string) => void;
  isLoading: boolean;
};

export function Chat({ chatHistory, sendChatMessage, isLoading }: ChatProps) {
  const [message, setMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      sendChatMessage(message);
      setMessage("");
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="mb-6 md:mb-8 overflow-hidden rounded-lg border border-border">
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3 md:px-6 md:py-4">
        <Bot size={16} className="shrink-0" />
        <h3 className="text-xs font-semibold uppercase tracking-wider">
          Refine with Gemini
        </h3>
      </div>
      <div className="flex flex-col h-full px-3 md:px-6 py-4">
        <div
          ref={chatContainerRef}
          className="flex-grow space-y-3 md:space-y-4 p-3 md:p-4 h-64 md:h-96 overflow-y-auto rounded-md border bg-background"
        >
          {chatHistory.map((entry, index) => (
            <div
              key={index}
              className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-2.5 md:p-3 rounded-lg max-w-[85%] md:max-w-sm ${entry.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                <p className="text-xs md:text-sm">
                  {entry.parts
                    .map((part: { text: string }) => part.text)
                    .join(" ")}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="p-2.5 md:p-3 rounded-lg bg-muted max-w-[85%] md:max-w-sm">
                <div className="flex space-x-1">
                  <div
                    className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0s" }}
                  ></div>
                  <div
                    className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-3 md:mt-4 flex space-x-2">
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
            className="flex-grow text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading}
            className="shrink-0 cursor-pointer"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
