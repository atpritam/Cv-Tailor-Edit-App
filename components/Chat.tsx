import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Bot, Undo2, Redo2, Send, Sparkles } from "lucide-react";
import type { ChatMessage } from "@/lib/types";

type ChatProps = {
  chatHistory: ChatMessage[];
  sendChatMessage: (message: string) => void;
  isLoading: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
};

const BoldableText = ({ text }: { text: string }) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
        ) : (
          part
        ),
      )}
    </>
  );
};

export function Chat({
  chatHistory,
  sendChatMessage,
  isLoading,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: ChatProps) {
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
    <div className="mb-4 md:mb-6 overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-3 md:px-5 md:py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Refine with AI
            </h3>
            <p className="text-xs text-muted-foreground hidden md:block">
              Chat to customize your resume
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo || isLoading}
            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary disabled:opacity-30"
            title="Undo last change"
          >
            <Undo2 size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo || isLoading}
            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary disabled:opacity-30"
            title="Redo change"
          >
            <Redo2 size={14} />
          </Button>
        </div>
      </div>
      <div className="flex flex-col h-full p-4 md:p-5">
        <div
          ref={chatContainerRef}
          className="flex-grow space-y-3 md:space-y-4 p-4 h-56 md:h-80 overflow-y-auto rounded-lg border border-border bg-background"
        >
          {chatHistory.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Bot size={32} className="mb-3 opacity-40" />
              <p className="text-sm">Ask AI to modify your resume</p>
              <p className="text-xs mt-1 opacity-60">
                e.g., &quot;Make the summary shorter&quot; or &quot;Add more details to projects&quot;
              </p>
            </div>
          )}
          {chatHistory.map((entry, index) => (
            <div
              key={index}
              className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-3 md:p-3.5 rounded-xl max-w-[85%] md:max-w-sm ${
                  entry.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted border border-border"
                }`}
              >
                <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                  <BoldableText
                    text={entry.parts
                      .map((part: { text: string }) => part.text)
                      .join("")}
                  />
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="p-3 md:p-3.5 rounded-xl bg-muted border border-border max-w-[85%] md:max-w-sm">
                <div className="flex space-x-1.5">
                  <div
                    className="h-2 w-2 bg-primary/60 rounded-full animate-bounce"
                    style={{ animationDelay: "0s" }}
                  ></div>
                  <div
                    className="h-2 w-2 bg-primary/60 rounded-full animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  ></div>
                  <div
                    className="h-2 w-2 bg-primary/60 rounded-full animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
            className="flex-grow text-sm bg-background border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !message.trim()}
            className="shrink-0 cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground px-4"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
