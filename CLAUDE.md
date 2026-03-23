# iMobCreator — Contexto do Projeto

## Identidade

**Nome:** iMobCreator (também chamado de iMobCreatorAI)
**Tipo:** SaaS B2B para corretores de imóveis no Brasil
**Produto:** Geração automatizada de criativos para Instagram e Facebook via IA
**Organização GitHub:** DB8-Intelligence
**Repositório:** DB8-Intelligence/imob-creator-studio
**Diretório local:** /home/user/imob-creator-studio

## Branch de Desenvolvimento

Branch ativo: `claude/copy-config-imobcreatorai-08yBQ`

Sempre desenvolver nessa branch. Nunca fazer push para `main` sem permissão explícita.

## Stack Técnica

- **Frontend:** React + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn/ui (componentes em `src/components/ui/`)
- **Roteamento:** React Router v6
- **Estado do servidor:** TanStack React Query
- **Backend:** Supabase (PostgreSQL + Storage + Edge Functions em Deno)
- **Autenticação:** Supabase Auth (JWT)
- **Pagamentos:** Kiwify (webhook em `supabase/functions/kiwify-webhook/`)
- **IA:** Anthropic Claude API (via `ANTHROPIC_API_KEY` nas edge functions)
- **Monitoramento:** Sentry (`@sentry/react`)
- **Deploy frontend:** Lovable / Vercel
- **Deploy backend:** Supabase Cloud

## Estrutura Principal

```
src/
  pages/          # Páginas React (lazy-loaded via React.lazy)
  components/     # Componentes reutilizáveis
    ui/           # shadcn/ui components
    app/          # AppLayout, navegação
    workspace/    # Cards de workspace/settings
  hooks/          # Custom React hooks
  contexts/       # AuthContext, WorkspaceContext
  integrations/   # Cliente Supabase tipado
supabase/
  functions/      # Edge Functions Deno
    _shared/      # Módulos compartilhados (cors.ts)
  migrations/     # Migrações SQL ordenadas por timestamp
```

## Funcionalidades Principais

1. **Geração de criativos** — imagens para Instagram/Facebook via IA
2. **Pipeline WhatsApp→Instagram** — parceiros enviam fotos via WhatsApp; sistema faz upscale, gera CTA, publica automaticamente
3. **Briefing do corretor** — formulário multi-step com estratégia personalizada gerada por Claude
4. **Templates** — galeria de templates editáveis
5. **Biblioteca** — histórico de criativos gerados
6. **Planos** — Free, Pro (créditos avulsos), Pro+ (pipeline WhatsApp)

## Tabelas Supabase (principais)

- `profiles` — perfil do corretor (briefing, estratégia IA, config)
- `workspaces` — workspace/imobiliária (logo, watermark config)
- `brands` — identidade visual do corretor
- `creatives` — histórico de criativos gerados
- `partner_submissions` — submissões do pipeline WhatsApp
- `whatsapp_configs` — configuração do pipeline por workspace

## Convenções

- Idioma do código: **inglês** (variáveis, funções, componentes)
- Idioma da UI e comentários: **português brasileiro**
- CORS: usar `buildCorsHeaders(req)` de `../_shared/cors.ts` em todas as edge functions
- Lazy loading: todas as páginas devem ser importadas com `React.lazy()` em `App.tsx`
- Formulários: usar `react-hook-form` + `zod` quando possível
- Toasts: usar `useToast` de `@/hooks/use-toast`

## Quando o usuário mencionar "iMobCreator"

Este é o projeto acima. Entender o contexto completo sem necessidade de cópia/cola.
Usar o diretório `/home/user/imob-creator-studio` como working directory.
