# Home Pública — ImobCreator AI / NexoImob

> Especificação visual de `src/pages/Index.tsx` (landing page pública, rota `/`).
> Gerada em 2026-04-17 a partir do commit `ed4459a`.

---

## 1. PROPÓSITO

**Quem é o usuário:** Corretor de imóveis brasileiro (autônomo, iniciante a médio nível) ou gestor de imobiliária de pequeno/médio porte, visitando pela primeira vez vindo de anúncio pago, indicação ou busca orgânica. Ainda **não está logado** — a página não consome `useAuth`, `useUserPlan` nem nenhum hook de sessão.

**O que ele precisa fazer aqui (1 frase):** Entender em menos de 30 segundos que a NexoImob transforma uma foto de imóvel em criativo / vídeo / site profissional via IA, e clicar num CTA que o leva para um módulo (Criativos, Vídeos, etc.) onde ele pode testar grátis.

**Fluxo esperado:**
`entra (com UTM capturado)` → `vê vídeo loop no hero + headline em amarelo ouro` → `escaneia cards de módulos e tabs interativas` → `lê depoimentos + preços R$97–R$397` → `clica no CTA amarelo "Testar Grátis — 50 Créditos"` → `sai para /criativos` (ou fecha e recebe popup lead capture).

---

## 2. ESTRUTURA VISUAL ATUAL

A página renderiza **14 blocos verticalmente empilhados**, todos full-width com `container mx-auto max-w-5xl` (ou `max-w-6xl` no grid de soluções). Todas as seções animam com Framer Motion `fadeUp` + `stagger` via `<Reveal>` e têm tracking de scroll via `useSectionTracker` para o funnel analytics.

| # | Seção | O que mostra | CTAs | Dados dinâmicos |
|---|---|---|---|---|
| 0 | **AnnouncementBanner** | Barra promocional fina no topo | — | Conteúdo do próprio componente |
| 1 | **Header** (sticky) | Logo + dropdowns "Soluções"/"Recursos" + botão login | Links para `/criativos`, `/videos`, `/site-imobiliario`, `/crm-imobiliario`, `/whatsapp-imobiliario`, `/publicacao-social`, `/precos`, `/contato` | Estado local do dropdown |
| 2 | **HeroSection** (`min-h-screen`) | Vídeo MP4 loop de fundo (CloudFront) + overlay navy `#21346e` gradiente + badge amarelo pulsante + headline 3 linhas UPPERCASE Rubik (tamanho clamp 48–100px) com "CRIATIVOS" em amarelo `#FFD700` + subtítulo 18px branco 75% + 2 CTAs em shape SVG cortado (primário amarelo `TESTAR GRÁTIS — 50 CRÉDITOS`) | Botão primário → `/criativos`, secundário → variante AB | `useABVariant()` troca headline/CTA entre A e B |
| 3 | **S2 Trust Strip** | Faixa off-white `#F8FAFF` com texto "Plataforma imobiliária completa" + marquee horizontal infinito (CSS keyframe 20s) com nomes: ZAP Imóveis, OLX, VivaReal, ImovelWeb, Meta, WhatsApp Business | — | — |
| 4 | **S3 Soluções Grid** | H2 "Oferecemos tudo o que você precisa… / De 1 foto para campanha completa em minutos" + grid 3 colunas (responsivo 1→2→3) de **6 cards-módulo** com emoji em pastilha colorida (`bg-[#EEF2FF]`/`FFF7E0`/`F0FDF4`/`F0F9FF`/`FFF0F5`/`FFFBEB`), badge verde "Disponível" e link "Ver planos →" | Cada card → rota do módulo | Variante AB troca copy dos cards (`modulesA` vs `modulesB`) |
| 5 | **S4 Feature Tabs** | Fundo `#F8FAFF`. H2 + barra horizontal de 5 tabs (Criativos / Vídeos / Site+Portais / CRM / WhatsApp) com emoji + label. Abaixo, card branco com grid 2 colunas: texto à esquerda (título, subtítulo, 4 bullets com check azul, botão navy `#002B5B`) + mockup ilustrativo à direita (grid 3×2 de thumbs / player de vídeo / preview de site / colunas kanban / mock chat WhatsApp) | Botão navy por tab → rota do módulo | `activeTab` state local + `AnimatePresence` cross-fade |
| 6 | **S5 Metrics** | Fundo branco entre bordas horizontais finas. 4 contadores `CountUp` (500+, 1200+, 3×, 98% / variante B: 500+, 10h, 40%, 4.8) em navy bold + label cinza | — | Variante AB troca métricas |
| 7 | **S6 Feature Cards Alternados (×4)** | 4 seções full-width alternando `bg-white` e `bg-[#F8FAFF]`, layout 2 colunas com `reverse` a cada ímpar. Cada bloco: badge colorido pill (`#EEF2FF` com texto `#3B5BDB`), H3, descrição, 4 bullets check, link texto. Visual à direita com gradiente pastel do módulo. Temas: Criativos, Vídeos, Site+Portais, CRM | Link texto "Experimente/Acessar" → rota | Array literal, sem dados dinâmicos |
| 8 | **S6b ThemeGallerySection** | Componente importado — galeria de temas de site imobiliário (Brisa/Urbano/Litoral) | — | Dados do componente |
| 9 | **S7 Diferenciais** | Fundo `#F8FAFF`. H2 "Por que escolher a NexoImob AI?" + grid 2 colunas de 4 cards com ícone Lucide em pastilha `bg-[#EEF2FF]` (Zap, Target, Link2, Award) | — | — |
| 10 | **S8 Depoimentos** | Fundo branco. H2 + grid 3 colunas de 3 cards com: 5 estrelas amarelo `#FFD700`, aspas do depoimento em itálico, métrica destaque navy (variante B), avatar circular com iniciais colorido, nome + cidade | — | Variante AB troca depoimentos (com métricas vs sem) |
| 11 | **S9 Planos Preview** | Fundo `#F8FAFF`. H2 "Planos para todos os tamanhos… / Comece com R$97/mês" + grid 2 colunas com apenas **2 cards** (Criativos e Vídeos: `R$97 · R$197 · R$397`) + link texto "Ver todos os planos" → `/precos` | Cada card → `/criativos#planos` ou `/videos#planos` | Variante AB troca subtítulo e copy |
| 12 | **S12 CTA Final** | Fundo navy sólido `#002B5B` com textura radial dots 4% opacidade. Centralizado: H2 branco 3xl–4xl + subtítulo branco 70% + 2 botões lado a lado (primário amarelo `#FFD700` texto navy, secundário outline branco 30%) + microcopy "Reembolso total em 7 dias" (só variante B) | Primário → `/criativos`, secundário → `/videos` | `funnel.clickCTA` tracking |
| 13 | **S13 FAQ** | Fundo branco, `max-w-2xl`. H2 "Perguntas frequentes" + 6 accordions com borda inferior cinza, pergunta em negrito navy, ícone Plus/Minus alternando, resposta cinza `#6B7280` com `AnimatePresence` height animation | — | Variante AB troca 6 perguntas (B foca em "sem cartão"/"imagens fake"/"reembolso") |
| 14 | **Footer** | Componente importado | — | — |
| — | **WhatsAppButton** | Botão flutuante fixo (FAB) canto inferior direito | Abre WhatsApp | — |
| — | **PopupLeadCapture** | Popup modal de captura de lead (provavelmente exit-intent ou timer) | Form de email | Estado interno do popup |

---

## 3. COMPONENTES REUTILIZADOS

**De `@/components`:**
- `Header` — navegação sticky com dropdowns hover
- `HeroSection` — hero com vídeo de fundo (isolado por já ter AB próprio)
- `Footer` — rodapé padrão
- `site/ThemeGallerySection` — galeria de temas de site imobiliário (seção inteira)
- `site/SiteThemeMiniGrid` — grid mini usado como mockup dentro das tabs S4 e das feature cards S6
- `ui/AnnouncementBanner` — barra promocional topo
- `ui/WhatsAppButton` — FAB de WhatsApp
- `ui/PopupLeadCapture` — popup de captura de leads
- `ui/CountUp` — contador animado para métricas

**Inline/locais na página:**
- `Reveal` — wrapper motion com `useInView` que aplica `stagger`/`fadeUp`
- `Accordion` — accordion individual de FAQ (usa `motion.div` + Plus/Minus)

**Ícones (Lucide):** `ArrowRight`, `Check`, `Plus`, `Minus`, `Zap`, `Target`, `Link2`, `Award`.

---

## 4. ESTADO / HOOKS

A home **não consome `useAuth`, `useUserPlan`, nenhum React Query**, nem nenhum context de sessão — é 100% pública e estática (dados em arrays literais no próprio arquivo).

**Hooks usados:**
- `useState<string>("criativos")` — `activeTab` das feature tabs
- `useState<boolean>` — `open` de cada `Accordion` no FAQ
- `useRef<HTMLElement>` — refs de cada seção para IntersectionObserver
- `useRef<HTMLDivElement>` — ref do `Reveal`
- `useRef<boolean>` — `firedRef` do `useSectionTracker` (dedup)
- `useEffect` — `captureAttribution()`, `captureLastTouch()`, `funnel.viewLanding({ variant })` on mount + IntersectionObserver setup/teardown
- `useCallback` — callback do IntersectionObserver
- `useInView` (Framer Motion) — no `Reveal`
- **`useABVariant()`** (custom, `@/hooks/useABVariant`) — retorna `"a" | "b"` e drive toda a lógica de variantes (copy, CTAs, métricas, depoimentos, FAQ)

**Serviços chamados:**
- `captureAttribution`, `captureLastTouch` de `@/services/analytics/utmCapture` — grava UTMs no storage
- `funnel.viewLanding`, `funnel.scrollSection`, `funnel.clickCTA` de `@/lib/funnel` — eventos de funil

---

## 5. ROTAS DE SAÍDA

Todos os links usam `<Link to>` do `react-router-dom` (não há `useNavigate` na página — só no `HeroSection` interno).

**Links para módulos (repetidos em várias seções):**
- `/criativos` — S3 card, S4 tab, S6 bloco 1, S12 CTA primário
- `/videos` — S3 card, S4 tab, S6 bloco 2, S12 CTA secundário
- `/site-imobiliario` — S3 card, S4 tab, S6 bloco 3
- `/crm-imobiliario` — S3 card, S4 tab, S6 bloco 4
- `/whatsapp-imobiliario` — S3 card, S4 tab
- `/publicacao-social` — S3 card (apenas)

**Links para pricing:**
- `/criativos#planos` — S9 card Criativos
- `/videos#planos` — S9 card Vídeos
- `/precos` — S9 footer ("Ver todos os planos e preços")

**Sem rotas para:** `/login`, `/signup`, `/dashboard`, `/app` — a página não direciona explicitamente para autenticação na home (isso está no `Header` importado).

---

## 6. PROBLEMAS VISUAIS DETECTADOS

1. **Repetição massiva dos 6 módulos.** Os mesmos módulos aparecem em S3 (grid de 6 cards), S4 (5 tabs), S6 (4 feature blocks alternados) e S9 (2 cards pricing). O usuário vê "Criativos" 4 vezes em layouts diferentes — cognitive overload e sensação de padding.
2. **Paleta de cor fragmentada.** A página mistura **dois sistemas**: o hero usa `#21346e` + `#FFD700` com fonte Rubik; o restante usa `#0A1628` + `#002B5B` + `#FFD700` com fonte Inter. O design system `ds.*` do Tailwind (com `gold #D4AF37`, `ocean`, `cyan`) **não é usado** — tudo é hex inline literal. Não há token de cor consistente.
3. **Inconsistência tipográfica.** Hero usa `Rubik` + `Plus Jakarta Sans` hardcoded via `style`; resto usa default Tailwind (`font-body` = Inter). `Playfair Display` definida no Tailwind nunca aparece.
4. **Hierarquia dos H2 é plana.** Todas as seções usam o mesmo `text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]` — sem diferenciação entre seções primárias (Soluções, Preços) e secundárias (Diferenciais, FAQ).
5. **S9 Pricing mostra só 2 módulos.** Criativos e Vídeos aparecem, mas o usuário viu 6 módulos em S3. Gera dissonância ("Site+Portais não tem preço?"). O link "Ver todos os planos" tenta mitigar, mas é hierarquicamente fraco.
6. **Os mockups das tabs (S4) são "placeholder-looking".** Retângulos cinza + gradientes pastel vazios — não mostram produto real. Um corretor pode achar que é mock, não produto.
7. **CTAs inconsistentes.** Hero tem botão SVG custom com path cortado em amarelo; S4 usa botão pill navy arredondado; S12 CTA final usa amarelo de novo mas retangular com corner-radius 10px. Três estilos de CTA primário na mesma página.
8. **Badge "Disponível" verde repete 6×+ no grid S3** e mais 2× em S9 — polui visualmente sem adicionar informação (todos estão disponíveis).
9. **Trust strip (S2) é genérico.** Lista de portais sem logos reais, só texto cinza. Parece placeholder.
10. **Ausência de prova visual do produto.** Nenhum screenshot real do produto gerado — só mockups decorativos. Depoimentos em S8 sem foto (só iniciais coloridas) reduzem credibilidade.
11. **Bordas `[1.5px]` custom** (em cards S3, S7, S8) não são token Tailwind — mistura com `border` default em outros lugares.
12. **Espaçamentos desiguais:** S2 tem `py-5`, S5 tem `py-16`, a maioria tem `py-20`. Sem escala clara.

---

## 7. PROMPT PRONTO PRA FIGMA / V0 / LOVABLE

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

**Fim da especificação.** Arquivos-fonte relevantes:
- `C:\Users\Douglas\imob-creator-studio\src\pages\Index.tsx` (555 linhas)
- `C:\Users\Douglas\imob-creator-studio\tailwind.config.ts` (151 linhas)
- `C:\Users\Douglas\imob-creator-studio\src\components\HeroSection.tsx`
- `C:\Users\Douglas\imob-creator-studio\src\components\Header.tsx`
- `C:\Users\Douglas\imob-creator-studio\src\hooks\useABVariant.ts`
- `C:\Users\Douglas\imob-creator-studio\src\lib\funnel.ts`
