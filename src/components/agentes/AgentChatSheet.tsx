/**
 * AgentChatSheet.tsx — Painel de conversa com agente interativo
 *
 * Sheet lateral direita com:
 * - Header: nome + emoji + memória badge
 * - Mensagens com markdown básico
 * - Input de texto + enviar
 * - Exemplos rápidos (chips clicáveis)
 * - Indicador de "digitando..."
 */
import { useState, useRef, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Trash2, Brain, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgentChat } from "@/hooks/useAgentChat";
import type { InteractiveAgentDef } from "@/config/interactive-agents";

interface AgentChatSheetProps {
  agent: InteractiveAgentDef | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/** Render basic markdown: bold, line breaks, bullet points */
function renderMarkdown(text: string): JSX.Element[] {
  return text.split("\n").map((line, i) => {
    // Bold
    let processed = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // Bullet points
    if (processed.startsWith("• ") || processed.startsWith("- ") || processed.match(/^[✅✓☑□🟢🔵🟡]\s/)) {
      processed = `<span class="ml-2">${processed}</span>`;
    }
    // Numbered lists
    if (processed.match(/^\d+\.\s/)) {
      processed = `<span class="ml-2">${processed}</span>`;
    }
    return (
      <span key={i}>
        <span dangerouslySetInnerHTML={{ __html: processed }} />
        {i < text.split("\n").length - 1 && <br />}
      </span>
    );
  });
}

export function AgentChatSheet({ agent, open, onOpenChange }: AgentChatSheetProps) {
  const { messages, isTyping, sendMessage, clearHistory, factCount } = useAgentChat(agent?.id ?? null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  if (!agent) return null;

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
    inputRef.current?.focus();
  };

  const showExamples = messages.length === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base">
              <span className="text-xl">{agent.emoji}</span>
              {agent.nome}
            </SheetTitle>
            <div className="flex items-center gap-2">
              {factCount > 0 && (
                <Badge variant="secondary" className="text-[10px] gap-1">
                  <Brain className="w-3 h-3" />
                  {factCount} memória{factCount !== 1 ? "s" : ""}
                </Badge>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-muted-foreground"
                title="Limpar conversa"
                onClick={clearHistory}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{agent.subtitulo}</p>
        </SheetHeader>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="flex gap-2.5">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm", agent.corBg)}>
                {agent.emoji}
              </div>
              <div className="flex-1 bg-muted/50 rounded-2xl rounded-tl-none px-4 py-3">
                <p className="text-sm text-foreground leading-relaxed">{agent.saudacao}</p>
                <p className="text-[10px] text-muted-foreground mt-1.5">Agora</p>
              </div>
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-2.5", msg.role === "user" && "flex-row-reverse")}>
              {msg.role === "assistant" && (
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm", agent.corBg)}>
                  {agent.emoji}
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3",
                  msg.role === "user"
                    ? "bg-accent text-accent-foreground rounded-tr-none"
                    : "bg-muted/50 rounded-tl-none"
                )}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
                </div>
                <p className={cn(
                  "text-[10px] mt-1.5",
                  msg.role === "user" ? "text-accent-foreground/60" : "text-muted-foreground"
                )}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-2.5">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm", agent.corBg)}>
                {agent.emoji}
              </div>
              <div className="bg-muted/50 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs text-muted-foreground ml-1">Digitando...</span>
              </div>
            </div>
          )}

          {/* Examples (only when empty) */}
          {showExamples && (
            <div className="pt-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-2">Experimente perguntar:</p>
              <div className="flex flex-wrap gap-1.5">
                {agent.exemplos.slice(0, 4).map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => handleExampleClick(ex)}
                    className="text-left text-xs px-3 py-2 rounded-xl border border-border hover:border-accent/40 hover:bg-accent/5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border px-4 py-3 flex-shrink-0">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              rows={1}
              className="min-h-[40px] max-h-[120px] resize-none text-sm"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              size="icon"
              className="h-10 w-10 flex-shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
            Shift+Enter para nova linha &middot; Memória persistente entre sessões
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
