/**
 * SectionsWrapper — helper compartilhado por TODOS os 19 temas de site.
 *
 * Renderiza as 6 seções padrão do site na ORDEM definida em
 * `site.sections_config.order`, pulando as que estão `enabled === false`.
 *
 * Cada tema passa um mapa {hero, imoveis, about, depoimentos, contato, footer}
 * com seus componentes já configurados — este wrapper só decide a ORDEM e se
 * cada um APARECE ou não.
 *
 * Se o site não tem sections_config salvo ainda, cai no DEFAULT (todas as
 * seções visíveis na ordem hero → imoveis → about → depoimentos → contato → footer)
 * — comportamento idêntico ao anterior.
 */
import { Fragment, type ReactNode } from "react";
import {
  DEFAULT_SITE_SECTIONS,
  normalizeSiteSectionsConfig,
  type CorretorSite,
  type SiteSectionKey,
} from "@/types/site";

interface SectionsWrapperProps {
  site: CorretorSite;
  children: Partial<Record<SiteSectionKey, ReactNode>>;
}

export default function SectionsWrapper({ site, children }: SectionsWrapperProps) {
  const config = site.sections_config
    ? normalizeSiteSectionsConfig(site.sections_config)
    : DEFAULT_SITE_SECTIONS;

  return (
    <>
      {config.order.map((key) => {
        if (config.enabled[key] === false) return null;
        const node = children[key];
        if (!node) return null;
        return <Fragment key={key}>{node}</Fragment>;
      })}
    </>
  );
}
