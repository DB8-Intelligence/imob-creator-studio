import { Card, CardContent } from "@/components/ui/card";
import type { InboxProperty } from "@/components/inbox/PropertyCard";

const PublicationStatsRow = ({ items }: { items: InboxProperty[] }) => {
  const approved = items.filter((item) => item.status === "approved").length;
  const published = items.filter((item) => item.status === "published").length;
  const error = items.filter((item) => item.status === "error").length;

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {[
        ["Aprovados", approved, "fila pronta para postagem"],
        ["Publicados", published, "prova operacional concluída"],
        ["Erros", error, "itens que pedem correção"],
      ].map(([label, value, desc]) => (
        <Card key={String(label)}>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="text-3xl font-display font-bold text-foreground mt-2">{value as number}</p>
            <p className="text-sm text-muted-foreground mt-2">{String(desc)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PublicationStatsRow;
