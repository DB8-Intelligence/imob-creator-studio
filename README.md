# NexoImob AI

Plataforma completa de marketing imobiliario com IA. Criativos, videos, site, CRM e WhatsApp integrados.

**Empresa:** DB8 INTERPRICE COMERCIO E SERVICOS LTDA · CNPJ 31.982.768/0001-31
**Dominio:** nexoimobai.com.br

## Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion
- **Fontes:** Rubik (hero/titulos) + Plus Jakarta Sans (corpo)
- **Backend:** Supabase Edge Functions (28 funcoes Deno)
- **Auth / DB / Storage:** Supabase (`spjnymdizezgmzwoskoj`)
- **Pagamentos:** Kiwify (webhook integrado)
- **Automacao:** n8n (`automacao.db8intelligence.com.br`)
- **Deploy:** Vercel (frontend) + Supabase (edge functions)

## Modulos

| Modulo | Status | Rota |
|--------|--------|------|
| Criativos | Disponivel | `/criativos` |
| Videos | Disponivel | `/videos` |
| Site + Portais | Em breve | `/site-imobiliario` |
| CRM | Em breve | `/crm-imobiliario` |
| WhatsApp | Em breve | `/whatsapp-imobiliario` |
| Publicacao Social | Em breve | `/publicacao-social` |

## Rodar localmente

```bash
npm install
npm run dev        # http://localhost:8080
npm run build      # producao
```

Copie `.env.example` para `.env` e preencha as variaveis.

## Rotas publicas

| Rota | Descricao |
|------|-----------|
| `/` | Home — hero video, solucoes, tabs, metricas, depoimentos, FAQ |
| `/criativos` | LP Criativos — checkout Kiwify |
| `/videos` | LP Videos — checkout Kiwify |
| `/site-imobiliario` | LP Site (em breve + waitlist) |
| `/crm-imobiliario` | LP CRM (em breve + waitlist) |
| `/whatsapp-imobiliario` | LP WhatsApp (em breve + waitlist) |
| `/publicacao-social` | LP Social (em breve + waitlist) |
| `/precos` | Pagina de precos (toggle mensal/anual) |
| `/sobre` | Sobre a empresa |
| `/contato` | Formulario de contato |
| `/auth` | Login / Cadastro |
| `/termos` | Termos de uso |
| `/para-corretores` | LP ICP corretores |
| `/para-imobiliarias` | LP ICP imobiliarias |
| `/para-equipes` | LP ICP equipes |

## Rotas protegidas (dashboard)

| Rota | Descricao |
|------|-----------|
| `/dashboard` | Dashboard principal |
| `/studio` | Creative Studio |
| `/video-creator` | Criador de videos |
| `/create/ideia` | Gerar criativos com IA |
| `/create/studio` | Creative Studio avancado |
| `/leads` | CRM — Pipeline de leads |
| `/imoveis` | Gestao de imoveis |
| `/max/criativos` | Galeria de criativos |
| `/automacoes` | Automacoes |
| `/calendario` | Calendario de conteudo |
| `/financeiro` | Financeiro |
| `/configuracoes` | Configuracoes |

## Edge Functions (Supabase)

28 funcoes deployadas incluindo:
- `kiwify-webhook` — Pagamentos Kiwify (compra, renovacao, cancelamento, chargeback)
- `asaas-webhook` — Pagamentos Asaas
- `generate-caption` / `generate-art` / `gerar-criativo` — Geracao de conteudo
- `generate-video` / `generate-video-v2` / `compose-video` — Pipeline de video
- `n8n-bridge` — Integracao n8n
- `publish-social` / `publish-dispatch` — Publicacao social
- `whatsapp-events` / `whatsapp-instance` — WhatsApp Evolution API

## Checkout Kiwify

**Criativos:**
- Starter R$97/mes: `https://pay.kiwify.com.br/UjBaKio`
- Basico R$197/mes: `https://pay.kiwify.com.br/gCd9MsZ`
- PRO R$397/mes: `https://pay.kiwify.com.br/2ofOTll`

**Videos:**
- Starter R$97/mes: `https://kiwify.app/kMcnV7a`
- Basico R$197/mes: `https://pay.kiwify.com.br/iJ5cYCJ`
- PRO R$397/mes: `https://pay.kiwify.com.br/rJ4B7Op`

## Webhook Kiwify

URL: `https://spjnymdizezgmzwoskoj.supabase.co/functions/v1/kiwify-webhook`

Autenticação: token estático via header `x-kiwify-token` OU query param `?signature=`.
O valor do token fica apenas em:

- Railway `db8-agent` → Variables → `KIWIFY_WEBHOOK_TOKEN`
- Supabase → Edge Functions Secrets → `KIWIFY_WEBHOOK_TOKEN`
- Kiwify Dashboard → Webhook config (URL com `?signature=...`)

**Nunca commitar o valor do token no código nem na documentação.**

## Variaveis de ambiente

| Variavel | Onde | Descricao |
|----------|------|-----------|
| `VITE_SUPABASE_URL` | `.env` | URL do projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `.env` | Anon key do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret (edge fn) | Service role para queries admin |
| `KIWIFY_WEBHOOK_TOKEN` | Secret (edge fn) | Token de validacao webhook Kiwify |
| `KIWIFY_CLIENT_ID` | Secret (edge fn) | Client ID Kiwify |
| `KIWIFY_ACCOUNT_ID` | Secret (edge fn) | Account ID Kiwify |
| `ANTHROPIC_API_KEY` | Secret (edge fn) | API key para geracao IA |
| `N8N_WEBHOOK_URL` | Secret (edge fn) | URL webhook n8n |

## Design System

```
Hero/Dark:    #21346e (navy deep) + #FFD700 (gold)
Geral:        #002B5B (navy) + #F8FAFF (off-white)
Texto:        #0A1628 (dark) + #374151 (body) + #6B7280 (muted)
Bordas:       #E5E7EB (padrao) + #002B5B (destaque)
Fontes:       Rubik 700/800 (hero) + Plus Jakarta Sans 400-800 (corpo)
Cards:        white bg + border 1.5px + radius 16px
Botao navy:   bg #002B5B text white radius 10px
Botao gold:   bg #FFD700 text #002B5B radius 10px
```

## Componentes UI compartilhados

- `AnnouncementBanner` — Banner topo dismissivel (localStorage)
- `PopupLeadCapture` — Exit intent + 30s timer, 1x/dia
- `WhatsAppButton` — Flutuante bottom-right com tooltip
- `CountUp` — Animacao de contador com IntersectionObserver
