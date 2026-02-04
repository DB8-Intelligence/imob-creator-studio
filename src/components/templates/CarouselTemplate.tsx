import React from "react";

interface CarouselSlide {
  title: string;
  description: string;
  imageUrl?: string;
}

interface CarouselTemplateProps {
  slides?: CarouselSlide[];
}

const defaultSlides: CarouselSlide[] = [
  {
    title: "🏠 Fachada Imponente",
    description: "Design moderno com iluminação natural",
    imageUrl: "/placeholder.svg",
  },
  {
    title: "🍽️ Área Gourmet",
    description: "Ambiente integrado com churrasqueira",
    imageUrl: "/placeholder.svg",
  },
  {
    title: "🏊 Piscina com Deck",
    description: "Perfeita para relaxar e curtir com a família",
    imageUrl: "/placeholder.svg",
  },
];

const CarouselTemplate: React.FC<CarouselTemplateProps> = ({
  slides = defaultSlides,
}) => {
  return (
    <div className="w-full flex overflow-x-auto gap-6 snap-x snap-mandatory font-body px-4 py-6 bg-background dark:bg-card rounded-xl">
      {slides.map((slide, index) => (
        <div
          key={index}
          className="min-w-[280px] snap-start bg-card dark:bg-muted rounded-lg p-4 shadow-soft flex-shrink-0"
        >
          {slide.imageUrl && (
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="rounded mb-2 w-full h-32 object-cover"
            />
          )}
          <h3 className="text-xl font-bold text-card-foreground">{slide.title}</h3>
          <p className="text-muted-foreground mt-1">{slide.description}</p>
        </div>
      ))}
    </div>
  );
};

export default CarouselTemplate;
