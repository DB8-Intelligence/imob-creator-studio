import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatMessage {
  id: string;
  direction: "incoming" | "outgoing";
  phone: string;
  name: string | null;
  text: string;
  type: string;
  media: string[];
  timestamp: string;
}

interface ChatWindowProps {
  phone: string;
  contactName: string | null;
}

export default function ChatWindow({ phone, contactName }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const callEdge = useCallback(
    async (action: string, opts?: { method?: string; body?: Record<string, unknown>; params?: Record<string, string> }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Nao autenticado");

      const params = new URLSearchParams({ action, ...(opts?.params ?? {}) });
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-instance?${params}`;

      const res = await fetch(url, {
        method: opts?.method ?? "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          ...(opts?.body ? { "Content-Type": "application/json" } : {}),
        },
        ...(opts?.body ? { body: JSON.stringify(opts.body) } : {}),
      });

      return res.json();
    },
    [],
  );

  // Load messages
  useEffect(() => {
    if (!phone) return;
    setLoading(true);
    setError("");

    callEdge("messages", { params: { phone } })
      .then((data) => {
        setMessages(data.messages ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [phone, callEdge]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    setSending(true);
    setError("");

    try {
      const res = await callEdge("send", {
        method: "POST",
        body: { phone, text },
      });

      if (!res.ok) {
        setError(res.error ?? "Erro ao enviar mensagem");
        return;
      }

      // Optimistic append
      setMessages((prev) => [
        ...prev,
        {
          id: res.message_id ?? crypto.randomUUID(),
          direction: "outgoing",
          phone,
          name: null,
          text,
          type: "text",
          media: [],
          timestamp: new Date().toISOString(),
        },
      ]);
      setInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setSending(false);
    }
  };

  const displayName = contactName ?? phone;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <p className="font-semibold text-sm text-[#002B5B]">{displayName}</p>
        {contactName && (
          <p className="text-xs text-gray-400">{phone}</p>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#F8FAFF]">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Carregando mensagens...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">Nenhuma mensagem ainda</p>
            <p className="text-xs mt-1">Envie a primeira mensagem abaixo</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.direction === "outgoing" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                  msg.direction === "outgoing"
                    ? "bg-[#002B5B] text-white rounded-br-md"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    msg.direction === "outgoing" ? "text-white/60" : "text-gray-400"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 flex items-center gap-2 shrink-0">
          <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Input area */}
      <div className="px-4 py-3 border-t border-gray-200 bg-white shrink-0">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Digite uma mensagem..."
            disabled={sending}
            rows={1}
            className="resize-none min-h-[40px] max-h-[120px] text-sm"
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="bg-[#002B5B] hover:bg-[#001d3d] text-white shrink-0 h-10 w-10 p-0"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
