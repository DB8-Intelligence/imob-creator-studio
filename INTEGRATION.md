# Integrações ImobCreator AI

## Gateways de Pagamento Ativos

- **Kiwify** — `kiwify-webhook` (edge function)
- **Asaas** — `asaas-webhook` (edge function) + `create-asaas-subscription`

Ambos gravam em `user_subscriptions` usando as colunas legadas `hotmart_subscription_id`, `hotmart_product_id`, `hotmart_raw` (nomes preservados por compatibilidade de schema).

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

# Deploy Edge Function Kiwify
npm run functions:deploy

# Deploy Edge Function Asaas
npm run functions:deploy:asaas

# Ver logs em tempo real
npm run functions:logs
```
