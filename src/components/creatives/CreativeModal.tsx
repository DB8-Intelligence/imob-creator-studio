import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Download,
  MessageCircle,
  CheckCircle2,
  Calendar,
  Send,
  Loader2,
  Lock,
  RefreshCw,
} from "lucide-react";
import { useCreativeActions } from "@/hooks/useCreativeActions";
import { useModules } from "@/hooks/useModuleAccess";
import { UpgradePrompt } from "./UpgradePrompt";
import { RestorationBadgeWithTooltip } from "@/components/disclaimers/RestorationDisclaimer";
import type { Creative } from "@/hooks/useCreativesGallery";

interface CreativeModalProps {
  creative: Creative | null;
  formats: { label: string; url: string }[];
  onClose: () => void;
  onRefresh: () => void;
}

export function CreativeModal({
  creative,
  formats,
  onClose,
  onRefresh,
}: CreativeModalProps) {
  const [selectedFormat, setSelectedFormat] = useState(0);
  const [editingCaption, setEditingCaption] = useState(false);
  const [caption, setCaption] = useState(creative?.caption ?? "");
  const [scheduleDate, setScheduleDate] = useState("");
  const [upgradeAction, setUpgradeAction] = useState<string | null>(null);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState("");

  const { can } = useModules();
  const actions = useCreativeActions(onRefresh);
  const isLoading = actions.loading === creative?.id;

  if (!creative) return null;

  const handleAction = async (
    action: () => Promise<{ blocked: boolean; reason?: string }>,
    upgradeKey: string
  ) => {
    const result = await action();
    if (result.blocked) setUpgradeAction(upgradeKey);
  };

  return (
    <>
      <Dialog open={!!creative} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {creative.template_name} — Todos os Formatos
            </DialogTitle>
          </DialogHeader>

          {/* Format tabs */}
          {formats.length > 1 && (
            <div className="flex gap-3 pb-2 border-b">
              {formats.map((f, i) => (
                <button
                  key={f.label}
                  onClick={() => setSelectedFormat(i)}
                  className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    selectedFormat === i
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFormat === i}
                    readOnly
                    className="w-3.5 h-3.5"
                  />
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {/* Preview image */}
          <div className="relative flex justify-center bg-gray-50 rounded-xl p-4">
            {formats[selectedFormat]?.url ? (
              <img
                src={formats[selectedFormat].url}
                alt={formats[selectedFormat].label}
                className="max-h-80 object-contain rounded-lg shadow"
              />
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
            {creative.restoration_applied && (
              <RestorationBadgeWithTooltip position="bottom-right" />
            )}
          </div>

          {/* Caption */}
          {creative.caption && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Legenda</p>
                {can.approveCreative() && (
                  <button
                    onClick={() => setEditingCaption(!editingCaption)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {editingCaption ? "Cancelar" : "Editar"}
                  </button>
                )}
              </div>
              {editingCaption ? (
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                  className="text-sm"
                />
              ) : (
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                  {creative.caption}
                </p>
              )}
              {creative.hashtags && (
                <p className="text-xs text-blue-500">{creative.hashtags}</p>
              )}
            </div>
          )}

          {/* Schedule input */}
          {can.scheduleCreative() && creative.status === "approved" && (
            <div className="flex items-center gap-2">
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="flex-1 text-sm border rounded-lg px-3 py-2"
                min={new Date().toISOString().slice(0, 16)}
              />
              <Button
                size="sm"
                disabled={!scheduleDate || isLoading}
                onClick={() =>
                  handleAction(
                    () => actions.schedule(creative, new Date(scheduleDate)),
                    "schedule"
                  )
                }
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Calendar className="h-3 w-3" />
                )}
                Agendar
              </Button>
            </div>
          )}

          {/* WhatsApp phone input */}
          {showPhoneInput && (
            <div className="flex items-center gap-2">
              <input
                type="tel"
                placeholder="55 71 99999-9999"
                value={whatsappPhone}
                onChange={(e) =>
                  setWhatsappPhone(e.target.value.replace(/\D/g, ""))
                }
                className="flex-1 text-sm border rounded-lg px-3 py-2"
              />
              <Button
                size="sm"
                disabled={whatsappPhone.length < 10}
                onClick={() => {
                  handleAction(
                    () => actions.sendWhatsApp(creative, whatsappPhone),
                    "whatsapp"
                  );
                  setShowPhoneInput(false);
                }}
              >
                Enviar
              </Button>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() =>
                handleAction(() => actions.download(creative), "download")
              }
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" /> Baixar
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPhoneInput(!showPhoneInput)}
              className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
            <Button
              variant={can.approveCreative() ? "outline" : "ghost"}
              disabled={isLoading}
              onClick={() =>
                handleAction(
                  () =>
                    actions.approve(
                      creative,
                      editingCaption ? caption : undefined
                    ),
                  "approve"
                )
              }
              className={`flex items-center gap-2 ${!can.approveCreative() ? "opacity-60" : ""}`}
            >
              {can.approveCreative() ? (
                <CheckCircle2 className="h-4 w-4 text-purple-600" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              Aprovar
            </Button>
            <Button
              disabled={isLoading || creative.status !== "approved"}
              onClick={() =>
                handleAction(() => actions.publishNow(creative), "publish")
              }
              className={`flex items-center gap-2 ${
                can.publishSocial()
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90"
                  : "opacity-60"
              }`}
            >
              {can.publishSocial() ? (
                <Send className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              Publicar IG/FB
            </Button>
            <Button
              variant="ghost"
              className="col-span-2 flex items-center gap-2 text-gray-500"
            >
              <RefreshCw className="h-4 w-4" /> Criar variação
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {upgradeAction && (
        <UpgradePrompt
          open={!!upgradeAction}
          onClose={() => setUpgradeAction(null)}
          blockedAction={
            upgradeAction as
              | "approve"
              | "schedule"
              | "publish"
              | "portal"
              | "xml"
          }
        />
      )}
    </>
  );
}
