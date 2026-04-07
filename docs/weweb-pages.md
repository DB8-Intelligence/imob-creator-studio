# WeWeb — Estrutura das Páginas

Páginas a criar no WeWeb visual editor. Cada seção descreve a hierarquia
de componentes e a lógica de exibição condicional.

---

## /criar (Criar Criativo)

Página principal de criação. Dual mode: formulário direto ou assistente IA.

```
┌──────────────────────────────────────────────────────────┐
│  Header                                                   │
│  ┌─────────────────┐  ┌─────────────────┐                │
│  │ Assistente IA ✦  │  │   Formulário    │  ← tabs        │
│  └─────────────────┘  └─────────────────┘                │
│                                                           │
│  Se creator_mode === 'form':                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Stepper: ● 1 Foto ──────── ○ 2 Textos            │   │
│  └────────────────────────────────────────────────────┘   │
│                                                           │
│  ═══ Etapa 1 (creator_step === 1) ═══                     │
│                                                           │
│  Seção "Formatos do criativo" (máx 3)                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                     │
│  │ □ 1:1│ │ ▯ 4:5│ │ ▮ 9:16│ │ ▭ 16:9│  FormatSelector  │
│  └──────┘ └──────┘ └──────┘ └──────┘                     │
│  "2 formatos selecionados (1 crédito)"                    │
│                                                           │
│  Seção "Quantos criativos gerar?"                         │
│  ┌────────────────┐ ┌──────────────────────┐              │
│  │ ○ 1 Criativo   │ │ ○ 5 Criativos       │              │
│  │   1 crédito    │ │   5 créditos ⭐ 5var │              │
│  └────────────────┘ └──────────────────────┘              │
│                                                           │
│  Seção "Quantas imagens usar?"                            │
│  ┌──────┐ ┌──────┐ ┌──────┐                              │
│  │ 1 img│ │ 2 img│ │ 3 img│                              │
│  └──────┘ └──────┘ └──────┘                              │
│                                                           │
│  Seção "Sua Imagem *"                                     │
│  ┌─────────┐ ┌─ ─ ─ ─ ─┐                                 │
│  │  📸 img │ │ + Upload │  ImageUploader (max=image_count)│
│  │  ✓   ✕  │ │         │                                 │
│  └─────────┘ └─ ─ ─ ─ ─┘                                 │
│                                                           │
│  ▾ Seção "Logo" (collapsible)                             │
│  ┌──────────────────────────────────────┐                 │
│  │  LogoUploader                        │                 │
│  │  ☐ Usar identidade visual            │                 │
│  └──────────────────────────────────────┘                 │
│                                                           │
│  Seção "Escolha o tema"                                   │
│  [TOP Temas] [Novos] [Todos] [Favoritos] [Imobiliário]   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│  │🏠 Dark   │ │🏠 IA     │ │🏠 Expert │  TemplateCard ×N │
│  │ Premium  │ │ Express  │ │ Photo    │                  │
│  │ ★ Recom. │ │ ★ Novo   │ │          │                  │
│  └──────────┘ └──────────┘ └──────────┘                  │
│  [Ver mais 3 temas]                                       │
│                                                           │
│  ┌────────────────────────────────────────────────────┐   │
│  │                    Avançar para o texto →           │   │
│  └────────────────────────────────────────────────────┘   │
│  (ativo se upload_images.length > 0 && selected_template) │
│                                                           │
│  ═══ Etapa 2 (creator_step === 2) ═══                     │
│                                                           │
│  ┌────────────────────────────────────────────────────┐   │
│  │  O que você está vendendo?              badge: IA  │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │ Textarea placeholder: "Apartamento 3 quartos │  │   │
│  │  │ no Jardim Europa, 120m², vista parque..."    │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │  [✦ Deixar a IA escrever]                          │   │
│  │  "A IA cria textos prontos para vender seu produto"│   │
│  └────────────────────────────────────────────────────┘   │
│                                                           │
│  ─── ou preencha manualmente ───                          │
│                                                           │
│  Título principal *  [________________________]           │
│  Subtítulo           [________________________]           │
│  CTA                 [________________________]           │
│  Badge de urgência   [________________________]           │
│                                                           │
│  ┌──────────┐  ┌──────────────────────────────────────┐   │
│  │ ← Voltar │  │          Gerar criativo ✦            │   │
│  └──────────┘  └──────────────────────────────────────┘   │
│                                                           │
│  Se creator_mode === 'assistant':                         │
│  ┌────────────────────────────────────────────────────┐   │
│  │  AssistantChat (full height)                       │   │
│  │  🤖 Olá! Vamos criar um criativo...               │   │
│  │  👤 [imagem]                                       │   │
│  │  🤖 Ótima foto! Qual estilo?                      │   │
│  │      [Dark Premium] [IA Express] [Expert]          │   │
│  │  👤 Dark Premium                                   │   │
│  │  🤖 Me conta o que vende...                        │   │
│  │  ...                                               │   │
│  │ ┌───────────────────────────────────────┐ ┌──────┐ │   │
│  │ │ Descreva o imóvel...                  │ │ Send │ │   │
│  │ └───────────────────────────────────────┘ └──────┘ │   │
│  └────────────────────────────────────────────────────┘   │
│                                                           │
│  ProgressOverlay (visible quando current_job.status       │
│  !== 'idle' && current_job.status !== 'done')             │
└──────────────────────────────────────────────────────────┘
```

### Condicionais importantes:
- Tabs: `creator_mode` toggle entre `'form'` e `'assistant'`
- Stepper: `creator_step` controla qual etapa aparece (1 ou 2)
- Botão "Avançar": `disabled` se `upload_images.length === 0 || !selected_template.id`
- Botão "Gerar": `disabled` se `!user_description && !manual_titulo`
- ProgressOverlay: `visible` quando `current_job.status !== 'idle'`

---

## /minhas-criacoes (Biblioteca)

```
┌──────────────────────────────────────────────────────────┐
│  Header: "Minhas Criações (N)"                            │
│                                                           │
│  Filtros: [Todos] [Post] [Story] [Reels] · Buscar: [___] │
│                                                           │
│  Grid 3 colunas:                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│  │ thumbnail│ │ thumbnail│ │ thumbnail│                  │
│  │ Dark Prem│ │ IA Expr. │ │ Expert   │                  │
│  │ 07/04/26 │ │ 06/04/26 │ │ 05/04/26 │                  │
│  │ [⬇][🔗][↻]│ │ [⬇][🔗][↻]│ │ [⬇][🔗][↻]│                  │
│  └──────────┘ └──────────┘ └──────────┘                  │
│                                                           │
│  Dados: GET /api/creative-jobs/:id/result                 │
│  Ou: SELECT * FROM generated_creatives WHERE user_id = X  │
│                                                           │
│  Ações por card:                                          │
│  ⬇ Download (link direto ao output_url)                   │
│  🔗 Compartilhar (copy URL ou share nativo)               │
│  ↻ Refazer (navegar para /criar com template_id pré-set)  │
└──────────────────────────────────────────────────────────┘
```

---

## /admin/agentes (Admin — Agentes)

Acessível apenas para admins (verificar role no Supabase).

```
┌──────────────────────────────────────────────────────────┐
│  Header: "Agentes do Pipeline"                            │
│  [+ Novo Agente]                                          │
│                                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Modal "Novo Agente":                                │ │
│  │  Nome:        [________________________]             │ │
│  │  Descrição:   [________________________]             │ │
│  │  Prompt:      ┌──────────────────────────────────┐   │ │
│  │               │ Textarea grande (10 linhas)      │   │ │
│  │               └──────────────────────────────────┘   │ │
│  │  Tipo:        [Dropdown: copy/visual/branding/...]   │ │
│  │                                                      │ │
│  │  [Assimilar e cadastrar]                             │ │
│  │                                                      │ │
│  │  Preview da classificação:                           │ │
│  │  Slug: agente-villa-split-panel                      │ │
│  │  Category: composicao                                │ │
│  │  Stage: composition                                  │ │
│  │  Trigger: always                                     │ │
│  │  Reason: "Keywords detected..."                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
│  Lista de agentes:                                        │
│  ┌────────┬──────────────────┬──────────┬────────┬──────┐ │
│  │ Status │ Nome             │ Categoria│ Stage  │ Ver  │ │
│  ├────────┼──────────────────┼──────────┼────────┼──────┤ │
│  │ 🟢     │ Image Analyzer   │ visual   │ image  │  →   │ │
│  │ 🟢     │ Copy Generator   │ copy     │ copy   │  →   │ │
│  │ 🟢     │ Color Extractor  │ branding │ brand  │  →   │ │
│  │ 🟡     │ Template Selector│ template │ decide │  →   │ │
│  │ 🟢     │ Composition Build│ composic │ compos │  →   │ │
│  │ 🟢     │ Villa Split Panel│ visual   │ image  │  →   │ │
│  └────────┴──────────────────┴──────────┴────────┴──────┘ │
│                                                           │
│  Dados: SELECT * FROM agent_registry ORDER BY created_at  │
│  Criar: POST /api/agents/create                           │
└──────────────────────────────────────────────────────────┘
```

---

## Regras gerais de UI

1. **Dark theme** — fundo `#0A0B0F`, cards `rgba(255,255,255,0.03)`, bordas `rgba(255,255,255,0.08)`
2. **Cor primária**: `#8B5CF6` (roxo) para ações, seleções, badges
3. **Cor sucesso**: `#10B981` (verde) para checks, conclusão
4. **Cor erro**: `#EF4444` (vermelho) para remover, erros
5. **Font stack**: Inter para UI, Playfair Display para criativos
6. **ProgressOverlay nunca bloqueia navegação** — overlay transparente a cliques
7. **Resultado NÃO aparece no formulário** — redireciona para `/minhas-criacoes`
8. **Assistente NÃO expõe lógica técnica** — template é "sugestão natural"
