import { SiteThemeMiniGrid } from "@/components/site/SiteThemeMiniGrid";
import { ReactNode } from "react";

export type TabData = {
  id: string;
  emoji: string;
  label: string;
  title: string;
  sub: string;
  benefits: string[];
  cta: string;
  href: string;
  accent: string;
  mockup: ReactNode;
};

export type ModuleData = {
  emoji: string;
  title: string;
  desc: string;
  href: string;
  accent: string;
  available: boolean;
};

export const tabsA: TabData[] = [
  {
    id: "criativos", emoji: "🎨", label: "Criativos",
    title: "50 artes/mês geradas por IA", sub: "Posts para Instagram, Facebook e WhatsApp com sua marca aplicada automaticamente.",
    benefits: ["6 estilos profissionais exclusivos", "Copy e headline gerados pela IA", "Identidade visual automática", "Download ou publicação direta"],
    cta: "Ver planos de Criativos", href: "/criativos", accent: "bg-[#EEF2FF]",
    mockup: (
      <div className="grid grid-cols-3 gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`aspect-square rounded-lg border border-[#E5E7EB] ${i % 2 === 0 ? "bg-gradient-to-br from-[#EEF2FF] to-[#F8FAFF]" : "bg-gradient-to-br from-[#FFF7E0] to-[#F8FAFF]"} flex items-center justify-center`}>
            <div className="w-6 h-4 bg-[#E5E7EB] rounded" />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "videos", emoji: "🎬", label: "Vídeos",
    title: "Reels profissionais em minutos", sub: "Envie fotos e receba vídeo cinematográfico com Ken Burns, trilha e overlay.",
    benefits: ["Ken Burns automático com crossfade", "6 moods de trilha royalty-free", "Texto overlay com dados do imóvel", "Formato 9:16 para Reels"],
    cta: "Ver planos de Vídeos", href: "/videos", accent: "bg-[#FFF7E0]",
    mockup: (
      <div className="flex flex-col gap-3">
        <div className="aspect-video rounded-lg bg-gradient-to-br from-[#FFF7E0] to-[#F8FAFF] border border-[#E5E7EB] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/80 border border-[#E5E7EB] flex items-center justify-center"><div className="w-0 h-0 border-l-[8px] border-l-[#002B5B] border-y-[5px] border-y-transparent ml-0.5" /></div>
        </div>
        <div className="flex gap-1.5">{[80, 100, 60].map((w, i) => <div key={i} className="h-1.5 rounded-full bg-[#E5E7EB]" style={{ width: `${w}%` }} />)}</div>
      </div>
    ),
  },
  {
    id: "site", emoji: "🏠", label: "Site+Portais",
    title: "Site imobiliário com SEO automático", sub: "Portfólio online com domínio próprio, integrado com portais de imóveis.",
    benefits: ["Template responsivo otimizado", "SEO automático por imóvel", "Integração ZAP, OLX, VivaReal", "Formulário com WhatsApp"],
    cta: "Acessar agora", href: "/site-imobiliario", accent: "bg-[#F0FDF4]",
    mockup: <div className="p-2 border rounded-md text-sm text-center text-gray-500">Preview Site</div>, // Replace with appropriate mockup
  },
  {
    id: "crm", emoji: "🤝", label: "CRM",
    title: "Organize leads e feche mais negócios", sub: "Pipeline visual com histórico completo de cada lead.",
    benefits: ["Pipeline Kanban de vendas", "Histórico de interações", "Automação de follow-up", "Relatórios de conversão"],
    cta: "Acessar CRM", href: "/crm-imobiliario", accent: "bg-[#F0F9FF]",
    mockup: (
      <div className="flex gap-2">
        {["Novos", "Negociação", "Fechados"].map((c) => (
          <div key={c} className="flex-1 rounded-lg border border-[#E5E7EB] p-2 bg-[#F8FAFF]">
            <div className="text-[9px] font-bold text-[#6B7280] mb-2 text-center">{c}</div>
            {[1,2].map(i=><div key={i} className="h-6 rounded bg-white border border-[#E5E7EB] mb-1.5" />)}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "whatsapp", emoji: "📱", label: "WhatsApp",
    title: "Foto no WA → post no Instagram", sub: "Parceiro envia fotos pelo WhatsApp, a IA cria e publica automaticamente.",
    benefits: ["Recepção automática via WA", "IA analisa e gera criativos", "Publicação automática no IG", "Notificação ao corretor"],
    cta: "Configurar agora", href: "/whatsapp-imobiliario", accent: "bg-[#FFF0F5]",
    mockup: (
      <div className="rounded-xl border border-[#E5E7EB] bg-[#F0FDF4] p-4 space-y-2">
        <div className="flex gap-2"><div className="w-6 h-6 rounded-full bg-[#25D366]" /><div className="bg-white rounded-lg px-3 py-2 text-[10px] text-[#374151] border border-[#E5E7EB]">📸 Novas fotos do apto 302</div></div>
        <div className="flex gap-2 justify-end"><div className="bg-[#DCF8C6] rounded-lg px-3 py-2 text-[10px] text-[#374151]">✅ Post gerado e publicado!</div></div>
      </div>
    ),
  },
];

export const tabsB: TabData[] = [
  {
    id: "criativos", emoji: "🎨", label: "Criativos",
    title: "De foto comum para campanha profissional em 3 segundos", sub: "Upload, escolhe o estilo e pronto. IA adiciona fundo cinematográfico, preço, CTA e logomarca. Resultado: 40% mais cliques.",
    benefits: ["12+ estilos: Dark Premium, Glass Morphism, Luxo Dourado", "Copy e headline gerados pela IA", "Identidade visual automática", "Pronto para Instagram, WhatsApp e anúncio"],
    cta: "Gerar Criativo Agora", href: "/criativos", accent: "bg-[#EEF2FF]",
    mockup: (
      <div className="grid grid-cols-3 gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`aspect-square rounded-lg border border-[#E5E7EB] ${i % 2 === 0 ? "bg-gradient-to-br from-[#EEF2FF] to-[#F8FAFF]" : "bg-gradient-to-br from-[#FFF7E0] to-[#F8FAFF]"} flex items-center justify-center`}>
            <div className="w-6 h-4 bg-[#E5E7EB] rounded" />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "videos", emoji: "🎬", label: "Vídeos",
    title: "5 fotos viram vídeo viral em 30 segundos", sub: "Vídeo profissional com Ken Burns, trilha cinematográfica e transições. Converte 3× mais que imagem estática no Reels.",
    benefits: ["Ken Burns automático com crossfade profissional", "6 trilhas royalty-free por mood", "Texto overlay com dados do imóvel", "1 vídeo/dia = 500+ views/semana"],
    cta: "Criar Vídeo Agora", href: "/videos", accent: "bg-[#FFF7E0]",
    mockup: (
      <div className="flex flex-col gap-3">
        <div className="aspect-video rounded-lg bg-gradient-to-br from-[#FFF7E0] to-[#F8FAFF] border border-[#E5E7EB] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/80 border border-[#E5E7EB] flex items-center justify-center"><div className="w-0 h-0 border-l-[8px] border-l-[#002B5B] border-y-[5px] border-y-transparent ml-0.5" /></div>
        </div>
        <div className="flex gap-1.5">{[80, 100, 60].map((w, i) => <div key={i} className="h-1.5 rounded-full bg-[#E5E7EB]" style={{ width: `${w}%` }} />)}</div>
      </div>
    ),
  },
  {
    id: "site", emoji: "🏠", label: "Site+Portais",
    title: "Seu imóvel em site profissional, sem pagar hosting", sub: "Setup automático em 2min. Tema moderno, galeria com zoom, integração ZAP/OLX, chat de contato. +60% agendamentos vs só WhatsApp.",
    benefits: ["3 temas profissionais: Brisa, Urbano, Litoral", "SEO automático por imóvel", "Integração ZAP, OLX, VivaReal automática", "Formulário direto pro WhatsApp"],
    cta: "Lançar Meu Site", href: "/site-imobiliario", accent: "bg-[#F0FDF4]",
    mockup: <div className="p-2 border rounded-md text-sm text-center text-gray-500">Preview Site</div>,
  },
  {
    id: "crm", emoji: "🤝", label: "CRM",
    title: "Nunca mais perca um lead — nem esqueça de ligar", sub: "CRM que rastreia cada cliente. Automação avisa quando é hora de fazer follow-up. Corretores ganham 3-5 vendas/mês a mais.",
    benefits: ["Pipeline Kanban: Interesse → Agendado → Visitou → Negociando", "Histórico completo de interações", "Follow-up automático via WhatsApp", "Relatórios de conversão por período"],
    cta: "Organizar Leads Agora", href: "/crm-imobiliario", accent: "bg-[#F0F9FF]",
    mockup: (
      <div className="flex gap-2">
        {["Novos", "Negociação", "Fechados"].map((c) => (
          <div key={c} className="flex-1 rounded-lg border border-[#E5E7EB] p-2 bg-[#F8FAFF]">
            <div className="text-[9px] font-bold text-[#6B7280] mb-2 text-center">{c}</div>
            {[1,2].map(i=><div key={i} className="h-6 rounded bg-white border border-[#E5E7EB] mb-1.5" />)}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "whatsapp", emoji: "📱", label: "WhatsApp",
    title: "Seu WhatsApp vendendo 24/7", sub: "Cliente clica no site, cai no seu WhatsApp com mensagem pronta. Resposta automática agenda visita sem você ao vivo. +50% contatos noturnos.",
    benefits: ["Setup em 5 minutos via QR code", "Templates aprovados pelo Meta", "Agendamento automático de visitas", "Respostas por palavra-chave"],
    cta: "Ativar WhatsApp Agora", href: "/whatsapp-imobiliario", accent: "bg-[#FFF0F5]",
    mockup: (
      <div className="rounded-xl border border-[#E5E7EB] bg-[#F0FDF4] p-4 space-y-2">
        <div className="flex gap-2"><div className="w-6 h-6 rounded-full bg-[#25D366]" /><div className="bg-white rounded-lg px-3 py-2 text-[10px] text-[#374151] border border-[#E5E7EB]">📸 Novas fotos do apto 302</div></div>
        <div className="flex gap-2 justify-end"><div className="bg-[#DCF8C6] rounded-lg px-3 py-2 text-[10px] text-[#374151]">✅ Post gerado e publicado!</div></div>
      </div>
    ),
  },
];

export const modulesA: ModuleData[] = [
  { emoji: "🎨", title: "Criativos", desc: "Posts e artes profissionais com IA", href: "/criativos", accent: "bg-[#EEF2FF]", available: true },
  { emoji: "🎬", title: "Vídeos", desc: "Fotos viram Reels cinematográficos", href: "/videos", accent: "bg-[#FFF7E0]", available: true },
  { emoji: "🏠", title: "Site + Portais", desc: "10 modelos profissionais + SEO automático", href: "/site-imobiliario", accent: "bg-[#F0FDF4]", available: true },
  { emoji: "🤝", title: "CRM", desc: "Pipeline Kanban completo de leads", href: "/crm-imobiliario", accent: "bg-[#F0F9FF]", available: true },
  { emoji: "📱", title: "WhatsApp", desc: "Inbox + automações inteligentes", href: "/whatsapp-imobiliario", accent: "bg-[#FFF0F5]", available: true },
  { emoji: "📣", title: "Publicação Social", desc: "Agende e publique IG + FB", href: "/publicacao-social", accent: "bg-[#FFFBEB]", available: true },
];

export const modulesB: ModuleData[] = [
  { emoji: "🎨", title: "Criativos em Segundos", desc: "3 cliques geram criativo profissional — economiza 30min por imóvel", href: "/criativos", accent: "bg-[#EEF2FF]", available: true },
  { emoji: "🎬", title: "Vídeos que Vendem", desc: "5 fotos viram Reel cinematográfico em 30s — 3× mais alcance que imagem", href: "/videos", accent: "bg-[#FFF7E0]", available: true },
  { emoji: "🏠", title: "Site Pronto em 2min", desc: "Cada imóvel ganha site profissional com SEO — +60% agendamentos", href: "/site-imobiliario", accent: "bg-[#F0FDF4]", available: true },
  { emoji: "🤝", title: "Nunca Perca um Lead", desc: "CRM com follow-up automático — corretores ganham 3-5 vendas/mês a mais", href: "/crm-imobiliario", accent: "bg-[#F0F9FF]", available: true },
  { emoji: "📱", title: "WhatsApp 24/7", desc: "Respostas automáticas + agendamento — +50% contatos fora do horário", href: "/whatsapp-imobiliario", accent: "bg-[#FFF0F5]", available: true },
  { emoji: "📣", title: "Poste em Tudo", desc: "Um clique publica em Instagram, Facebook e TikTok — economiza 2h/dia", href: "/publicacao-social", accent: "bg-[#FFFBEB]", available: true },
];
