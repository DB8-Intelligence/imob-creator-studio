import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Copy, ExternalLink, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Portal {
  slug: string;
  name: string;
  logo: string;
  active: boolean;
  listings: number;
  featured: number;
  lastUpdate: string | null;
}

const PORTALS: Portal[] = [
  { slug: "zap", name: "ZAP Imóveis", logo: "🟡", active: true, listings: 0, featured: 0, lastUpdate: null },
  { slug: "olx", name: "OLX Imóveis", logo: "🟠", active: true, listings: 0, featured: 0, lastUpdate: null },
  { slug: "vivareal", name: "VivaReal", logo: "🔵", active: true, listings: 0, featured: 0, lastUpdate: null },
  { slug: "imovelweb", name: "ImovelWeb", logo: "🟢", active: false, listings: 0, featured: 0, lastUpdate: null },
  { slug: "chavesnamao", name: "Chaves na Mão", logo: "🔑", active: false, listings: 0, featured: 0, lastUpdate: null },
  { slug: "mitula", name: "Mitula", logo: "🔷", active: false, listings: 0, featured: 0, lastUpdate: null },
  { slug: "trovit", name: "Trovit", logo: "🟣", active: false, listings: 0, featured: 0, lastUpdate: null },
  { slug: "quercasa", name: "QuerCasa", logo: "🏡", active: false, listings: 0, featured: 0, lastUpdate: null },
];

interface PortaisPanelProps {
  workspaceSlug?: string;
}

export function PortaisPanel({ workspaceSlug }: PortaisPanelProps) {
  const { toast } = useToast();
  const [portals, setPortals] = useState(PORTALS);

  const feedBaseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-xml-feed`;

  const togglePortal = (slug: string) => {
    setPortals((prev) =>
      prev.map((p) => (p.slug === slug ? { ...p, active: !p.active } : p))
    );
  };

  const copyFeedUrl = (portalSlug: string) => {
    const url = `${feedBaseUrl}?workspace=${workspaceSlug ?? "meu-workspace"}&portal=${portalSlug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "URL copiada!", description: url });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5 text-accent" />
          Portais Imobiliários
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {portals.map((portal) => (
          <div
            key={portal.slug}
            className="flex items-center gap-3 p-3 rounded-lg border"
          >
            <span className="text-2xl">{portal.logo}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{portal.name}</p>
                <Badge
                  variant="outline"
                  className={
                    portal.active
                      ? "text-green-600 border-green-300 text-[10px]"
                      : "text-gray-400 border-gray-200 text-[10px]"
                  }
                >
                  {portal.active ? (
                    <>
                      <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                      Ativo
                    </>
                  ) : (
                    "Inativo"
                  )}
                </Badge>
              </div>
              <div className="flex gap-4 mt-1 text-xs text-gray-500">
                <span>{portal.listings} imóveis</span>
                <span>{portal.featured} destaques</span>
                {portal.lastUpdate && (
                  <span>
                    Atualizado:{" "}
                    {new Date(portal.lastUpdate).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => copyFeedUrl(portal.slug)}
              >
                <Copy className="h-3 w-3 mr-1" />
                XML
              </Button>
              <Switch
                checked={portal.active}
                onCheckedChange={() => togglePortal(portal.slug)}
              />
            </div>
          </div>
        ))}

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-600 mb-1">
            URL base do feed XML:
          </p>
          <code className="text-xs text-gray-500 break-all">
            {feedBaseUrl}?workspace={workspaceSlug ?? "[seu-slug]"}&portal=[portal]
          </code>
        </div>
      </CardContent>
    </Card>
  );
}
