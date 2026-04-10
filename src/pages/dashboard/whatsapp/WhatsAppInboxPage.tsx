import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Image,
  Video,
  FileText,
  Filter,
  PlusCircle,
  Inbox,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface WhatsAppMessage {
  id: string;
  sender_number: string;
  sender_name: string | null;
  message_type: "text" | "image" | "video" | "document";
  body: string | null;
  media_url: string | null;
  status: "pending" | "processed";
  created_at: string;
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

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function WhatsAppInboxPage() {
  const { user } = useAuth();
  const { workspaceId } = useWorkspaceContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  /* ---- Fetch ---- */
  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("whatsapp_inbox" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // Table may not exist — graceful degradation
        console.warn("whatsapp_inbox query:", error.message);
        setMessages([]);
      } else {
        setMessages((data ?? []) as unknown as WhatsAppMessage[]);
      }
    } catch {
      setMessages([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    loadMessages();
  }, [user]);

  /* ---- Realtime subscription ---- */
  useEffect(() => {
    if (!workspaceId) return;
    const channel = supabase
      .channel("whatsapp-inbox-realtime")
      .on(
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "whatsapp_inbox",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload: any) => {
          setMessages((prev) => [payload.new as any, ...prev]);
          toast({ title: `Nova mensagem de ${(payload.new as any).sender_name || (payload.new as any).sender_number}` });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId]);

  /* ---- Filters ---- */
  const filtered = messages.filter((m) => {
    if (filter === "photos") return m.message_type === "image";
    if (filter === "pending") return m.status === "pending";
    return true;
  });

  /* ---- Render ---- */
  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans']">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#002B5B]">
              Mensagens Recebidas
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Inbox do WhatsApp — mensagens de imagens, textos e mais.
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="photos">Fotos</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
          </TabsList>

          {/* Content area — same for all tabs, filtering is in JS */}
          <TabsContent value={filter} className="mt-4">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              /* Empty state */
              <div className="text-center py-20">
                <div className="mx-auto w-16 h-16 rounded-full bg-[#002B5B]/10 flex items-center justify-center mb-4">
                  <Inbox className="h-8 w-8 text-[#002B5B]/40" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700">
                  Nenhuma mensagem recebida
                </h3>
                <p className="text-sm text-gray-500 mt-1 mb-6">
                  Conecte seu WhatsApp primeiro para comecar a receber mensagens.
                </p>
                <Link to="/dashboard/whatsapp/setup">
                  <Button className="bg-[#002B5B] hover:bg-[#001d3d] text-white gap-2">
                    Conectar WhatsApp
                  </Button>
                </Link>
              </div>
            ) : (
              /* Message list */
              <div className="space-y-2">
                {filtered.map((msg) => (
                  <Card
                    key={msg.id}
                    className="hover:shadow-md transition-shadow border border-gray-200"
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      {/* Thumbnail / type icon */}
                      {msg.message_type === "image" ? (
                        <div className="h-12 w-12 rounded bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                          <Image className="h-5 w-5 text-blue-400" />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded bg-gray-50 flex items-center justify-center shrink-0">
                          {TYPE_ICONS[msg.message_type] ?? TYPE_ICONS.text}
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[#002B5B] truncate">
                            {msg.sender_name ?? msg.sender_number}
                          </span>
                          <span className="text-xs text-gray-400">
                            {msg.sender_name ? msg.sender_number : ""}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {msg.body ?? `[${msg.message_type}]`}
                        </p>
                        <span className="text-[11px] text-gray-400">
                          {new Date(msg.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Status badge */}
                      <Badge
                        className={`shrink-0 border-0 text-[11px] ${
                          msg.status === "processed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {msg.status === "processed" ? "Processado" : "Pendente"}
                      </Badge>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {msg.status !== "processed" && (
                          <button
                            type="button"
                            onClick={async () => {
                              await supabase
                                .from("whatsapp_inbox" as any)
                                .update({ status: "processed" } as any)
                                .eq("id", msg.id);
                              setMessages((prev) =>
                                prev.map((m) =>
                                  m.id === msg.id ? { ...m, status: "processed" as const } : m
                                )
                              );
                              toast({ title: "Mensagem marcada como processada" });
                            }}
                            className="text-xs text-[#002B5B] hover:underline"
                          >
                            Marcar processado
                          </button>
                        )}
                        {msg.message_type === "image" && (
                          <Button
                            size="sm"
                            className="text-xs bg-[#002B5B] hover:bg-[#001d3d] text-white gap-1.5 shrink-0"
                            onClick={() => navigate("/dashboard/criativos/novo")}
                          >
                            <PlusCircle className="h-3.5 w-3.5" />
                            Criar Criativo
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
