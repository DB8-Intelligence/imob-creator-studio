/**
 * LeadsMapView.tsx — Mapa de leads (placeholder)
 *
 * Futuro: integrar com Mapbox/Google Maps para mostrar pins
 * dos imóveis de interesse dos leads com clustering.
 */
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import type { Lead } from "@/types/lead";

interface LeadsMapViewProps {
  leads: Lead[];
}

export function LeadsMapView({ leads }: LeadsMapViewProps) {
  const leadsWithProperty = leads.filter((l) => l.imovel_interesse_nome);

  return (
    <div className="space-y-4">
      {/* Map placeholder */}
      <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 aspect-[16/9] max-h-[500px] flex flex-col items-center justify-center gap-3">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
          <MapPin className="w-8 h-8 text-accent" />
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground">Mapa de Leads</p>
          <p className="text-sm text-muted-foreground mt-1">
            Integração com mapa em breve. {leadsWithProperty.length} lead{leadsWithProperty.length !== 1 ? "s" : ""} com imóvel vinculado.
          </p>
        </div>
        <Badge variant="outline">Em desenvolvimento</Badge>
      </div>

      {/* Preview list */}
      {leadsWithProperty.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Leads com imóvel de interesse
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {leadsWithProperty.map((lead) => (
              <div key={lead.id} className="rounded-xl border border-border p-3 flex items-start gap-3">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{lead.nome}</p>
                  <p className="text-xs text-muted-foreground truncate">{lead.imovel_interesse_nome}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
