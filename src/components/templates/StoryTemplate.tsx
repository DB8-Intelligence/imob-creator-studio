import React from "react";

interface StoryTemplateProps {
  title?: string;
  details?: string;
  ctaText?: string;
  backgroundImage?: string;
}

const StoryTemplate: React.FC<StoryTemplateProps> = ({
  title = "Descubra Seu Novo Lar",
  details = "Alphaville · Vista Incrível · 5 Suítes",
  ctaText = "Agendar Agora",
  backgroundImage = "/placeholder.svg",
}) => {
  return (
    <div
      className="w-full max-w-[1080px] aspect-[9/16] bg-cover bg-center relative text-primary-foreground font-body rounded-xl overflow-hidden"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      {/* Dark overlay with enhanced dark mode opacity */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" />

      {/* Top content */}
      <div className="absolute top-24 left-10 right-10 text-center z-10">
        <h2 className="text-4xl font-bold text-accent drop-shadow-lg">
          {title}
        </h2>
        <p className="mt-4 text-xl drop-shadow-md">{details}</p>
      </div>

      {/* Bottom CTA */}
      <div className="absolute bottom-24 left-10 right-10 text-center z-10">
        <button className="bg-accent text-accent-foreground font-bold px-8 py-3 rounded-full shadow-xl hover:bg-accent/90 transition-colors">
          {ctaText}
        </button>
      </div>
    </div>
  );
};

export default StoryTemplate;
