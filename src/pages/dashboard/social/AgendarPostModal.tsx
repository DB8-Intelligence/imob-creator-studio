import { useState } from "react";
import { CalendarPlus, Instagram, Facebook, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface AgendarPostModalProps {
  open: boolean;
  onClose: () => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AgendarPostModal({
  open,
  onClose,
}: AgendarPostModalProps) {
  const { user } = useAuth();
  const { workspaceId } = useWorkspaceContext();
  const { toast } = useToast();

  const [platform, setPlatform] = useState("instagram");
  const [format, setFormat] = useState("feed");
  const [caption, setCaption] = useState(
    "Apartamento incrivel com vista para o mar. Agende sua visita!"
  );
  const [hashtags, setHashtags] = useState(
    "#imoveis #apartamento #venda #imobiliaria"
  );
  const [scheduledAt, setScheduledAt] = useState("");
  const [saving, setSaving] = useState(false);

  /* ---- Submit ---- */
  const handleSubmit = async () => {
    if (!scheduledAt) {
      toast({
        title: "Selecione data e hora",
        description: "Informe quando deseja publicar.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const payload = {
        user_id: user?.id,
        workspace_id: workspaceId,
        platform,
        format,
        caption,
        hashtags,
        scheduled_at: new Date(scheduledAt).toISOString(),
        status: "scheduled",
      };

      const { error } = await supabase
        .from("publication_queue" as any)
        .insert([payload] as any);

      if (error) {
        console.warn("publication_queue insert:", error.message);
        toast({
          title: "Erro ao agendar",
          description:
            error.message.includes("does not exist")
              ? "Tabela publication_queue ainda nao existe. Contate o suporte."
              : error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Publicacao agendada com sucesso!" });
        // Reset form
        setPlatform("instagram");
        setFormat("feed");
        setCaption(
          "Apartamento incrivel com vista para o mar. Agende sua visita!"
        );
        setHashtags("#imoveis #apartamento #venda #imobiliaria");
        setScheduledAt("");
        onClose();
      }
    } catch {
      toast({
        title: "Erro inesperado",
        description: "Nao foi possivel agendar a publicacao.",
        variant: "destructive",
      });
    }

    setSaving(false);
  };

  /* ---- Preview color by platform ---- */
  const previewGradient =
    platform === "facebook"
      ? "from-blue-600 to-blue-400"
      : platform === "both"
      ? "from-purple-600 via-pink-500 to-blue-500"
      : "from-purple-600 via-pink-500 to-orange-400";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#002B5B] flex items-center gap-2">
            <CalendarPlus className="h-5 w-5" />
            Agendar Publicacao
          </DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para agendar um novo post.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Platform */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#002B5B]">
              Plataforma
            </Label>
            <RadioGroup
              value={platform}
              onValueChange={setPlatform}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="instagram" id="platform-ig" />
                <Label
                  htmlFor="platform-ig"
                  className="flex items-center gap-1 text-sm cursor-pointer"
                >
                  <Instagram className="h-4 w-4 text-pink-500" />
                  Instagram
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="facebook" id="platform-fb" />
                <Label
                  htmlFor="platform-fb"
                  className="flex items-center gap-1 text-sm cursor-pointer"
                >
                  <Facebook className="h-4 w-4 text-blue-600" />
                  Facebook
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="both" id="platform-both" />
                <Label
                  htmlFor="platform-both"
                  className="text-sm cursor-pointer"
                >
                  Ambos
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Format */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#002B5B]">
              Formato
            </Label>
            <RadioGroup
              value={format}
              onValueChange={setFormat}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="feed" id="format-feed" />
                <Label htmlFor="format-feed" className="text-sm cursor-pointer">
                  Feed
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="story" id="format-story" />
                <Label htmlFor="format-story" className="text-sm cursor-pointer">
                  Story
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="reel" id="format-reel" />
                <Label htmlFor="format-reel" className="text-sm cursor-pointer">
                  Reel
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label
              htmlFor="caption"
              className="text-sm font-semibold text-[#002B5B]"
            >
              Legenda
            </Label>
            <Textarea
              id="caption"
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Escreva a legenda do post..."
            />
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <Label
              htmlFor="hashtags"
              className="text-sm font-semibold text-[#002B5B]"
            >
              Hashtags
            </Label>
            <Input
              id="hashtags"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#imoveis #apartamento"
            />
          </div>

          {/* Date / time */}
          <div className="space-y-2">
            <Label
              htmlFor="scheduled-at"
              className="text-sm font-semibold text-[#002B5B]"
            >
              Data / Hora
            </Label>
            <Input
              id="scheduled-at"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#002B5B]">
              Preview
            </Label>
            <div
              className={`h-40 rounded-lg bg-gradient-to-br ${previewGradient} flex items-center justify-center`}
            >
              <div className="text-center text-white/80 px-4">
                <p className="text-sm font-medium line-clamp-2">
                  {caption || "Legenda do post"}
                </p>
                <p className="text-[11px] mt-1 opacity-70">
                  {format.toUpperCase()} ·{" "}
                  {platform === "both"
                    ? "Instagram + Facebook"
                    : platform.charAt(0).toUpperCase() + platform.slice(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button
            className="w-full bg-[#002B5B] hover:bg-[#001d3d] text-white gap-2"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Agendando...
              </>
            ) : (
              <>
                <CalendarPlus className="h-4 w-4" />
                Agendar Publicacao
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
