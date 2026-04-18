# Hub de Criação de Criativos — Especificação Visual

> Arquivo analisado: `src/pages/CreateCreativeHub.tsx` (721 linhas, ~31KB)
> Config visual: `tailwind.config.ts` (paleta `ds.*` + tokens shadcn via CSS vars)
> Brand real detectado: navy profundo (`ds.bg #05080B` / `ds.surface #0B1420` / `ds.ocean #0B1F2A`) + gold (`ds.gold #D4AF37` / `ds.gold-light #F2C94C`). O `#FFD700` puro não aparece no config — o dourado oficial é `#D4AF37`. Accent da UI usa token CSS-var `--accent` (shadcn).
> Fontes: `font-display` = Playfair Display (h1/h2), `font-body` = Inter, `font-mono` = JetBrains Mono (numeração de steps).

---

## 1. PROPÓSITO

- **Persona:** corretor de imóveis com plano ativo (módulo Criativos liberado), pressionado por tempo, que precisa produzir uma peça visual para Instagram, anúncio pago, carrossel ou vídeo de imóvel — sem depender de designer.
- **Objetivo da tela:** transformar o intent inicial do corretor em um briefing estruturado e encaminhá-lo ao fluxo de execução correto (Flux Pro, Studio, Sequence ou Video Creator) com o contexto já capturado — gerar um criativo pronto em menos de 3 minutos.
- **Fluxo esperado:**
  1. Entra em `/create/hub` (ou atalho "Criar criativo" da sidebar).
  2. Seleciona objetivo (Post IG / Anúncio / Carrossel / Vídeo).
  3. Escolhe fonte de assets (ideia / imóvel / marca).
  4. Confirma ou troca o fluxo recomendado pela IA.
  5. Preenche briefing mínimo (título, público, CTA + campos dinâmicos).
  6. Vê preview estruturado do plano e aprova.
  7. Sistema navega para `/create/ideia`, `/create/studio`, `/create/sequence`, `/upload` ou `/video-creator` já com `wizardDraft` no `location.state`.

---

## 2. ESTRUTURA VISUAL ATUAL

```
AppLayout (sidebar + topbar global)
└── <main class="max-w-5xl mx-auto space-y-8 pb-10">
    ├── Section hero
    │   ├── Badge "Wizard Único de Criação" (accent/10)
    │   ├── h1 font-display 4xl — "Planeje seu criativo em um fluxo único..."
    │   ├── p muted-foreground 3xl — subtítulo
    │   └── Button outline "Reiniciar wizard" (ícone RefreshCcw)
    │
    ├── Section stepper (grid 6 colunas)
    │   └── 6 cards rounded-2xl numerados 01..06
    │        Labels: Objetivo · Assets · Fluxo · Briefing · Preview · Aprovação
    │        Estados: active (border-accent + bg-accent/5)
    │                completed (border-accent/30 + bg-accent/10)
    │                pending (border-border/60 + bg-card)
    │
    └── Grid principal lg:grid-cols-[1.3fr_0.7fr]
        ├── Card esquerdo (conteúdo dinâmico por step)
        │   ├── Step 1 — grid 2 cols de OBJECTIVES
        │   │   (Instagram / Megaphone / Layers3 / Clapperboard)
        │   │   com Badge contextual (Rápido / Conversão / Storytelling / Vídeo IA)
        │   ├── Step 2 — lista vertical de ASSET_SOURCES (Wand2 / ImageIcon / Library)
        │   ├── Step 3 — grid 2 cols de FLOWS com Badge "Recomendado"
        │   │   (Assistente IA / Formulário / Fluxo imóvel / Fluxo vídeo)
        │   ├── Step 4 — FormFlow inline
        │   │   (Input título, Input público, Input CTA,
        │   │    campos dinâmicos via DYNAMIC_BRIEF_FIELDS, Textarea notes)
        │   ├── Step 5 — Preview em 2 cards lado a lado
        │   │   (coluna "Plano" + coluna "Briefing" com labels uppercase tracking-wide)
        │   ├── Step 6 — Aprovação: 3 cards (Sparkles / CheckCircle2 / Send)
        │   │   + CTAs "Abrir fluxo recomendado" / "Biblioteca" / "Publicação"
        │   └── Footer de navegação (Voltar / Próximo passo) — border-t
        │
        └── Coluna direita (sticky-style, sidebar de resumo)
            ├── Card "Recomendação atual" (objetivo, assets, rota final)
            └── Card accent "Definição de pronto" (4 checks com CheckCircle2)
```

**Dados dinâmicos renderizados:**
- Rota final computada em tempo real por `getResolvedPath(draft)`.
- Fluxo recomendado via `getRecommendedFlow(objective, assetSource)` — mostrado com badge gold "Recomendado".
- Progresso persistido em `localStorage` key `create-creative-wizard-draft:v1`.
- **Ausentes no componente atual:** saldo de créditos, lista de imóveis disponíveis, contador de jobs em processamento, galeria de criativos recentes.

---

## 3. COMPONENTES REUTILIZADOS

**Já usados nesta tela:**
- `AppLayout` — `@/components/app/AppLayout` (shell global com sidebar + topbar)
- `Card`, `CardContent` — `@/components/ui/card`
- `Button` — `@/components/ui/button` (variantes `default`, `outline`)
- `Badge` — `@/components/ui/badge`
- `Input`, `Textarea` — shadcn primitives
- Ícones `lucide-react`: ArrowLeft, ArrowRight, Bot, CheckCircle2, Clapperboard, FileText, ImageIcon, Instagram, Layers3, Library, Megaphone, RefreshCcw, Send, Sparkles, Wand2

**Candidatos a integrar (existem no repo, mas não importados aqui):**
- `FormFlow` — para transformar Step 4 em form stepper reutilizável
- `ImageUploader` — quando `assetSource === "property"` abre upload inline no Step 2
- `CreativeCard` — mostrar 2-3 peças recentes abaixo do wizard ("continuar de onde parou")
- `PlanBadge` — exibir plano do usuário e travar opções fora do plano
- `RestorationBadge` — sinalizar "restaurado" em thumbnails vindas da `imageRestoration`
- `CreditsIndicator` / `PlanProgress` — mostrar saldo de créditos antes de iniciar geração
- `JobStatusChip` — listar jobs em processamento/fila na coluna direita
- `EmptyState` — quando o corretor não tem nenhum imóvel cadastrado e escolhe `asset_source = "property"`

---

## 4. ESTADO / HOOKS

**Local (já implementado):**
- `useState<WizardStep>` — step 1..6
- `useState<WizardDraft>` — objective, assetSource, flow, title, audience, cta, notes + campos dinâmicos (campaignGoal, propertyType, location, slideCount, videoDuration)
- `useEffect` de hidratação/persistência via `localStorage` (key `create-creative-wizard-draft:v1`)
- `useNavigate` — roteamento final com `state: { fromUnifiedWizard, wizardDraft }`

**A plugar (hooks do domínio que ainda não estão nesta tela):**
- `useAuth()` — userId + session para autorizar a ação
- `useUserPlan()` — limites de geração, quais objetivos estão liberados no plano
- `useUserSubscriptions()` — status da assinatura (ativa / vencida / trial)
- `useCreativeActions()` — métodos `startCreative`, `saveDraft`, `queueGeneration`
- `useJobStatus(userId)` — realtime dos jobs Flux/Shotstack em andamento
- `useImageRestoration()` — toggle `auto_restore` + preview com disclaimer "restaurado"
- `useProperties()` — listar imóveis do corretor quando `assetSource === "property"`
- `useCredits()` — saldo em tempo real (gate antes de `handleContinueToFlow`)

---

## 5. ROTAS DE SAÍDA

Resolução feita por `getResolvedPath(draft)`:

| Condição no draft | Rota destino |
|---|---|
| `objective === "property_video"` | `/video-creator` |
| `flow === "video_guided"` | `/video-creator` |
| `flow === "property_guided"` | `/upload` |
| `flow === "direct_form"` | `/create/studio` |
| `objective === "carousel_sequence"` | `/create/sequence` |
| fallback (`instagram_post` + assistant) | `/create/ideia` |
| default | `/create/ideia` |

**Rotas auxiliares do Step 6:**
- `/library` — biblioteca de criativos prontos
- `/calendario/publicacoes` — agenda de publicação

**Rotas implícitas (a criar/linkar):**
- `/dashboard/criativos` — galeria geral
- `/dashboard/job/:id` — detalhes de um job em processamento
- `/creative/:id/preview` — pré-visualização do criativo gerado

---

## 6. PROBLEMAS VISUAIS DETECTADOS

1. **Stepper de 6 etapas é longo demais.** Etapas 2 (Assets) e 3 (Fluxo) são consequência direta da etapa 1 — o `recommendedFlow` já as decide automaticamente. Poderia ser colapsado num único step "Contexto" com toggles, reduzindo de 6 para 4 steps reais.
2. **4 OBJECTIVES + 3 ASSET_SOURCES + 4 FLOWS = 11 cards clicáveis nas 3 primeiras telas.** Carga cognitiva alta, todos os cards com visual equivalente (sem hierarquia por popularidade ou plano).
3. **Sem estado vazio tratado.** Se o corretor escolher `assetSource: property` mas não tiver imóveis cadastrados, o wizard continua até o Step 6 e só descobre o problema em `/upload`. Deveria haver gate no Step 2.
4. **Ausência de feedback do sistema.** Tela não mostra: saldo de créditos, plano atual, jobs em processamento, nem "continuar rascunho anterior". O `localStorage` persiste mas não há card "Retomar do step 3".
5. **Cor `accent` amarrada ao CSS-var shadcn** — não há garantia visual de que está renderizando como `#D4AF37` (gold DB8). Precisa validar `--accent` em `src/index.css`.
6. **Sem animações de transição entre steps.** Framer Motion está disponível na stack mas não é usado aqui — trocas de step são cortes secos.
7. **Coluna direita "Definição de pronto" usa 4 CheckCircles estáticos** (sempre verdes, mesmo quando o step não foi completado) — é decoração, não reflete o estado real.
8. **Sem RestorationBadge nem disclaimer de compliance visível** — corretor não é avisado aqui sobre o aviso "restaurado" que será aplicado depois no CreativeCard.
9. **Botão "Reiniciar wizard" no header** é destrutivo sem confirmação.
10. **Responsive gap** no mobile: grid 6 colunas do stepper quebra (md:grid-cols-6 sem fallback estilizado) — em <768px vira 6 cards empilhados ocupando muito espaço.

---

## 7. PROMPT PRONTO PARA FIGMA / V0 / LOVABLE

```
Gere uma página web responsiva chamada "Hub de Criação de Criativos" para um SaaS
imobiliário brasileiro (ImobCreator AI). Persona: corretor de imóveis premium,
pouco tempo, quer gerar uma peça visual (post Instagram, anúncio pago, carrossel
ou vídeo de imóvel) em menos de 3 minutos, sem depender de designer.

Identidade visual:
- Fundo navy profundo #05080B com surfaces em #0B1420 e #0B1F2A
- Accent gold #D4AF37 (variante light #F2C94C)
- Texto principal #F5F7FA, secundário #A0AEC0
- Tipografia: Playfair Display (títulos), Inter (corpo), JetBrains Mono (números)
- Cartões com border rgba(255,255,255,0.07), raio 2xl, sombra discreta dourada

Layout (container max-w-5xl, padding generoso):
1. Header com breadcrumb "Criar > Hub", badge gold "Wizard Único de Criação", h1
   grande em Playfair ("Planeje seu criativo em um fluxo único"), botão outline
   "Reiniciar wizard" à direita.
2. Indicador de créditos + plano do usuário no canto superior (chip gold).
3. Stepper horizontal de 4 etapas (Objetivo · Briefing · Preview · Aprovar) com
   numeração mono 01..04, estado ativo com glow gold sm.
4. Grid 2 colunas (1.3fr / 0.7fr):
   - Esquerda: card principal com conteúdo do step atual. Transições Framer
     Motion fade+slide ao trocar step.
     * Step 1: grid 2x2 com 4 cards de objetivo (Instagram, Anúncio, Carrossel,
       Vídeo) — cada card com ícone lucide em quadrado gold/10, badge contextual
       ("Rápido", "Conversão", "Storytelling", "Vídeo IA"), título e descrição.
       Hover eleva + border gold.
     * Step 2: form briefing lado a lado — título, público-alvo, CTA, campos
       dinâmicos conforme objetivo (duração do vídeo, número de slides etc),
       textarea de contexto. Toggle "Auto-restore de imagem" com disclaimer
       "imagens podem ser restauradas; a peça gerada receberá selo 'restaurado'".
     * Step 3: preview side-by-side — card esquerdo "Plano" (objetivo, fluxo,
       rota) + card direito "Briefing" (título, público, CTA). Loading spinner
       gold quando calculando recomendação.
     * Step 4: 3 cards de confirmação + CTAs grandes "Abrir fluxo recomendado"
       (primário gold), "Biblioteca" e "Publicação" (outline).
   - Direita (sticky): card "Recomendação atual" mostrando fluxo, objetivo,
     rota final; card "Jobs em andamento" listando até 3 jobs com progress
     bar dourada; card "Criativos recentes" com 3 thumbnails 1:1 e
     RestorationBadge quando aplicável.
5. Footer do card principal: botões "Voltar" (outline) e "Próximo passo"
   (primário gold com seta). Progress bar fina gold acima do footer indicando
   % de conclusão do wizard.
6. Estado vazio: se corretor não tem imóveis e escolhe "começar por imóvel",
   mostrar card amigável com ilustração minimalista e CTA "Cadastrar primeiro
   imóvel".

Comportamentos: persistência em localStorage, transições suaves 300ms, loading
spinners dourados em chamadas async, toast gold em sucesso, disclaimers cinza
pequenos para compliance ("imagens restauradas via IA"), mobile-first com
stepper colapsando em dropdown abaixo de 768px.

Tom: premium, confiável, luxo discreto — nada de neon ou gradientes berrantes.
Espaçamento generoso, tipografia elegante, gold como destaque pontual.
```

---

### Anexo — mapeamento de tokens

| Uso na tela atual | Token Tailwind | Valor resolvido esperado |
|---|---|---|
| `bg-accent/5` (card selecionado) | `--accent` via CSS var | gold a 5% opacity |
| `border-accent` | `--accent` | `#D4AF37` (recomendado) |
| `bg-card` | `--card` | `#0B1420` (ds.surface) |
| `text-foreground` | `--foreground` | `#F5F7FA` |
| `text-muted-foreground` | `--muted-foreground` | `#A0AEC0` |
| `font-display` h1/h2 | Playfair Display | — |
| `font-mono` step 01..06 | JetBrains Mono | — |

**Próximo passo recomendado:** validar `src/index.css` para confirmar que `--accent` está mapeado para `#D4AF37` e não para um amarelo shadcn default.
