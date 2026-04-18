# WhatsApp Inbox — Especificação Visual

**Arquivo analisado:** `src/pages/dashboard/whatsapp/WhatsAppInboxPage.tsx`
**Tokens de marca:** `tailwind.config.ts` (palette `ds.*` — navy/ocean + gold `#D4AF37`; página atual usa navy literal `#002B5B`)

---

## 1. PROPÓSITO

- **Persona:** corretor imobiliário com módulo WhatsApp ativo, instância Evolution API conectada, recebendo leads via campanhas, anúncios Meta e cards do ImobCreator.
- **Objetivo:** atender todos os leads do WhatsApp sem sair do dashboard — inbox unificado com contexto do lead imobiliário ao lado.
- **Fluxo esperado:** corretor entra em `/dashboard/whatsapp/inbox` → vê lista de conversas ordenadas por última mensagem → busca/filtra → seleciona um contato → lê histórico no chat central → responde (texto/template/mídia) → consulta ficha do lead no painel direito → arquiva ou volta pra lista.

---

## 2. ESTRUTURA VISUAL ATUAL

Layout **split-pane de 2 colunas** dentro de um container com borda `rounded-xl` e altura `calc(100vh - 200px)`:

- **Header da página:** título `Conversas WhatsApp` em navy `#002B5B` + subtítulo cinza.
- **Coluna esquerda (340px fixos):**
  - Campo de busca com ícone `Search` (shadcn `Input`).
  - Lista scrollável de contatos (botões): nome/telefone em navy bold, última mensagem truncada em cinza, timestamp relativo (`agora`, `5min`, `2h`, `3d`) no canto direito.
  - Estado ativo: fundo `bg-[#002B5B]/[0.04]`.
  - Loading: spinner `Loader2`. Empty: círculo navy/10 com ícone `Inbox`.
- **Coluna direita (flex-1):** `ChatWindow` quando há contato selecionado; senão empty state central com ícone `MessageSquare`, título `Selecione uma conversa` e hint.
- **Ausente hoje:** 3ª coluna de painel de contato/lead, header de status da instância, unread badges, filtros por status, indicador de digitação, barra de anexos.
- **Dados dinâmicos:** lista via edge function `whatsapp-instance?action=contacts`; novas mensagens chegam via Supabase Realtime no canal `whatsapp-inbox-realtime-contacts` (INSERT em `whatsapp_inbox`) e atualizam a lista + disparam toast.

---

## 3. COMPONENTES REUTILIZADOS

- `Card`, `Badge`, `Input` — shadcn/ui
- Ícones `lucide-react`: `MessageSquare`, `Image`, `Video`, `FileText`, `Inbox`, `Loader2`, `Search`
- `ChatWindow` — `@/components/whatsapp/ChatWindow` (renderização do chat ativo, mensagens e input)
- `useToast` — feedback de nova mensagem
- `useAuth` — sessão do usuário
- Cliente `supabase` — auth session + realtime channel

**Componentes a extrair/criar:**
- `ConversationList` (coluna esquerda com busca + lista)
- `ConversationItem` (cada botão da lista)
- `MessageBubble` (balão texto/imagem/vídeo/documento)
- `MessageInput` (textarea + anexos + templates + enviar)
- `TypingIndicator` (3 pontinhos animados)
- `ContactPanel` / `LeadCard` (coluna direita — foto, telefone, tags, imóvel de interesse, link pro CRM)
- `ConnectionStatusBadge` (pill verde/vermelho no header)
- `QuickRepliesBar` (botões de templates rápidos)

---

## 4. ESTADO / HOOKS

- `useAuth()` — `user` da sessão; gating do fetch inicial.
- `useToast()` — notificação de nova mensagem recebida.
- `useState<Contact[]>` — `contacts`, `loading`, `search`, `selectedPhone`.
- `useCallback callEdge(action, params)` — wrapper fetch pra edge function `functions/v1/whatsapp-instance` com Bearer do `session.access_token`.
- `useEffect #1` — carrega `contacts` via `callEdge("contacts")` quando `user` muda.
- `useEffect #2` — assina canal Supabase Realtime `postgres_changes` (INSERT em `public.whatsapp_inbox`) → atualiza/insere contato no topo da lista + toast.
- **Pendente migrar pra `@tanstack/react-query`** (`useQuery(['wa-contacts'])`, `useQuery(['wa-messages', phone])`) pra cache, refetch on focus e paginação.
- **Pendente hook** `useUserSubscriptions` pra validar plano com módulo WhatsApp (bloquear inbox se não contratou).
- **Pendente hook** `useWhatsAppInstance` pra status de conexão (`connected | disconnected | qrcode | pairing`) consumido no header.

---

## 5. ROTAS DE SAÍDA

- `/dashboard/whatsapp` — setup da instância, QR code, status de conexão (empty state quando instância desconectada deve linkar pra cá).
- `/dashboard/whatsapp/fluxos` — automações, bot, respostas automáticas, funis.
- `/dashboard/whatsapp/templates` — gerenciar templates rápidos / respostas salvas.
- `/dashboard/leads/:leadId` — ficha do lead no CRM (quando `contact.phone` bate com um lead cadastrado, painel direito linka pra cá).
- `/dashboard/imoveis/:imovelId` — imóvel de interesse vinculado ao lead.
- `/dashboard` — voltar ao hub.

---

## 6. PROBLEMAS VISUAIS DETECTADOS

1. **Layout 3 colunas ausente** — hoje só tem 2 colunas; painel de contato/lead (direita) não existe, perdendo contexto imobiliário.
2. **Mobile quebrado** — `w-[340px]` fixo + `flex` lado a lado força scroll horizontal em telas <768px; precisa stack (tabs ou drawer) + breakpoint tablet com lista+chat.
3. **Status de conexão invisível** — não há indicador de instância `connected/disconnected` no header; corretor descobre que está offline só quando tenta enviar.
4. **Sem unread badge** — lista não diferencia conversas com mensagens não lidas; todas têm mesmo peso visual.
5. **Sem filtros** — falta tabs `Todas | Não lidas | Leads | Arquivadas` e filtro por etiqueta.
6. **Sem templates/quick replies** — corretor digita saudação repetida toda hora; falta barra de respostas rápidas acima do input.
7. **Empty state quando instância desconectada** — cair em "Selecione uma conversa" sem CTA pra reconectar é frustrante; deveria mostrar alerta + botão `Conectar WhatsApp`.
8. **Scroll infinito não implementado** — `ChatWindow` ao carregar histórico longo vai lagar; precisa paginação reversa + `IntersectionObserver` no topo.
9. **Timestamp relativo sem fallback absoluto** — `3d` fica ambíguo depois de 7 dias; precisa mostrar data (`12/abr`) pra conversas antigas.
10. **Sem indicador de digitação** — Evolution API emite `presence.update` mas UI ignora.
11. **Cor navy inconsistente** — página usa `#002B5B` literal, enquanto design-system em `tailwind.config.ts` define paleta `ds.ocean #0B1F2A` / `ds.gold #D4AF37`; padronizar.
12. **Realtime sem deduplicação** — mesma mensagem reprocessada pode duplicar contato na lista.

---

## 7. PROMPT PRONTO PRA FIGMA/V0/LOVABLE

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
