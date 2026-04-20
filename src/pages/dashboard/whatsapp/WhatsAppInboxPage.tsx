import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Image,
  Video,
  FileText,
  Inbox,
  Loader2,
  Search,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ChatWindow from "@/components/whatsapp/ChatWindow";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Contact {
  phone: string;
  name: string | null;
  lastMessage: string;
  lastAt: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const TYPE_ICONS: Record<string, React.ReactNode> = {
  text: <MessageSquare className="h-4 w-4 text-gray-500" />,
  image: <Image className="h-4 w-4 text-blue-500" />,
  video: <Video className="h-4 w-4 text-purple-500" />,
  document: <FileText className="h-4 w-4 text-orange-500" />,
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function WhatsAppInboxPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);

  const callEdge = useCallback(
    async (action: string, params?: Record<string, string>) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Nao autenticado");

      const qs = new URLSearchParams({ action, ...(params ?? {}) });
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-instance?${qs}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } },
      );
      return res.json();
    },
    [],
  );

  /* ---- Load contacts ---- */
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    callEdge("contacts")
      .then((data) => {
        setContacts(data.contacts ?? []);
      })
      .catch(() => {
        setContacts([]);
      })
      .finally(() => setLoading(false));
  }, [user, callEdge]);

  /* ---- Realtime: add new contacts when messages arrive ---- */
  useEffect(() => {
    const channel = supabase
      .channel("whatsapp-inbox-realtime-contacts")
      .on(
        "postgres_changes" as never,
        {
          event: "INSERT",
          schema: "public",
          table: "whatsapp_inbox",
        },
        (payload: { new: Record<string, unknown> }) => {
          const row = payload.new;
          const phone = row.from_phone as string;
          const name = (row.from_name as string | null) ?? null;
          const text = (row.message_text as string) ?? "";
          const at = (row.received_at as string) ?? new Date().toISOString();

          setContacts((prev) => {
            const exists = prev.find((c) => c.phone === phone);
            if (exists) {
              return prev.map((c) =>
                c.phone === phone ? { ...c, lastMessage: text, lastAt: at, name: name ?? c.name } : c,
              );
            }
            return [{ phone, name, lastMessage: text, lastAt: at }, ...prev];
          });

          toast({ title: `Nova mensagem de ${name ?? phone}` });
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [toast]);

  /* ---- Filter ---- */
  const filtered = search
    ? contacts.filter(
        (c) =>
          c.phone.includes(search) ||
          c.name?.toLowerCase().includes(search.toLowerCase()),
      )
    : contacts;

  const selectedContact = contacts.find((c) => c.phone === selectedPhone) ?? null;

  /* ---- Render ---- */
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/dashboard/secretaria"
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#002B5B] mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Voltar ao Hub da Secretária
          </Link>
          <h1 className="text-2xl font-bold text-[#002B5B]">
            Conversas WhatsApp
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Visualize e responda mensagens recebidas pelo WhatsApp.
          </p>
        </div>

        {/* Split-pane layout */}
        <div className="flex gap-0 border border-gray-200 rounded-xl overflow-hidden h-[calc(100vh-200px)] min-h-[500px]">
          {/* Left: Contact list */}
          <div className="w-[340px] shrink-0 border-r border-gray-200 flex flex-col bg-white">
            {/* Search */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar contato..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 text-sm h-9"
                />
              </div>
            </div>

            {/* Contact list */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Carregando...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-[#002B5B]/10 flex items-center justify-center mb-3">
                    <Inbox className="h-6 w-6 text-[#002B5B]/40" />
                  </div>
                  <p className="text-sm text-gray-500">
                    {search ? "Nenhum contato encontrado" : "Nenhuma conversa ainda"}
                  </p>
                </div>
              ) : (
                filtered.map((contact) => (
                  <button
                    key={contact.phone}
                    type="button"
                    onClick={() => setSelectedPhone(contact.phone)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      selectedPhone === contact.phone ? "bg-[#002B5B]/[0.04]" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-[#002B5B] truncate">
                        {contact.name ?? contact.phone}
                      </span>
                      <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                        {formatRelativeTime(contact.lastAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {contact.lastMessage || "[mensagem]"}
                    </p>
                    {contact.name && (
                      <p className="text-[11px] text-gray-400 mt-0.5">{contact.phone}</p>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right: Chat window */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedPhone && selectedContact ? (
              <ChatWindow
                key={selectedPhone}
                phone={selectedPhone}
                contactName={selectedContact.name}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-center px-8">
                <div>
                  <div className="mx-auto w-16 h-16 rounded-full bg-[#002B5B]/10 flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-[#002B5B]/30" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700">
                    Selecione uma conversa
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Escolha um contato na lista para ver e responder mensagens.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
