#!/usr/bin/env bash
# ============================================================
# test-video-pipeline.sh — Teste operacional do pipeline de video v2
#
# Prereqs:
#   1. Backend FFmpeg deployado e respondendo em /generate-video/v2
#   2. 3 fotos de teste no Supabase Storage (video-assets/test/)
#   3. generation-callback edge function deployada
#
# Uso:
#   bash scripts/test-video-pipeline.sh
#
# O script:
#   1. Envia payload de teste para o backend
#   2. Monitora generation_jobs ate status = done/error
#   3. Reporta resultado
# ============================================================

set -e

BACKEND_URL="${BACKEND_URL:-https://api.db8intelligence.com.br}"
SUPABASE_URL="${SUPABASE_URL:-https://spjnymdizezgmzwoskoj.supabase.co}"
SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY:?Defina SUPABASE_SERVICE_ROLE_KEY}"

echo "=================================="
echo "  Video Pipeline v2 — Test"
echo "=================================="
echo ""

# ── 1. Verificar backend ──────────────────────────────────────
echo "1/4  Verificando backend..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${BACKEND_URL}/health")
if [ "$STATUS" != "200" ]; then
  echo "   ERRO: Backend nao responde (status: $STATUS)"
  exit 1
fi
echo "   OK: Backend vivo"

# ── 2. Verificar endpoint v2 ──────────────────────────────────
echo "2/4  Verificando /generate-video/v2..."
V2_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
  -X POST "${BACKEND_URL}/generate-video/v2" \
  -H "Content-Type: application/json" \
  -d '{"job_id":"probe"}')

if [ "$V2_STATUS" = "404" ]; then
  echo "   ERRO: Endpoint /generate-video/v2 nao existe (404)"
  echo "   O backend precisa ser atualizado. Ver docs/video-backend-activation.md"
  exit 1
elif [ "$V2_STATUS" = "422" ] || [ "$V2_STATUS" = "400" ]; then
  echo "   OK: Endpoint existe (rejeitou payload vazio como esperado)"
else
  echo "   INFO: Endpoint retornou $V2_STATUS (pode estar funcionando)"
fi

# ── 3. Enviar payload de teste ─────────────────────────────────
echo "3/4  Enviando payload de teste..."
PAYLOAD=$(cat docs/video-test-payload.json)
RESPONSE=$(curl -s --max-time 30 \
  -X POST "${BACKEND_URL}/generate-video/v2" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

echo "   Resposta: $RESPONSE"

JOB_STATUS=$(echo "$RESPONSE" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ "$JOB_STATUS" = "accepted" ] || [ "$JOB_STATUS" = "processing" ]; then
  echo "   OK: Job aceito pelo backend"
else
  echo "   AVISO: Status inesperado: $JOB_STATUS"
fi

# ── 4. Monitorar resultado ─────────────────────────────────────
echo "4/4  Monitorando generation_jobs (max 5min)..."
JOB_ID="test-job-001"
for i in $(seq 1 60); do
  sleep 5
  ROW=$(curl -s \
    "${SUPABASE_URL}/rest/v1/generation_jobs?id=eq.${JOB_ID}&select=status,result_url,error_message" \
    -H "apikey: ${SERVICE_KEY}" \
    -H "Authorization: Bearer ${SERVICE_KEY}")

  STATUS=$(echo "$ROW" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "   [$((i*5))s] status: ${STATUS:-nao_encontrado}"

  if [ "$STATUS" = "done" ]; then
    RESULT_URL=$(echo "$ROW" | grep -o '"result_url":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo ""
    echo "=================================="
    echo "  SUCESSO"
    echo "  Video URL: $RESULT_URL"
    echo "=================================="
    exit 0
  elif [ "$STATUS" = "error" ]; then
    ERROR=$(echo "$ROW" | grep -o '"error_message":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo ""
    echo "=================================="
    echo "  FALHA"
    echo "  Erro: $ERROR"
    echo "=================================="
    exit 1
  fi
done

echo ""
echo "  TIMEOUT: Job nao completou em 5 minutos"
exit 1
