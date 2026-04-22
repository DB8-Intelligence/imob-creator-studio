# Criativos Pro — Spec Enxuto (reconciliado com o repo)

**Versão:** 1.0
**Data:** 2026-04-22
**Status:** Proposta — aguarda aprovação Douglas
**Substitui:** pacote `NEXOIMOB_SISTEMA_COMPLETO_FINAL.md` v1.1 (10-12 semanas)

---

## 1. Por que essa versão existe

A spec anterior (Claude.ai) projetou o sistema de criativos como se o repo estivesse vazio. Mas `imob-creator-studio` já tem ~50% da infra descrita:

| Spec original pedia | O repo já tem |
|---|---|
| Webhook Evolution API | `supabase/functions/whatsapp-events/` |
| Secretária/agente WhatsApp | `whatsapp-ai-reply` (Sprint 1+2 shipped) |
| Geração de imagem IA | `gerar-criativo`, `generate-art` (Gemini + DALL-E) |
| Geração de vídeo IA | `generate-video-v2` (Fal.ai / Flux Pro) |
| Galeria de criativos com status | `creatives_gallery` (`generating→approved→published`) |
| Publicação Instagram | `publish-social` (Graph API v18.0, container+publish) |
| Gating por plano | `ModuleProtectedRoute` + `user_subscriptions.module_id` |
| Ativação via pagamento | webhooks Kiwify + Asaas |

O que **não existe** e precisa ser construído: **pipeline end-to-end sincronizada** (foto chega → imóvel criado → criativo gerado → aprovado → publicado, sem intervenção manual entre passos), **aprovação bidirecional por WhatsApp**, **Vision pré-geração** para validar que é imóvel.

Escopo: **4-5 semanas**, não 10-12.

---

## 2. Correções obrigatórias vs spec original

1. **Tabelas:** usar `properties` / `profiles` / `workspaces` (existem) — **não** criar `imovel_listings` / `corretores` / `corretor_workspace_members`.
2. **Shotstack:** descartar. Gemini (imagem) + Fal.ai (vídeo) cobrem o caso. Menos uma dependência paga, menos uma API key pra rotacionar.
3. **`setTimeout(2min)` em Edge Function:** **não funciona** — invocação Deno morre. Substituir por:
   - Coluna `creatives_gallery.approval_deadline TIMESTAMPTZ`
   - `pg_cron` a cada minuto varrendo jobs vencidos (mesmo padrão do follow-up horário da Secretária Virtual).
4. **Número único de WhatsApp:** usar a instância Evolution que o corretor já conectou (`user_whatsapp_instances`), não criar número centralizado. O corretor envia pro **próprio bot**, não pra um número DB8. Isso elimina roteamento `phone → corretor_id` e fricção de cadastro adicional.

---

## 3. Arquitetura enxuta

```
Corretor → WhatsApp próprio (Evolution) → whatsapp-events
  │
  ├─ Detecta: foto + caption com intenção de cadastro
  │   (regra simples: caption contém R$ + endereço OU comando "/novo imóvel")
  │
  ├─ Cria linha em `properties` (source='whatsapp_intake', status='draft')
  ├─ Cria linha em `creatives_gallery` (status='analyzing', deadline=now()+2min)
  │
  ↓
[pipeline-criativo Edge Function] (chamada única, sequencial)
  │
  ├─ Etapa 1: Vision (Gemini/Claude) — valida que é imóvel, extrai metadados da foto
  ├─ Etapa 2: Claude parsa caption → preço, endereço, quartos, etc.
  ├─ Etapa 3: Claude gera copy + CTA por tipo de transação
  ├─ Etapa 4: Gemini/DALL-E gera arte (reusa `gerar-criativo`)
  ├─ Atualiza `creatives_gallery.status='pending_approval'`
  │
  ↓
Evolution envia pro WhatsApp do corretor:
  [imagem gerada] + "Aprovar? 👍 / Rejeitar 👎 / Editar no app: <link>"
  │
  ↓
whatsapp-events detecta resposta citando o job:
  ├─ 👍 ou "sim" → status='approved' → dispara `publish-social`
  ├─ 👎 ou "não" → status='rejected' + link pra editar
  │
  ↓
pg_cron a cada 1min:
  ├─ jobs com status='pending_approval' AND approval_deadline < now()
  │   → envia fallback texto "Ainda pendente — SIM/NÃO?"
  │   → prorroga deadline +3min (max 2 tentativas)
```

Edge functions a criar/estender:
- `pipeline-criativo` (nova) — orquestra etapas 1-4 em série
- `whatsapp-events` (estender) — detectar intenção de cadastro + resposta de aprovação
- `publish-social` (reusar, sem mudança)
- `criativos-sweep-deadline` (nova, cron) — fallback e expiração

---

## 4. Schema (delta mínimo)

```sql
-- properties: 1 coluna nova pra rastrear origem
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual'
    CHECK (source IN ('manual','import_xml','import_sheet','whatsapp_intake'));

-- creatives_gallery: 3 colunas pra pipeline + aprovação
ALTER TABLE creatives_gallery
  ADD COLUMN IF NOT EXISTS approval_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approval_reminders_sent INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS whatsapp_message_id TEXT; -- pra casar resposta com job

-- Status já existe: generating, ready, approved, scheduled, published, expired.
-- Adicionar: analyzing, pending_approval, rejected
ALTER TABLE creatives_gallery
  DROP CONSTRAINT IF EXISTS creatives_gallery_status_check;
ALTER TABLE creatives_gallery
  ADD CONSTRAINT creatives_gallery_status_check CHECK (status IN (
    'analyzing','generating','pending_approval','ready',
    'approved','rejected','scheduled','published','expired','error'
  ));

CREATE INDEX IF NOT EXISTS idx_creatives_pending_deadline
  ON creatives_gallery(approval_deadline)
  WHERE status = 'pending_approval';
```

Nenhuma tabela nova. Tudo se encaixa no que já existe.

---

## 5. Módulo e preço

Criar `module_id = 'criativos_pro'`. Três opções de posicionamento (decisão Douglas):

| Modelo | Prós | Contras |
|---|---|---|
| **A. Incluído no MAX** | Diferencial forte pro tier top, justifica upsell | Não monetiza direto |
| **B. Upgrade pago** (+R$X/mês sobre qualquer plano) | Receita incremental previsível, captura quem não precisa do MAX | Exige novo SKU Kiwify/Asaas |
| **C. Módulo standalone** (substitui plano) | Entrada barata, conversão via dor específica | Canibaliza MAX se preço baixo |

Recomendação: **B (upgrade)**. O gating já funciona por `module_id`, é só adicionar o SKU no Kiwify e o webhook já existente insere a subscription. Zero código de ativação novo.

---

## 6. Roadmap 4-5 semanas

| Semana | Entregas |
|---|---|
| **1** | Schema delta; estender `whatsapp-events` pra detectar intenção de cadastro; criar `properties` draft a partir de foto+caption; testes com 5 fotos reais |
| **2** | Edge function `pipeline-criativo` (Vision + parse + copy + geração); usar engines existentes; salvar em `creatives_gallery` |
| **3** | Aprovação WhatsApp bidirecional (detectar 👍/👎 citando job); `publish-social` dispara em status=approved; pg_cron de fallback |
| **4** | Página `/dashboard/criativos/:job_id` (preview + botões aprovar/rejeitar/editar); gating `module_id=criativos_pro`; SKU Kiwify |
| **5** | QA end-to-end (corretor externo real), ajustes de prompts, deploy produção, monitoramento 1ª semana |

Estimativa: **70-90h**. Comparar com os 210-250h do spec original.

---

## 7. Fora de escopo (fase 2, se pedir)

- Shotstack premium render (se Gemini não for suficiente pro visual de luxo)
- Analytics pós-publicação (impressões, engajamento) — já existe parcial em `publish-social`
- Edição inline da copy antes de aprovar
- Múltiplas variações (A/B) por job
- Fila com prioridade pra corretores MAX

---

## 8. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Corretor manda foto que não é imóvel | Vision valida; rejeita com mensagem clara |
| Corretor não responde em 2min → fica travado | pg_cron expira após 2 tentativas, libera status=`expired` |
| Resposta ambígua no WhatsApp | Só aceita 👍/👎/sim/não/aprovar/rejeitar. Outro → pede de novo |
| Caption incompleta (sem preço/endereço) | Parser Claude retorna `needs_more_info`; bot pede o que falta antes de gerar |
| Custo Gemini/DALL-E escalar | Gate por plano; limite mensal por corretor (config em `user_subscriptions.limits`) |
| Race condition (duas fotos ao mesmo tempo) | `whatsapp_message_id` casa resposta com job certo |

---

## 9. Decisão pedida

1. Aprovar este escopo enxuto → começar Sprint 1 (schema + intake)?
2. Escolher modelo de preço (A / B / C)?
3. Stand-by do pacote Claude.ai v1.1? (Guardar em `docs/` pra referência mas não seguir)
