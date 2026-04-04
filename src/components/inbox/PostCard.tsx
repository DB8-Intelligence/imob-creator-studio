import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/inbox/StatusBadge";
import type { InboxProperty } from "@/components/inbox/PropertyCard";
import { ImageIcon, ExternalLink, RotateCcw, Loader2, AlertCircle } from "lucide-react";
import { ShareButton } from "@/components/share/ShareButton";

interface PostCardProps {
  property: InboxProperty;
  isHighlighted?: boolean;
  isRetrying?: boolean;
  onRetry?: (id: string) => void;
}

const PostCard = ({ property, isHighlighted, isRetrying, onRetry }: PostCardProps) => {
  const coverImage = property.final_image || property.images?.[0];
  const createdAt = property.created_at
    ? new Date(property.created_at).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <Card className={`overflow-hidden transition-shadow hover:shadow-md ${isHighlighted ? "ring-2 ring-primary" : ""}`}>
      <div className="relative aspect-video bg-muted">
        {coverImage ? (
          <img
            src={coverImage}
            alt={property.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ImageIcon className="w-10 h-10" />
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm text-foreground line-clamp-1">{property.title}</h3>
            {createdAt && (
              <p className="text-xs text-muted-foreground mt-0.5">{createdAt}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <StatusBadge status={property.status} />
            {coverImage && (property.status === "generated" || property.status === "published") && (
              <ShareButton
                imageUrl={coverImage}
                caption={property.description ?? undefined}
                filename={`${property.title ?? "imagem"}.jpg`}
                size="sm"
                variant="ghost"
              />
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">
          {property.description || "Sem descrição"}
        </p>

        {property.status === "error" && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="w-3 h-3" /> Erro na publicação
            </div>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                disabled={isRetrying}
                onClick={() => onRetry(property.id)}
              >
                {isRetrying ? (
                  <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Reenviando...</>
                ) : (
                  <><RotateCcw className="w-3 h-3 mr-1" /> Tentar novamente</>
                )}
              </Button>
            )}
          </div>
        )}

        {property.status === "published" && property.instagram_url && (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            asChild
          >
            <a href={property.instagram_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3 mr-1" /> Ver no Instagram
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;
