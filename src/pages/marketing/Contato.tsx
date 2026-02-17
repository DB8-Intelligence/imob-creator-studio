import { useState } from "react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Contato = () => {
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    // placeholder — will integrate with backend later
    setTimeout(() => {
      toast({ title: "Mensagem enviada!", description: "Retornaremos em breve." });
      setSending(false);
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <MarketingLayout>
      <section className="pt-32 pb-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              Contato
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Fale com a{" "}
              <span className="text-gradient">nossa equipe</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Dúvidas, sugestões ou parcerias? Estamos prontos para ajudar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Info */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Email</h3>
                  <p className="text-muted-foreground text-sm">contato@imobcreator.com.br</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">WhatsApp</h3>
                  <p className="text-muted-foreground text-sm">(11) 99999-9999</p>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-muted/50 border border-border/50">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Horário de atendimento:</strong><br />
                  Segunda a Sexta, 9h às 18h (horário de Brasília)
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input id="name" required placeholder="Seu nome" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required placeholder="seu@email.com" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="phone">WhatsApp</Label>
                <Input id="phone" placeholder="(11) 99999-9999" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="message">Mensagem</Label>
                <Textarea id="message" required rows={5} placeholder="Como podemos ajudar?" className="mt-1" />
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={sending}>
                {sending ? "Enviando..." : "Enviar Mensagem"}
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default Contato;
