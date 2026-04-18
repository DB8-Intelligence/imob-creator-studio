# Prompts V0 — ImobCreator AI / NexoImob

Prompts prontos pra colar no v0.app, Lovable ou Figma AI.
Um por página principal do sistema.

## Como usar

1. Abrir v0.app (home, não templates)
2. Copiar o prompt inteiro da página que quer redesenhar
3. Colar no campo de input do v0
4. Aguardar geração (~30s, custa 1-2 créditos)
5. Refinar via chat se necessário ("deixa mais minimalista", "move X pra direita") — isso NÃO custa créditos extras
6. Quando aprovar, copiar o código gerado e voltar pro chat do Claude pra integrar no repo (Claude integra os hooks existentes)

## Índice

- [Home Pública (/)](#home-pública)
- [Preços (/precos)](#preços)
- [Dashboard (/dashboard)](#dashboard)
- [Hub de Criativos (/create)](#hub-de-criativos)
- [Criar Vídeo (/video-creator)](#criar-vídeo)
- [CRM (/dashboard/crm)](#crm)
- [WhatsApp Inbox (/dashboard/whatsapp/inbox)](#whatsapp-inbox)
- [Site Imobiliário (/site-imobiliario)](#site-imobiliário)

---

## Home Pública

**Rota atual:** `/`
**Arquivo:** `src/pages/Index.tsx`
**Foco na refinação:** essa é a página de entrada pública. Priorize CTA "Começar agora" ou "Ver planos". Hero precisa vender em 5 segundos. Não gaste crédito em detalhes de seções internas — peça hero + prova social + features + CTA final.

```
Crie uma landing page pública em português brasileiro para a NexoImob AI (ImobCreator AI),
um SaaS de marketing imobiliário que transforma uma foto de imóvel em criativo, vídeo e
site profissional via IA.

PERSONA: Corretor de imóveis brasileiro, 28-55 anos, autônomo ou de imobiliária pequena,
mobile-first (60% do tráfego), não técnico, cético com "IA" mas atraído por "economia
de tempo" e "mais vendas". Não está logado — é primeira visita.

OBJETIVO: Converter o visitante em clique para /criativos (CTA primário) em menos de
30 segundos. Métrica-alvo: scroll até S8 (depoimentos) + 1 clique em CTA amarelo.

LAYOUT: 9 seções verticais em grid 12-col, max-width 1120px centralizado:
1. Header sticky (80px, fundo branco, logo à esquerda, nav centro com dropdowns
   "Soluções"/"Recursos", botão "Entrar" + CTA amarelo "Testar Grátis" à direita).
2. Hero (100vh, fundo vídeo imóvel em loop com overlay navy 60%, badge pill dourado
   pulsante no topo, headline em 3 linhas UPPERCASE 72-96px com 2ª linha em dourado,
   subtítulo 18px 1 parágrafo, 2 CTAs lado a lado — primário dourado sólido, secundário
   outline branco).
3. Soluções (grid 3×2 de 6 cards-módulo com emoji em quadrado pastel, título, descrição
   1 linha, link "Ver planos →"; hover eleva com shadow dourado suave).
4. Feature showcase (tabs horizontais no topo com 5 módulos, conteúdo 2 colunas abaixo:
   esquerda texto + 4 bullets + CTA navy, direita SCREENSHOT REAL do produto em
   browser mockup — não placeholder cinza).
5. Métricas (4 contadores animados em navy bold 48-64px, fundo branco entre duas
   linhas hairline cinza).
6. Depoimentos (3 cards com FOTO real do corretor, estrelas douradas, aspas itálico,
   métrica em destaque navy, nome + cidade + cargo).
7. Pricing preview (3 planos lado a lado: Starter R$97 / Básico R$197 / PRO R$397,
   plano do meio destacado com borda dourada, CTA em cada).
8. CTA final (fundo navy com pattern dots sutil, headline branca, CTA dourado centralizado,
   microcopy "Reembolso 7 dias sem perguntas").
9. FAQ (accordion 6 itens, max-width 640px) + Footer.

CORES (tokens Tailwind do projeto):
- Navy primário: #0A1628 (texto) e #002B5B (CTAs/links)
- Gold primário: #FFD700 (hero) e #D4AF37 (ds.gold — usar esse na V2)
- Background: white e #F8FAFF (alternância)
- Bordas: #E5E7EB
- Muted text: #6B7280
- Success pill: bg #DCFCE7 texto #166534

TIPOGRAFIA: Inter 400/500/600/700/800 para body e UI. Rubik 800 UPPERCASE letter-spacing
-3px APENAS no H1 do hero. Não usar Playfair. Escala: H1 hero clamp(48px,8vw,100px)
line-height 0.98; H2 seção clamp(26px,3.5vw,36px) font-extrabold; H3 card 16-18px bold;
body 14-15px; caption 12px.

COMPORTAMENTOS:
- Hover em cards: border navy + shadow 0 4px 20px rgba(0,43,91,0.08), translate-y -2px,
  transição 200ms.
- Loading: skeleton gradient pulse nos mockups enquanto carrega vídeo do hero.
- Empty states: nenhum na home (tudo estático), mas FAB WhatsApp aparece após 3s scroll.
- Reveal on scroll: fadeUp 20px + stagger 80ms nos filhos, trigger quando 10% visível,
  só uma vez por sessão.
- Tabs: cross-fade 300ms com Framer Motion AnimatePresence mode="wait".
- FAQ: accordion com height animate 250ms, ícone Plus/Minus rotacionando.
- CTA primário dourado: 3 variantes por seção proibido — manter UM estilo de CTA
  primário (retangular radius 10px, height 48-56px, padding-x 24-32px).

CONSOLIDAR: reduzir repetição dos 6 módulos — aparecem hoje em 4 seções; reduzir
para 2 (grid de soluções + feature tabs). Remover S6 blocks alternados e S9 reduzido.
```

---

## Preços

**Rota atual:** `/precos`
**Arquivo:** `src/pages/public/Precos.tsx`
**Foco na refinação:** priorize o card do plano único R$147 como hero de conversão e o grid de add-ons abaixo. Não gaste crédito detalhando o FAQ (5 perguntas são conteúdo, não design). O estado `missingModule` (ring dourado no card do add-on faltante) é o diferencial — peça animação sutil (glow), não pulse berrante.

```
Crie uma landing de preços em português brasileiro para ImobCreator AI, um SaaS de
marketing imobiliário para corretores autônomos e imobiliárias brasileiras.

PERSONA: corretor 30-55 anos, celular-first, desconfiado de SaaS cobrado em dólar,
vem de um anúncio ou redirecionado de dentro do app quando tentou usar um módulo que
não contratou. Objetivo único: converter em checkout Kiwify (R$147/mês plano base).

PALETA: navy principal #0A1628 (background escuro, texto hero, CTAs primários), gold
#FFD700 (ring de destaque e highlights), amber-400 #FBBF24 (CTA do bundle e CTA
final sobre navy), branco #FFFFFF e cinza neutro #F9FAFB para seções alternadas,
cinza texto #6B7280, esmeralda 500 para checkmarks de features.

TIPOGRAFIA: headings em Rubik 700-800 (font-extrabold, tracking tight), corpo em
Plus Jakarta Sans 400-500. Hero H1 em 48-56px desktop / 30px mobile. Preço principal
em 56px font-extrabold.

LAYOUT (mobile-first, max-width 1152px no grid de add-ons):
1. HEADER fixo com logo + navegação discreta.
2. HERO: título "Tudo que você precisa para vender mais imóveis" + subtítulo curto.
   Banner condicional amarelo quando vier query state `missingModule`.
3. CARD ÚNICO centralizado (480px max-width): badge navy "APROVEITAR OFERTA", preço
   R$147/mês grande, CTA navy full-width "Começar agora", grid 2 colunas com 16
   features (check verde + label).
4. SEÇÃO ADD-ONS com fundo #F9FAFB: grid 3x2 de cards brancos rounded-xl. Cada card
   tem emoji 56px, nome, preço em destaque, descrição curta e botão "Adicionar +".
   Card "Bundle Completo" com borda amber e badge "Economize R$69". Quando
   missingModule corresponde ao card, aplicar ring-2 ring-gold + shadow-xl +
   animação sutil pulse-glow (sem scale).
5. SOCIAL PROOF: 3 contadores animados (CountUp on-scroll) com título
   "Corretores que já confiam".
6. FAQ accordion custom com 5 perguntas (Plus/Minus icons, height auto transition
   250ms). Apenas uma aberta por vez.
7. CTA FINAL full-bleed navy #0A1628: headline branca + botão amber grande +
   link WhatsApp secundário branco 70%. Logo abaixo, pílula esmeralda "30 dias de
   garantia" integrada à mesma seção (sem gap vertical).
8. FOOTER.

COMPORTAMENTOS: reveal on-scroll com fade-up stagger 80ms, hover nos cards (shadow
-md→lg, translate-y -2px), todos os CTAs externos abrem em nova aba, accordion
single-open com transição de altura suave.

TONE: confiança brasileira, sem gringismo, microcopy curta, preço sempre com "/mês"
claro quando recorrente.
```

---

## Dashboard

**Rota atual:** `/dashboard`
**Arquivo:** `src/pages/Dashboard.tsx`
**Foco na refinação:** a tela atual tem 12 blocos verticais — esse é o problema. Peça explicitamente **3 zonas** (hero com créditos, grid modular condicional, intenções rápidas). Estado vazio para quem não tem módulos é crítico. Badge MAX dourado pra super-admin. Não gaste crédito em `OnboardingWizard`, `ActivationFunnelCard`, `UpgradePlannerCard` — esses podem virar overlays separados.

```
Redesenhe o Dashboard Home do ImobCreator AI, um SaaS de marketing imobiliário
brasileiro para corretores autônomos e imobiliárias. A persona é o corretor
logado que acabou de fechar uma visita e tem 5 minutos entre um cliente e
outro para gerar um criativo, um vídeo curto ou disparar uma mensagem em massa
pelo WhatsApp. O objetivo da tela é ser o hub central que mostra quanto de
crédito ele ainda tem, quais módulos ele contratou (Criativos, Vídeos,
WhatsApp, Site, CRM, Social Media) e coloca o próximo clique produtivo a no
máximo 2 toques de distância, com decisão guiada por intenção, não por menu.

Layout em 3 zonas verticais, dentro de uma AppLayout que já fornece sidebar
fixa à esquerda (240px) e topbar com avatar + notificações.

Zona 1 — Hero: saudação personalizada "Olá, {Primeiro Nome}", badge do plano
ativo (mostrar badge dourado "MAX" para plano vitalício), card hero grande
com saldo de créditos em números grandes, barra de progresso mensal e CTA
primário "Criar agora".

Zona 2 — Seus Módulos: grid modular de 2 a 3 colunas (xl:grid-cols-3,
md:grid-cols-2, mobile 1 coluna) com um widget por módulo ativo. Cada widget:
ícone em chip colorido no canto superior esquerdo (Criativos roxo, Vídeos
âmbar, WhatsApp verde WhatsApp, Site azul, CRM esmeralda, Social rosa),
contador de créditos usados/total com barra de progresso, 1 métrica viva
(ex: "12 criativos gerados", "8 vídeos prontos de 10") e 2 CTAs (primário
sólido + secundário outline). Quando zero módulos ativos, mostrar empty
state grande com ilustração e CTA "Conheça os planos".

Zona 3 — Intenções rápidas: grid de 4 cards "O que você quer gerar hoje?"
(Post Instagram, Criativo de anúncio, Vídeo do imóvel, Pacote completo),
cada um com ícone grande + descrição curta + botão "Abrir fluxo →".

Rodapé: métrica Time-to-first-value, operações recentes (lista dos últimos
6 criativos com thumb + status + data), card do workspace, checklist de
onboarding colapsável e card de upgrade como último upsell.

Cores: navy #0A1628 como background, azul-oceano #0B1F2A para surfaces,
dourado #D4AF37 como accent/CTA primário, cinza-claro #F5F7FA para texto
principal. Tipografia: Playfair Display para títulos h1/h2 (voz premium),
Inter para corpo e UI. Bordas arredondadas rounded-2xl (16px), sombras
suaves, hover com glow dourado discreto.

Comportamentos: skeleton shimmer em todos os cards enquanto as queries
carregam, empty state ilustrado quando subscriptions=[], widgets se
atualizam em realtime quando um webhook ativa um módulo novo (fade-in suave),
badge "MAX" vitalício em dourado, toast de boas-vindas no primeiro acesso,
OnboardingWizard overlay modal fullscreen apenas no primeiro login.
Mobile-first, tudo responsivo, performance crítica (LCP < 2s).
```

---

## Hub de Criativos

**Rota atual:** `/create`
**Arquivo:** `src/pages/CreateCreativeHub.tsx`
**Foco na refinação:** o wizard atual tem 6 steps — colapsar para 4 é a maior melhoria. Peça stepper horizontal + card principal com transições Framer Motion + sidebar direita sticky com "Jobs em andamento" e "Criativos recentes". Gold como accent, nunca dominante. Progressive disclosure: só mostrar preset visual depois de escolher template.

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

## Criar Vídeo

**Rota atual:** `/video-creator`
**Arquivo:** `src/pages/VideoCreatorPage.tsx`
**Foco na refinação:** o diferencial é o **preview em tempo real num phone mockup** — gaste crédito detalhando isso. Toggle IA/Premium no topo do preview (pill navy com estado gold). Música com preview 5s ao hover (sem clique). Não gaste crédito no formulário de upload — é drag-and-drop padrão. O prompt está em inglês; refine em PT no chat do v0 se quiser.

```
Design a desktop + mobile-first responsive page titled "Criar Vídeo" for a Brazilian real-estate SaaS called ImobCreator AI. The persona is a broker with the "Vídeos IA" add-on (R$79/mo) or "Vídeos Premium" (R$19/vídeo) active. Goal: generate a vertical 15–75s Instagram Reel from property photos in under 2 minutes.

LAYOUT: split-screen wizard. LEFT side (60% width on desktop, full-width on mobile) = horizontal stepper with 4 steps (1. Imóvel / 2. Estilo / 3. Customizar / 4. Revisar) with animated progress bar; below the stepper, the active step's form. RIGHT side (40% width, sticky on desktop, collapsible bottom-sheet on mobile) = live vertical 9:16 video preview frame (phone mockup) showing a real-time mocked Ken Burns animation of the selected photos with the chosen music and style — updates instantly as user changes inputs. Above the preview: a toggle between "Vídeos IA" (fast, included) and "Vídeos Premium" (cinematographic, R$19 per video) — navy pill with gold active state.

COLORS: deep navy background #0A1628 (primary), gold #FFD700 / #D4AF37 for CTAs and selected states, emerald #10B981 for success, amber #F59E0B for warnings. Cards use muted navy #123C4A with 1px border rgba(255,255,255,0.07), rounded-2xl, soft shadow-card.

TYPOGRAPHY: headings in Playfair Display serif (display font, 700 weight); body in Inter 400/500/600. Display sizes: h1 32px, h2 20px, label 14px semibold, body 14px, caption 12px.

STEP 1 (Imóvel): searchable property selector card with thumbnail + address + type; "Upload nova foto" multi-drop zone accepting 6–20 photos, thumbnails with drag-to-reorder.
STEP 2 (Estilo): 3 large SelectableCards (Luxury / Fast Sales / Storytelling) with motion-loop preview GIF on hover, gold ring on selected.
STEP 3 (Customizar): accordion groups: Música (6 mood cards with play icon and 5s audio preview on hover, waveform visualization), Narração/Voiceover (toggle + textarea + 3 voice options + TTS provider logo), Texto overlay (title + subtitle + CTA), Duração (slider 15–75s).
STEP 4 (Revisar): summary tiles + "Gerar vídeo" CTA full-width gold with sparkle icon.

BEHAVIORS: real-time preview updates <200ms after any change; music pre-listen on hover (not commit); rendering state shows actual progress bar with ETA ("Upload → Transcode → Ken Burns → Música → Finalizar") and animated phone mock of the video being composed; on completion the preview becomes a playable HTML5 video with download/WhatsApp-share/Instagram-share buttons. LGPD warning about people/documents is a collapsible info panel, not a permanent banner.

ACCESSIBILITY: focus rings in gold, ARIA-labels on SelectableCards, audio previews keyboard-triggerable, reduced-motion respects prefers-reduced-motion. All UI copy in Brazilian Portuguese. Avoid decision paralysis: only show preset visual + mood after template is chosen (progressive disclosure).
```

---

## CRM

**Rota atual:** `/dashboard/crm`
**Arquivo:** `src/pages/dashboard/crm/DashboardCRMPage.tsx` (wrapper) → `src/pages/CrmKanban.tsx`
**Foco na refinação:** o kanban atual tem 5 colunas — peça 6 (com "Qualificando" e "Perdido"). Tab-bar local (Pipeline/Clientes/Agenda/Importar) em vez de depender só da sidebar global. Modo lista no mobile (kanban quebra em <1440px). Não gaste crédito detalhando o LeadDetailPage — foco no kanban + side panel deslizante.

```
Projete o Dashboard CRM de um SaaS imobiliário premium brasileiro
(ImobCreator AI), voltado para corretores e pequenas imobiliárias que
precisam gerenciar visualmente o pipeline de vendas — do primeiro
contato até o fechamento — sem abrir planilhas.

PERSONA
Corretor de 35 anos, 20-80 leads ativos/mês, usa no desktop grande e
ocasionalmente no iPad em visitas. Quer enxergar o funil inteiro em
uma tela, mover cards com o mouse, e nunca perder um follow-up.

OBJETIVO DA TELA
Gestão visual de pipeline por drag-and-drop + leitura instantânea de
saúde do funil (4 KPIs) + acesso rápido a detalhe do lead.

LAYOUT
Shell escuro com sidebar global à esquerda (já existente, não redesenhar).
Na área principal:
1. Header compacto: título "Pipeline de Leads" em serif Playfair Display
   + subtítulo Inter muted + botão dourado "+ Novo Lead" à direita.
2. Tab-bar horizontal embaixo do header: Pipeline | Clientes | Agenda | Importar
   (sticky no scroll; indicador dourado na tab ativa).
3. Faixa de 4 KPI cards translúcidos (glass effect): Total, Em negociação,
   Fechados no mês, Taxa de conversão. Cada KPI com ícone circular colorido
   (azul/laranja/verde/violeta) + número grande em display serif.
4. Barra de filtros: search à esquerda com ícone lupa, 3 selects (Temperatura,
   Origem, Corretor) + chips de filtro rápido ("Quentes", "Sem resposta 7d",
   "Meus leads") + toggle view Kanban/Lista.
5. Kanban horizontal com scroll-x elegante, 6 colunas de 300 px:
   🟡 Novo Lead | 🟠 Qualificando | 🔵 Contato Feito | 🟣 Visita Agendada |
   🟢 Proposta Enviada | ⚫ Fechado/Perdido (com toggle ganho↔perdido).
   Cada coluna: header com emoji + label + contador pill + total R$
   estimado no rodapé. Cards arrastáveis com foto/inicial do lead,
   nome, telefone, chip de temperatura (🔥quente/☀️morno/❄️frio),
   chip de fonte, valor estimado, "último contato há Xd", 3 ações
   rápidas no hover (WhatsApp, editar, converter).
6. Side panel deslizante à direita (400 px) quando clica num card:
   mesma estrutura do LeadDetailPage (Info + Timeline realtime), mas
   inline sem navegação.

CORES (brand DB8 / ImobCreator)
- Fundo: navy profundo #0A1628 (app) e #0B1420 (surface).
- Accent primário: gold #D4AF37 (CTAs, tab ativa, hover).
- Stages (azul→amarelo→verde→vermelho crescendo em urgência):
  Novo=azul #3B82F6, Qualif=âmbar, Contato=ciano, Visita=violeta,
  Proposta=laranja, Fechado=esmeralda, Perdido=rosa dim.
- Texto: #F5F7FA principal, #A0AEC0 muted, #4A5568 subtle.
- Bordas: rgba(255,255,255,0.07) com glow dourado sutil em hover.

TIPOGRAFIA
Playfair Display (títulos H1/H2), Inter (body, UI), JetBrains Mono
(valores em R$ e números KPI).

COMPORTAMENTOS
- Drag-drop de cards entre colunas com animação spring (Framer Motion).
- Filtros sticky ao rolar o kanban.
- Busca global com debounce 300 ms, destaca match no card.
- Empty state motivador: ilustração de funil dourado + "Seu pipeline
  começa aqui — importe um CSV ou crie seu primeiro lead".
- Loading: shimmer nos KPIs + skeleton nos cards.
- Realtime: badge "novo" pulsante quando chega lead via webhook Meta.
- Mobile (<768 px): kanban vira stack vertical com tab-selector de
  coluna ativa (evita scroll horizontal).

DELIVERABLES
Frame Desktop 1440×900 + Mobile 390×844, com estados: vazio, com
dados, card em drag, side panel aberto, loading.
```

---

## WhatsApp Inbox

**Rota atual:** `/dashboard/whatsapp/inbox`
**Arquivo:** `src/pages/dashboard/whatsapp/WhatsAppInboxPage.tsx`
**Foco na refinação:** a tela hoje tem 2 colunas — peça as 3 (lista + chat + painel do lead imobiliário à direita). Status de conexão (pill verde/vermelho) no header é crítico. Verde WhatsApp `#25D366` **só** pro indicador online — não use em CTAs. Unread badge dourado. Stack mobile. Não gaste crédito em microanimações de bubble — foco em layout e estados.

```
Crie a tela "Inbox WhatsApp" do ImobCreator AI — um SaaS imobiliário brasileiro
que permite ao corretor atender leads do WhatsApp direto no dashboard, sem
precisar abrir o WhatsApp Web em outra aba.

Persona: corretor(a) de imóveis com módulo WhatsApp ativo, recebendo 20-80
conversas por dia vindas de anúncios Meta Ads, campanhas próprias e cards
gerados no ImobCreator. Precisa responder rápido, saber quem é lead quente e
não perder contexto do imóvel de interesse.

Objetivo: inbox unificado estilo WhatsApp Web com contexto CRM imobiliário ao
lado da conversa.

Layout 3 colunas no desktop (>=1280px):
1) Lista de conversas (340px, esquerda) — busca no topo, tabs "Todas | Não lidas
   | Leads", lista scrollável com avatar circular, nome/telefone, última
   mensagem truncada, timestamp relativo, unread badge dourado, dot verde
   quando online.
2) Chat ativo (flex-1, centro) — header com avatar + nome + status "online/
   visto há X", scroll de mensagens com bubbles (recebidas em cinza claro à
   esquerda, enviadas em navy à direita com texto branco), typing indicator
   (3 pontos animados), barra de quick replies acima do input, input com
   emoji, anexo (imagem/vídeo/doc/áudio), botão enviar em dourado.
3) Painel contato/lead (320px, direita) — foto, telefone, tags (Lead Quente,
   Visitou imóvel, etc), imóvel de interesse com thumbnail, histórico de
   interações, CTA "Abrir ficha no CRM".

Tablet (768-1279px): 2 colunas (lista + chat), painel direito vira drawer que
desliza ao clicar em "Ver lead".

Mobile (<768px): stack navegacional — lista ocupa tela inteira, ao selecionar
contato navega pra chat em tela cheia com botão "voltar".

Cores:
- Navy principal #0A1628 (headers, nomes, bubbles enviadas)
- Ocean #0B1F2A (background secundário)
- Gold #D4AF37 (CTAs, unread badges, acentos premium)
- Verde WhatsApp #25D366 (status online, ícone de conexão OK apenas)
- Cinzas neutros para mensagens recebidas e textos secundários
- Fundo geral branco no light mode

Tipografia: Plus Jakarta Sans (body) + Playfair Display (títulos de página).

Comportamentos dinâmicos obrigatórios:
- Status de conexão da instância Evolution API no header (pill verde
  "Conectado" / vermelho "Desconectado — reconectar")
- Unread count badge dourado circular com número no item da lista
- Typing indicator animado (3 pontos pulando) quando lead está digitando
- Timestamp relativo (agora, 5min, 2h, 3d) + fallback pra data absoluta
  depois de 7 dias
- Realtime: nova mensagem faz item subir pro topo com animação fade-up +
  preview atualizado + toast discreto
- Quick replies: barra horizontal scrollável com 5-8 templates salvos
  ("Bom dia! Vi seu interesse...", "Posso agendar visita?", etc)
- Empty state quando instância desconectada: ilustração + CTA "Conectar
  WhatsApp" linkando pra /dashboard/whatsapp
- Scroll infinito reverso no histórico com skeleton loaders no topo
- Todos os textos em português do Brasil, tom profissional-amigável

Referência visual: WhatsApp Web, mas com identidade premium (navy + gold),
densidade de informação maior no painel direito, e microinterações suaves
via Framer Motion (fade-up ao chegar mensagem, scale-in ao abrir conversa).
```

---

## Site Imobiliário

**Rota atual:** `/site-imobiliario`
**Arquivo:** `src/pages/SiteImobiliario.tsx`
**Foco na refinação:** split-screen editor + preview é o padrão correto. Peça o toggle Desktop/Tablet/Mobile no preview (70% do tráfego do site público é mobile — ver às cegas nessa resolução é bug). Checklist pré-publicação em modal antes do Publicar. Abas Imóveis/Depoimentos/XML ainda não existem no código mas pedir delas no design força o padrão futuro.

```
Crie a tela "Site Imobiliário" do SaaS ImobCreator AI (imobcreatorai.com.br), editor
visual no-code do site público do corretor de imóveis. A persona é um(a) corretor(a)
brasileiro(a) de 35-55 anos, com médio letramento digital, que quer publicar um site
profissional em até 10 minutos sem ajuda de desenvolvedor.

OBJETIVO: configurar perfil, aparência, hero, imóveis em destaque, depoimentos,
domínio e SEO do site público, com preview ao vivo lado-a-lado e autosave, culminando
em um clique "Publicar" que torna o site acessível em {slug}.nexoimobai.com.br.

LAYOUT (desktop ≥1024px): split horizontal full-height.
- ESQUERDA (40%, bg neutro claro, scroll vertical): header com título "Meu Site",
  subtítulo de uma linha, badge de status (Rascunho / Publicado / Pendente domínio)
  e botão principal "Publicar" (ou "Despublicar"). Abaixo, navegação por abas
  pill-style com ícones: Perfil, Aparência, Hero, Imóveis, Depoimentos, Domínio,
  SEO. Cada aba é um formulário agrupado por subseções com labels claros, contadores
  de caracteres (bio/meta), chips togglables para especialidades, uploads dashed
  para foto/banner, color pickers com preset do tema selecionado, cards de tema
  (grid 3-col) com gradient preview e estado selected = border gold + ring 30% +
  CheckCircle2. Domínio custom traz bloco DNS com botões "Copiar" por linha e
  verificação em tempo real (spinner → CheckCircle / XCircle).
- DIREITA (60%, bg leve, sticky): toolbar com toggle Desktop / Tablet / Mobile +
  badge "Preview ao vivo" + botão "Abrir em nova aba". Viewport com browser chrome
  (3 dots + URL) renderizando o site real do corretor em iframe scaled, com imóveis
  e depoimentos reais do banco. Em mobile (<1024px), preview vira botão flutuante
  que abre modal fullscreen.

CORES (brand ImobCreator — variante navy/gold):
- Fundo app: #F8FAFC (light mode) / #05080B (dark mode).
- Superfícies: #FFFFFF / #0B1420.
- Navy primário: #0A1628 (headings, CTAs secundários).
- Gold accent: #FFD700 / #D4AF37 (CTA primário "Publicar", estado selected, badges
  premium).
- Cinzas: #A0AEC0 (muted), #4A5568 (subtle).
- Estados: success #10B981, warning #F59E0B, destructive #EF4444.
- OBS: o corretor personaliza as cores DO SITE (não do app) via color picker
  restringido ao range do tema escolhido.

TIPOGRAFIA: Playfair Display para headings grandes (h1, títulos de card do tema),
Inter 14-16px para body e inputs, JetBrains Mono 12px para blocos DNS.

COMPORTAMENTOS:
1. Autosave com debounce de 1200ms; toast "Salvo às 14:32" discreto no rodapé, com
   estado de erro + retry.
2. Preview atualiza em tempo real conforme o usuário digita.
3. Toggle Desktop/Tablet/Mobile no preview redimensiona o iframe.
4. Verificação DNS assíncrona: spinner enquanto checa, CheckCircle verde quando OK,
   alerta vermelho com instrução se falhar.
5. Empty state na aba Imóveis: ilustração + "Você ainda não tem imóveis cadastrados"
   + CTA "Adicionar primeiro imóvel" → /imoveis.
6. Checklist pré-publicação (modal ao clicar Publicar): foto ✓, bio ✓, ao menos 1
   imóvel ✓, telefone/whatsapp ✓. Se faltar algo, destacar a aba.
7. Wizard de onboarding na primeira visita (4 passos: identidade, tema, domínio,
   publicar).
8. Autosave indicator + "Última alteração há 3s" em rodapé fixo do painel esquerdo.

ACESSIBILIDADE: foco visível em todos os controles, labels sempre associadas,
contraste AA mínimo, preview com alt adequado, tabs navegáveis por teclado (←/→).
```
