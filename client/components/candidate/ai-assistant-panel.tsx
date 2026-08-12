"use client";

import * as React from "react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { chatWithAssistant, type AssistantMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

const WELCOME_MESSAGE: AssistantMessage = {
  role: "assistant",
  content:
    "Hi! I can help you use ApplyWise — building your resume, running the ATS analyzer, interview prep, cover letters, and more. What would you like to do today?",
};

// Default react-markdown output has block-level spacing meant for full
// documents (large paragraph gaps, big list indents) — way too loose for a
// narrow chat bubble. These overrides keep it compact and readable at
// small sizes without losing the actual formatting (bold, lists, etc).
const markdownComponents = {
  p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
  strong: ({ ...props }) => <strong className="font-semibold" {...props} />,
  ul: ({ ...props }) => <ul className="mb-2 list-disc space-y-1 pl-4 last:mb-0" {...props} />,
  ol: ({ ...props }) => <ol className="mb-2 list-decimal space-y-1 pl-4 last:mb-0" {...props} />,
  li: ({ ...props }) => <li {...props} />,
  a: ({ ...props }) => <a className="text-primary underline" target="_blank" rel="noreferrer" {...props} />,
};

export function AiAssistantPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { callAuthed } = useAuth();
  const [messages, setMessages] = React.useState<AssistantMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const nextMessages = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      // Only the last 20 messages are sent as history (matches the backend's
      // validator cap) — the assistant doesn't need the entire chat since
      // its scope is narrow, guided help, not long-running context.
      const history = nextMessages.slice(-20);
      const res = await callAuthed((token) => chatWithAssistant(token, trimmed, history));
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply }]);
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry, I'm having trouble responding right now. (${detail})` },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop on mobile only — on desktop the panel sits alongside content */}
      <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-sm flex-col border-l border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">AI Assistant</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> Online
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                )}
              >
                {m.role === "assistant" ? (
                  <ReactMarkdown components={markdownComponents}>{m.content}</ReactMarkdown>
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking...
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask me anything about ApplyWise..."
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button size="icon" onClick={handleSend} disabled={isSending || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
