import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Calendar, Instagram, Globe, type LucideIcon } from "lucide-react";

interface UpgradePromptProps {
  open: boolean;
  onClose: () => void;
  blockedAction: "approve" | "schedule" | "publish" | "portal" | "xml";
}

const UPGRADE_CONTENT: Record<
  string,
  {
    title: string;
    desc: string;
    features: string[];
    plan: string;
    price: string;
    icon: LucideIcon;
  }
> = {
  approve: {
    title: "Aprove e personalize seus criativos",
    desc: "No plano Básico você revisa a legenda e aprova antes de publicar.",
    features: [
      "Editar legenda e copy",
      "Solicitar ajuste de layout",
      "Histórico de aprovações",
    ],
    plan: "Básico",
    price: "R$197/mês",
    icon: Zap,
  },
  schedule: {
    title: "Agende suas publicações",
    desc: "Programe posts para o melhor horário do seu público.",
    features: [
      "Calendário de publicações",
      "Melhor horário sugerido por IA",
      "Fila de agendamentos",
    ],
    plan: "Básico",
    price: "R$197/mês",
    icon: Calendar,
  },
  publish: {
    title: "Publique direto no Instagram e Facebook",
    desc: "Conecte suas redes sociais e publique sem sair do NexoImob.",
    features: [
      "Publicação Instagram",
      "Publicação Facebook",
      "Relatório de alcance",
    ],
    plan: "Módulo Social",
    price: "R$59/mês",
    icon: Instagram,
  },
  portal: {
    title: "Seu portal imobiliário profissional",
    desc: "Tenha um site próprio com todos os seus imóveis.",
    features: [
      "Site com domínio próprio",
      "SEO automático por IA",
      "Imóvel aprovado → publicado",
    ],
    plan: "Módulo Site",
    price: "R$197/mês",
    icon: Globe,
  },
  xml: {
    title: "Distribua para todos os portais",
    desc: "Gere feed XML e envie para ZAP, OLX, VivaReal e ImovelWeb.",
    features: [
      "Feed XML automático",
      "ZAP + OLX + VivaReal + ImovelWeb",
      "Atualização em tempo real",
    ],
    plan: "Módulo Site",
    price: "R$197/mês",
    icon: Globe,
  },
};

export function UpgradePrompt({
  open,
  onClose,
  blockedAction,
}: UpgradePromptProps) {
  const content = UPGRADE_CONTENT[blockedAction];
  const Icon = content.icon;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center mb-2">
            <Icon className="h-6 w-6 text-yellow-600" />
          </div>
          <DialogTitle className="text-center">{content.title}</DialogTitle>
          <DialogDescription className="text-center">
            {content.desc}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {content.features.map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              {f}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <Badge className="bg-yellow-100 text-yellow-800 mb-1">
              {content.plan}
            </Badge>
            <p className="font-bold text-lg">{content.price}</p>
          </div>
          <Button
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
            onClick={() =>
              window.open("https://imobcreatorai.com.br/planos", "_blank")
            }
          >
            Ver planos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
