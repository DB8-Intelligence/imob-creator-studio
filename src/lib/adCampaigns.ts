/**
 * adCampaigns.ts — Full paid-traffic structure for NexoImob AI.
 * Used by CampaignBuilderPage to generate UTM links and export briefs.
 *
 * Covers:
 *  - Meta Ads: 4 campaigns × 5 creatives × 2 copy variants
 *  - Google Ads: 4 keyword campaigns × 3 headline sets × 2 descriptions
 */

// ── Shared types ──────────────────────────────────────────────────────────────

export type Platform = "meta" | "google";
export type AdFormat = "feed" | "story" | "reels" | "search" | "pmax";

export interface CopyVariant {
  id:          "A" | "B";
  headline:    string;   // ≤ 40 chars (Meta primary text headline) / ≤ 30 chars (Google)
  body:        string;   // primary text for Meta; description for Google
  cta:         string;   // button label
}

export interface Creative {
  id:         string;
  concept:    string;         // short concept label
  hook:       string;         // first line / scroll-stopper
  format:     AdFormat[];     // supported formats
  visualNote: string;         // brief for the designer/AI
  copy:       CopyVariant[];
}

export interface AdCampaign {
  id:          string;
  platform:    Platform;
  name:        string;
  icp:         string;         // target persona
  objective:   "traffic" | "leads" | "conversions";
  destination: string;         // relative path
  utmCampaign: string;
  utmSource:   "meta" | "google";
  utmMedium:   "cpc" | "paid_social";
  budgetNote:  string;
  targetingNote: string;
  creatives:   Creative[];
}

// ── Meta Ads ──────────────────────────────────────────────────────────────────

const metaCampanha1: AdCampaign = {
  id:           "meta_corretores",
  platform:     "meta",
  name:         "Corretores Autônomos",
  icp:          "Corretor autônomo, 25–55 anos, BR, usa Instagram para divulgar imóveis",
  objective:    "conversions",
  destination:  "/lp/criar-posts-imoveis",
  utmCampaign:  "corretores_posts",
  utmSource:    "meta",
  utmMedium:    "paid_social",
  budgetNote:   "Começar R$30/dia, escalar quando CPA < R$40",
  targetingNote: "Interesses: mercado imobiliário, CRECI, Zap Imóveis, Viva Real. Cargo: corretor de imóveis. Lookalike 1% de usuários ativos.",
  creatives: [
    {
      id: "meta_c1_cr1",
      concept: "Antes/Depois — post amador vs profissional",
      hook: "Esse post fez o imóvel ser vendido em 2 dias.",
      format: ["feed", "reels"],
      visualNote: "Split-screen: foto tirada com celular sem edição × post gerado pelo NexoImob AI com copy e branding. Resultado: 'Vendido em 2 dias'.",
      copy: [
        {
          id: "A",
          headline: "Post profissional em 3 minutos",
          body: "Você passa horas editando posts de imóveis enquanto poderia estar fazendo visitas. NexoImob AI transforma 3 fotos em post profissional com copy pronta. Grátis para testar.",
          cta: "Criar meu primeiro post",
        },
        {
          id: "B",
          headline: "3 fotos → post que vende",
          body: "Corretores que postam mais, vendem mais. Mas criar post bom leva tempo — ou tirava. Agora leva 3 minutos. NexoImob AI faz tudo: layout, copy, legenda, branding.",
          cta: "Testar grátis agora",
        },
      ],
    },
    {
      id: "meta_c1_cr2",
      concept: "Velocidade — demo ao vivo 3 minutos",
      hook: "Quanto tempo você gasta por post de imóvel?",
      format: ["reels", "story"],
      visualNote: "Tela do celular ou browser mostrando o fluxo: upload de 3 fotos → spinner 'gerando' → post finalizado. Timer visível no canto. Música rápida.",
      copy: [
        {
          id: "A",
          headline: "3 minutos. Post profissional.",
          body: "Você filma. NexoImob AI transforma em post, legenda e story em menos de 3 minutos. Sem Canva, sem designer, sem espera.",
          cta: "Ver como funciona",
        },
        {
          id: "B",
          headline: "Menos edição, mais visitas",
          body: "Cada hora editando posts é uma hora que você não passa com cliente. NexoImob AI elimina esse tempo — post profissional gerado automaticamente.",
          cta: "Testar grátis",
        },
      ],
    },
    {
      id: "meta_c1_cr3",
      concept: "FOMO — seus concorrentes já usam",
      hook: "Seus concorrentes já estão usando IA para criar posts.",
      format: ["feed", "story"],
      visualNote: "Texto estático ou animado simples. Fundo escuro premium. Estatística '18.000+ posts gerados no Brasil'. Tom urgente mas elegante.",
      copy: [
        {
          id: "A",
          headline: "18.000 posts gerados. E os seus?",
          body: "Mais de 18.000 posts imobiliários criados com IA no Brasil. Corretores que adotaram primeiro estão se destacando no Instagram. Entre antes que o mercado sature.",
          cta: "Entrar agora — é grátis",
        },
        {
          id: "B",
          headline: "O corretor do lado já usa.",
          body: "NexoImob AI já gerou mais de 18.000 posts profissionais para corretores em todo o Brasil. Seus concorrentes aparecem mais. Seus imóveis chegam primeiro.",
          cta: "Criar minha conta grátis",
        },
      ],
    },
    {
      id: "meta_c1_cr4",
      concept: "Volume — 400 posts por mês sozinho",
      hook: "400 posts por mês. Sem equipe. Sem agência.",
      format: ["feed"],
      visualNote: "Grid do Instagram mostrando identidade visual consistente e alta frequência de posts. Todos com branding do corretor. Contador animado.",
      copy: [
        {
          id: "A",
          headline: "Poste todo dia sem esforço",
          body: "Corretor que some do feed perde relevância. Com NexoImob AI você consegue criar post para cada imóvel do portfólio em minutos — e manter o Instagram ativo sem virar editor.",
          cta: "Montar meu portfólio visual",
        },
        {
          id: "B",
          headline: "Consistência que vende",
          body: "Os melhores corretores do Brasil postam todo dia. O segredo não é ter mais tempo — é ter IA trabalhando por você. NexoImob AI cria posts, legendas e stories no piloto automático.",
          cta: "Começar gratuitamente",
        },
      ],
    },
    {
      id: "meta_c1_cr5",
      concept: "Depoimento — corretor real com resultado",
      hook: "Esse corretor triplicou o alcance dos seus imóveis em 30 dias.",
      format: ["feed", "reels"],
      visualNote: "Depoimento em texto ou vídeo curto. Foto do corretor com nome/cidade/CRECI. Resultado em destaque ('3x mais alcance', 'vendido em 5 dias').",
      copy: [
        {
          id: "A",
          headline: "\"Vendi em 5 dias com esse post\"",
          body: "Rafael C., corretor em São Paulo, gerou um post com NexoImob AI e fechou a venda em 5 dias. 'O cliente disse que comprou pelo post antes de ver o imóvel pessoalmente.'",
          cta: "Quero resultados assim",
        },
        {
          id: "B",
          headline: "Avaliação 5 estrelas de corretores",
          body: "Centenas de corretores no Brasil já usam NexoImob AI para criar posts profissionais. O retorno médio? Mais visitas, mais leads, menos tempo editando.",
          cta: "Testar grátis — sem cartão",
        },
      ],
    },
  ],
};

const metaCampanha2: AdCampaign = {
  id:           "meta_imobiliarias",
  platform:     "meta",
  name:         "Imobiliárias",
  icp:          "Gerente/dono de imobiliária, 30–60 anos, BR, equipe de 3–30 corretores",
  objective:    "leads",
  destination:  "/para-imobiliarias",
  utmCampaign:  "imobiliarias_gestao",
  utmSource:    "meta",
  utmMedium:    "paid_social",
  budgetNote:   "R$50/dia — público menor, ticket maior. Objetivo: lead qualificado para demo.",
  targetingNote: "Cargo: diretor, gerente, sócio. Setor: imobiliário. Tamanho da empresa: 10–200. Lookalike de usuários com workspace > 3 membros.",
  creatives: [
    {
      id: "meta_c2_cr1",
      concept: "Custo — economia vs designer freelancer",
      hook: "R$ 3.000/mês em designer freelancer para criar posts de imóveis.",
      format: ["feed"],
      visualNote: "Comparativo visual: lista de custos (designer R$3k, agência R$5k, in-house R$6k) vs NexoImob AI (plano da imobiliária). ROI claro.",
      copy: [
        {
          id: "A",
          headline: "Corte R$3k/mês em design",
          body: "Uma imobiliária com 10 corretores gasta em média R$3.000/mês para criar posts manualmente — entre freelancer, tempo interno e retrabalho. NexoImob AI elimina esse custo e mantém identidade visual profissional em todos os anúncios.",
          cta: "Ver planos para imobiliárias",
        },
        {
          id: "B",
          headline: "Sua imobiliária gasta quanto em design?",
          body: "Freelancer de design, Canva Pro, horas do gerente revisando posts... O custo real de criar conteúdo para 10+ corretores é alto. NexoImob AI centraliza tudo com IA e brand kit automático.",
          cta: "Solicitar demo",
        },
      ],
    },
    {
      id: "meta_c2_cr2",
      concept: "Identidade visual — consistência entre corretores",
      hook: "10 corretores. 10 estilos de post diferentes. Um cliente confuso.",
      format: ["feed", "story"],
      visualNote: "Grid com 10 posts de 10 corretores diferentes mostrando inconsistência (antes) → grid uniforme com brand kit da imobiliária (depois).",
      copy: [
        {
          id: "A",
          headline: "Brand kit para toda a equipe",
          body: "Com NexoImob AI, todos os posts da sua imobiliária seguem a mesma identidade visual automaticamente. Cada corretor gera posts com sua logo, cores e fontes — sem precisar treinamento.",
          cta: "Ver como funciona",
        },
        {
          id: "B",
          headline: "Identidade visual em escala",
          body: "Imobiliárias que mantêm identidade visual consistente são percebidas como mais profissionais e confiáveis. NexoImob AI garante isso para todos os corretores da sua equipe ao mesmo tempo.",
          cta: "Quero ver uma demo",
        },
      ],
    },
    {
      id: "meta_c2_cr3",
      concept: "Workflow — aprovação antes de publicar",
      hook: "Seu corretor acabou de publicar um post com erro. De novo.",
      format: ["feed"],
      visualNote: "Mockup da interface de aprovação: lista de posts pendentes com botão 'Aprovar' e 'Solicitar ajuste'. Fundo escuro, tom profissional.",
      copy: [
        {
          id: "A",
          headline: "Aprovação de posts em 1 clique",
          body: "Com NexoImob AI, você revisa e aprova cada post antes de publicar. Sem posts com erro, sem identidade visual fora do padrão, sem surpresas no feed da imobiliária.",
          cta: "Controlar minha equipe",
        },
        {
          id: "B",
          headline: "Gestão de conteúdo para imobiliárias",
          body: "Cada corretor cria. Você aprova. NexoImob AI conecta a criação de posts ao fluxo de aprovação da sua imobiliária — tudo centralizado em um painel.",
          cta: "Ver o painel de gestão",
        },
      ],
    },
    {
      id: "meta_c2_cr4",
      concept: "Escala — onboarding rápido para equipe",
      hook: "Novos corretores prontos para postar no primeiro dia.",
      format: ["reels", "story"],
      visualNote: "Timeline de onboarding: Dia 1 (configurar brand kit) → Dia 1 (primeiro post gerado) → Semana 1 (10 posts publicados). Velocidade.",
      copy: [
        {
          id: "A",
          headline: "Onboard em 5 minutos",
          body: "Com NexoImob AI, qualquer novo corretor consegue criar posts profissionais no primeiro dia. Brand kit já configurado, IA já treinada com seu portfólio. Zero curva de aprendizado.",
          cta: "Montar meu brand kit",
        },
        {
          id: "B",
          headline: "Sua equipe cria. A IA padroniza.",
          body: "Não dependa do talento individual de cada corretor para ter posts profissionais. NexoImob AI garante qualidade consistente independente de quem cria o post.",
          cta: "Conhecer os planos",
        },
      ],
    },
    {
      id: "meta_c2_cr5",
      concept: "Analytics — relatório de criatividade da equipe",
      hook: "Qual corretor da sua equipe está produzindo mais conteúdo?",
      format: ["feed"],
      visualNote: "Dashboard mockup mostrando ranking de corretores por posts criados, taxa de aprovação, imóveis processados. Tom de gestão/dados.",
      copy: [
        {
          id: "A",
          headline: "Relatório de produtividade por corretor",
          body: "NexoImob AI mostra quem está criando mais conteúdo, quais imóveis estão com mais posts e qual corretor está mais ativo no marketing. Dados para gerir com precisão.",
          cta: "Ver o dashboard",
        },
        {
          id: "B",
          headline: "Dados que mostram quem produz mais",
          body: "Tome decisões baseadas em dados: quem precisa de mais suporte, quais imóveis precisam de mais exposição, quais posts têm melhor performance. Tudo no painel de gestão.",
          cta: "Quero esses dados",
        },
      ],
    },
  ],
};

const metaCampanha3: AdCampaign = {
  id:           "meta_automacao",
  platform:     "meta",
  name:         "Automação Imobiliária",
  icp:          "Gerente de marketing, diretor comercial ou dono de imobiliária que já testou automação",
  objective:    "conversions",
  destination:  "/lp/automacao-imobiliaria",
  utmCampaign:  "automacao_imobiliaria",
  utmSource:    "meta",
  utmMedium:    "paid_social",
  budgetNote:   "R$40/dia. Público mais sofisticado, ciclo de venda maior. Foco em demonstração de produto.",
  targetingNote: "Interesses: automação, n8n, CRM imobiliário, marketing digital B2B. Comportamento: small business owners. Exclua quem já converteu.",
  creatives: [
    {
      id: "meta_c3_cr1",
      concept: "Multi-canal — WhatsApp + Instagram + portal",
      hook: "1 imóvel cadastrado. Posts automáticos no Instagram, WhatsApp e portais.",
      format: ["feed", "reels"],
      visualNote: "Fluxograma animado: imóvel no centro → setas saindo para Instagram, WhatsApp, OLX, Zap. Tudo acontecendo ao mesmo tempo sem intervençãohumana.",
      copy: [
        {
          id: "A",
          headline: "1 cadastro → distribuição automática",
          body: "Com NexoImob AI, você cadastra o imóvel uma vez e ele aparece no Instagram, no WhatsApp da equipe e nos portais — com posts profissionais criados pela IA, sem digitar uma linha.",
          cta: "Ver a automação em ação",
        },
        {
          id: "B",
          headline: "Automação que entende de imóvel",
          body: "Não é automação genérica. É automação treinada para o mercado imobiliário: copy que destaca benefícios, formato certo para cada canal, identidade visual da sua imobiliária.",
          cta: "Quero ver como funciona",
        },
      ],
    },
    {
      id: "meta_c3_cr2",
      concept: "Workflow — do cadastro à publicação sem digitar",
      hook: "Último post que você criou manualmente: foi a última vez.",
      format: ["reels"],
      visualNote: "Screencast do fluxo: formulário de imóvel preenchido → IA gerando posts → aprovação com 1 clique → publicação agendada. Timer total: 3 min.",
      copy: [
        {
          id: "A",
          headline: "Post aprovado em 1 clique",
          body: "Você já tentou automatizar o marketing da sua imobiliária e desistiu porque era complexo demais? NexoImob AI faz tudo em 3 passos: cadastra, revisa, aprova. Sem código, sem integrações complicadas.",
          cta: "Testar a automação",
        },
        {
          id: "B",
          headline: "Do cadastro à publicação: 3 minutos",
          body: "A maioria das ferramentas de automação não foi feita para imobiliárias. NexoImob AI foi. Entende tipos de imóvel, copy certa por categoria, formato ideal para cada canal.",
          cta: "Ver demo ao vivo",
        },
      ],
    },
    {
      id: "meta_c3_cr3",
      concept: "Volume — 12 posts por imóvel sem digitar",
      hook: "12 versões de post para o mesmo imóvel. Geradas em 2 minutos.",
      format: ["feed"],
      visualNote: "Grid de 12 variações do mesmo imóvel: feed, story, carrossel, reels, formato paisagem — todos com identidade visual consistente.",
      copy: [
        {
          id: "A",
          headline: "12 posts. 1 imóvel. 2 minutos.",
          body: "NexoImob AI cria feed, story, carrossel e versão para reels do mesmo imóvel automaticamente. Variações de copy, formatos diferentes, tudo com seu branding. Pronto para publicar em todos os canais.",
          cta: "Gerar meus primeiros posts",
        },
        {
          id: "B",
          headline: "Equipe de marketing sem contratar",
          body: "Ter uma equipe de design e copy dedicada ao marketing imobiliário custa caro. NexoImob AI entrega o mesmo resultado — em escala, sem custo fixo, disponível 24h.",
          cta: "Conhecer os planos",
        },
      ],
    },
    {
      id: "meta_c3_cr4",
      concept: "Integrações — n8n + WhatsApp + CRM",
      hook: "Conecta com seu CRM, dispara no WhatsApp, publica no Instagram. Tudo sozinho.",
      format: ["feed"],
      visualNote: "Diagrama de integrações: NexoImob AI no centro, setas para logos de n8n, WhatsApp Business, RD Station, Kommo CRM. Tom técnico mas acessível.",
      copy: [
        {
          id: "A",
          headline: "Conecta com seu CRM e WhatsApp",
          body: "NexoImob AI se integra com as ferramentas que você já usa: n8n, WhatsApp Business, CRM imobiliário. Quando um imóvel é cadastrado, o marketing começa sozinho.",
          cta: "Ver as integrações",
        },
        {
          id: "B",
          headline: "Automação sem substituir seu stack",
          body: "Não precisa abandonar o que funciona. NexoImob AI se encaixa no seu fluxo atual — captura do CRM, geração de posts com IA, disparo via WhatsApp Business, tudo conectado.",
          cta: "Solicitar uma demo",
        },
      ],
    },
    {
      id: "meta_c3_cr5",
      concept: "ROI — horas salvas por semana",
      hook: "Sua equipe passa quantas horas por semana criando posts?",
      format: ["feed", "story"],
      visualNote: "Calculadora visual: 10 imóveis × 45 min de edição = 7,5h/semana → com NexoImob AI: 10 imóveis × 3 min = 30 min. Economia visível.",
      copy: [
        {
          id: "A",
          headline: "7 horas salvas por semana",
          body: "Uma imobiliária com 10 imóveis ativos gasta em média 7 horas por semana criando e editando posts. NexoImob AI reduz para 30 minutos. O que sua equipe faria com esse tempo?",
          cta: "Calcular minha economia",
        },
        {
          id: "B",
          headline: "Menos trabalho repetitivo. Mais vendas.",
          body: "Cada hora criando post manual é uma hora que um corretor não está prospectando, atendendo cliente ou fechando negócio. NexoImob AI automatiza o marketing para liberar o time para o que importa.",
          cta: "Ver planos e preços",
        },
      ],
    },
  ],
};

const metaCampanha4: AdCampaign = {
  id:           "meta_video",
  platform:     "meta",
  name:         "Vídeo Imobiliário",
  icp:          "Corretor ou gerente de marketing que já usa Reels e quer escalar com vídeo",
  objective:    "conversions",
  destination:  "/lp/video-imobiliario",
  utmCampaign:  "video_imobiliario",
  utmSource:    "meta",
  utmMedium:    "paid_social",
  budgetNote:   "R$35/dia. Audiência visual — usar vídeo como criativo do próprio anúncio (meta).",
  targetingNote: "Interesses: produção de vídeo, Reels, conteúdo imobiliário. Comportamento: usuários ativos em vídeo no Instagram. Lookalike de quem usou /create/animate.",
  creatives: [
    {
      id: "meta_c4_cr1",
      concept: "Speed demo — fotos → vídeo cinemático",
      hook: "Essas 5 fotos viraram esse vídeo. Em 4 minutos.",
      format: ["reels"],
      visualNote: "O próprio vídeo cinemático gerado pelo NexoImob AI como criativo. Mostrar 5 fotos originais no início, depois o resultado final com trilha e movimento de câmera. CTA no final.",
      copy: [
        {
          id: "A",
          headline: "Fotos → vídeo em 4 minutos",
          body: "Envie as fotos do imóvel, escolha o estilo — cinematic, luxury, drone — e receba um vídeo profissional pronto para Reels, TikTok e YouTube em menos de 5 minutos.",
          cta: "Criar meu primeiro vídeo",
        },
        {
          id: "B",
          headline: "Sem produtora. Sem editor.",
          body: "Corretores que usam vídeo vendem 3x mais rápido. Mas contratar produtora é caro e demorado. NexoImob AI cria vídeos cinemáticos a partir das suas fotos — em minutos, não em dias.",
          cta: "Gerar vídeo grátis",
        },
      ],
    },
    {
      id: "meta_c4_cr2",
      concept: "Resultado — 3x mais visualizações",
      hook: "Imóveis com vídeo recebem 3x mais visualizações no Instagram.",
      format: ["feed", "story"],
      visualNote: "Gráfico simples: barra 'post com foto' vs barra 3x maior 'post com vídeo cinemático'. Estilo minimalista, fundo escuro premium.",
      copy: [
        {
          id: "A",
          headline: "3x mais visualizações com vídeo",
          body: "Dados do Instagram confirmam: vídeos recebem 3 vezes mais visualizações que fotos estáticas. NexoImob AI transforma suas fotos em vídeo cinemático para você aparecer mais no feed.",
          cta: "Quero aparecer mais",
        },
        {
          id: "B",
          headline: "Reels que vendem antes da visita",
          body: "Clientes que assistem ao vídeo do imóvel antes de visitar chegam mais qualificados e decidem mais rápido. NexoImob AI cria esse vídeo automaticamente das suas fotos.",
          cta: "Testar gratuitamente",
        },
      ],
    },
    {
      id: "meta_c4_cr3",
      concept: "Estilos — 5 opções cinemáticas",
      hook: "Cinematic. Luxury. Drone. Walkthrough. Moderno. Qual combina com seu imóvel?",
      format: ["feed", "reels"],
      visualNote: "Grid ou carrossel mostrando o mesmo imóvel em 5 estilos diferentes. Cada estilo com nome e movimento de câmera característico.",
      copy: [
        {
          id: "A",
          headline: "5 estilos cinemáticos de vídeo",
          body: "Cada imóvel tem um estilo ideal. NexoImob AI oferece 5 opções: Cinematic (elegante), Luxury (premium), Drone (aéreo), Walkthrough (imersivo) e Moderno (dinâmico). Escolha e gere em minutos.",
          cta: "Escolher meu estilo",
        },
        {
          id: "B",
          headline: "O vídeo certo para cada imóvel",
          body: "Apartamento de luxo merece estilo diferente de casa popular. NexoImob AI tem 5 estilos cinemáticos — com movimento de câmera, trilha e ritmo únicos para cada perfil de imóvel.",
          cta: "Ver os estilos",
        },
      ],
    },
    {
      id: "meta_c4_cr4",
      concept: "Dor — produtora é caro e demorado",
      hook: "Última vez que você contratou produtora de vídeo: quanto pagou e quanto demorou?",
      format: ["feed"],
      visualNote: "Comparativo custo/tempo: Produtora (R$500–2000, 5–10 dias) vs NexoImob AI (plano mensal, 5 minutos). Tom direto.",
      copy: [
        {
          id: "A",
          headline: "R$500 por vídeo vs R$X/mês ilimitado",
          body: "Contratar produtora para cada imóvel é inviável em escala. NexoImob AI gera vídeos profissionais ilimitados por uma fração do custo — e em minutos, não dias.",
          cta: "Ver planos e preços",
        },
        {
          id: "B",
          headline: "Produtora: R$500 e 5 dias. NexoImob AI: grátis e 5 min.",
          body: "Para um corretor com 20 imóveis ativos, contratar produtora para cada um sai caro demais. NexoImob AI entrega qualidade de produção profissional sem o custo e a espera.",
          cta: "Testar grátis agora",
        },
      ],
    },
    {
      id: "meta_c4_cr5",
      concept: "Prova social — corretor com resultado real",
      hook: "\"Meus reels passaram a ter 3x mais visualizações.\"",
      format: ["feed", "story"],
      visualNote: "Depoimento de Ana Paula Ferreira (RE/MAX) ou Rafael Costa. Foto + nome + cargo + empresa. Resultado em destaque. Estrelas de avaliação.",
      copy: [
        {
          id: "A",
          headline: "\"3x mais visualizações nos reels\"",
          body: "'Meus reels de imóveis passaram a ter 3x mais visualizações depois que comecei a usar os vídeos cinemáticos. Os clientes perguntam quem faz minha produção.' — Ana Paula F., RE/MAX",
          cta: "Quero esses resultados",
        },
        {
          id: "B",
          headline: "40% mais agendamentos com vídeo",
          body: "'Mostrar o apartamento em vídeo antes da visita presencial aumentou minha taxa de agendamento em 40%.' — Rafael Costa, Corretor CRECI-RJ. O vídeo fecha antes da visita.",
          cta: "Criar meu primeiro vídeo",
        },
      ],
    },
  ],
};

// ── Google Ads ─────────────────────────────────────────────────────────────────

export interface GoogleKeyword {
  keyword:    string;
  matchType:  "broad" | "phrase" | "exact";
  bid:        string;
}

export interface GoogleAdGroup {
  id:            string;
  name:          string;
  keywords:      GoogleKeyword[];
  headlines:     string[];   // up to 15, ≤ 30 chars each
  descriptions:  string[];   // up to 4, ≤ 90 chars each
  finalUrl:      string;
  displayPath:   string;
}

export interface GoogleCampaign {
  id:          string;
  platform:    "google";
  name:        string;
  type:        "search" | "pmax";
  objective:   "traffic" | "leads" | "conversions";
  utmCampaign: string;
  budgetNote:  string;
  targetingNote: string;
  adGroups:    GoogleAdGroup[];
}

const googleCampanha1: GoogleCampaign = {
  id:           "google_marketing_imob",
  platform:     "google",
  name:         "Marketing Imobiliário",
  type:         "search",
  objective:    "conversions",
  utmCampaign:  "google_mkt_imob",
  budgetNote:   "R$25/dia. CPC máx R$2,50. Meta: CPA < R$35.",
  targetingNote: "BR, todas as cidades. Dispositivos: mobile prioritário. Horário: seg–sáb 8h–22h.",
  adGroups: [
    {
      id:   "gg_mkt_imob_ag1",
      name: "Marketing Imobiliário Geral",
      keywords: [
        { keyword: "marketing imobiliário",               matchType: "phrase", bid: "R$2,00" },
        { keyword: "marketing para corretor de imóveis",  matchType: "phrase", bid: "R$2,20" },
        { keyword: "como fazer marketing imobiliário",    matchType: "broad",  bid: "R$1,80" },
        { keyword: "estratégia de marketing imobiliário", matchType: "phrase", bid: "R$2,00" },
        { keyword: "marketing digital imobiliário",       matchType: "phrase", bid: "R$2,10" },
      ],
      headlines: [
        "Marketing Imobiliário com IA",
        "Posts Profissionais em 3 min",
        "IA para Corretor de Imóveis",
        "Crie Posts de Imóveis Agora",
        "NexoImob AI — Gratis",
        "Marketing que Vende Imóveis",
        "IA Imobiliária Número 1 no BR",
        "Teste Grátis — Sem Cartão",
        "Posts, Vídeos e Automação",
        "Resultado em 3 Minutos",
      ],
      descriptions: [
        "Transforme fotos de imóveis em posts profissionais com IA. Sem designer, sem Canva. Pronto em 3 minutos.",
        "Mais de 18.000 posts criados por corretores em todo o Brasil. Teste grátis hoje, sem cartão de crédito.",
        "NexoImob AI: IA especializada no mercado imobiliario. Posts, videos, automacao e muito mais.",
        "Corretores que usam IA no marketing vendem mais rápido. Comece agora com 10 criativos grátis.",
      ],
      finalUrl:    "/lp/criar-posts-imoveis",
      displayPath: "db8intelligence.com.br/posts-imoveis",
    },
  ],
};

const googleCampanha2: GoogleCampaign = {
  id:           "google_posts_imoveis",
  platform:     "google",
  name:         "Posts para Imóveis",
  type:         "search",
  objective:    "conversions",
  utmCampaign:  "google_posts_imoveis",
  budgetNote:   "R$30/dia. Intenção alta de conversão — palavras transacionais.",
  targetingNote: "BR. Foco mobile. Excluir quem já visitou /dashboard (remarketing negativo).",
  adGroups: [
    {
      id:   "gg_posts_imov_ag1",
      name: "Posts para Imóveis — Criação",
      keywords: [
        { keyword: "criar posts para imóveis",          matchType: "phrase", bid: "R$2,50" },
        { keyword: "posts para imóveis instagram",      matchType: "phrase", bid: "R$2,40" },
        { keyword: "como criar post de imóvel",         matchType: "broad",  bid: "R$1,90" },
        { keyword: "post imobiliário profissional",     matchType: "phrase", bid: "R$2,20" },
        { keyword: "template post imóvel",              matchType: "broad",  bid: "R$1,70" },
        { keyword: "criar post de apartamento",        matchType: "exact",  bid: "R$2,30" },
        { keyword: "gerador de posts imobiliários",    matchType: "phrase", bid: "R$2,60" },
      ],
      headlines: [
        "Posts de Imóveis com IA",
        "3 Fotos → Post Profissional",
        "Grátis para Testar Agora",
        "Post Imobiliário em 3 min",
        "Crie Posts sem Designer",
        "IA Faz o Post por Você",
        "10 Criativos Grátis Hoje",
        "Feed, Story e Reels Prontos",
        "Posts que Vendem Imóveis",
        "NexoImob AI — Teste",
      ],
      descriptions: [
        "Envie 3 fotos e a IA cria post profissional com copy e legenda. Pronto para Instagram em minutos.",
        "Sem Canva, sem designer, sem esforco. NexoImob AI cria posts de imoveis automaticamente.",
        "Corretores profissionais postam todo dia. Com NexoImob AI, voce cria posts em 3 minutos.",
        "Teste grátis — 10 criativos sem cartão de crédito. Posts para feed, story e reels com IA.",
      ],
      finalUrl:    "/lp/criar-posts-imoveis",
      displayPath: "db8intelligence.com.br/criar-posts",
    },
  ],
};

const googleCampanha3: GoogleCampaign = {
  id:           "google_video_imobiliario",
  platform:     "google",
  name:         "Vídeo Imobiliário",
  type:         "search",
  objective:    "conversions",
  utmCampaign:  "google_video_imob",
  budgetNote:   "R$20/dia. Volume menor que posts, mas ticket de conversão maior.",
  targetingNote: "BR. Desktop + mobile. Incluir termos de produção de vídeo com contexto imobiliário.",
  adGroups: [
    {
      id:   "gg_video_imob_ag1",
      name: "Vídeo Imobiliário — Criação",
      keywords: [
        { keyword: "vídeo imobiliário",                    matchType: "phrase", bid: "R$2,20" },
        { keyword: "criar vídeo de imóvel",                matchType: "phrase", bid: "R$2,30" },
        { keyword: "video para anuncio de imovel",         matchType: "phrase", bid: "R$2,10" },
        { keyword: "vídeo tour imóvel",                    matchType: "broad",  bid: "R$1,80" },
        { keyword: "produção de vídeo imobiliário barato", matchType: "phrase", bid: "R$2,40" },
        { keyword: "reels para corretores de imóveis",     matchType: "phrase", bid: "R$2,20" },
        { keyword: "como fazer vídeo de imóvel para reels",matchType: "broad",  bid: "R$1,90" },
      ],
      headlines: [
        "Vídeo Imobiliário com IA",
        "Fotos → Vídeo em 5 min",
        "Cinematic, Luxury, Drone",
        "Sem Produtora — Com IA",
        "Reels de Imóveis Prontos",
        "Vídeo Profissional em Casa",
        "5 Estilos Cinemáticos",
        "NexoImob AI — Gratis",
        "Vídeo que Vende Imóveis",
        "Resultado em 5 Minutos",
      ],
      descriptions: [
        "Envie fotos do imóvel e receba vídeo cinemático em 5 minutos. 5 estilos: Cinematic, Luxury, Drone e mais.",
        "Sem produtora, sem editor, sem espera. NexoImob AI transforma fotos em video profissional com IA.",
        "Vídeos de imóveis no Reels geram 3x mais visualizações. Crie o seu agora — grátis para testar.",
        "Corretores que usam vídeo fecham mais rápido. Gere vídeo cinemático do seu imóvel em minutos.",
      ],
      finalUrl:    "/lp/video-imobiliario",
      displayPath: "db8intelligence.com.br/video",
    },
  ],
};

const googleCampanha4: GoogleCampaign = {
  id:           "google_automacao_imob",
  platform:     "google",
  name:         "Automação Imobiliária",
  type:         "search",
  objective:    "leads",
  utmCampaign:  "google_automacao_imob",
  budgetNote:   "R$25/dia. Busca B2B com intenção de solução — lead qualificado vale mais.",
  targetingNote: "BR. Horário comercial prioritário. Incluir termos de CRM e automação de marketing.",
  adGroups: [
    {
      id:   "gg_auto_imob_ag1",
      name: "Automação de Marketing Imobiliário",
      keywords: [
        { keyword: "automação imobiliária",               matchType: "phrase", bid: "R$2,50" },
        { keyword: "automatizar posts imóveis",           matchType: "phrase", bid: "R$2,30" },
        { keyword: "automação de marketing imobiliário",  matchType: "phrase", bid: "R$2,60" },
        { keyword: "software marketing imobiliário",      matchType: "broad",  bid: "R$2,00" },
        { keyword: "ferramenta automação imobiliária",    matchType: "phrase", bid: "R$2,40" },
        { keyword: "IA para imobiliária",                 matchType: "phrase", bid: "R$2,20" },
        { keyword: "automatizar marketing corretor",      matchType: "broad",  bid: "R$1,90" },
      ],
      headlines: [
        "Automação Imobiliária com IA",
        "Posts Automáticos p/ Imóveis",
        "1 Imóvel → 12 Posts Prontos",
        "IA que Entende de Imóvel",
        "Automatize Sem Programar",
        "Integra com WhatsApp e CRM",
        "NexoImob AI para imob.",
        "Solicitar Demo Gratuita",
        "Escale sem Aumentar Equipe",
        "Automação Real p/ Imobiliária",
      ],
      descriptions: [
        "1 imóvel cadastrado → posts para Instagram, WhatsApp e portais criados automaticamente pela IA.",
        "Automação criada para o mercado imobiliário. Integra com seu CRM e WhatsApp Business sem código.",
        "Imobiliárias que automatizam o marketing geram mais leads com menos esforço. Veja como funciona.",
        "Da captacao do imovel a publicacao automatica: NexoImob AI cuida do marketing enquanto voce vende.",
      ],
      finalUrl:    "/lp/automacao-imobiliaria",
      displayPath: "db8intelligence.com.br/automacao",
    },
  ],
};

// ── Exports ───────────────────────────────────────────────────────────────────

export const META_CAMPAIGNS: AdCampaign[]    = [metaCampanha1, metaCampanha2, metaCampanha3, metaCampanha4];
export const GOOGLE_CAMPAIGNS: GoogleCampaign[] = [googleCampanha1, googleCampanha2, googleCampanha3, googleCampanha4];

export const ALL_CAMPAIGNS = [...META_CAMPAIGNS, ...GOOGLE_CAMPAIGNS];

/** Destination pages used across all campaigns */
export const CAMPAIGN_DESTINATIONS: Record<string, string> = {
  "/lp/criar-posts-imoveis":   "LP — Criar Posts de Imóveis",
  "/lp/video-imobiliario":     "LP — Vídeo Imobiliário",
  "/lp/automacao-imobiliaria": "LP — Automação Imobiliária",
  "/para-corretores":          "ICP — Corretores",
  "/para-imobiliarias":        "ICP — Imobiliárias",
  "/para-equipes":             "ICP — Equipes",
};

/** Budget totals for reference */
export const DAILY_BUDGET_TOTAL_BRL = 30 + 50 + 40 + 35 + 25 + 30 + 20 + 25; // = R$255/dia
