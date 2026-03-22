import { useState } from "react";
import { Mail, MessageCircle, Send, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const ContactSection = () => {
  const [form, setForm] = useState({ nome: "", email: "", mensagem: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Monta o mailto com os dados do formulário
    const subject = encodeURIComponent(`Contato ImobCreator AI — ${form.nome}`);
    const body = encodeURIComponent(
      `Nome: ${form.nome}\nE-mail: ${form.email}\n\nMensagem:\n${form.mensagem}`
    );
    window.open(`mailto:contato@imobcreatorai.com?subject=${subject}&body=${body}`);
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <section id="contatos" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Contatos
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-5">
            Fale com a <span className="text-gradient">nossa equipe</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Dúvidas sobre planos, integração ou suporte técnico? Estamos disponíveis para ajudar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Formulário */}
          <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-soft">
            <h3 className="font-display text-xl font-semibold text-foreground mb-6">Envie uma mensagem</h3>
            {sent ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Send className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-foreground font-medium">Mensagem enviada!</p>
                <p className="text-muted-foreground text-sm text-center">Seu cliente de e-mail foi aberto. Retornamos em até 24h.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Nome</label>
                  <input
                    type="text"
                    required
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="Seu nome completo"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">E-mail</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Mensagem</label>
                  <textarea
                    required
                    rows={4}
                    value={form.mensagem}
                    onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                    placeholder="Como podemos ajudar?"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none"
                  />
                </div>
                <Button type="submit" variant="default" size="lg" className="w-full group">
                  Enviar mensagem
                  <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </form>
            )}
          </div>

          {/* Informações de contato */}
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border border-border/60 bg-card p-6 flex items-start gap-4 hover:shadow-soft transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">WhatsApp</h4>
                <p className="text-muted-foreground text-sm mb-2">Atendimento rápido para dúvidas sobre planos e funcionalidades.</p>
                <a
                  href="https://wa.me/5511999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-500 text-sm font-medium hover:underline"
                >
                  Chamar no WhatsApp →
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-6 flex items-start gap-4 hover:shadow-soft transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">E-mail</h4>
                <p className="text-muted-foreground text-sm mb-2">Para suporte técnico, parcerias e questões comerciais.</p>
                <a
                  href="mailto:contato@imobcreatorai.com"
                  className="text-accent text-sm font-medium hover:underline"
                >
                  contato@imobcreatorai.com
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-6 flex items-start gap-4 hover:shadow-soft transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Horário de atendimento</h4>
                <p className="text-muted-foreground text-sm">Segunda a sexta, das 9h às 18h (horário de Brasília).</p>
                <p className="text-muted-foreground text-sm mt-1">Suporte técnico: atendimento por e-mail em até 24h.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-6 flex items-start gap-4 hover:shadow-soft transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Base de operação</h4>
                <p className="text-muted-foreground text-sm">Brasil — atendemos corretores e imobiliárias em todo o território nacional.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
