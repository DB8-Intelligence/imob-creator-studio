/**
 * automation.ts — Tipos de automação de conteúdo (DEV-26)
 *
 * Entidades: automation_rules (regras) + automation_logs (execuções).
 * Integração: n8n scheduler → automation-trigger → generate-dispatch.
 */

export type AutomationGenerationType = "post" | "video";
export type AutomationFrequency = "daily" | "weekly" | "manual";
export type AutomationLogStatus = "pending" | "running" | "success" | "error";

/** Regra de automação de conteúdo */
export interface AutomationRule {
  id: string;
  user_id: string;
  workspace_id: string;
  property_id: string | null;
  generation_type: AutomationGenerationType;
  template_id: string | null;
  preset: string | null;
  mood: string | null;
  engine_id: string | null;
  frequency: AutomationFrequency;
  is_active: boolean;
  name: string;
  created_at: string;
  updated_at: string;
}

/** Log de execução de automação */
export interface AutomationLog {
  id: string;
  automation_id: string;
  status: AutomationLogStatus;
  asset_id: string | null;
  job_id: string | null;
  error: string | null;
  created_at: string;
}

/** Payload que o n8n envia para automation-trigger */
export interface AutomationTriggerPayload {
  automation_id: string;
  property_id?: string;
  template_id?: string;
  generation_type: AutomationGenerationType;
  engine_id?: string;
  preset?: string;
  mood?: string;
  automation: true;
}

/** Campos editáveis ao criar/atualizar uma regra */
export interface AutomationRuleInput {
  name: string;
  property_id?: string | null;
  generation_type: AutomationGenerationType;
  template_id?: string | null;
  preset?: string | null;
  mood?: string | null;
  engine_id?: string | null;
  frequency: AutomationFrequency;
  is_active?: boolean;
}
