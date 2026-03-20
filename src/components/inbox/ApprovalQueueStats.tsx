import { Card, CardContent } from "@/components/ui/card";
import type { InboxProperty } from "./PropertyCard";

const ApprovalQueueStats = ({ items }: { items: InboxProperty[] }) => {
  const pending = items.filter((item) => item.status === "pending").length;
  const editing = items.filter((item) => item.status === "editing").length;
  const approved = items.filter((item) => item.status === "approved").length;
  const published = items.filter((item) => item.status === "published").length;

  const stats = [
    ["Novos", pending, "aguardando triagem inicial"],
    ["Em edição", editing, "em preparação de copy e arte"],
    ["Aprovados", approved, "prontos para postagem"],
    ["Postados", published, "já convertidos em publicação"],
  ];

  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map(([label, value, desc]) => (
        <Card key={String(label)} className="border-border/60">
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

export default ApprovalQueueStats;
