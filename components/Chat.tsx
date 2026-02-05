"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Sparkles, Undo2, Redo2, Send } from "lucide-react";
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
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="mb-6 rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3 bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles size={14} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">Refine with AI</h3>
            <p className="text-xs text-muted-foreground hidden sm:block">Ask for changes to your resume</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo || isLoading}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            title="Undo last change"
          >
            <Undo2 size={15} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo || isLoading}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            title="Redo change"
          >
            <Redo2 size={15} />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4">
        <div
          ref={chatContainerRef}
          className="h-64 md:h-80 overflow-y-auto rounded-lg border border-border/60 bg-background p-4 space-y-3"
        >
          {chatHistory.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-3">
                <Sparkles size={18} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Start a conversation</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-[240px]">
                Ask the AI to make changes like &quot;make the summary shorter&quot; or &quot;add more technical details&quot;
              </p>
            </div>
          )}

          {chatHistory.map((entry, index) => (
            <div
              key={index}
              className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-3.5 py-2.5 rounded-2xl max-w-[85%] ${
                  entry.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
              >
                <p className="text-sm leading-relaxed">
                  <BoldableText
                    text={entry.parts.map((part: { text: string }) => part.text).join("")}
                  />
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-muted">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                  <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                  <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="mt-3 flex gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
            className="flex-1 h-10 rounded-xl border-border/60 bg-background text-sm placeholder:text-muted-foreground/60"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !message.trim()}
            size="sm"
            className="h-10 w-10 p-0 rounded-xl shrink-0"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
