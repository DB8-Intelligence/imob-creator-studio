/**
 * MaxPagePlaceholder.tsx — Placeholder para páginas do Dashboard MAX
 *
 * Usado enquanto os prompts de cada janela ainda não foram enviados.
 * Mostra título, descrição e breadcrumb da seção.
 */
import AppLayout from "@/components/app/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Construction } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MaxPagePlaceholderProps {
  sectionEmoji: string;
  sectionLabel: string;
  pageTitle: string;
  pageDescription: string;
  icon?: LucideIcon;
}

export function MaxPagePlaceholder({
  sectionEmoji,
  sectionLabel,
  pageTitle,
  pageDescription,
  icon: Icon,
}: MaxPagePlaceholderProps) {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <span>{sectionEmoji} {sectionLabel}</span>
          <span>/</span>
          <span className="text-foreground font-medium">{pageTitle}</span>
        </div>

        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          {Icon && (
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-6 h-6 text-accent" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
            <p className="text-muted-foreground mt-1">{pageDescription}</p>
          </div>
        </div>

        {/* Placeholder content */}
        <div className="rounded-2xl border-2 border-dashed border-border p-16 text-center">
          <Construction className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-medium text-foreground text-lg">Em construção</p>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Esta página será implementada em breve. A estrutura de navegação já está configurada.
          </p>
          <Badge variant="outline" className="mt-4">
            Dashboard MAX
          </Badge>
        </div>
      </div>
    </AppLayout>
  );
}
