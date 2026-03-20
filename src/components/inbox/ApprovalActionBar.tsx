import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink, Sparkles } from "lucide-react";

interface ApprovalActionBarProps {
  onGoToPosts: () => void;
  onGoToCreate: () => void;
}

const ApprovalActionBar = ({ onGoToPosts, onGoToCreate }: ApprovalActionBarProps) => {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <p className="font-semibold text-foreground">Fila de aprovação ativa</p>
        <p className="text-sm text-muted-foreground mt-1">
          Use esta área para revisar o que entrou, mover para aprovação e acompanhar o que já virou publicação.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={onGoToCreate}>
          <Sparkles className="w-4 h-4 mr-2" />
          Novo criativo
        </Button>
        <Button onClick={onGoToPosts}>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Ver aprovações/publicações
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default ApprovalActionBar;
