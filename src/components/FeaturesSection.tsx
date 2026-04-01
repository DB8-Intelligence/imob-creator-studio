import { Video, Image, Sofa, Hammer, PenTool, MapPin, Building2, ZoomIn, type LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
  tag?: string;
}

const features: Feature[] = [
  {
    icon: Image,
    title: "Criativos com IA",
    description: "Gere posts, stories e artes profissionais a partir de fotos ou ideias. Copy, design e variações em um clique.",
    gradient: "from-amber-500/10 to-orange-500/5",
    iconColor: "text-amber-400",
  },
  {
    icon: Video,
    title: "Vídeos Cinematográficos",
    description: "Transforme fotos em vídeos com movimento de câmera, zoom e pan. 5 estilos: cinematic, luxury, drone, walkthrough e moderno.",
    gradient: "from-blue-500/10 to-indigo-500/5",
    iconColor: "text-blue-400",
    tag: "Veo 3.1",
  },
  {
    icon: Sofa,
    title: "Mobiliar Ambientes",
    description: "Decore ambientes vazios com 7 estilos profissionais. IA preenche o espaço com mobília realista instantaneamente.",
    gradient: "from-emerald-500/10 to-teal-500/5",
    iconColor: "text-emerald-400",
    tag: "Novo",
  },
  {
    icon: Hammer,
    title: "Reformar e Valorizar",
    description: "Visualize como ficaria um imóvel reformado antes de investir. 5 estilos de renovação para impressionar clientes.",
    gradient: "from-orange-500/10 to-red-500/5",
    iconColor: "text-orange-400",
    tag: "Novo",
  },
  {
    icon: PenTool,
    title: "Render de Esboços",
    description: "Transforme esboços e plantas baixas em renders fotorealistas. Do rascunho ao visual profissional em segundos.",
    gradient: "from-violet-500/10 to-purple-500/5",
    iconColor: "text-violet-400",
    tag: "Novo",
  },
  {
    icon: Building2,
    title: "Terreno Vazio",
    description: "Envie foto de um terreno e visualize como ficaria com construção: residencial, comercial, condomínio, galpão ou misto.",
    gradient: "from-cyan-500/10 to-blue-500/5",
    iconColor: "text-cyan-400",
    tag: "Novo",
  },
  {
    icon: MapPin,
    title: "Demarcar Terrenos",
    description: "Gere demarcações visuais, medidas estimadas, divisão de lotes e até visualização 3D do terreno com IA.",
    gradient: "from-rose-500/10 to-pink-500/5",
    iconColor: "text-rose-400",
    tag: "Novo",
  },
  {
    icon: ZoomIn,
    title: "Upscale de Imagem",
    description: "Melhore a qualidade de fotos de imóveis: resolução, iluminação, cores e nitidez — sem alterar o conteúdo.",
    gradient: "from-sky-500/10 to-blue-500/5",
    iconColor: "text-sky-400",
  },
];

const FeaturesSection = () => {
  return (
    <section id="criativos" className="py-24 bg-background relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-6 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-semibold mb-5">
            <span className="w-1.5 h-1.5 bg-accent rounded-full" />
            8 Serviços de IA Integrados
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Tudo que o mercado imobiliário precisa,{" "}
            <span className="text-gradient">em uma plataforma</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Da criação de artes à geração de vídeos, do staging virtual à demarcação de terrenos — todos os serviços conectados por IA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group relative rounded-2xl bg-gradient-to-br ${feature.gradient} border border-border/40 p-6 hover:border-border/80 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {feature.tag && (
                <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-accent/15 text-accent text-[10px] font-bold uppercase tracking-wide">
                  {feature.tag}
                </span>
              )}
              <div className={`w-12 h-12 rounded-xl bg-card border border-border/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
