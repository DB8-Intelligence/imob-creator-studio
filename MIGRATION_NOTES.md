# Notas de Migração — ImobCreator → Antigravity

## Arquitetura do projeto

### Frontend (React + Vite)
- `src/pages/` — Páginas/rotas da aplicação
- `src/components/` — Componentes reutilizáveis (UI, inbox, brand, templates)
- `src/hooks/` — Hooks customizados (API calls, upload, AI generation)
- `src/services/` — Camadas de serviço (userPlanApi, templatesApi)
- `src/contexts/` — AuthContext (autenticação Supabase)
- `src/assets/` — Imagens e templates visuais
- `src/index.css` — Design tokens (CSS variables)

### Edge Functions (Proxy — Deno/Supabase)
- `supabase/functions/inbox-proxy/` — Proxy genérico para Railway. Recebe `_method` e `_path` no body e redireciona.
- `supabase/functions/generate-caption/` — Proxy de geração de legendas. Busca prompts do usuário na tabela `prompt_templates` e envia ao Railway.
- `supabase/functions/generate-art/` — Proxy de geração de arte.

### Backend Railway (externo)
- URL: `https://db8-agent-production.up.railway.app`
- Fonte de verdade para: propriedades, créditos, templates de marca, geração de conteúdo IA.
- **Não faz parte deste repositório.** É um serviço externo.

### Supabase (Auth + DB + Storage)
- **Auth:** Login/cadastro com email
- **DB:** Tabelas `profiles`, `properties`, `property_media`, `brands`, `templates`, `creatives`, `prompt_templates`
- **Storage:** Buckets `property-media`, `creatives`, `avatars`, `brand-assets`

## Como o Antigravity deve importar

### 1. Páginas e Componentes
Copiar `src/` integralmente. Todas as rotas estão em `src/App.tsx`.

### 2. Chamadas API
As chamadas ao Railway passam por edge functions. Se o Antigravity suportar serverless functions, replicar as 3 funções em `supabase/functions/`. Caso contrário, apontar as chamadas diretamente ao Railway (ajustar hooks/services).

### 3. Variáveis de ambiente
Ver `.env.example`. As edge functions usam secrets configurados no Supabase (não em `.env`).

### 4. Assets
Imagens de template estão em `src/assets/templates/`. Imagens de propriedades são servidas pelo Supabase Storage (URLs públicas).

## Checklist de validação pós-migração

- [ ] `npm install && npm run dev` roda sem erros
- [ ] `npm run build` gera bundle sem erros
- [ ] Landing page `/` renderiza completa
- [ ] `/auth` permite login/cadastro
- [ ] `/inbox` lista propriedades do Railway (`GET /properties`)
- [ ] `/editor/:id` carrega dados e salva via `PATCH /properties/{id}`
- [ ] Upload de imóvel (`/upload`) envia fotos ao storage e cria via `POST /properties`
- [ ] Geração de legenda funciona (`POST /generate-caption`)
- [ ] `/settings/prompts` salva/carrega prompts customizados
- [ ] Créditos decrementam (`PATCH /me`)
- [ ] Templates de marca CRUD funciona (`/brand-templates`)

## Observações importantes

1. O frontend **nunca** acessa o Railway diretamente — sempre via edge functions proxy.
2. O campo `status` em PATCH de propriedades é enviado como **query parameter** (peculiaridade da API Railway).
3. A tabela `prompt_templates` é local (Supabase) e consultada pela edge function `generate-caption` antes de chamar o Railway.
