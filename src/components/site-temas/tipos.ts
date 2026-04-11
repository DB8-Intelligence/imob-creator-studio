import type { CorretorSite, SiteImovel, SiteDepoimento } from "@/types/site";

export interface TemaProps {
  site: CorretorSite;
  imoveis: SiteImovel[];
  depoimentos: SiteDepoimento[];
  isPreview?: boolean;
}

export const formatPrice = (value?: number): string => {
  if (!value) return "Consulte";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const whatsappLink = (phone: string, msg?: string): string => {
  const clean = phone.replace(/\D/g, "");
  const base = `https://wa.me/${clean}`;
  return msg ? `${base}?text=${encodeURIComponent(msg)}` : base;
};
