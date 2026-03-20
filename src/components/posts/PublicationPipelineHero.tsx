import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PublicationPipelineHero = () => {
  return (
    <Card className="border-accent/20 bg-gradient-to-r from-accent/10 to-transparent">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge className="bg-accent text-accent-foreground">Publicar / Aprovar</Badge>
          <Badge variant="outline">Operação visível</Badge>
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground">
          Transforme aprovação em <span className="text-accent">feature premium</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-3xl">
          Esta área existe para mostrar que o IMOBCREATOR não para na geração: ele acompanha revisão, aprovação, agendamento e publicação.
        </p>
      </CardContent>
    </Card>
  );
};

export default PublicationPipelineHero;
