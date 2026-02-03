import React from "react";

interface SquarePostTemplateProps {
  title?: string;
  details?: string;
  ctaText?: string;
}

const SquarePostTemplate: React.FC<SquarePostTemplateProps> = ({
  title = "🏡 Casa à Venda no Alphaville",
  details = "5 suítes · 630m² · Condomínio Fechado",
  ctaText = "Agende sua visita",
}) => {
  return (
    <div className="template-post bg-card p-6 rounded-lg w-full aspect-square flex flex-col justify-between shadow-elevated border border-border">
      <div>
        <h3 className="text-xl font-bold text-card-foreground font-display">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mt-2 font-body">
          {details}
        </p>
      </div>

      <div className="mt-auto text-right">
        <button className="bg-accent text-accent-foreground font-semibold px-6 py-3 rounded-full hover:bg-accent/90 transition-colors shadow-soft font-body">
          {ctaText}
        </button>
      </div>
    </div>
  );
};

export default SquarePostTemplate;
