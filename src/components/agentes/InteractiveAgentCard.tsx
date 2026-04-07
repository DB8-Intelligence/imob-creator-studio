/**
 * InteractiveAgentCard.tsx — Card de agente interativo
 *
 * Mostra: emoji, nome, subtitulo, categoria, exemplos, botão executar.
 */
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InteractiveAgentDef } from "@/config/interactive-agents";

interface InteractiveAgentCardProps {
  agent: InteractiveAgentDef;
  memoryCount: number;
  onExecute: (agent: InteractiveAgentDef) => void;
}

export function InteractiveAgentCard({ agent, memoryCount, onExecute }: InteractiveAgentCardProps) {
  return (
    <Card className={cn("border transition-all hover:shadow-md hover:-translate-y-0.5 group", agent.corBg)}>
      <CardContent className="p-5 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{agent.emoji}</span>
            <div>
              <h3 className="font-semibold text-foreground text-sm">{agent.nome}</h3>
              <p className="text-[11px] text-muted-foreground">{agent.subtitulo}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-[9px]">{agent.categoria}</Badge>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-3 flex-1">
          {agent.descricao}
        </p>

        {/* Example prompts */}
        <div className="mb-4">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wide font-semibold mb-1.5">Exemplos:</p>
          <div className="space-y-1">
            {agent.exemplos.slice(0, 3).map((ex) => (
              <p key={ex} className="text-[11px] text-muted-foreground truncate">
                &ldquo;{ex}&rdquo;
              </p>
            ))}
          </div>
        </div>

        {/* Footer: memory badge + execute button */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          {memoryCount > 0 ? (
            <Badge variant="outline" className="text-[9px] gap-1">
              <Brain className="w-3 h-3" />
              {memoryCount} memória{memoryCount !== 1 ? "s" : ""}
            </Badge>
          ) : (
            <span className="text-[10px] text-muted-foreground">Sem memória ainda</span>
          )}
          <Button
            size="sm"
            onClick={() => onExecute(agent)}
            className={cn("text-xs h-8 gap-1.5", agent.cor.replace("text-", "bg-").replace("-500", "-500") + " hover:opacity-90 text-white")}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Conversar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
