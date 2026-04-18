# Design Spec — Página Pública `/precos` (ImobCreator AI)

Arquivo-fonte analisado: `src/pages/public/Precos.tsx` (295 linhas)
Paleta: `tailwind.config.ts` (tokens `ds.*` presentes, mas a página usa hex literais)
Data: 2026-04-17

---

## 1. PROPÓSITO

- **Quem é o usuário:** visitante anônimo vindo do site institucional **ou** usuário logado redirecionado por `ModuleProtectedRoute` que tentou acessar um add-on que não possui (ex.: clicou em "Gerar vídeo IA" sem ter o módulo `videos`).
- **O que precisa fazer:** comparar o plano único R$147/mês + 6 add-ons opcionais e decidir comprar (checkout externo Kiwify).
- **Fluxo esperado:** entra (hero) → lê benefícios do plano único → escaneia grid de add-ons (com destaque ring-gold no `missingModule` se aplicável) → lê prova social → tira dúvidas no FAQ → confirma no CTA final navy → sai via link Kiwify em nova aba.

---

## 2. ESTRUTURA VISUAL ATUAL

Ordem das seções no DOM (`<Header />` → seções → `<Footer />`):

### 2.1 Hero (`pt-32 pb-12`, bg branco, centralizado)
- **Banner condicional `missingModule`** (se `location.state.missingModule` existe): caixa amarela `bg-yellow-50 border-yellow-200 rounded-xl`, ícone 🔒, texto "Você precisa do add-on **{missingModule}** para acessar essa funcionalidade."
- **H1:** "Tudo que você precisa para vender mais imóveis" (text-3xl md:text-5xl, font-extrabold, navy `#0A1628`).
- **Subtítulo:** "Um plano completo. Sem surpresas. Cancele quando quiser." (text-lg cinza `#6B7280`).
- Sem CTA no hero.

### 2.2 Plano Único (`pb-20`, bg branco)
- Card único centralizado (`max-w-[480px]`, border-2 navy, rounded-2xl, shadow-lg).
- **Badge topo:** pílula navy com texto branco "🔥 APROVEITAR OFERTA" (absolute -top-3.5, centralizada).
- **Microcopy:** "Plano Completo por menos de R$5 por dia".
- **Preço:** `R$147` em text-5xl navy + `/mês` cinza.
- **CTA primário:** botão navy full-width "Começar agora →" (link externo `VITE_KIWIFY_PROFISSIONAL_URL`, target `_blank`).
- **Sub-CTA textual:** "Corretor independente ou Imobiliárias em crescimento."
- **Grid 2 colunas** com 16 features (check esmeralda + label cinza-900), listadas de `2 sites imobiliários` até `Sem fidelidade`.

### 2.3 Add-ons Grid (`#addons`, bg `#F9FAFB`, `pt-16 pb-20`)
- **H2:** "Potencialize com módulos extras" (text-2xl md:text-3xl navy).
- **Grid responsivo** 1/2/3 colunas (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`), `max-w-6xl`.
- **6 cards** (dados dinâmicos de `addons[]`):

| id | icon | nome | preço | destaque visual |
|---|---|---|---|---|
| `videos` | 🎬 | Vídeos com IA | R$79/mês | borda cinza padrão |
| `videos` | ✨ | Vídeos Premium | R$19/vídeo | borda cinza padrão |
| `whatsapp` | 💬 | WhatsApp Pro | R$49/mês | borda cinza padrão |
| `social` | 📣 | Social Autopilot | R$29/mês | borda cinza padrão |
| `portais` | 🏠 | Portais XML | R$39/mês | borda cinza padrão |
| `bundle` | 🎯 | Bundle Completo | R$147/mês | border-2 amber + badge "Economize R$69" + CTA amber |

- **Estado dinâmico `missingModule`:** card cujo `id` bate com `missingModule` recebe `ring-2 ring-[#FFD700] shadow-xl scale-[1.02] animate-pulse`.
- **CTA card:** "Adicionar +" (navy padrão, amber no bundle), link externo Kiwify por add-on.

### 2.4 Social Proof (`py-16`, bg branco)
- 3 colunas centralizadas com `<CountUp>` animado:
  - `+3.500` corretores
  - `+40h` economizadas/mês
  - `+25%` alcance digital
- Sem CTA, sem título da seção.

### 2.5 FAQ (`py-16`, bg `#F9FAFB`, `max-w-2xl`)
- **H2:** "Perguntas frequentes".
- **Accordion custom** (`useState` local por item), 5 perguntas:
  1. Posso cancelar a qualquer momento?
  2. Os add-ons são obrigatórios?
  3. Quais formas de pagamento são aceitas?
  4. O que acontece quando atinjo 200 posts IA?
  5. Como funcionam os vídeos com IA?
- Abre/fecha com `Plus`/`Minus` icon + `AnimatePresence` (height 0 → auto, duração 0.25s).

### 2.6 CTA Final (`py-20`, bg `#0A1628` navy)
- **H2 branco:** "Pronto para vender mais imóveis?"
- **Botão amber:** "Começar agora por R$147/mês →" (mesmo link Kiwify Profissional).
- **Link secundário branco 70%:** "💬 Falar com nosso time no WhatsApp" (abre `wa.me` hardcoded com número placeholder `5511999999999`).

### 2.7 Garantia (`py-10`, bg branco)
- Pílula única centralizada `bg-emerald-50 text-emerald-700 border-emerald-200`: "✅ 30 dias de garantia".

### 2.8 Footer
- Importado do componente global `@/components/Footer`.

---

## 3. COMPONENTES REUTILIZADOS

| Componente | Origem | Uso |
|---|---|---|
| `Header` | `@/components/Header` | Topbar global da área pública |
| `Footer` | `@/components/Footer` | Rodapé global |
| `CountUp` | `@/components/ui/CountUp` | Contadores animados (3 instâncias) |
| `motion`, `AnimatePresence`, `useInView` | `framer-motion` | Reveal on-scroll + accordion |
| Ícones `Check`, `Plus`, `Minus`, `ArrowRight`, `MessageCircle` | `lucide-react` | Ícones inline |

**Componentes locais (definidos no próprio arquivo, não reutilizáveis fora):**
- `Reveal` — wrapper com `useInView` (amount 0.1, once true) que dispara variants `stagger`.
- `Accordion` — item de FAQ isolado com `useState(open)`.

Observação: não usa nenhum primitivo shadcn/ui (`Card`, `Button`, `Accordion` do Radix). A página foi feita com Tailwind puro + hex literais, o que a desacopla do token system `ds.*` definido em `tailwind.config.ts`.

---

## 4. ESTADO / HOOKS

| Hook | Escopo | Função |
|---|---|---|
| `useLocation()` | `PrecosPage` (raiz) | Lê `location.state.missingModule` (string opcional) injetado via `navigate('/precos', { state: { missingModule: 'videos' } })` |
| `useState<boolean>(false)` | `Accordion` (por item) | Controla abertura de cada pergunta (estado isolado, não compartilhado — impossível ter "só uma aberta por vez") |
| `useRef<HTMLDivElement>` + `useInView(ref, { once: true, amount: 0.1 })` | `Reveal` | Dispara animação `fadeUp` + `stagger` quando 10% da seção entra no viewport |
| `import.meta.env.VITE_KIWIFY_*_URL` | Módulo | 7 URLs de checkout Kiwify resolvidas em build-time (fallback `"#"`) |

Sem contexto, sem queries, sem auth — página 100% estática a não ser pelo `missingModule` e pelo `CountUp`.

---

## 5. ROTAS DE SAÍDA

### Links externos Kiwify (`target="_blank"`, `rel="noopener noreferrer"`)
- `VITE_KIWIFY_PROFISSIONAL_URL` — usado 2x (card plano + CTA final navy).
- `VITE_KIWIFY_ADDON_VIDEOS_FFMPEG_URL` — card "Vídeos com IA".
- `VITE_KIWIFY_ADDON_VIDEOS_PREMIUM_URL` — card "Vídeos Premium".
- `VITE_KIWIFY_ADDON_WHATSAPP_PRO_URL` — card "WhatsApp Pro".
- `VITE_KIWIFY_ADDON_SOCIAL_AUTOPILOT_URL` — card "Social Autopilot".
- `VITE_KIWIFY_ADDON_PORTAIS_XML_URL` — card "Portais XML".
- `VITE_KIWIFY_ADDON_BUNDLE_URL` — card "Bundle Completo".

### Links externos diretos
- `https://wa.me/5511999999999?text=Quero%20saber%20mais%20sobre%20o%20NexoImob` — número **hardcoded placeholder** (problema: número fake em produção).

### Navegações internas
- Nenhuma via `Link`/`navigate()`. O único ancora interno é `#addons` (seção), mas não há nada apontando para ele nesta página — possivelmente usado pelo `Header` ou por CTAs de outras páginas.

---

## 6. PROBLEMAS VISUAIS DETECTADOS

1. **Hierarquia CTA confusa no plano único**: o badge "🔥 APROVEITAR OFERTA" compete com o próprio preço. A microcopy "Plano Completo por menos de R$5 por dia" aparece **acima** do preço, criando ordem de leitura invertida (gancho antes do produto).
2. **Zero CTA no hero** — usuário precisa scrollar para encontrar o botão "Começar agora". Taxa de clique no above-the-fold fica dependente do card único abaixo.
3. **Duplicação de IDs nos add-ons**: dois cards têm `id: "videos"` (FFMPEG e Premium). Se `missingModule === "videos"`, ambos pulsam — ambiguidade visual.
4. **Mistura preço/recorrência**: "R$19/vídeo" ao lado de "R$79/mês", "R$147/mês" e "R$29/mês" sem separador visual ou agrupamento. O visitante precisa ler cada card para entender o modelo (recorrente vs unitário).
5. **Bundle com mesmo preço do plano (R$147/mês)** vira cognitive load: usuário pode confundir o "Bundle Completo add-ons" com o "Plano Completo base" — ambos custam R$147 com CTAs de cor diferente mas posicionamento similar.
6. **CTA repete 3x** no mesmo destino (Kiwify Profissional): card plano, CTA final navy, além de potencial CTA no Header. Em telas médias a seção "Garantia" fica solta entre CTA final e Footer, sem papel visual claro.
7. **Desacoplamento de tokens**: hex literais (`#0A1628`, `#FFD700`, `#6B7280`, `#F9FAFB`, `#E5E7EB`, `#374151`) em vez do design-system `ds.ocean`, `ds.gold`, etc. Divergência do `tailwind.config.ts`: o projeto define `ds.gold: #D4AF37` mas a página usa `#FFD700` e `amber-400` da paleta padrão do Tailwind.
8. **Tipografia inconsistente**: `tailwind.config.ts` declara `font-display: Playfair Display` e `font-body: Inter`, mas a página não aplica nenhuma dessas classes (usa o default). O prompt do usuário pede Rubik + Plus Jakarta Sans — nenhuma das duas está configurada no Tailwind.
9. **FAQ com 5 perguntas e todos collapsados por padrão** — zero descoberta de conteúdo para quem não clica. Sem indicação de qual pergunta é mais relevante.
10. **WhatsApp hardcoded fake** (`5511999999999`) — problema de release para produção, não apenas visual, mas aparece como link.
11. **Social Proof sem título** — 3 números soltos entre add-ons e FAQ. Falta ancoragem narrativa ("+ de 3.500 corretores já confiam...").
12. **Garantia isolada em seção própria** de 40px (`py-10`) sem integração visual ao CTA final — deveria estar logo abaixo do botão navy para reforçar confiança no momento da decisão.
13. **Animação `animate-pulse` + `scale-[1.02]` no missingModule** em loop infinito pode ser perceived como piscante/cansativo; vale trocar por um glow mais sutil (`animate-pulse-glow` já disponível nos keyframes).

---

## 7. PROMPT PRONTO PRA FIGMA / V0 / LOVABLE

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

*Spec gerada em 2026-04-17 para `/precos` público. Fonte: `src/pages/public/Precos.tsx`.*
