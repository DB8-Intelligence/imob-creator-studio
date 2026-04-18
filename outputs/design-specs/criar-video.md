# Spec Visual — Página "Criar Vídeo" (VideoCreatorPage)

**Arquivo analisado:** `src/pages/VideoCreatorPage.tsx` (≈55 KB, 1138 linhas)
**Tailwind tokens:** `tailwind.config.ts` — fontes `Playfair Display` (display) + `Inter` (body); paleta shadcn via CSS-vars (`--accent`, `--primary`, `--foreground`); palette pública `ds.gold #D4AF37`, `ds.ocean #0B1F2A`, sombras `shadow-gold-*` e `shadow-elevated`. A marca navy `#0A1628` + gold `#FFD700` documentada no MASTER é aproximada pelos tokens `--primary` (navy escuro) e `--accent` (gold — no tema usado como `ds.gold #D4AF37`, variação da `#FFD700`).

---

## 1. PROPÓSITO

- **Persona:** corretor/imobiliária com add-on ativo (Plus R$79/mês — 600 créditos / 15 fotos / 1080p; ou Premium R$19/vídeo — 4K, 20 fotos, prioridade). Usuários sem add-on caem no `PlanGate`.
- **Objetivo (1 frase):** transformar 6–20 fotos do imóvel em um vídeo vertical/horizontal profissional com Ken Burns, música e transições automáticas, em menos de 3 minutos.
- **Fluxo esperado:**
  1. Entra em `/video-creator` (ou via prefill vindo de `/video-dashboard`).
  2. **Step 0** — sobe 6–20 fotos (drag & drop).
  3. **Step 1** — escolhe template narrativo, preset visual (câmera) e formato (Reels 9:16 / Feed 1:1 / YouTube 16:9).
  4. **Step 2** — escolhe mood de trilha, confirma resumo e dispara geração.
  5. Aguarda render (ffmpeg Ken Burns padrão — 5 min timeout; Veo opcional para clips IA).
  6. Baixa MP4, vê na biblioteca, cria outro vídeo ou volta ao dashboard.

---

## 2. ESTRUTURA VISUAL ATUAL

Layout em container `max-w-5xl` centralizado, scroll único, empilhado verticalmente dentro do `AppLayout`:

1. **Header hero** — `section` rounded-3xl com gradient `from-card to-muted/40`, badge "Novo módulo" (accent/gold), título display "Criador de Vídeos IA", subtítulo e grid de 3 métricas (tempo, resolução do plano, duração estimada, movimento padrão — na verdade 4 blocos).
2. **Stepper horizontal** — 3 pílulas ("Upload de fotos" / "Template & estilo" / "Trilha & gerar") separadas por chevrons; estado atual = `bg-accent`, concluído = `bg-emerald-500/15` com `CheckCircle2`, pendente = `bg-muted`.
3. **Step 0 — Upload:** card com aviso de conteúdo proibido (pessoas identificáveis / documentos — borda âmbar), drop zone pontilhada grande, grid 4/6/8 colunas de thumbs quadradas com botão X no hover, contador "N/max fotos" e botão "Próximo" desabilitado até 6 fotos.
4. **Step 1 — Template & estilo:** card com 3 blocos em coluna:
   - **Tipo de vídeo** (grid 3 cols de `VIDEO_TEMPLATE_LIST` — emoji + badge duração + nome + tagline + best_for).
   - **Estilo visual** (grid 3 cols de `VISUAL_PRESET_LIST` — emoji + ritmo + nome + sensação).
   - **Formato de saída** (grid 3 cols de `FORMATS` — nome + ratio mono + plataformas).
   - **Bloco resumo de duração** (muted/30, 4 linhas: fotos, s/foto, duração estimada, resolução).
5. **Step 2 — Trilha & gerar:**
   - Card "Trilha sonora" com grid 2/3 cols de `MUSIC_MOOD_LIST`.
   - Grid `lg:[1fr,320px]` com:
     - **Coluna esquerda:** card "Resumo do vídeo" (6 tiles 2-cols: template, estilo, trilha, formato, fotos, duração); faixa de thumbs (12 + contador +N); botões "Editar configurações" e "Gerar vídeo com IA" (accent, full-width).
     - **Coluna direita (sticky-like):** card "Status da geração" — painel navy/primary com badges do config atual; durante render mostra `Loader2` + progress bar pulsante 3/5; pós-render mostra `<video controls>`, card emerald de sucesso, CTAs "Baixar vídeo", "Ver na Biblioteca", "Criar outro vídeo".
6. **Dados dinâmicos:**
   - Créditos restantes (via `overview.addOn.credits_used` + `planRule`).
   - Máximo de fotos (`maxPhotosAllowed`) e resolução (`resolutionLabel`) derivados do plano.
   - Duração calculada (`estimateVideoDuration(templateId, photos.length)`).
   - Custo estimado (`estimateVideoCost` — monetization) — registrado em metadata, não exibido ao usuário.
   - Progresso Veo `veoProgress.current/total` quando engine alternativo está ativo.

---

## 3. COMPONENTES REUTILIZADOS

**Layout & shell:**
- `AppLayout` (`@/components/app/AppLayout`) — container com sidebar/header do app.

**shadcn/ui:**
- `Card` + `CardContent` — blocos de seção.
- `Button` — variantes default/outline/ghost, tamanho `lg`.
- `Badge` — variantes default/secondary/outline.
- `Label` — títulos dos grupos.

**Ícones (lucide-react):**
- `Upload`, `X`, `ChevronRight`, `ChevronLeft`, `Film`, `Download`, `Zap`, `Lock`, `Crown`, `Star`, `CheckCircle2`, `Loader2`, `ImageIcon`, `Music`.

**Componentes inline (não extraídos, mas candidatos a extração):**
- `PlanGate` — gate com 2 cards (Plus/Premium) + CTA "Ver planos".
- Drop zone de upload (poderia ser `PhotoUploader`).
- `PhotoThumb` com X no hover (poderia ser `PhotoGridItem`).
- Cards de escolha Template/Preset/Format/Mood (mesmo padrão `rounded-xl border p-4 text-left` com seleção `ring-1 ring-accent`) — candidatos a `SelectableCard`.
- Painel de status (`StatusPanel` — idle/generating/generated).
- `VideoPreview` (tag `<video>` embutida).

**Nenhum componente dedicado existe atualmente** — toda a UI é inline na página. A spec assume extração de `PropertySelector`, `StyleCard`, `VideoPreview`, `MusicSelector`, `VoiceoverInput` no redesign (voiceover ainda não existe na página).

---

## 4. ESTADO / HOOKS

**Contextos e auth:**
- `useAuth()` — user atual (`src/contexts/AuthContext`).
- `useWorkspaceContext()` — `workspaceId`.
- `useUserPlan()` — plano do usuário (`pro`/`vip`/outro) → determina acesso e tier default.

**Dados do módulo vídeo:**
- `useVideoModuleOverview(workspaceId)` — `overview.addOn` com `addon_type` e `credits_used`.
- `useCreateVideoJob(workspaceId)` / `useUpdateVideoJobStatus(workspaceId)` / `useReleaseVideoCredit(workspaceId)` — mutações (React Query).

**Polling (engine Veo opcional):**
- `useVeoPolling()` — `startPolling`, `results`, `isPolling`.
- `pollJobUntilDone(jobId, { intervalMs: 3000, timeoutMs: 300_000 })` — engine ffmpeg padrão.

**Form state (complexo, 10+ `useState`):**
- `step` (0/1/2), `photos: UploadedPhoto[]`, `templateId`, `presetId`, `moodId`, `format`, `generating`, `generated`, `videoUrl`, `dragging`, `engine` ("ffmpeg_kenburns"|"veo_video"), `veoProgress`, `pendingJobId`.
- `fileInputRef: HTMLInputElement` para dispatch de upload.

**Derivados / regras de plano:**
- `resolveVideoPlanTier()`, `getVideoPlanRule()`, `getUploadSummary()` — limites por plano.
- `getDefaultVideoMotionPreset()`, `getVideoMotionPresetConfig()` — motion presets.
- `getVideoTemplate()`, `estimateVideoDuration()`, `VIDEO_TEMPLATE_LIST` — templates.
- `VISUAL_PRESET_LIST` / `getVisualPreset()` — presets visuais.
- `MUSIC_MOOD_LIST` / `getMusicMood()` / `moodToPayloadValue()` — trilha.
- `resolvePresetForTemplate()`, `resolveLegacyPresetId()`, `getVideoPreset()` — preset engine v2.

**Monetização (efeitos colaterais):**
- `estimateVideoCost()`, `checkBeforeGenerate()`, `logVideoStarted()`, `logVideoCompleted()`, `logVideoFailed()`.

**Integração/analytics:**
- `dispatchN8nEvent("video_completed" | "video_failed", …)`.
- `trackEvent(user.id, "video_module_viewed" | "first_generation_started" | "first_generation_completed", …)`.

**Prefill vindo da navegação:**
- `location.state` como `VideoCreatorPrefill` (templateId, presetId, moodId, format) — dispara toast e `window.history.replaceState({}, "")`.

---

## 5. ROTAS DE SAÍDA

`useNavigate()` + `<a href>`:

- `navigate("/plano")` — CTA do `PlanGate` (quando usuário sem add-on).
- `navigate("/library")` — botão "Ver na Biblioteca" após geração concluída.
- `<a href="/termos" target="_blank">` — link "Ver Termos de Uso" no aviso de conteúdo proibido e rodapé de consentimento.
- `<a href={videoUrl} download=…>` — download direto do MP4 gerado.

**Rotas esperadas pela spec, mas NÃO implementadas nesta página:**
- `/video-dashboard` (entrada via prefill vem da dashboard, mas não há botão de retorno explícito).
- `/dashboard/videos/:id` (job detail — não navegado aqui; o vídeo aparece inline).
- `/video-plans` — não referenciada.
- `/video-styles` — não referenciada.

**Observação:** o botão "Criar outro vídeo" não navega — apenas reseta estado local (`setStep(0)`, `setPhotos([])`).

---

## 6. PROBLEMAS VISUAIS DETECTADOS

1. **Scroll único muito longo no Step 2** — 4 seções grandes empilhadas (trilha, resumo 6-tiles, faixa de thumbs, status panel) forçam scroll vertical extenso no mobile; status panel não é sticky.
2. **Preview do vídeo pequeno e tardio** — o `<video>` final aparece apenas dentro da coluna lateral de 320px; em mobile ele ocupa a largura, mas em desktop fica confinado a ~320px, subutilizando o espaço para um formato de mídia que pede destaque.
3. **Ausência de preview em tempo real** — o usuário só vê o resultado após o render completo (3–5 min em ffmpeg, mais em Veo). Não há mock/preview animado do Ken Burns antes de clicar "Gerar".
4. **Estado de loading "cego"** — a progress bar é estática `w-3/5` com `animate-pulse`, não reflete progresso real; não há ETA nem feedback de etapa (upload → transcode → render → finalize).
5. **Decision paralysis no Step 1** — 3 seletores simultâneos (template, preset visual, formato) dentro do mesmo card, cada um com 3 opções e duas camadas de metadados (badge + tagline + best_for). 9 decisões expostas de uma vez sem recomendação clara.
6. **Template + preset visual competem semanticamente** — a distinção entre "Tipo de vídeo" e "Estilo visual" é sutil (template narra a história; preset define a câmera). Usuário provavelmente não diferencia "luxury template" de "luxury visual preset".
7. **Trilha sem pré-escuta** — `MUSIC_MOOD_LIST` é selecionável apenas por nome/emoji/descrição; não há player `<audio>` para ouvir o mood antes de comprometer 1 crédito.
8. **Voiceover não existe** — a spec prevê `VoiceoverInput` mas a página não tem campo de locução/narração; oportunidade clara para redesign (Premium tier).
9. **Modo "IA básico vs Premium cinematográfico" invisível** — `engine: ffmpeg_kenburns|veo_video` existe em state mas não tem toggle UI; usuário nunca escolhe explicitamente.
10. **Sem compartilhamento direto** — ausência de "Compartilhar no WhatsApp", "Postar no Instagram" ou copy link; fluxo termina em `download` ou `/library`.
11. **Header duplica informação** — 4 métricas "< 3 min / resolução / duração / movimento" repetem dados que também aparecem no resumo do Step 2.
12. **Aviso LGPD/termos** em azul-âmbar ocupa espaço proeminente no Step 0, mas o texto legal do rodapé no Step 2 é quase invisível (`text-[11px] text-muted-foreground/60`).

---

## 7. PROMPT PRONTO PRA FIGMA/V0/LOVABLE

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
