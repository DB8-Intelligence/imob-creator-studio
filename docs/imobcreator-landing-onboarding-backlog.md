# Backlog direto — Landing + Onboarding do ImobCreatorAI

## Contexto
Este backlog consolida os aprendizados de dois briefings concorrenciais sobre geradores de criativos com IA e os traduz para implementação direta no repositório do ImobCreatorAI.

Tese central:
- concorrentes genéricos convertem bem por causa de velocidade, simplicidade, promessa visual forte e baixa barreira técnica
- o ImobCreatorAI deve manter essa simplicidade inicial, mas superar em nicho imobiliário, profundidade de produto, vídeo, aprovação e automação

---

## OBJETIVO
Melhorar:
- conversão da landing
- ativação inicial do usuário
- time-to-first-value
- clareza do posicionamento
- descoberta do módulo de vídeo e do fluxo principal

---

# FRONTEND — LANDING

## LAND-001 — Refatorar hero principal
**Objetivo:** posicionar o produto com promessa clara de resultado e velocidade.
**Implementar:**
- nova headline com criativo + copy + vídeo
- subheadline orientada a resultado
- CTA principal "Começar grátis"
- CTA secundário "Ver demonstração"
- reforço visual de produção imobiliária com IA
**Critério de aceite:** hero comunica valor em até 5 segundos e deixa claro que não é um gerador genérico.
**Arquivos-alvo sugeridos:**
- `src/components/HeroSection.tsx`
- assets/ilustrações do hero, se necessário

## LAND-002 — Adicionar faixa de métricas abaixo do hero
**Objetivo:** ancorar percepção de velocidade e capacidade.
**Implementar:**
- `< 5 min` para criativo e copy
- `4 formatos` prontos para redes sociais
- `100% IA + aprovação`
- `vídeo como add-on premium`
**Critério de aceite:** faixa escaneável e imediatamente visível após o hero.
**Arquivos-alvo sugeridos:**
- `src/components/HeroSection.tsx`

## LAND-003 — Simplificar seção “Como funciona”
**Objetivo:** reduzir fricção cognitiva.
**Implementar:**
1. envie imagem ou ideia
2. IA gera criativo, copy e/ou vídeo
3. revise, aprove e publique
- adicionar link para “ver fluxo avançado do dashboard”
**Critério de aceite:** visitante entende o fluxo principal em poucos segundos.
**Arquivos-alvo sugeridos:**
- `src/components/HowItWorksSection.tsx`

## LAND-004 — Criar seção “Por que é diferente”
**Objetivo:** explicitar superioridade contra geradores genéricos.
**Implementar blocos:**
- feito para o mercado imobiliário
- não só imagem: copy + vídeo + aprovação
- brand kit por cliente
- automação com dashboard + n8n
**Critério de aceite:** landing diferencia o produto de criadores visuais genéricos.
**Arquivos-alvo sugeridos:**
- nova seção `src/components/WhyDifferentSection.tsx`
- `src/pages/Index.tsx`

## LAND-005 — Fortalecer prova social
**Objetivo:** aumentar credibilidade e reduzir objeção.
**Implementar:**
- 3 depoimentos com nome/cargo/empresa
- blocos visuais de validação
- opcional: logos/clientes
**Critério de aceite:** seção posicionada antes de pricing ou próxima da proposta de valor.
**Arquivos-alvo sugeridos:**
- `src/components/SocialProofSection.tsx`

## LAND-006 — Reforçar CTA final
**Objetivo:** aumentar fechamento de sessão.
**Implementar:**
- headline final orientada a ação
- subtexto conectando ideia -> criativo -> vídeo -> aprovação
- CTAs “Criar conta grátis” e “Ver planos”
**Critério de aceite:** final da landing fecha com argumento forte e direto.
**Arquivos-alvo sugeridos:**
- `src/components/CTASection.tsx`

## LAND-007 — Reforçar posicionamento do módulo criativo rápido
**Objetivo:** vender rapidez para não-designers.
**Implementar:**
- seção sobre transformar ideias em criativos profissionais
- texto enfatizando que o sistema assume a parte técnica
- foco em Instagram e Facebook como canais prioritários
**Critério de aceite:** landing deixa explícito que a plataforma reduz dependência de designer.
**Arquivos-alvo sugeridos:**
- nova seção ou ajuste em `FeaturesSection.tsx`
- `TemplatesSection.tsx`

## LAND-008 — Ajustar header para conversão
**Objetivo:** priorizar ativação e descoberta.
**Implementar:**
- CTA “Começar grátis” sempre visível
- destaque para “Vídeos IA” e/ou “Criar conteúdo”
**Critério de aceite:** header empurra claramente para cadastro/uso.
**Arquivos-alvo sugeridos:**
- `src/components/Header.tsx`

---

# FRONTEND — ONBOARDING

## ONB-001 — Criar bifurcação inicial: modo rápido x modo profissional
**Objetivo:** atender usuário iniciante e operador avançado.
**Implementar:**
- modo rápido: imagem + ideia + gerar
- modo profissional: briefing + branding + copy + variações + vídeo
**Critério de aceite:** usuário escolhe jornada logo no início.
**Arquivos-alvo sugeridos:**
- `src/pages/Dashboard.tsx`
- `src/components/dashboard/ActionCardsSection.tsx`
- novo componente de escolha de modo

## ONB-002 — Criar tela de primeira intenção pós-login
**Objetivo:** começar por objetivo, não por configuração técnica.
**Pergunta:** “O que você quer gerar hoje?”
**Opções:**
- post para Instagram
- criativo para anúncio
- vídeo do imóvel
- pacote completo
**Critério de aceite:** primeira tela pós-login reduz indecisão e acelera ação.
**Arquivos-alvo sugeridos:**
- `src/pages/Dashboard.tsx`
- componentes de hub inicial

## ONB-003 — Reduzir campos do primeiro uso
**Objetivo:** encurtar o caminho até o primeiro output útil.
**Implementar no primeiro fluxo:**
- imagem
- objetivo
- tipo de saída
**Depois do primeiro resultado:**
- refinar copy
- trocar template
- adicionar branding
- gerar vídeo
**Critério de aceite:** o primeiro uso tem baixa fricção real.
**Arquivos-alvo sugeridos:**
- `src/pages/CreateCreativeHub.tsx`
- `src/pages/Upload.tsx`
- fluxos de geração inicial

## ONB-004 — Mostrar resultado antes de ensinar recursos avançados
**Objetivo:** provar valor antes de explicar o sistema.
**Implementar:**
- após primeira geração, mostrar preview
- depois sugerir brand kit, biblioteca, vídeo, aprovação
**Critério de aceite:** onboarding é orientado a valor, não tutorial teórico.
**Arquivos-alvo sugeridos:**
- `src/pages/CreateCreativeHub.tsx`
- componentes de preview/empty states

## ONB-005 — Criar checklist inicial dentro do dashboard
**Objetivo:** guiar ativação contínua.
**Checklist sugerido:**
- gerar primeiro criativo
- configurar brand kit
- gerar primeira copy
- testar vídeo IA
- revisar biblioteca
- ativar automação
**Critério de aceite:** checklist persiste progresso do usuário.
**Arquivos-alvo sugeridos:**
- `src/pages/Dashboard.tsx`
- seção de onboarding/checklist

## ONB-006 — Onboarding comercial do módulo de vídeo
**Objetivo:** melhorar descoberta e upsell.
**Regras:**
- se Pro/VIP: mostrar acesso ao vídeo
- se sem acesso: CTA para ativar o módulo
**Critério de aceite:** usuário entende seu estado e próximo passo comercial.
**Arquivos-alvo sugeridos:**
- `src/pages/Dashboard.tsx`
- `src/pages/VideosPricingPage.tsx`
- `src/pages/PlanPage.tsx`

## ONB-007 — Hub inicial de criação
**Objetivo:** reduzir indecisão e organizar entrada no produto.
**Cards sugeridos:**
- Criar criativo
- Criar anúncio
- Criar vídeo
- Gerar pacote completo
**Critério de aceite:** hub inicial orienta o primeiro clique útil.
**Arquivos-alvo sugeridos:**
- `src/components/dashboard/ActionCardsSection.tsx`
- `src/pages/Dashboard.tsx`

---

# COPY / UX WRITING

## COPY-001 — Refatorar linguagem técnica para linguagem de resultado
**Objetivo:** tornar a experiência amigável para não-designers.
**Trocar:**
- “pipeline”, “parâmetros”, “configuração avançada”
**Por:**
- “gere seu primeiro criativo”
- “transforme sua ideia em post”
- “crie um vídeo do imóvel em minutos”
**Critério de aceite:** primeira experiência fala de resultado, não de sistema.
**Arquivos-alvo sugeridos:**
- textos do dashboard
- textos das páginas de criação
- landing principal

## COPY-002 — Mensagens por etapa do fluxo
**Objetivo:** guiar o usuário de forma clara.
**Exemplos:**
- upload: “Envie a imagem do imóvel”
- geração: “A IA está transformando seu conteúdo em uma peça pronta”
- preview: “Revise antes de publicar”
- vídeo: “Transforme suas fotos em um vídeo pronto para reels”
**Critério de aceite:** cada etapa explica claramente a ação e o próximo passo.

---

# ANALYTICS / BACKEND SUPPORT

## ONB-BE-001 — Registrar marcos do onboarding
**Objetivo:** medir ativação real.
**Eventos mínimos:**
- signup_created
- first_login
- first_generation_started
- first_generation_completed
- brand_kit_configured
- video_module_viewed
- video_addon_activated
**Critério de aceite:** eventos disponíveis por usuário/workspace.
**Arquivos-alvo sugeridos:**
- camada de analytics / event bus
- integração frontend + backend

## ONB-BE-002 — Medir time-to-first-value
**Objetivo:** acompanhar o principal KPI de onboarding.
**Métrica:**
- tempo entre criação de conta e primeiro output útil gerado
**Critério de aceite:** métrica disponível para leitura operacional.

---

# PRIORIDADE DE IMPLEMENTAÇÃO

## Sprint 1 — Conversão da landing
- LAND-001
- LAND-002
- LAND-003
- LAND-004
- LAND-008

## Sprint 2 — Ativação inicial do produto
- ONB-001
- ONB-002
- ONB-003
- ONB-007

## Sprint 3 — Profundidade e retenção
- ONB-004
- ONB-005
- ONB-006
- COPY-001
- COPY-002

## Sprint 4 — Otimização comercial e analítica
- LAND-005
- LAND-006
- LAND-007
- ONB-BE-001
- ONB-BE-002

---

# RESULTADO ESPERADO

Ao final, o ImobCreatorAI deve:
- converter melhor na landing
- parecer mais rápido e mais simples para novos usuários
- entregar primeiro valor mais cedo
- se diferenciar claramente de geradores criativos genéricos
- comunicar profundidade superior com copy + vídeo + aprovação + automação
