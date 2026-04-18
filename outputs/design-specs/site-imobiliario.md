# Site Imobiliário — Especificação Visual

Rota: `/site-imobiliario`
Arquivo fonte: `src/pages/SiteImobiliario.tsx` (~30KB)
Brand ImobCreator: navy `#0A1628` + gold `#FFD700` (confirmado em `tailwind.config.ts` como palette `ds.ocean #0B1F2A` + `ds.gold #D4AF37` — variante premium)
Fontes: `Playfair Display` (display), `Inter` (body)

---

## 1. PROPÓSITO

**Persona:** Corretor(a) ativo com módulo Site contratado, que quer ter presença digital própria sem depender de desenvolvedor. Geralmente 35-55 anos, conforto médio com tecnologia, já usa Instagram e portais de anúncio. Quer parecer profissional, não "feito em template".

**Objetivo (1 frase):** Configurar visual, conteúdo, domínio e SEO do site público do corretor e publicá-lo em minutos com preview ao vivo.

**Fluxo esperado:**
1. Entra em **/site-imobiliario** → se `created_at === updated_at` dispara `SiteOnboardingWizard` (primeira vez).
2. Aba **Perfil** → preenche foto, nome, CRECI, bio, especialidades (chips), contatos e redes sociais.
3. Aba **Aparência** → escolhe 1 de 9 temas (brisa, urbano, litoral, dark-premium, nestland, nexthm, ortiz, quarter, rethouse) + ajusta cores primária/secundária.
4. Aba **Hero** → faz upload do banner (1200×400), escreve título e subtítulo.
5. Aba **Domínio** → define `slug.nexoimobai.com.br` e/ou domínio customizado (`www.seunome.com.br`) + verifica DNS (CNAME + A record).
6. Aba **SEO** → meta título (60c), meta descrição (160c), Google Analytics ID; preview de snippet Google.
7. Observa **preview lado-a-lado (60% da tela, scale 0.5)** atualizando via autosave de 1200ms.
8. Clica **Publicar** → badge vira `Publicado` e o link `{slug}.nexoimobai.com.br` fica acessível.

---

## 2. ESTRUTURA VISUAL ATUAL

Layout é **split em 2 painéis full-height (100vh - 4rem)**:

### Painel Esquerdo — Editor (`lg:w-[40%]`, scroll vertical, bg-card)
- **Header (linha única):**
  - Esquerda: `h1 "Meu Site"` + subtítulo `"Configure seu site profissional"`.
  - Direita: `Badge` de status (`Publicado` default / `Rascunho` secondary) + botão `Publicar` / `Despublicar` (ícone `Eye` / `EyeOff`).
- **Auto-save indicator** (condicional, abaixo do header): `Loader2` + texto `"Salvando..."` em `text-muted-foreground`.
- **Tabs horizontais** (`TabsList` bg-muted, 5 abas com ícone + label em `text-xs`):
  1. `Perfil` (`User`) — foto upload (círculo 80×80 dashed), grid 2-col para Nome/CRECI, textarea Bio (maxLength 300 + contador), chips de Especialidades (10 opções togglables, estilo pill com X quando selecionada), grid 2-col para Anos/Telefone/WhatsApp/E-mail, grid 2-col para Instagram/Facebook/LinkedIn/YouTube.
  2. `Aparência` (`Paintbrush`) — grid 2-3 cols de 9 cards de tema (cada um com gradient 48px preview + label + descrição + `CheckCircle2` gold quando selecionado, border `#D4AF37` + ring 30% opacity). Color pickers nativos para cor primária/secundária.
  3. `Hero` (`ImageIcon`) — upload de banner dashed h-36, input título, input subtítulo.
  4. `Domínio` (`Globe`) — 2 `Card`s: **Endereço do Site** (slug sanitizado + sufixo `.nexoimobai.com.br` + link preview com `ExternalLink`) e **Domínio Customizado** (input + bloco DNS font-mono com 3 cols mostrando `CNAME www cname.vercel-dns.com` e `A @ 76.76.21.21` + botão `Verificar DNS` com `ShieldCheck` + badge `Domínio verificado` quando `site.dominio_verificado`).
  5. `SEO` (`Search`) — meta título (maxLength 60 + contador), meta descrição (maxLength 160 + contador), Google Analytics ID, **Card "Preview no Google"** (título azul, URL verde, descrição cinza — replica SERP).

### Painel Direito — Preview (`lg:w-[60%]`, bg-muted/30, hidden no mobile)
- Badge topo `Preview ao vivo` com `Eye`.
- Container `max-w-[640px]`, `rounded-xl`, `border`, `bg-white`, `shadow-sm`.
- **Browser chrome fake**: 3 dots (red/yellow/green) + pill de URL `{slug}.nexoimobai.com.br`.
- **Viewport scaled**: div fixa `height: 720px`, renderiza `ThemeRenderer` dentro de wrapper `width: 1280` com `transform: scale(0.5)` e `transformOrigin: top left` (preview desktop encolhido, sem toggle mobile).
- Legenda: `"Preview em tempo real — as alterações aparecem conforme você edita."`

### Dados dinâmicos observados
- Status publicação: boolean `site.publicado` → `Badge` text.
- Slug sanitizado em tempo real (`toLowerCase + replace /[^a-z0-9-]/g`).
- Contador Bio `(draft.bio ?? "").length`/300; Meta título/60; Meta descrição/160.
- `site.dominio_verificado` → badge verde.
- Autosave debounce 1200ms via `useRef<setTimeout>`.
- **Não há** dashboard de leads/views/contador de imóveis nesta tela (possível fragmentação vs. `/site-leads`).

---

## 3. COMPONENTES REUTILIZADOS

Do código atual:
- `AppLayout` — shell com sidebar + topbar (`@/components/app/AppLayout`).
- `Tabs` / `TabsContent` / `TabsList` / `TabsTrigger` — shadcn.
- `Card` / `CardContent` / `CardHeader` / `CardTitle` — shadcn (usado em Domínio e SEO preview).
- `Input`, `Textarea`, `Label`, `Button`, `Badge` — shadcn.
- `Loader2`, `User`, `Paintbrush`, `ImageIcon`, `Globe`, `Search`, `Eye`, `EyeOff`, `CheckCircle2`, `Upload`, `X`, `Info`, `ExternalLink`, `ShieldCheck` — lucide-react.
- `ThemeRenderer` (`@/components/site-temas/ThemeRenderer`) — recebe `{ site, imoveis, depoimentos }` e renderiza o tema escolhido.
- `SiteOnboardingWizard` (`@/components/site/SiteOnboardingWizard`) — modal/overlay de primeira configuração.
- `TEMAS` (array de 9 objetos `{id, label, preview}`) + `type TemaCorr` (`@/types/site`).

Componentes **implícitos/ausentes** que a spec do usuário sugere (não encontrados na página):
- `PropertyPicker` — aba "Imóveis em destaque" **não existe** neste arquivo; seleção de imóveis é delegada ao `ThemeRenderer` que recebe `imoveis={[]}` (vazio no preview).
- `TestimonialEditor` — aba "Depoimentos" **não existe** aqui; `depoimentos={[]}` passado hardcoded.
- Integração XML de portais (aba XML) **não existe** neste arquivo.

---

## 4. ESTADO / HOOKS

```ts
const { toast } = useToast();
const { data: site, isLoading } = useSite();                    // GET corretor_sites (single row)
const { mutate: updateSite, isPending: isSaving } = useUpdateSite();
const { mutate: publishSite, isPending: isPublishing } = usePublishSite();

const [draft, setDraft] = useState<Partial<CorretorSite>>({});
const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const firstLoad = useRef(true);
```

**Patterns-chave:**
- `patchDraft(field, value)` — atualiza draft local + enfileira `updateSite({ [field]: value })` após **1200ms de debounce**.
- Seed inicial via `useEffect` com guard `firstLoad.current` para evitar sobrescrever draft com dados stale.
- `previewSite` — computed: merge `site + draft` + defaults (nome "Seu Nome", cores, tema "brisa").
- `showOnboarding` — heurística `site && !site.publicado && created_at === updated_at` (primeira visita).
- `toggleEspecialidade(esp)` — lê/grava array `draft.especialidades` imutavelmente.
- `publishSite(!site.publicado)` — toggle boolean.

Hooks **não presentes** (mencionados pela spec, mas ausentes): `useAuth`, `useUserSubscriptions`, `useQuery(site_themes)` — temas vêm de constante estática `TEMAS`.

---

## 5. ROTAS DE SAÍDA

A página **não tem `navigate()` explícito** — é uma tela terminal focada em config.

Rotas relacionadas ao módulo Site (via link externo ou abas irmãs no sidebar):
- `https://{slug}.nexoimobai.com.br` — site público renderizado (rota pública `/c/:slug` ou subdomínio).
- `/site-leads` — dashboard de leads capturados pelo site (não linkado daqui).
- `/site-preview` — preview fullscreen (se existir).
- `/integracoes` — integração XML de portais (Viva Real / ZAP / OLX) — **não existe** como aba aqui.
- `ExternalLink` no slug apenas exibe URL, não abre.

Pontos de saída potenciais que **faltam**:
- Botão "Ver site publicado" (abrir em nova aba após publicar).
- Link para gestão de imóveis (`/imoveis`) dentro da aba de conteúdo.
- Link para `/site-leads` com contador de novos leads.

---

## 6. PROBLEMAS VISUAIS DETECTADOS

1. **Abas escondidas / escopo incompleto** — Spec original pede 7 abas (Tema, Conteúdo, Imóveis, Depoimentos, Contato, Domínio, Portais XML); o código tem **apenas 5** (Perfil, Aparência, Hero, Domínio, SEO). Não há gerenciamento de imóveis em destaque, depoimentos ou XML — o corretor precisa sair da página para editar esse conteúdo, quebrando o fluxo.

2. **Preview com dados falsos** — `ThemeRenderer` recebe `imoveis={[]}` e `depoimentos={[]}` hardcoded. O corretor vê um tema vazio no preview, não o site real com seus imóveis — experiência enganosa antes de publicar.

3. **Escala 0.5 fixa, sem toggle mobile** — O preview renderiza 1280×720 escalado a 50%. Não há toggle Desktop/Tablet/Mobile, embora responsividade seja crítica para site imobiliário (70%+ tráfego mobile).

4. **Estados de publicação ambíguos** — Apenas 2 estados (`Rascunho` / `Publicado`). Faltam:
   - `Pending domain verification` (domínio customizado não validado).
   - `Publicado com problemas` (ex: sem imóveis, sem foto).
   - `Publicando...` (durante a mutation).
   - Checklist pré-publicação (campos obrigatórios preenchidos).

5. **DNS em mono-font ilegível** — Bloco DNS (`CNAME www cname.vercel-dns.com`) em 3 columns font-mono + `text-xs` é difícil de copiar; falta botão "Copiar" por linha.

6. **Feedback de autosave fraco** — Indicador `Salvando...` aparece só no topo, some rapidamente. Não há "Salvo às 14:32" nem estado de erro ("Falha ao salvar — tentando novamente").

7. **Onboarding opaco** — Lógica `created_at === updated_at` é frágil: qualquer save disparado antes de o usuário ver o wizard o desabilita permanentemente. Melhor: flag explícita `onboarding_completed`.

8. **Cognitive load na aba Perfil** — 15+ inputs numa única aba, sem agrupamento visual (Identidade / Contato / Redes). Scroll longo no painel 40%.

9. **Cor primária/secundária via `<input type="color">` nativo** — UI cross-browser inconsistente, sem preset de paletas do tema escolhido. Corretor pode escolher cores que quebram o tema.

10. **Mobile = sem preview** — painel direito `hidden lg:flex` significa que no mobile (< 1024px) o corretor edita às cegas.

11. **Sem indicação de campos obrigatórios** — Nenhum `*` em labels. Corretor pode "publicar" sem foto, sem bio, sem telefone.

12. **Botão Publicar sem confirmação** — Toggle imediato sem dialog "Tem certeza? Seu site ficará público em `{slug}.nexoimobai.com.br`".

---

## 7. PROMPT PRONTO PRA FIGMA/V0/LOVABLE

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
