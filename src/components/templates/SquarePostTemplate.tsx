import React from "react";

interface SquarePostTemplateProps {
  title?: string;
  details?: string;
  ctaText?: string;
  imageUrl?: string;
}

const SquarePostTemplate: React.FC<SquarePostTemplateProps> = ({
  title = "🏡 Casa Moderna no Alphaville",
  details = "5 suítes · 630m² · Condomínio com segurança 24h",
  ctaText = "Agende sua Visita",
  imageUrl = "/placeholder.svg",
}) => {
  return (
    <div className="w-full max-w-[1080px] aspect-square bg-card rounded-xl shadow-elevated p-6 flex flex-col justify-between text-card-foreground font-body">
      {/* Dynamic Image */}
      <img
        src={imageUrl}
        alt="Imagem do Imóvel"
        className="rounded-md h-[50%] object-cover mb-4"
      />

      {/* Content */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-lg text-muted-foreground">{details}</p>
      </div>

      {/* CTA */}
      <div className="text-right">
        <button className="bg-accent text-accent-foreground font-semibold px-6 py-2 rounded-full hover:bg-accent/90 transition-colors">
          {ctaText}
        </button>
      </div>
    </div>
  );
};

export default SquarePostTemplate;
