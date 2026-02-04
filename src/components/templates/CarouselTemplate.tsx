import React from "react";

interface CarouselSlide {
  title: string;
  description: string;
}

interface CarouselTemplateProps {
  slides?: CarouselSlide[];
}

const defaultSlides: CarouselSlide[] = [
  {
    title: "🏡 Casa de Alto Padrão",
    description: "Alphaville 2 · 5 suítes · 630m²",
  },
  {
    title: "✨ Acabamentos de Luxo",
    description: "Porcelanato · Piscina aquecida",
  },
  {
    title: "📍 Localização Privilegiada",
    description: "Próximo à entrada do condomínio",
  },
];

const CarouselTemplate: React.FC<CarouselTemplateProps> = ({
  slides = defaultSlides,
}) => {
  return (
    <div className="w-full flex overflow-x-auto gap-4 snap-x snap-mandatory font-body pb-2 scrollbar-hide">
      {slides.map((slide, index) => (
        <div
          key={index}
          className="min-w-[280px] snap-start bg-card rounded-lg p-4 shadow-soft border border-border flex-shrink-0"
        >
          <h3 className="text-xl font-bold text-card-foreground">{slide.title}</h3>
          <p className="text-muted-foreground mt-1">{slide.description}</p>
        </div>
      ))}
    </div>
  );
};

export default CarouselTemplate;
