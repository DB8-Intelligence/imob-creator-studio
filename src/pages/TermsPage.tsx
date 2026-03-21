import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, ArrowLeft } from "lucide-react";

type Tab = "termos" | "privacidade" | "reembolso" | "cancelamento";

const TABS: { id: Tab; label: string }[] = [
  { id: "termos", label: "Termos de Uso" },
  { id: "privacidade", label: "Privacidade" },
  { id: "reembolso", label: "Reembolso" },
  { id: "cancelamento", label: "Cancelamento" },
];

const Section = ({
  number,
  title,
  children,
}: {
  number: string | number;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mb-8">
    <h2 className="font-display text-base font-bold text-foreground mb-3 flex items-start gap-3">
      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center mt-0.5">
        {number}
      </span>
      {title}
    </h2>
    <div className="pl-10 text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
  </div>
);

const Highlight = ({ children }: { children: React.ReactNode }) => (
  <span className="font-semibold text-foreground">{children}</span>
);

const List = ({ items }: { items: string[] }) => (
  <ul className="list-disc list-inside space-y-1">
    {items.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ul>
);

// ── Tab content ────────────────────────────────────────────────────────────────

const TermosDeUso = () => (
  <div>
    <div className="mb-8 p-4 rounded-2xl bg-accent/5 border border-accent/20">
      <p className="text-sm text-muted-foreground">
        <Highlight>Última atualização:</Highlight> 04/03/2026
      </p>
    </div>

    <Section number={0} title="Aceite automático ao comprar/assinar">
      <p>
        Ao clicar em <Highlight>"Comprar"</Highlight>, <Highlight>"Assinar"</Highlight>,{" "}
        <Highlight>"Finalizar compra"</Highlight> ou equivalente, você confirma que leu, entendeu e aceita
        integralmente estes Termos de Uso, a Política de Privacidade, a Política de Reembolso e a Política de
        Cancelamento do IMOVIE, disponíveis em <Highlight>imobcreator.com.br</Highlight>.
      </p>
    </Section>

    <Section number={1} title="Partes e contato">
      <p>
        O IMOVIE <Highlight>("Plataforma")</Highlight> é operado por{" "}
        <Highlight>DB8 INTERPRACE LTDA</Highlight>, CNPJ 31.982.768/0001-31, nome fantasia{" "}
        <Highlight>DB8 INTELLIGENCE AI</Highlight>, Brasil.
      </p>
      <ul className="space-y-1 mt-2">
        <li>
          <Highlight>Suporte:</Highlight>{" "}
          <a
            href="mailto:suporteimovie@imobcreatorai.com.br"
            className="text-accent underline hover:text-accent/80"
          >
            suporteimovie@imobcreatorai.com.br
          </a>
        </li>
        <li>
          <Highlight>Site:</Highlight>{" "}
          <span className="text-accent">imobcreator.com.br</span>
        </li>
        <li>
          <Highlight>Atendimento:</Highlight> somente Brasil.
        </li>
      </ul>
    </Section>

    <Section number={2} title="Conta, login e responsabilidade">
      <List
        items={[
          "Login via e-mail/senha e/ou Google.",
          "1 conta por pessoa/empresa.",
          "É proibido compartilhar conta, repassar acesso, revender créditos, ou permitir uso por terceiros.",
          "Você é responsável por toda atividade feita na sua conta.",
        ]}
      />
    </Section>

    <Section number={3} title="Descrição do serviço">
      <p>O IMOVIE permite:</p>
      <List
        items={[
          "Criar vídeos de imóveis a partir de fotos;",
          "Fazer upscale/melhoria de fotos;",
          "Comprar assinaturas (mensal/anual) e créditos avulsos.",
        ]}
      />
    </Section>

    <Section number={4} title="Limites técnicos de upload">
      <List
        items={[
          "Formatos aceitos: conforme a Plataforma indicar no upload.",
          "Limite máximo: 200MB por arquivo.",
          "Podemos ajustar limites por motivos técnicos, segurança e custo operacional.",
        ]}
      />
    </Section>

    <Section number={5} title="Conteúdo proibido (regra obrigatória)">
      <p>Você não pode enviar fotos/arquivos com:</p>
      <List
        items={[
          "Pessoas identificáveis (rosto/corpo);",
          "Documentos (CPF/RG/CNH, contratos, comprovantes, etc.);",
          "Dados pessoais/sensíveis, cartões, dados bancários e comprovantes;",
          "Qualquer conteúdo ilegal/ofensivo/discriminatório/sexual explícito/violento;",
          "Ou que viole direitos de terceiros.",
        ]}
      />
      <p className="mt-3">
        <Highlight>Consequências:</Highlight> bloqueio do processamento, remoção, suspensão e/ou encerramento da
        conta, sem reembolso.
      </p>
    </Section>

    <Section number={6} title="Direitos autorais e responsabilidade do usuário">
      <p>
        Você declara que possui direitos/licenças sobre as fotos enviadas e autoriza o processamento. Você é
        responsável por reclamações de terceiros (direitos autorais, marca, imagem, privacidade e LGPD).
      </p>
    </Section>

    <Section number={7} title="Uso livre dos resultados">
      <p>
        Os vídeos e imagens gerados podem ser usados livremente (inclusive comercialmente) pelo usuário, desde
        que o conteúdo de origem seja lícito e autorizado.
      </p>
    </Section>

    <Section number={8} title="Créditos, planos e validade">
      <div className="space-y-4">
        <div>
          <p className="font-semibold text-foreground mb-1">8.1 Créditos do plano (assinatura mensal/anual)</p>
          <p>
            Créditos do plano acumulam mês a mês enquanto a assinatura estiver ativa e adimplente. A assinatura é
            recorrente e permanece ativa até o usuário cancelar.
          </p>
        </div>
        <div>
          <p className="font-semibold text-foreground mb-1">8.2 Créditos extras (avulsos)</p>
          <p>
            Créditos extras expiram em 30 dias. Créditos extras são não reembolsáveis, salvo cobrança
            indevida/duplicada ou exigência legal.
          </p>
        </div>
      </div>
    </Section>

    <Section number={9} title='Definição oficial de "uso efetivo"'>
      <p>
        Para fins de reembolso/garantia e disputas, considera-se uso efetivo:
      </p>
      <List
        items={[
          "Iniciar processamento;",
          "Consumir créditos;",
          "Baixar, gerar ou visualizar arquivo final;",
          "Ou qualquer execução de job (tarefas internas de processamento).",
        ]}
      />
    </Section>

    <Section number={10} title="Falhas e estorno automático">
      <p>
        Se houver falha técnica no processamento, o IMOVIE poderá estornar automaticamente os créditos e
        registrar no histórico do usuário.
      </p>
    </Section>

    <Section number={11} title="Anti-fraude, chargeback e suspensão imediata">
      <p>
        Podemos suspender imediatamente a conta (sem aviso prévio) em caso de: contestação/chargeback, suspeita
        de fraude, uso indevido do meio de pagamento, violação de conteúdo, compartilhamento/repasse de conta,
        revenda de créditos, uso para concorrência, engenharia reversa ou tentativa de burlar regras.
      </p>
      <p className="mt-3 font-semibold text-foreground">Durante suspensão por contestação/chargeback:</p>
      <List
        items={[
          "O usuário poderá manter acesso aos arquivos já gerados (quando tecnicamente possível);",
          "Fica bloqueada a criação de novos jobs/processamentos e o consumo de créditos até a resolução;",
          "Podemos exigir reverificação de segurança para reativação.",
        ]}
      />
      <p className="mt-3">
        O usuário concorda que poderemos compartilhar com a processadora de pagamento evidências técnicas e de
        entrega: IP, logs de acesso, datas/horários, autenticação, histórico de uso, execução de jobs, consumo
        de créditos, downloads e visualizações.
      </p>
    </Section>

    <Section number={12} title="Sem garantia estética e limitação de responsabilidade">
      <List
        items={[
          "Resultados podem variar; não garantimos resultado estético.",
          "Não respondemos por danos indiretos/lucros cessantes.",
          "Quando aplicável, nossa responsabilidade total limita-se ao valor pago nos últimos 30 dias, salvo obrigação legal diversa.",
        ]}
      />
    </Section>

    <Section number={13} title="Alterações do serviço/termos">
      <p>
        Podemos atualizar funcionalidades e estes Termos. A versão vigente ficará disponível no site.
      </p>
    </Section>

    <Section number={14} title="Foro">
      <p>
        Lei brasileira. Fica eleito o foro de <Highlight>Salvador/BA</Highlight>.
      </p>
    </Section>
  </div>
);

const PoliticaPrivacidade = () => (
  <div>
    <div className="mb-8 p-4 rounded-2xl bg-accent/5 border border-accent/20">
      <p className="text-sm text-muted-foreground">
        <Highlight>Última atualização:</Highlight> 04/03/2026
      </p>
    </div>

    <Section number={0} title="Aceite automático ao comprar/assinar">
      <p>
        Ao clicar em <Highlight>"Comprar"</Highlight>, <Highlight>"Assinar"</Highlight> ou{" "}
        <Highlight>"Finalizar compra"</Highlight>, você aceita esta Política de Privacidade e os demais
        documentos legais do IMOVIE disponíveis em{" "}
        <span className="text-accent">imobcreatorai.com.br</span>.
      </p>
    </Section>

    <Section number={1} title="Controladora e contato">
      <p>
        <Highlight>Controladora:</Highlight> DB8 INTERPRACE LTDA, CNPJ 31.982.768/0001-31, nome fantasia{" "}
        <Highlight>DB8 INTELLIGENCE AI</Highlight>, Brasil.
      </p>
      <ul className="space-y-1 mt-2">
        <li>
          <Highlight>Contato:</Highlight>{" "}
          <a
            href="mailto:suporteimovie@imobcreatorai.com.br"
            className="text-accent underline hover:text-accent/80"
          >
            suporteimovie@imobcreatorai.com.br
          </a>
        </li>
        <li>
          <Highlight>Site:</Highlight>{" "}
          <span className="text-accent">imobcreatorai.com.br</span>
        </li>
      </ul>
    </Section>

    <Section number={2} title="Escopo">
      <p>Esta Política se aplica ao uso do IMOVIE no Brasil, sob a LGPD.</p>
    </Section>

    <Section number={3} title="Dados coletados">
      <div className="space-y-4">
        <div>
          <p className="font-semibold text-foreground mb-1">3.1 Dados fornecidos</p>
          <List
            items={[
              "Cadastro/conta: e-mail e credenciais (senha e/ou Google);",
              "Conteúdo: fotos de imóveis enviadas para geração de vídeo e/ou upscale;",
              "Suporte: mensagens e dados enviados ao atendimento (inclusive via IA).",
            ]}
          />
        </div>
        <div>
          <p className="font-semibold text-foreground mb-1">3.2 Dados técnicos (logs)</p>
          <p>
            Podemos coletar: IP, data/hora, dispositivo/navegador, identificadores de sessão,
            páginas/ações, histórico de jobs, erros e performance, para segurança e auditoria.
          </p>
        </div>
        <div>
          <p className="font-semibold text-foreground mb-1">3.3 Pagamento</p>
          <p>
            Pagamentos via Stripe. Não armazenamos dados completos do cartão. Guardamos
            identificadores de cobrança (IDs/status/histórico) para conciliação e suporte.
          </p>
        </div>
      </div>
    </Section>

    <Section number={4} title="Finalidades e bases legais (LGPD)">
      <List
        items={[
          "Execução do contrato (fornecer serviço e processamentos);",
          "Cumprimento legal/regulatório;",
          "Legítimo interesse (segurança, antifraude, auditoria, melhoria);",
          "Exercício regular de direitos (defesa em disputas/chargebacks).",
        ]}
      />
    </Section>

    <Section number={5} title="Conteúdo proibido e segurança">
      <p>
        É proibido enviar fotos com pessoas identificáveis, documentos e dados pessoais/sensíveis.
        Podemos bloquear processamento, remover conteúdo, suspender conta e preservar logs.
      </p>
    </Section>

    <Section number={6} title="Compartilhamento com terceiros">
      <p>Compartilhamos dados apenas para operar a Plataforma:</p>
      <List
        items={[
          "Stripe (pagamentos/antifraude);",
          "Provedores de infraestrutura/banco/armazenamento;",
          "Provedores de renderização de vídeo;",
          "Provedores de infraestrutura/segurança (quando aplicável).",
        ]}
      />
    </Section>

    <Section number={7} title="Retenção e exclusão">
      <List
        items={[
          "Arquivos (fotos/vídeos): armazenados até o usuário deletar;",
          "Logs/registros: retidos por prazo razoável para segurança, antifraude, suporte e obrigações legais.",
        ]}
      />
    </Section>

    <Section number={8} title="Direitos do titular (LGPD)">
      <p>
        <Highlight>Solicitações:</Highlight> acesso, correção, exclusão (quando aplicável),
        portabilidade (quando aplicável) e informações de compartilhamento.
      </p>
      <p className="mt-2">
        <Highlight>Canal:</Highlight>{" "}
        <a
          href="mailto:suporteimovie@imobcreatorai.com.br"
          className="text-accent underline hover:text-accent/80"
        >
          suporteimovie@imobcreatorai.com.br
        </a>{" "}
        (assunto: <Highlight>"LGPD – IMOVIE"</Highlight>).
      </p>
    </Section>

    <Section number={9} title="Alterações">
      <p>
        A versão vigente estará em{" "}
        <span className="text-accent">imobcreatorai.com.br/privacidade</span>.
      </p>
    </Section>
  </div>
);

const ComingSoon = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
      <span className="text-2xl">📄</span>
    </div>
    <h3 className="font-display text-lg font-bold text-foreground mb-2">{label}</h3>
    <p className="text-muted-foreground text-sm max-w-xs">
      Este documento será publicado em breve. Em caso de dúvidas entre em contato:{" "}
      <a
        href="mailto:suporteimovie@imobcreatorai.com.br"
        className="text-accent underline hover:text-accent/80"
      >
        suporteimovie@imobcreatorai.com.br
      </a>
    </p>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const TermsPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>("termos");

  return (
    <div className="min-h-screen bg-background">

      {/* Minimal top bar */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/60 shadow-sm">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 bg-accent-gradient rounded-lg flex items-center justify-center shadow-glow">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display text-base font-semibold text-foreground">
              ImobCreator <span className="text-gradient">AI</span>
            </span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-border/50 bg-muted/20 py-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <p className="text-xs text-muted-foreground mb-1">Documentos legais · DB8 INTERPRACE LTDA</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">
            Políticas e Termos
          </h1>
          <p className="text-muted-foreground text-sm">
            Leia atentamente antes de usar a plataforma. Última atualização: 04/03/2026.
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="sticky top-14 z-40 bg-background/90 backdrop-blur-xl border-b border-border/60">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-6 max-w-4xl py-12">
        <div className="max-w-2xl">
          {activeTab === "termos" && <TermosDeUso />}
          {activeTab === "privacidade" && <PoliticaPrivacidade />}
          {activeTab === "reembolso" && <ComingSoon label="Política de Reembolso" />}
          {activeTab === "cancelamento" && <ComingSoon label="Política de Cancelamento" />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-6 max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 DB8 INTERPRACE LTDA · CNPJ 31.982.768/0001-31 · DB8 INTELLIGENCE AI</p>
          <p>
            Dúvidas:{" "}
            <a
              href="mailto:suporteimovie@imobcreatorai.com.br"
              className="text-accent underline hover:text-accent/80"
            >
              suporteimovie@imobcreatorai.com.br
            </a>
          </p>
        </div>
      </footer>

    </div>
  );
};

export default TermsPage;
