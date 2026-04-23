import { Link } from "react-router-dom";
import { Building2, ArrowLeft, Mail, Trash2 } from "lucide-react";

const DataDeletionPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/60 shadow-sm">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 bg-accent-gradient rounded-lg flex items-center justify-center shadow-glow">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display text-base font-semibold text-foreground">
              NexoImob <span className="text-gradient">AI</span>
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

      <div className="border-b border-border/50 bg-muted/20 py-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <p className="text-xs text-muted-foreground mb-1">Documentos legais · DB8 INTERPRACE LTDA</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">
            Exclusão de dados do usuário
          </h1>
          <p className="text-muted-foreground text-sm">
            Como solicitar a exclusão de suas informações na plataforma NexoImob AI.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-4xl py-10 space-y-8">
        <section className="p-6 rounded-2xl bg-accent/5 border border-accent/20">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground mb-2">
                Direito à exclusão (LGPD art. 18, V)
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Conforme a Lei Geral de Proteção de Dados (LGPD), você tem direito a solicitar a exclusão
                dos seus dados pessoais tratados pela NexoImob AI. Processamos pedidos em até 15 dias úteis.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-base font-bold text-foreground mb-3">
            1. Como solicitar a exclusão
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Envie um e-mail para o endereço abaixo informando:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-4">
            <li>E-mail usado no cadastro da plataforma;</li>
            <li>CPF/CNPJ da conta (para verificação de identidade);</li>
            <li>Motivo do pedido (opcional);</li>
            <li>Se deseja exclusão total ou parcial (por exemplo, só a conexão Instagram/Facebook).</li>
          </ul>
          <div className="mt-4 p-4 rounded-xl bg-muted border border-border flex items-center gap-3">
            <Mail className="w-5 h-5 text-accent flex-shrink-0" />
            <a
              href="mailto:suporte@db8intelligence.com.br?subject=Solicita%C3%A7%C3%A3o%20de%20exclus%C3%A3o%20de%20dados%20-%20NexoImob%20AI"
              className="text-sm font-semibold text-accent underline hover:text-accent/80"
            >
              suporte@db8intelligence.com.br
            </a>
          </div>
        </section>

        <section>
          <h2 className="font-display text-base font-bold text-foreground mb-3">
            2. Dados excluídos automaticamente ao desconectar Instagram/Facebook
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Quando você revoga o acesso do aplicativo <strong>NexoImob AI</strong> nas configurações do
            Meta (Facebook/Instagram → Configurações → Aplicativos e sites), removemos automaticamente:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-4">
            <li>Tokens de acesso da sua conta do Instagram/Facebook;</li>
            <li>Identificador da conta Business e da Página vinculada;</li>
            <li>Nome de exibição e foto de perfil armazenados.</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            Posts já publicados no seu Instagram/Facebook permanecem nas plataformas Meta — o controle
            sobre eles passa a ser exclusivamente seu.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base font-bold text-foreground mb-3">
            3. O que é excluído quando você apaga a conta
          </h2>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-4">
            <li>Perfil, e-mail, WhatsApp, configurações e preferências;</li>
            <li>Imóveis cadastrados, fotos e descrições;</li>
            <li>Criativos gerados e histórico de publicações;</li>
            <li>Conexões de redes sociais (Instagram, Facebook);</li>
            <li>Histórico de leads, atendimentos e conversas;</li>
            <li>Tokens de integrações (Google Calendar, Evolution API etc).</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-base font-bold text-foreground mb-3">
            4. O que mantemos por obrigação legal
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Alguns dados são mantidos pelo prazo legal mínimo, mesmo após exclusão da conta:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-4">
            <li>Notas fiscais e comprovantes de pagamento (5 anos — art. 173 CTN);</li>
            <li>Logs de acesso (6 meses — Marco Civil da Internet art. 15);</li>
            <li>Dados de faturamento anonimizados para relatórios fiscais.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-base font-bold text-foreground mb-3">
            5. Prazo de resposta
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Pedidos recebidos por e-mail são respondidos em até <strong>48 horas úteis</strong> com
            confirmação do processo. A exclusão efetiva ocorre em até <strong>15 dias úteis</strong>,
            conforme prazo legal da LGPD.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base font-bold text-foreground mb-3">
            6. Dúvidas ou reclamações
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Encarregada de Proteção de Dados (DPO):{" "}
            <a
              href="mailto:suporte@db8intelligence.com.br"
              className="text-accent underline hover:text-accent/80 font-semibold"
            >
              suporte@db8intelligence.com.br
            </a>
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            Você também pode contatar a Autoridade Nacional de Proteção de Dados (ANPD) diretamente
            em caso de reclamação: <a href="https://www.gov.br/anpd" target="_blank" rel="noreferrer" className="underline hover:text-foreground">gov.br/anpd</a>.
          </p>
        </section>

        <div className="pt-6 border-t border-border/50 text-xs text-muted-foreground text-center">
          DB8 INTERPRACE LTDA · CNPJ 31.982.768/0001-31 · Última atualização: 23/04/2026
        </div>
      </div>
    </div>
  );
};

export default DataDeletionPage;
