import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ImageIcon } from "lucide-react";

interface RecentCreativeItem {
  id: string;
  name: string;
  format: string;
  status: string | null;
  created_at: string;
  exported_url: string | null;
  property_id: string | null;
  properties: { title: string } | null;
}

const FORMAT_LABELS: Record<string, string> = {
  feed_square: "Feed",
  feed_portrait: "Feed",
  story: "Story",
  carousel: "Carrossel",
  reels: "Reels",
  facebook_cover: "Facebook",
};

const relativeDate = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Hoje";
  if (days === 1) return "Ontem";
  return `${days} dias atrás`;
};

const RecentOperationsSection = ({ items }: { items: RecentCreativeItem[] }) => {
  const navigate = useNavigate();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Operações recentes</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Acompanhe os últimos criativos gerados e reabra rapidamente o fluxo.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/library")}>
          Ver biblioteca
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-sm">Nenhuma operação recente ainda.</p>
            <Button className="mt-3" size="sm" onClick={() => navigate("/upload")}>
              Gerar primeiro criativo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {items.map((creative) => (
            <Card
              key={creative.id}
              className="hover:shadow-soft transition-shadow cursor-pointer"
              onClick={() => creative.property_id && navigate(`/editor/${creative.property_id}`)}
            >
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {creative.exported_url ? (
                    <img src={creative.exported_url} alt={creative.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-medium text-foreground truncate">
                      {creative.properties?.title ?? creative.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {FORMAT_LABELS[creative.format] ?? creative.format} • {relativeDate(creative.created_at)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      creative.status === "published" ? "default" :
                      creative.status === "scheduled" ? "secondary" : "outline"
                    }
                    className="text-xs shrink-0"
                  >
                    {creative.status === "published" ? "Publicado" :
                     creative.status === "scheduled" ? "Agendado" : "Rascunho"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default RecentOperationsSection;
