/**
 * LPQrCodeModal — modal com QR Code da URL pública da LP.
 * Corretor pode imprimir em cartazes, panfletos, outdoors.
 * Download PNG + copiar link.
 */
import { useCallback, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Download, ExternalLink, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LPQrCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  /** Título pra mostrar no modal (nome do imóvel, etc). */
  title: string;
}

export default function LPQrCodeModal({
  open, onOpenChange, slug, title,
}: LPQrCodeModalProps) {
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  const url = `${window.location.origin}/imovel/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link copiado!" });
  };

  const handleDownload = useCallback(() => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qrcode-${slug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({ title: "QR Code baixado" });
  }, [slug, toast]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code da Landing Page
          </DialogTitle>
          <DialogDescription>
            Baixe e imprima em cartazes, panfletos ou outdoors. Quem escanear
            vai direto pra página de "{title}".
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {/* QR Code */}
          <div
            ref={containerRef}
            className="rounded-lg border border-border bg-white p-6 shadow-sm"
          >
            <QRCodeCanvas
              value={url}
              size={240}
              level="H"
              marginSize={2}
              imageSettings={{
                src: "/favicon.ico",
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>

          {/* URL */}
          <div className="w-full">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              URL pública
            </label>
            <div className="mt-1 flex gap-2">
              <Input value={url} readOnly className="font-mono text-xs" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
                aria-label="Copiar link"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                asChild
                aria-label="Abrir em nova aba"
              >
                <a href={url} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <p className="text-center text-[11px] text-muted-foreground">
            Dica: o QR Code tem nível de correção alto (30%), funciona mesmo
            com manchas ou dobras. Imprima em no mínimo 3×3 cm.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Baixar PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
