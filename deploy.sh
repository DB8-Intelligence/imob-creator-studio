#!/usr/bin/env bash
# ============================================================
# deploy.sh — Deploy completo do ImobCreator Studio
#
# O que este script faz (automaticamente):
#   1. Verifica autenticação Supabase CLI
#   2. Aplica migrations pendentes no banco de dados
#   3. Deploy das edge functions
#   4. Configura secrets necessários
#
# Pré-requisitos:
#   1. Supabase CLI instalado e autenticado com a conta correta
#      npm install -g @supabase/cli  (ou download do binário)
#      supabase login
#   2. Projeto linkado:
#      supabase link --project-ref spjnymdizezgmzwoskoj
#
# ⚠️  IMPORTANTE: O projeto spjnymdizezgmzwoskoj está na conta Lovable.
#     Para acesso, faça login com as credenciais Lovable:
#     https://supabase.com/dashboard/project/spjnymdizezgmzwoskoj
#
# Uso: bash deploy.sh
# ============================================================

set -e

# ── Configuração ─────────────────────────────────────────────
PROJECT_REF="${SUPABASE_PROJECT_REF:-spjnymdizezgmzwoskoj}"
N8N_WEBHOOK_URL="https://automacao.db8intelligence.com.br/webhook/db8intelligence-events"
ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:?Defina a variável ANTHROPIC_API_KEY antes de executar}"

echo "================================================================"
echo "  ImobCreator Studio — Deploy Automático"
echo "  Projeto: ${PROJECT_REF}"
echo "================================================================"
echo ""

# ── 1. Verifica autenticação ──────────────────────────────────
echo "1/5  Verificando autenticação Supabase..."
if ! supabase projects list --project-ref "${PROJECT_REF}" &>/dev/null 2>&1; then
  echo ""
  echo "❌ Erro: não foi possível acessar o projeto ${PROJECT_REF}"
  echo ""
  echo "   Execute: supabase login"
  echo "   Em seguida: supabase link --project-ref ${PROJECT_REF}"
  echo ""
  echo "   Se o projeto está no Lovable, faça login com as credenciais Lovable."
  exit 1
fi
echo "   ✅ Autenticado"
echo ""

# ── 2. Aplica migrations ──────────────────────────────────────
echo "2/5  Aplicando migrations do banco de dados..."
echo "     (inclui: workspaces, video_jobs, reel_script_logs)"
supabase db push --project-ref "${PROJECT_REF}"
echo "   ✅ Migrations aplicadas"
echo ""

# ── 3. Deploy das Edge Functions ──────────────────────────────
echo "3/5  Fazendo deploy das edge functions..."

echo "     → n8n-bridge"
supabase functions deploy n8n-bridge \
  --project-ref "${PROJECT_REF}" \
  --no-verify-jwt

echo "     → generate-video"
supabase functions deploy generate-video \
  --project-ref "${PROJECT_REF}" \
  --no-verify-jwt

echo "     → generate-reel-script"
supabase functions deploy generate-reel-script \
  --project-ref "${PROJECT_REF}" \
  --no-verify-jwt
echo "   ✅ Edge functions deployadas"
echo ""

# ── 4. Configura secrets ──────────────────────────────────────
echo "4/5  Configurando secrets das edge functions..."
supabase secrets set \
  ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY}" \
  N8N_WEBHOOK_URL="${N8N_WEBHOOK_URL}" \
  --project-ref "${PROJECT_REF}"
echo "   ✅ Secrets configurados"
echo ""

# ── 5. Verificação final ──────────────────────────────────────
echo "5/5  Verificando deploy..."
echo ""
echo "   Functions deployadas:"
supabase functions list --project-ref "${PROJECT_REF}" 2>/dev/null | grep -E "n8n-bridge|generate-video|generate-reel" || true
echo ""
echo "   Secrets ativos:"
supabase secrets list --project-ref "${PROJECT_REF}" 2>/dev/null | grep -E "ANTHROPIC|N8N" || true
echo ""

# ── Resultado ─────────────────────────────────────────────────
echo "================================================================"
echo "  ✅ DEPLOY CONCLUÍDO"
echo ""
echo "  Endpoints das edge functions:"
echo "  • n8n-bridge:"
echo "    https://${PROJECT_REF}.supabase.co/functions/v1/n8n-bridge"
echo ""
echo "  • generate-reel-script:"
echo "    https://${PROJECT_REF}.supabase.co/functions/v1/generate-reel-script"
echo ""
echo "  n8n Webhooks (já ativos):"
echo "  • POST /webhook/db8intelligence-events   [WF3 — router]"
echo "  • POST /webhook/reel-script-generated    [WF4 — reel actions]"
echo ""
echo "  Dashboard: https://supabase.com/dashboard/project/${PROJECT_REF}"
echo "================================================================"
