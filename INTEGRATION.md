# Integrações ImobCreator AI

## Hotmart Webhook

**Endpoint (Edge Function Supabase):**
https://dsszhodrrchlaqfignky.supabase.co/functions/v1/hotmart-webhook

**Configurar no Hotmart:**
Hotmart → Ferramentas → Webhooks → Nova notificação → URL acima

**Secrets necessários (supabase secrets set):**
- HOTMART_HOTTOK → gerado no painel Hotmart em Ferramentas > Webhooks
- N8N_WEBHOOK_HOTMART → https://automacao.db8intelligence.com.br/webhook/hotmart

**Eventos tratados:**
- PURCHASE_APPROVED → ativa plano + envia WhatsApp boas-vindas
- SUBSCRIPTION_CANCELLATION → cancela plano
- PURCHASE_CANCELED → cancela plano
- PURCHASE_REFUNDED → marca como reembolsado

**Mapeamento de produtos (atualizar em hotmart-webhook/index.ts):**
| Plano   | Preço     | Créditos | Product ID Hotmart |
|---------|-----------|----------|--------------------|
| Starter | R$97/mês  | 100      | PRODUCT_ID_STARTER |
| Básico  | R$197/mês | 300      | PRODUCT_ID_BASICO  |
| PRO     | R$397/mês | 600      | PRODUCT_ID_PRO     |
| MAX     | R$697/mês | ∞        | PRODUCT_ID_MAX     |

## WhatsApp (Evolution API)

**Servidor:** evolution-api-production-feed.up.railway.app
**Domínio custom:** evolution-api.db8intelligence.com.br (SSL propagando)
**Instância ImobCreator:** imobcreator-whatsapp
**Instance ID:** 3cd7fd04-cf6c-42f3-be65-a3cff8015c19

**Verificar status:**
```bash
curl "https://evolution-api-production-feed.up.railway.app/instance/connectionState/imobcreator-whatsapp" \
  -H "apikey: SUA_API_KEY"
```

**Enviar mensagem de teste:**
```bash
curl -X POST \
  "https://evolution-api-production-feed.up.railway.app/message/sendText/imobcreator-whatsapp" \
  -H "apikey: SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"number": "5571XXXXXXXXX", "text": "Teste ImobCreator ✅"}'
```

## Deploy

```bash
# Migration Supabase
npm run db:migration

# Deploy Edge Function
npm run functions:deploy

# Adicionar secrets
npx supabase secrets set HOTMART_HOTTOK=<valor>
npx supabase secrets set N8N_WEBHOOK_HOTMART=<valor>

# Ver logs em tempo real
npm run functions:logs
```
