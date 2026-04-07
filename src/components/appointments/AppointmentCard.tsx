/**
 * AppointmentCard.tsx — Card de agendamento para a visão "Hoje"
 *
 * Mostra: horário, lead, imóvel, endereço, status, botões Confirmar/Chegou
 */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Check, MapPin, Clock, User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  APPOINTMENT_STATUS_CONFIG,
  APPOINTMENT_TIPO_CONFIG,
  type Appointment,
  type AppointmentStatus,
} from "@/types/appointment";

interface AppointmentCardProps {
  appointment: Appointment;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onComplete: (appointment: Appointment) => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function AppointmentCard({ appointment: apt, onUpdateStatus, onComplete }: AppointmentCardProps) {
  const statusCfg = APPOINTMENT_STATUS_CONFIG[apt.status];
  const tipoCfg = APPOINTMENT_TIPO_CONFIG[apt.tipo];
  const whatsappUrl = apt.lead_telefone
    ? `https://wa.me/55${apt.lead_telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${apt.lead_nome}, confirmando nossa visita hoje às ${formatTime(apt.data_hora)}. Nos vemos lá!`)}`
    : null;

  const isPast = apt.status === "concluido" || apt.status === "nao_compareceu" || apt.status === "cancelado";

  return (
    <Card className={cn("transition-all", isPast && "opacity-60")}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Time block */}
          <div className="text-center flex-shrink-0 w-16">
            <p className="text-2xl font-bold text-foreground">{formatTime(apt.data_hora)}</p>
            <p className="text-[10px] text-muted-foreground">{apt.duracao}</p>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Lead + status */}
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-foreground">{apt.lead_nome}</p>
              <Badge variant="outline" className={cn("text-[10px]", statusCfg.bgColor)}>
                {statusCfg.emoji} {statusCfg.label}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {tipoCfg.emoji} {tipoCfg.label}
              </Badge>
            </div>

            {/* Property */}
            {apt.property_nome && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{apt.property_nome}</span>
              </div>
            )}

            {/* Address */}
            {apt.property_endereco && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{apt.property_endereco}</span>
              </div>
            )}

            {/* Notes */}
            {apt.notas && (
              <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-2.5 py-1.5">{apt.notas}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            {apt.status === "agendado" && (
              <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => onUpdateStatus(apt.id, "confirmado")}>
                <Check className="w-3.5 h-3.5 mr-1" />
                Confirmar
              </Button>
            )}
            {apt.status === "confirmado" && (
              <Button size="sm" className="text-xs h-8 bg-orange-500 hover:bg-orange-600 text-white" onClick={() => onUpdateStatus(apt.id, "em_andamento")}>
                <Clock className="w-3.5 h-3.5 mr-1" />
                Chegou
              </Button>
            )}
            {apt.status === "em_andamento" && (
              <Button size="sm" className="text-xs h-8 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => onComplete(apt)}>
                <Check className="w-3.5 h-3.5 mr-1" />
                Concluir
              </Button>
            )}
            {whatsappUrl && !isPast && (
              <Button size="sm" variant="ghost" className="text-xs h-8 text-green-600" onClick={() => window.open(whatsappUrl, "_blank")}>
                <MessageCircle className="w-3.5 h-3.5 mr-1" />
                Zap
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
