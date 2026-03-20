import { Card, CardContent } from "@/components/ui/card";

interface Item {
  label: string;
  value: string;
  description: string;
}

const ModuleMetricCards = ({ items }: { items: Item[] }) => {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.label} className="border-border/60">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
            <p className="text-2xl font-display font-bold text-foreground mt-2">{item.value}</p>
            <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ModuleMetricCards;
