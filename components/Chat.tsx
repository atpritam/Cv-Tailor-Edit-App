import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { MessageSquare, Undo2, Redo2, Send, Loader2 } from "lucide-react";
import type { ChatMessage } from "@/lib/types";

type ChatProps = {
  chatHistory: ChatMessage[];
  sendChatMessage: (message: string) => void;
  isLoading: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isTailoring?: boolean;
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
  isTailoring = false,
}: ChatProps) {
  const [message, setMessage] = useState("");
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      sendChatMessage(message);
      setMessage("");
      setUserHasInteracted(true);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const allSuggestions = [
    "Make the summary more concise",
    "Add more technical keywords",
    "Emphasize leadership experience",
  ];
  
  // Show 2 suggestions on mobile, 3 on desktop
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const suggestions = isMobile ? allSuggestions.slice(0, 2) : allSuggestions;

  const showSuggestions = !userHasInteracted && chatHistory.length > 0;
  const isDisabled = isLoading || isTailoring;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <MessageSquare size={14} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Refine with AI</h3>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Ask to modify specific sections
            </p>
          </div>
        </div>
        
        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo || isDisabled}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30"
            title="Undo"
          >
            <Undo2 size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo || isDisabled}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30"
            title="Redo"
          >
            <Redo2 size={14} />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="h-64 md:h-80 overflow-y-auto p-4 space-y-3"
      >
        {isTailoring && chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Loader2 size={24} className="text-primary animate-spin" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Tailoring your resume
            </p>
            <p className="text-xs text-muted-foreground">
              Analyzing your experience and optimizing for the job requirements
            </p>
          </div>
        ) : chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="text-muted-foreground mb-4">
              <p className="text-sm mb-1">Tell the AI what to change</p>
              <p className="text-xs opacity-60">Try one of these suggestions:</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setMessage(s)}
                  className="px-3 py-1.5 text-xs rounded-full border border-border bg-muted/50 text-muted-foreground hover:bg-accent hover:text-foreground hover:border-primary/30 transition-colors cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {chatHistory.map((entry, index) => (
              <div
                key={index}
                className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    entry.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
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
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Suggestions in chat area - shown when AI has responded but user hasn't interacted */}
            {showSuggestions && (
              <div className="flex justify-center pt-4">
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setMessage(s);
                        setUserHasInteracted(true);
                      }}
                      disabled={isDisabled}
                      className="px-3 py-1.5 text-xs rounded-full border border-border bg-muted/50 text-muted-foreground hover:bg-accent hover:text-foreground hover:border-primary/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-4 flex gap-2">
        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isDisabled && handleSend()}
          disabled={isDisabled}
          className="flex-1 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50"
        />
        <button
          onClick={handleSend}
          disabled={isDisabled}
          style={{ 
            backgroundColor: isDisabled ? '#334155' : '#f59e0b',
            color: '#0c0c0f',
            opacity: isDisabled ? 0.5 : 1
          }}
          className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
            isDisabled 
              ? "cursor-not-allowed" 
              : "hover:opacity-90 cursor-pointer"
          }`}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
