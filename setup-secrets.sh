#!/usr/bin/env bash
# ============================================================
# setup-secrets.sh — Configura secrets das Supabase Edge Functions
# Projeto: imob-creator-studio (dsszhodrrchlaqfignky)
#
# ⚠️  NOTA IMPORTANTE: dsszhodrrchlaqfignky é um projeto Lovable.
#     Para acessar via CLI, faça login com a conta Lovable no Supabase.
#     Alternativamente, use este projeto de teste (já configurado):
#       spjnymdizezgmzwoskoj (ImobCreatorAi)
#       Functions deployadas: generate-reel-script, n8n-bridge
#       Secrets configurados: ANTHROPIC_API_KEY, N8N_WEBHOOK_URL
#
# Pré-requisitos (projeto Lovable):
#   1. Supabase CLI instalado:  npm install -g supabase
#   2. Login com conta Lovable: supabase login
#   3. Projeto linkado:         cd imob-creator-studio && supabase link --project-ref dsszhodrrchlaqfignky
#
# Uso: bash setup-secrets.sh
# ============================================================

set -e

PROJECT_REF="${SUPABASE_PROJECT_REF:-dsszhodrrchlaqfignky}"
N8N_WEBHOOK_URL="https://automacao.db8intelligence.com.br/webhook/db8intelligence-events"

echo "🔐 Configurando secrets para projeto Supabase: ${PROJECT_REF}"
echo ""

# ── Anthropic (Claude API) ────────────────────────────────────
echo "➡  ANTHROPIC_API_KEY..."
supabase secrets set \
  ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:?Defina a variável ANTHROPIC_API_KEY antes de executar}" \
  --project-ref "${PROJECT_REF}"

# ── n8n Webhook URL ───────────────────────────────────────────
echo "➡  N8N_WEBHOOK_URL..."
supabase secrets set \
  N8N_WEBHOOK_URL="${N8N_WEBHOOK_URL}" \
  --project-ref "${PROJECT_REF}"

# ── Supabase (Serviço interno — usado pelas edge functions) ───
# Nota: SUPABASE_URL e SUPABASE_ANON_KEY são injetados automaticamente
# pela plataforma Supabase. Não precisam ser setados manualmente.

echo ""
echo "✅ Secrets configurados com sucesso!"
echo ""
echo "Edge functions que usam ANTHROPIC_API_KEY:"
echo "  - generate-reel-script"
echo ""
echo "Edge functions que usam N8N_WEBHOOK_URL:"
echo "  - n8n-bridge  (fallback; usa hardcoded URL como padrão)"
echo ""
echo "Para aplicar as migrations SQL:"
echo "  supabase db push --project-ref ${PROJECT_REF}"
echo ""
echo "Para deploy das edge functions:"
echo "  supabase functions deploy n8n-bridge --project-ref ${PROJECT_REF} --no-verify-jwt"
echo "  supabase functions deploy generate-video --project-ref ${PROJECT_REF} --no-verify-jwt"
echo "  supabase functions deploy generate-reel-script --project-ref ${PROJECT_REF} --no-verify-jwt"
echo ""
echo "Para verificar secrets ativos:"
echo "  supabase secrets list --project-ref ${PROJECT_REF}"
echo ""
echo "⚡ ATALHO — Deploy completo automatizado:"
echo "   bash deploy.sh"
