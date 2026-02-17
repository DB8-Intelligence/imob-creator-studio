import { useState } from "react";
import { Link } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

const faqs = [
  { q: "Como funciona o sistema de créditos?", a: "Cada ação consome créditos: upscale de imagem (1 crédito), geração de legenda (1 crédito), montagem de template (1 crédito) e publicação no Instagram (1 crédito). Um post completo consome 4 créditos. Os créditos são renovados mensalmente conforme seu plano." },
  { q: "Preciso instalar algum aplicativo?", a: "Não! O envio é pelo WhatsApp que você já usa e a aprovação é feita pelo navegador. Nenhum download necessário." },
  { q: "Posso personalizar os templates com minha marca?", a: "Sim! Você cadastra sua logo, cores, tipografia e slogan. Todos os posts são gerados automaticamente com a identidade visual da sua imobiliária." },
  { q: "Quantas fotos posso enviar por imóvel?", a: "Até 20 fotos por imóvel. O sistema faz upscale automático para garantir qualidade profissional." },
  { q: "A publicação no Instagram é realmente automática?", a: "Sim! Após sua aprovação, o post é publicado automaticamente no feed do Instagram da sua conta conectada." },
  { q: "Posso editar a legenda antes de publicar?", a: "Claro! A IA gera uma sugestão de legenda, mas você pode editar o texto, CTA e hashtags antes de aprovar." },
  { q: "Funciona para qualquer tipo de imóvel?", a: "Sim! Apartamentos, casas, terrenos, lançamentos, comerciais. O sistema se adapta ao tipo de imóvel para gerar legendas relevantes." },
  { q: "Posso cancelar a qualquer momento?", a: "Sim, sem multa ou fidelidade. Seus créditos restantes ficam disponíveis até o fim do período pago." },
  { q: "Tem suporte se eu precisar de ajuda?", a: "Todos os planos incluem suporte por email. Planos Pro e Agência têm suporte prioritário e atendimento dedicado." },
  { q: "Os créditos não usados acumulam?", a: "Não, os créditos não utilizados expiram ao final de cada período de faturamento mensal." },
];

const FAQ = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <MarketingLayout>
      <section className="pt-32 pb-24 bg-background">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              FAQ
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Perguntas{" "}
              <span className="text-gradient">Frequentes</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Tudo que você precisa saber antes de começar.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="border border-border/50 rounded-xl overflow-hidden bg-card">
                <button
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium text-foreground pr-4">{f.q}</span>
                  {openIdx === i ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                {openIdx === i && (
                  <div className="px-5 pb-5 text-muted-foreground leading-relaxed">{f.a}</div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Ainda tem dúvidas?</p>
            <Button variant="outline" asChild>
              <Link to="/contato">
                Fale conosco
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default FAQ;
