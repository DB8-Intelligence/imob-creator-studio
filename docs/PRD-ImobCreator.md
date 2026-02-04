# 📋 Documento de Especificação do Produto (PRD)

## ImobCreator AI — Criativos Imobiliários Inteligentes

**Versão:** 1.0  
**Data:** Fevereiro 2026  
**Status:** Especificação Inicial

---

## 1. Nome do Produto e Slogan

### Nome Principal
**ImobCreator AI**

### Slogan
> *"Criativos profissionais em segundos. Sua marca, seu imóvel, sua venda."*

### Taglines Alternativas
- "Do upload à publicação em 3 cliques"
- "IA que entende o mercado imobiliário"
- "Menos Canva, mais vendas"

---

## 2. Principais Funcionalidades

### 2.1 Upload de Mídia
| Funcionalidade | Descrição |
|----------------|-----------|
| **Upload de Fotos** | Suporte a JPG, PNG, WebP (até 20MB por imagem) |
| **Upload de Vídeos** | Suporte a MP4, MOV (até 500MB, máx. 60s para Reels) |
| **Galeria de Imóvel** | Organização por imóvel com até 50 fotos/vídeos |
| **IA de Enhancement** | Melhoria automática de qualidade, correção de luz e cores |
| **Remoção de Fundo** | Para destacar imóveis ou criar composições |

### 2.2 Geração Automática de Artes

#### Formatos Suportados
```
┌─────────────────────────────────────────────────────────────┐
│  FORMATO          │  DIMENSÕES    │  PLATAFORMA            │
├───────────────────┼───────────────┼────────────────────────┤
│  Feed Quadrado    │  1080×1080    │  Instagram/Facebook    │
│  Feed Retrato     │  1080×1350    │  Instagram/Facebook    │
│  Stories/Reels    │  1080×1920    │  Instagram/TikTok      │
│  Carrossel        │  1080×1080×10 │  Instagram             │
│  Capa Facebook    │  820×312      │  Facebook              │
│  WhatsApp Status  │  1080×1920    │  WhatsApp              │
└─────────────────────────────────────────────────────────────┘
```

#### Tipos de Criativos
1. **Anúncio de Venda** — Destaque do imóvel com preço e CTA
2. **Anúncio de Locação** — Foco em valor mensal e disponibilidade
3. **Lançamento** — Contagem regressiva e exclusividade
4. **Vendido/Alugado** — Celebração de negócio fechado
5. **Antes/Depois** — Comparativo de reformas
6. **Tour Virtual** — CTA para vídeo ou link 360°
7. **Depoimento** — Quote de cliente satisfeito
8. **Dica do Corretor** — Conteúdo educativo
9. **Institucional** — Branding puro da imobiliária

### 2.3 Templates Corporativos Personalizados

#### Marcas Suportadas (Fase 1)
| Marca | Cores Primárias | Logo | Tipografia |
|-------|-----------------|------|------------|
| **Douglas Bonanzza Imóveis** | Azul Marinho (#1E3A5F), Dourado (#D4AF37) | Logo horizontal/vertical | Montserrat Bold + Open Sans |
| **DB8 Imobiliária** | Preto (#18181B), Amarelo (#FACC15) | Logo minimalista | Inter Bold + Inter Regular |

#### Sistema de Templates
- **3 Estilos por Marca:**
  - 🚀 **Express** — Minimalista, foco no imóvel
  - ✨ **Mágico** — Elementos decorativos, gradientes
  - 🎯 **Conversão** — Destaque em preço e CTA agressivo

### 2.4 Gerador de Legendas Inteligentes

#### Componentes da Legenda
```
┌────────────────────────────────────────────────────────┐
│  📍 Localização                                        │
│  🏠 Tipo do imóvel + características principais        │
│  💰 Preço (com formatação)                             │
│  ✨ Benefício emocional                                │
│  👉 CTA (chamada para ação)                            │
│  #️⃣ Hashtags otimizadas (10-15)                       │
│  📞 Contato do corretor                                │
└────────────────────────────────────────────────────────┘
```

#### Exemplos de Legendas Geradas

**Estilo Profissional:**
```
🏡 Casa de Alto Padrão no Alphaville

📍 Alphaville 2, Santana de Parnaíba
📐 630m² | 5 suítes | 4 vagas

Viva o sonho de morar em um dos condomínios mais exclusivos 
de São Paulo. Esta residência oferece acabamentos de primeira 
linha, piscina aquecida e vista panorâmica.

💰 R$ 3.200.000

📲 Agende sua visita exclusiva!
WhatsApp: (11) 99999-9999

#alphaville #casadeluxo #imovelaltoppadrao #douglasbonanzza 
#imoveissp #casaavenda #corretordeimoveis
```

**Estilo Urgente:**
```
⚡ OPORTUNIDADE ÚNICA ⚡

Casa 5 suítes Alphaville 2
DE R$ 3.500.000 POR R$ 3.200.000

🔥 Últimos dias nessa condição!
📲 Chama no direct AGORA

#oportunidade #alphaville #baixou
```

### 2.5 Ajuste com IA

| Recurso | Descrição |
|---------|-----------|
| **Prompt Livre** | "Deixe mais elegante", "Adicione urgência" |
| **Variações** | Gera 3 opções de layout/texto para escolha |
| **Tradução** | Legendas em inglês/espanhol para público internacional |
| **Tom de Voz** | Formal, Amigável, Urgente, Luxo |
| **A/B Testing** | Sugere variações para teste de engajamento |

### 2.6 Exportação

- **Formatos:** PNG, JPG, PDF, MP4 (para vídeos)
- **Qualidade:** Alta resolução (300 DPI para impressão)
- **Pacote:** Download de todas as variações em ZIP
- **Compartilhamento:** Link direto para redes sociais

### 2.7 Biblioteca de Modelos

- **Modelos Prontos:** +100 templates categorizados
- **Favoritos:** Salvar templates preferidos
- **Histórico:** Criativos anteriores para reutilização
- **Busca:** Por tipo, cor, estilo, formato

### 2.8 Agendamento de Posts

- **Calendário Visual:** Visualização mensal de publicações
- **Multi-plataforma:** Instagram, Facebook, LinkedIn
- **Horários Inteligentes:** Sugestão baseada em engajamento
- **Fila de Posts:** Programação em lote

### 2.9 Integrações

| Integração | Funcionalidade |
|------------|----------------|
| **Meta Business Suite** | Publicação direta no Instagram/Facebook |
| **WhatsApp Business API** | Envio de criativos para listas de transmissão |
| **Google Analytics** | Tracking de performance |
| **CRMs Imobiliários** | Import de dados de imóveis (Vista, Jetimob, etc.) |

---

## 3. Fluxo do Usuário (UX)

### 3.1 Jornada Principal

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   [1. CADASTRO]  →  [2. SELEÇÃO]  →  [3. UPLOAD]  →  [4. CRIAÇÃO]      │
│        ↓               ↓               ↓               ↓               │
│   Email/Google    Marca/Estilo      Fotos/Vídeos    Template+IA        │
│                                                                         │
│                   [5. PERSONALIZAÇÃO]  →  [6. EXPORTAR/AGENDAR]        │
│                          ↓                       ↓                      │
│                   Ajustes manuais         PNG/Redes Sociais            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Telas Principais

#### Tela 1: Cadastro e Login
```
┌─────────────────────────────────────────────────────────────┐
│                     ImobCreator AI                          │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              🏠 Bem-vindo!                          │   │
│   │                                                     │   │
│   │   [     Email      ] [    Senha    ]               │   │
│   │                                                     │   │
│   │   [        Entrar        ]                         │   │
│   │                                                     │   │
│   │   ───────── ou ─────────                           │   │
│   │                                                     │   │
│   │   [ G ] Continuar com Google                       │   │
│   │                                                     │   │
│   │   Não tem conta? Criar agora                       │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Tela 2: Seleção de Marca
```
┌─────────────────────────────────────────────────────────────┐
│   ← Voltar                          ImobCreator AI          │
│                                                             │
│         Qual marca você representa?                         │
│                                                             │
│   ┌───────────────────────┐   ┌───────────────────────┐    │
│   │                       │   │                       │    │
│   │   DOUGLAS BONANZZA    │   │        DB8            │    │
│   │       IMÓVEIS         │   │     IMOBILIÁRIA       │    │
│   │                       │   │                       │    │
│   │   [Logo Azul/Dourado] │   │  [Logo Preto/Amarelo] │    │
│   │                       │   │                       │    │
│   │      [ Selecionar ]   │   │      [ Selecionar ]   │    │
│   └───────────────────────┘   └───────────────────────┘    │
│                                                             │
│         💡 Você pode trocar a marca a qualquer momento      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Tela 3: Upload de Mídia
```
┌─────────────────────────────────────────────────────────────┐
│   ← Voltar                     DB8 Imobiliária    [👤]      │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                                                     │   │
│   │           📤 Arraste suas fotos aqui               │   │
│   │                                                     │   │
│   │              ou clique para selecionar              │   │
│   │                                                     │   │
│   │   Formatos: JPG, PNG, WebP, MP4 (máx 20MB/foto)    │   │
│   │                                                     │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   Fotos selecionadas: (3)                                  │
│   ┌────┐ ┌────┐ ┌────┐                                     │
│   │ 📷 │ │ 📷 │ │ 📷 │  [+ Adicionar mais]                 │
│   └────┘ └────┘ └────┘                                     │
│                                                             │
│                        [ Continuar → ]                      │
└─────────────────────────────────────────────────────────────┘
```

#### Tela 4: Escolha de Formato
```
┌─────────────────────────────────────────────────────────────┐
│   ← Voltar                     DB8 Imobiliária    [👤]      │
│                                                             │
│         Escolha o formato do criativo                       │
│                                                             │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐                  │
│   │         │   │         │   │ ┌─┐┌─┐  │                  │
│   │   □     │   │   ▯     │   │ │ ││ │  │                  │
│   │         │   │         │   │ └─┘└─┘  │                  │
│   │  Feed   │   │ Stories │   │Carrossel│                  │
│   │1080×1080│   │1080×1920│   │  Multi  │                  │
│   └─────────┘   └─────────┘   └─────────┘                  │
│                                                             │
│         Escolha o tipo de criativo                          │
│                                                             │
│   [Venda] [Locação] [Lançamento] [Vendido] [Institucional] │
│                                                             │
│                        [ Criar Arte → ]                     │
└─────────────────────────────────────────────────────────────┘
```

#### Tela 5: Editor de Criativos
```
┌─────────────────────────────────────────────────────────────────────────┐
│   ← Voltar                     DB8 Imobiliária               [Salvar]   │
│                                                                         │
│   ┌─────────────────────────────────┐   ┌─────────────────────────────┐ │
│   │                                 │   │  📝 PERSONALIZAR            │ │
│   │       [PREVIEW DO CRIATIVO]     │   │                             │ │
│   │                                 │   │  Título:                    │ │
│   │   ┌─────────────────────────┐   │   │  [Casa Moderna Alphaville ] │ │
│   │   │                         │   │   │                             │ │
│   │   │    🏠 Casa de Luxo      │   │   │  Descrição:                 │ │
│   │   │    Alphaville           │   │   │  [5 suítes · 630m² · Pool ] │ │
│   │   │                         │   │   │                             │ │
│   │   │    R$ 3.200.000         │   │   │  Preço:                     │ │
│   │   │                         │   │   │  [R$ 3.200.000            ] │ │
│   │   │    [Saiba Mais]         │   │   │                             │ │
│   │   │                         │   │   │  CTA:                       │ │
│   │   │         [DB8 Logo]      │   │   │  [Agende sua Visita       ] │ │
│   │   └─────────────────────────┘   │   │                             │ │
│   │                                 │   │  ─────────────────────────  │ │
│   │   Estilo: [Express][Mágico][✓]  │   │                             │ │
│   │                                 │   │  🤖 Ajustar com IA:         │ │
│   └─────────────────────────────────┘   │  [Deixe mais elegante...  ] │ │
│                                         │           [Aplicar IA]      │ │
│                                         │                             │ │
│   [ 🔄 Gerar Variações ]               │  ─────────────────────────  │ │
│                                         │                             │ │
│   ┌────┐ ┌────┐ ┌────┐                 │  📱 Legenda Gerada:         │ │
│   │ V1 │ │ V2 │ │ V3 │                 │  🏡 Casa de Alto Padrão...  │ │
│   └────┘ └────┘ └────┘                 │                             │ │
│                                         │  [📋 Copiar] [✏️ Editar]   │ │
│                                         └─────────────────────────────┘ │
│                                                                         │
│   [ 📥 Baixar PNG ]  [ 📤 Publicar no Instagram ]  [ 📅 Agendar ]      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Tela 6: Calendário de Agendamento
```
┌─────────────────────────────────────────────────────────────┐
│   ← Voltar                     Calendário           [👤]    │
│                                                             │
│          ◀  Fevereiro 2026  ▶                              │
│                                                             │
│   DOM    SEG    TER    QUA    QUI    SEX    SAB            │
│   ┌────┬────┬────┬────┬────┬────┬────┐                     │
│   │    │    │    │    │    │    │  1 │                     │
│   ├────┼────┼────┼────┼────┼────┼────┤                     │
│   │  2 │  3 │  4 │  5 │  6 │  7 │  8 │                     │
│   │    │ 📷 │    │ 📷 │    │ 📷 │    │                     │
│   ├────┼────┼────┼────┼────┼────┼────┤                     │
│   │  9 │ 10 │ 11 │ 12 │ 13 │ 14 │ 15 │                     │
│   │    │ 📷 │    │    │ 📷 │    │    │                     │
│   └────┴────┴────┴────┴────┴────┴────┘                     │
│                                                             │
│   📋 Fila de Publicações:                                   │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ 03/02 10:00  │ Casa Alphaville │ Instagram │ [✏️][🗑]│   │
│   │ 05/02 18:00  │ Apto Moema      │ Facebook  │ [✏️][🗑]│   │
│   │ 07/02 12:00  │ Terreno Granja  │ Instagram │ [✏️][🗑]│   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Stack Tecnológico Sugerido

### 4.1 Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui           │  │
│  │  State: TanStack Query + Zustand                                  │  │
│  │  Canvas: Fabric.js ou Konva.js (edição de imagens)                │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                  │                                      │
│                                  ▼                                      │
│                              BACKEND                                    │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Supabase (via Lovable Cloud)                                     │  │
│  │  - PostgreSQL (dados de usuários, imóveis, templates)             │  │
│  │  - Auth (email, Google, magic link)                               │  │
│  │  - Storage (imagens, vídeos, exports)                             │  │
│  │  - Edge Functions (processamento IA, integrações)                 │  │
│  │  - Realtime (colaboração futura)                                  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                  │                                      │
│                                  ▼                                      │
│                           SERVIÇOS DE IA                                │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Lovable AI Gateway                                               │  │
│  │  - google/gemini-2.5-flash (textos, legendas)                     │  │
│  │  - google/gemini-2.5-flash-image (geração de imagens)             │  │
│  │  - Processamento de prompts imobiliários                          │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                  │                                      │
│                                  ▼                                      │
│                           INTEGRAÇÕES                                   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Meta Graph API (Instagram/Facebook)                              │  │
│  │  WhatsApp Business API                                            │  │
│  │  Stripe (pagamentos)                                              │  │
│  │  Analytics (Mixpanel/Amplitude)                                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Stack Detalhada

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| **Frontend** | React 18 + TypeScript | Ecossistema maduro, tipagem forte |
| **Build** | Vite | Build rápido, HMR instantâneo |
| **Estilos** | TailwindCSS + shadcn/ui | Design system consistente |
| **Canvas** | Fabric.js | Edição de imagens client-side |
| **Estado** | TanStack Query + Zustand | Cache otimizado + estado global simples |
| **Backend** | Supabase (Lovable Cloud) | BaaS completo, sem DevOps |
| **Database** | PostgreSQL | Relacional, robusto, extensível |
| **Storage** | Supabase Storage | S3-compatible, CDN integrado |
| **Auth** | Supabase Auth | OAuth2, MFA, RLS |
| **Functions** | Supabase Edge Functions | Deno, low-latency |
| **IA Texto** | Lovable AI (Gemini) | Integrado, sem API key |
| **IA Imagem** | Lovable AI (Gemini Image) | Geração e edição |
| **Pagamentos** | Stripe | Subscriptions, invoices |
| **Deploy** | Lovable (Vercel-like) | CI/CD automático |
| **Analytics** | Mixpanel | Eventos, funis, retention |
| **Monitoramento** | Sentry | Errors, performance |

### 4.3 Modelo de Dados

```sql
-- Usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  brand_id UUID REFERENCES brands(id),
  subscription_tier TEXT DEFAULT 'free',
  credits_remaining INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marcas/Imobiliárias
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  font_display TEXT,
  font_body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Imóveis
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  address TEXT,
  city TEXT,
  neighborhood TEXT,
  property_type TEXT, -- casa, apartamento, terreno, etc
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_sqm DECIMAL,
  price DECIMAL,
  listing_type TEXT, -- venda, locação
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mídia dos Imóveis
CREATE TABLE property_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT, -- image, video
  is_cover BOOLEAN DEFAULT FALSE,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id),
  name TEXT NOT NULL,
  format TEXT, -- feed, story, carousel
  style TEXT, -- express, magico, conversao
  thumbnail_url TEXT,
  layout_json JSONB,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criativos Gerados
CREATE TABLE creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id),
  template_id UUID REFERENCES templates(id),
  brand_id UUID REFERENCES brands(id),
  title TEXT,
  format TEXT,
  style TEXT,
  content_json JSONB, -- textos, posições, etc
  output_url TEXT,
  caption TEXT,
  hashtags TEXT[],
  status TEXT DEFAULT 'draft', -- draft, scheduled, published
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Publicações Agendadas
CREATE TABLE scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creative_id UUID REFERENCES creatives(id) ON DELETE CASCADE,
  platform TEXT, -- instagram, facebook
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, published, failed
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Requisitos de Integração

### 5.1 Meta Graph API (Instagram/Facebook)

#### Escopo de Permissões Necessárias
```
instagram_basic
instagram_content_publish
pages_show_list
pages_read_engagement
pages_manage_posts
business_management
```

#### Fluxo de Publicação
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Criativo   │ ──► │  Upload p/   │ ──► │  Publicar    │
│   Finalizado │     │  CDN/Storage │     │  via API     │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     URL pública da
                     imagem/vídeo
```

#### Endpoints Principais
| Endpoint | Uso |
|----------|-----|
| `POST /{ig-user-id}/media` | Criar container de mídia |
| `POST /{ig-user-id}/media_publish` | Publicar o container |
| `GET /{ig-user-id}/insights` | Métricas de engajamento |

### 5.2 WhatsApp Business API

- **Cloud API** (recomendado) para envio de templates
- **Catálogo de Mídia** para compartilhamento rápido
- **Listas de Transmissão** para envio em massa

### 5.3 CRMs Imobiliários

| CRM | Tipo de Integração |
|-----|-------------------|
| Vista | API REST (import de imóveis) |
| Jetimob | Webhook (sincronização bidirecional) |
| Imobzi | API REST |
| Kenlo | Webhook |

### 5.4 Analytics

- **Mixpanel**: Eventos de usuário, funis de conversão
- **Meta Pixel**: Retargeting de visitantes
- **Google Analytics 4**: Tráfego e comportamento

---

## 6. Wireframes e Textos de Exemplo

### 6.1 Tela Inicial (Landing Page)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo ImobCreator]              Features  Preços  Login  [Começar]    │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                                                                   │  │
│  │          Criativos Profissionais                                 │  │
│  │          em Segundos ✨                                          │  │
│  │                                                                   │  │
│  │   Gere posts, stories e reels para seus imóveis                 │  │
│  │   com IA. Sem Canva. Sem designer. Sem stress.                  │  │
│  │                                                                   │  │
│  │              [🚀 Criar Meu Primeiro Post — Grátis]              │  │
│  │                                                                   │  │
│  │   ★★★★★ "Economizo 4 horas por semana" — Maria, Corretora       │  │
│  │                                                                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│                        [Preview animado de criativos]                   │
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │ 📸 Upload       │  │ 🎨 Customize    │  │ 📤 Publique     │         │
│  │ Envie as fotos  │  │ Escolha estilo  │  │ Direto nas      │         │
│  │ do imóvel       │  │ e textos        │  │ redes sociais   │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Exemplos de Prompts para IA

#### Prompt de Sistema (Backend)
```
Você é um especialista em marketing imobiliário brasileiro. 
Seu objetivo é criar legendas persuasivas e profissionais para 
posts de Instagram de imóveis.

Regras:
1. Use emojis estrategicamente (máximo 5 por legenda)
2. Destaque os diferenciais do imóvel
3. Crie urgência quando apropriado
4. Inclua CTA claro
5. Gere 10-15 hashtags relevantes
6. Mantenha tom profissional mas acessível
7. Adapte ao perfil da marca (luxo vs popular)

Formato de saída:
{
  "headline": "Frase de impacto (máx 10 palavras)",
  "body": "Texto principal (máx 150 palavras)",
  "cta": "Chamada para ação",
  "hashtags": ["array", "de", "hashtags"]
}
```

#### Prompt de Usuário
```
Crie uma legenda para:
- Tipo: Casa de alto padrão
- Localização: Alphaville 2, Santana de Parnaíba
- Características: 5 suítes, 630m², piscina aquecida, 4 vagas
- Preço: R$ 3.200.000
- Tipo de anúncio: Venda
- Tom: Luxo e exclusividade
- Marca: DB8 Imobiliária
```

#### Prompt para Geração de Imagem
```
Create a professional real estate social media post design:
- Modern minimalist style
- Dark background (#18181B)
- Golden yellow accent (#FACC15)
- Property photo placeholder in center
- Title at top: "Casa de Alto Padrão"
- Price badge: "R$ 3.200.000"
- CTA button: "Agende sua Visita"
- Logo space at bottom right
- 1080x1080 pixels, Instagram feed format
```

---

## 7. Requisitos de Branding

### 7.1 Douglas Bonanzza Imóveis

| Elemento | Especificação |
|----------|---------------|
| **Cores Primárias** | Azul Marinho `#1E3A5F`, Dourado `#D4AF37` |
| **Cores Secundárias** | Branco `#FFFFFF`, Cinza Claro `#F5F5F5` |
| **Tipografia Display** | Montserrat Bold |
| **Tipografia Body** | Open Sans Regular/Medium |
| **Logo** | Escudo com iniciais DB + nome completo |
| **Tom de Voz** | Sofisticado, confiável, tradicional |
| **Palavras-chave** | Experiência, Tradição, Excelência, Confiança |

### 7.2 DB8 Imobiliária

| Elemento | Especificação |
|----------|---------------|
| **Cores Primárias** | Preto `#18181B`, Amarelo `#FACC15` |
| **Cores Secundárias** | Branco `#FFFFFF`, Cinza `#71717A` |
| **Tipografia Display** | Inter Bold / Playfair Display |
| **Tipografia Body** | Inter Regular |
| **Logo** | "DB8" minimalista + barra amarela |
| **Tom de Voz** | Moderno, dinâmico, inovador |
| **Palavras-chave** | Inovação, Agilidade, Tecnologia, Resultados |

### 7.3 Exemplos de Tom de Voz

#### Douglas Bonanzza (Formal/Luxo)
```
"Há mais de 20 anos realizando o sonho da casa própria. 
Conheça esta residência excepcional no coração do Alphaville."
```

#### DB8 (Moderno/Direto)
```
"Encontramos o match perfeito pra você. 🔥
Casa nova, vida nova. Bora agendar?"
```

---

## 8. Plano de Monetização

### 8.1 Modelo Freemium + Créditos

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PLANOS DE ASSINATURA                          │
├─────────────────────┬─────────────────────┬─────────────────────────────┤
│      STARTER        │       PRO           │        BUSINESS             │
│      Grátis         │    R$ 97/mês        │      R$ 297/mês             │
├─────────────────────┼─────────────────────┼─────────────────────────────┤
│ • 10 criativos/mês  │ • 100 criativos/mês │ • Criativos ilimitados      │
│ • 1 marca           │ • 3 marcas          │ • Marcas ilimitadas         │
│ • Templates básicos │ • Todos templates   │ • Templates exclusivos      │
│ • Export PNG        │ • Export PNG/PDF    │ • Export todos formatos     │
│ • Marca d'água      │ • Sem marca d'água  │ • White-label               │
│ • —                 │ • Agendamento       │ • Agendamento + API         │
│ • —                 │ • Legendas IA       │ • IA avançada               │
│ • —                 │ • —                 │ • Multi-usuários            │
│ • —                 │ • —                 │ • Suporte prioritário       │
└─────────────────────┴─────────────────────┴─────────────────────────────┘
```

### 8.2 Créditos Adicionais

| Pacote | Créditos | Preço | Preço/Crédito |
|--------|----------|-------|---------------|
| Básico | 50 | R$ 29 | R$ 0,58 |
| Popular | 150 | R$ 69 | R$ 0,46 |
| Profissional | 500 | R$ 197 | R$ 0,39 |

### 8.3 Planos Corporativos

- **Imobiliária (5-20 corretores):** R$ 497/mês
- **Rede (20-100 corretores):** R$ 1.497/mês
- **Enterprise (100+):** Sob consulta

### 8.4 Projeção de Receita (Ano 1)

| Métrica | Mês 1 | Mês 6 | Mês 12 |
|---------|-------|-------|--------|
| Usuários Free | 500 | 5.000 | 20.000 |
| Usuários Pagos | 20 | 300 | 1.500 |
| MRR | R$ 2.000 | R$ 35.000 | R$ 180.000 |
| ARR | — | — | R$ 2.160.000 |

---

## 9. KPIs e Métricas de Sucesso

### 9.1 Métricas de Aquisição

| Métrica | Meta Mês 1 | Meta Mês 6 | Meta Mês 12 |
|---------|------------|------------|-------------|
| Visitantes únicos | 5.000 | 50.000 | 200.000 |
| Taxa de cadastro | 10% | 12% | 15% |
| CAC (Custo de Aquisição) | R$ 50 | R$ 35 | R$ 25 |

### 9.2 Métricas de Engajamento

| Métrica | Meta |
|---------|------|
| Criativos por usuário/mês | 8+ |
| Tempo médio de criação | < 3 minutos |
| Taxa de exportação | 70%+ |
| Taxa de publicação | 40%+ |
| NPS | 50+ |

### 9.3 Métricas de Conversão

| Métrica | Meta |
|---------|------|
| Free → Paid (30 dias) | 5% |
| Trial → Paid | 25% |
| Churn mensal | < 5% |
| LTV/CAC | > 3x |

### 9.4 Métricas de Produto

| Métrica | Meta |
|---------|------|
| Uptime | 99.9% |
| Tempo de geração IA | < 5s |
| Erros por sessão | < 0.5% |
| Mobile usage | > 40% |

---

## 10. Requisitos de Segurança e Privacidade

### 10.1 Autenticação e Autorização

| Requisito | Implementação |
|-----------|---------------|
| **Autenticação** | Supabase Auth (email, OAuth) |
| **MFA** | Opcional para contas Business |
| **Sessões** | JWT com refresh tokens |
| **RLS** | Row Level Security em todas as tabelas |
| **Rate Limiting** | 100 req/min por usuário |

### 10.2 Proteção de Dados

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Email/senha | PII | Bcrypt hash, SSL |
| Fotos de imóveis | Sensível | Storage privado + RLS |
| Dados de pagamento | PCI-DSS | Stripe (não armazenamos) |
| Tokens Meta | Credenciais | Encrypted at rest |

### 10.3 Conformidade LGPD

| Requisito | Status |
|-----------|--------|
| Consentimento explícito | ✅ Checkbox obrigatório |
| Direito de exclusão | ✅ Botão "Excluir minha conta" |
| Portabilidade | ✅ Export de dados em JSON |
| Política de privacidade | ✅ Link no footer |
| DPO | 📋 Definir responsável |

### 10.4 Infraestrutura

| Camada | Proteção |
|--------|----------|
| Transporte | TLS 1.3 obrigatório |
| Storage | Encryption at rest (AES-256) |
| Database | Backup diário, replicação |
| Edge Functions | Isolamento por request |
| CDN | DDoS protection (Cloudflare) |

### 10.5 Auditoria e Logs

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 11. Roadmap de Desenvolvimento

### Fase 1: MVP (Semanas 1-6)
- [ ] Auth (email + Google)
- [ ] Upload de imagens
- [ ] 2 templates (Feed + Story)
- [ ] 2 marcas (Douglas Bonanzza + DB8)
- [ ] Export PNG
- [ ] Geração de legendas IA

### Fase 2: Core Features (Semanas 7-12)
- [ ] Editor avançado (Fabric.js)
- [ ] 10+ templates por formato
- [ ] Variações automáticas (3 opções)
- [ ] Carrossel
- [ ] Sistema de créditos
- [ ] Stripe integration

### Fase 3: Growth (Semanas 13-20)
- [ ] Agendamento de posts
- [ ] Integração Meta (publicação)
- [ ] Analytics dashboard
- [ ] Multi-usuário (equipes)
- [ ] App mobile (React Native)

### Fase 4: Scale (Semanas 21-30)
- [ ] White-label
- [ ] API pública
- [ ] Integrações CRM
- [ ] IA de geração de imagens
- [ ] Vídeos/Reels automatizados

---

## 12. Próximos Passos

1. **Validação do PRD** — Review com stakeholders
2. **Design System** — Criar tokens e componentes base
3. **Setup Técnico** — Lovable Cloud + estrutura de pastas
4. **MVP Sprint 1** — Auth + Upload + 1 template funcional
5. **User Testing** — 10 corretores beta testers

---

*Documento criado com ❤️ para ImobCreator AI*  
*Última atualização: Fevereiro 2026*
