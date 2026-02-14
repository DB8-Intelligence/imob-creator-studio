import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Send, X } from "lucide-react";

interface PublishPreviewModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isConfirming: boolean;
  imageUrl: string | null;
  propertyTitle: string;
}

const PublishPreviewModal = ({
  open,
  onClose,
  onConfirm,
  isConfirming,
  imageUrl,
  propertyTitle,
}: PublishPreviewModalProps) => {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirmar Publicação</DialogTitle>
          <DialogDescription>
            Revise a arte gerada antes de publicar no Instagram.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm font-medium text-foreground">{propertyTitle}</p>

          {imageUrl ? (
            <div className="rounded-lg overflow-hidden border bg-muted">
              <img
                src={imageUrl}
                alt="Arte final"
                className="w-full h-auto object-contain max-h-[400px]"
              />
            </div>
          ) : (
            <div className="h-64 rounded-lg bg-muted flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isConfirming}>
            <X className="w-4 h-4 mr-1" /> Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isConfirming || !imageUrl}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isConfirming ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publicando...</>
            ) : (
              <><Send className="w-4 h-4 mr-2" /> Confirmar Publicação</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PublishPreviewModal;
