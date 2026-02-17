# ImobCreator Studio

Plataforma SaaS para criação automatizada de posts imobiliários com IA.

## Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend proxy:** Supabase Edge Functions (Deno)
- **Backend principal:** Railway (`db8-agent-production.up.railway.app`)
- **Auth / DB / Storage:** Supabase (Lovable Cloud)

## Rodar localmente

```bash
npm install
npm run dev        # http://localhost:8080
npm run build      # produção
```

Copie `.env.example` para `.env` e preencha as variáveis.

## Rotas principais

| Rota | Descrição |
|------|-----------|
| `/` | Landing page pública |
| `/auth` | Login / Cadastro |
| `/dashboard` | Dashboard (protegida) |
| `/inbox` | Inbox de propriedades |
| `/editor/:id` | Editor de propriedade |
| `/posts` | Lista de posts |
| `/upload` | Upload de imóvel |
| `/templates` | Galeria de templates |
| `/brand-templates` | Templates da marca |
| `/settings/profile` | Perfil do corretor |
| `/settings/prompts` | Prompts customizados |
| `/plano` | Página de planos |

## Endpoints Railway esperados

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/health` | Health check |
| `GET` | `/properties` | Listar propriedades |
| `POST` | `/properties` | Criar propriedade |
| `PATCH` | `/properties/{id}?status=X` | Atualizar propriedade |
| `GET` | `/me` | Info do plano do usuário |
| `PATCH` | `/me` | Atualizar créditos/plano |
| `POST` | `/generate-caption` | Gerar legenda com IA |
| `GET` | `/templates` | Listar templates de marca |
| `POST` | `/templates` | Criar template |
| `PATCH` | `/templates/{id}` | Atualizar template |
| `DELETE` | `/templates/{id}` | Excluir template |

## Edge Functions (proxy)

- `inbox-proxy` — Proxy genérico para Railway (GET/POST/PATCH/DELETE)
- `generate-caption` — Proxy para geração de legendas com prompts customizados
- `generate-art` — Proxy para geração de arte

## Variáveis de ambiente obrigatórias

| Variável | Onde | Descrição |
|----------|------|-----------|
| `VITE_SUPABASE_URL` | `.env` | URL do projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `.env` | Anon key do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret (edge fn) | Service role para queries admin |

> **Nota:** Segredos e tokens do Railway ficam hardcoded nas edge functions (URL base). Nunca expor chaves privadas no frontend.
