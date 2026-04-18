import { useEffect, useState } from "react";
import { Zap, Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface QuickReply {
  id: string;
  shortcut: string;
  label: string;
  body: string;
  usage_count: number;
}

interface Props {
  onPick: (body: string) => void;
}

export default function QuickRepliesPopover({ onPick }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [replies, setReplies] = useState<QuickReply[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ shortcut: "", label: "", body: "" });

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    supabase
      .from("whatsapp_quick_replies")
      .select("id, shortcut, label, body, usage_count")
      .eq("user_id", user.id)
      .order("usage_count", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          toast({ title: "Falha ao carregar respostas rápidas", variant: "destructive" });
        } else {
          setReplies(data ?? []);
        }
        setLoading(false);
      });
  }, [open, user, toast]);

  const handlePick = async (reply: QuickReply) => {
    onPick(reply.body);
    setOpen(false);
    // fire-and-forget usage counter bump
    supabase
      .from("whatsapp_quick_replies")
      .update({ usage_count: reply.usage_count + 1 })
      .eq("id", reply.id)
      .then(() => {});
  };

  const handleCreate = async () => {
    if (!user) return;
    const shortcut = form.shortcut.trim().toLowerCase();
    if (!/^[a-z0-9_-]{1,24}$/.test(shortcut)) {
      toast({ title: "Atalho inválido", description: "Use letras minúsculas, números, _ ou -", variant: "destructive" });
      return;
    }
    if (!form.label.trim() || !form.body.trim()) {
      toast({ title: "Preencha nome e mensagem", variant: "destructive" });
      return;
    }

    const { data, error } = await supabase
      .from("whatsapp_quick_replies")
      .insert({ user_id: user.id, shortcut, label: form.label.trim(), body: form.body.trim() })
      .select("id, shortcut, label, body, usage_count")
      .single();

    if (error) {
      toast({
        title: error.code === "23505" ? "Atalho já existe" : "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setReplies((prev) => [data!, ...prev]);
    setForm({ shortcut: "", label: "", body: "" });
    setCreating(false);
    toast({ title: "Resposta rápida salva" });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("whatsapp_quick_replies").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
      return;
    }
    setReplies((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-10 px-3 gap-1.5 border-gray-200 text-[#002B5B] hover:bg-[#F0F4FA]"
        >
          <Zap className="h-4 w-4" />
          <span className="text-xs font-medium hidden sm:inline">Rápidas</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#002B5B]">Respostas rápidas</p>
            <p className="text-[11px] text-gray-500">Clique para inserir no chat</p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-[#002B5B]"
            onClick={() => setCreating((v) => !v)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Nova
          </Button>
        </div>

        {creating && (
          <div className="px-4 py-3 border-b border-gray-100 space-y-2 bg-[#F8FAFF]">
            <Input
              placeholder="atalho (ex: visita)"
              value={form.shortcut}
              onChange={(e) => setForm((f) => ({ ...f, shortcut: e.target.value }))}
              className="text-xs h-8"
            />
            <Input
              placeholder="Nome (ex: Agendar visita)"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              className="text-xs h-8"
            />
            <Textarea
              placeholder="Mensagem completa..."
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              rows={3}
              className="text-xs resize-none"
            />
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={handleCreate} className="h-7 bg-[#002B5B] hover:bg-[#001d3d] text-white text-xs flex-1">
                Salvar
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setCreating(false)} className="h-7 text-xs">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        <div className="max-h-[280px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-gray-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span className="text-xs">Carregando...</span>
            </div>
          ) : replies.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8 px-4">
              Nenhuma resposta salva. Crie a primeira para usar com <code>/atalho</code> no chat.
            </p>
          ) : (
            replies.map((r) => (
              <div key={r.id} className="group relative px-4 py-2.5 border-b border-gray-50 hover:bg-[#F8FAFF]">
                <button
                  type="button"
                  onClick={() => handlePick(r)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#002B5B]">{r.label}</span>
                    <span className="text-[10px] text-gray-400 font-mono">/{r.shortcut}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{r.body}</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(r.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-3 text-red-400 hover:text-red-600"
                  aria-label="Excluir"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
