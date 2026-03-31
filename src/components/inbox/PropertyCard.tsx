import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit3, XCircle, PlayCircle, ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatusBadge, { type PropertyStatus } from "./StatusBadge";

export interface InboxProperty {
  id: string;
  title: string;
  description?: string;
  status: PropertyStatus;
  images?: string[];
  created_at?: string;
  final_image?: string;
  instagram_url?: string;
  property_type?: string;
  property_standard?: string;
  city?: string;
  neighborhood?: string;
  investment_value?: number | null;
  built_area_m2?: number | null;
  highlights?: string;
}

interface PropertyCardProps {
  property: InboxProperty;
  onUpdateStatus: (id: string, status: PropertyStatus) => void;
  isUpdating: boolean;
}

const PropertyCard = ({ property, onUpdateStatus, isUpdating }: PropertyCardProps) => {
  const navigate = useNavigate();
  const imageCount = property.images?.length || 0;
  const firstImage = property.images?.[0];
  const truncatedDesc = property.description
    ? property.description.length > 140
      ? property.description.slice(0, 140) + "…"
      : property.description
    : "Sem descrição";

  const formattedDate = property.created_at
    ? new Date(property.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    : "Recente";

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Image preview */}
      <div className="relative aspect-video bg-muted">
        {firstImage ? (
          <img
            src={firstImage}
            alt={property.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ImageIcon className="w-10 h-10" />
          </div>
        )}
        {imageCount > 0 && (
          <Badge className="absolute top-2 right-2 bg-black/60 text-white border-none text-xs">
            {imageCount} foto{imageCount > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm text-foreground line-clamp-1">{property.title}</h3>
          <StatusBadge status={property.status} />
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">{truncatedDesc}</p>

        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground/70">{formattedDate}</p>
          {property.city && (
            <p className="text-[11px] text-muted-foreground/70">{property.city}</p>
          )}
        </div>

        {property.highlights && (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-2">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Destaque</p>
            <p className="text-xs text-foreground mt-1 line-clamp-2">{property.highlights}</p>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            variant="default"
            className="flex-1 text-xs"
            onClick={() => navigate(`/editor/${property.id}`)}
          >
            <Edit3 className="w-3.5 h-3.5 mr-1" />
            Editar
          </Button>
          {property.status === "new" && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(property.id, "processing")}
            >
              <PlayCircle className="w-3.5 h-3.5 mr-1" />
              Iniciar
            </Button>
          )}
          {property.status === "ready" && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs text-amber-500 border-amber-500/40 hover:bg-amber-500/10"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(property.id, "approved")}
            >
              Aprovar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
