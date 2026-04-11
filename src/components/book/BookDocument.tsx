/**
 * BookDocument.tsx — @react-pdf/renderer Document
 *
 * Gera o "Book do Corretor" em PDF com 7 paginas:
 *  1. Capa  2. Sobre Mim  3-4. Portfolio  5. Depoimentos  6. Servicos  7. Contato
 */
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { CorretorSite, SiteImovel, SiteDepoimento } from "@/types/site";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatBRL(value: number | undefined | null): string {
  if (value == null) return "Sob consulta";
  const parts = value.toFixed(2).split(".");
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `R$ ${intPart},${parts[1]}`;
}

function renderStars(rating: number): string {
  const clamped = Math.min(5, Math.max(0, Math.round(rating)));
  return "\u2605".repeat(clamped) + "\u2606".repeat(5 - clamped);
}

// ─── Colors ─────────────────────────────────────────────────────────────────

const C = {
  navy: "#1E3A8A",
  gold: "#F59E0B",
  white: "#FFFFFF",
  gray: "#6B7280",
  lightGray: "#F3F4F6",
  darkText: "#1F2937",
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 11, color: C.darkText },

  // --- Capa ---
  capa: {
    backgroundColor: C.navy,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 60,
  },
  capaName: { fontSize: 36, fontWeight: "bold", color: C.white, textAlign: "center", marginBottom: 8 },
  capaCreci: { fontSize: 14, color: C.gold, marginBottom: 24, textAlign: "center" },
  capaTagsRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6, marginBottom: 40 },
  capaTag: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 9,
    color: C.white,
  },
  capaFooter: { fontSize: 8, color: "rgba(255,255,255,0.5)", position: "absolute", bottom: 30 },

  // --- Section title ---
  sectionTitle: { fontSize: 22, fontWeight: "bold", color: C.navy, marginBottom: 4 },
  goldLine: { width: 60, height: 3, backgroundColor: C.gold, marginBottom: 16 },

  // --- Sobre ---
  sobrePage: { padding: 50 },
  bioText: { fontSize: 11, lineHeight: 1.6, color: C.gray, marginBottom: 24 },
  statsGrid: { flexDirection: "row", gap: 20, marginTop: 12 },
  statBox: {
    flex: 1,
    backgroundColor: C.lightGray,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  statNumber: { fontSize: 28, fontWeight: "bold", color: C.navy },
  statLabel: { fontSize: 9, color: C.gray, marginTop: 4, textAlign: "center" },

  // --- Portfolio ---
  portfolioPage: { padding: 50 },
  propertyRow: { flexDirection: "row", gap: 16, marginBottom: 20 },
  propertyCard: {
    flex: 1,
    border: `1 solid ${C.lightGray}`,
    borderRadius: 8,
    overflow: "hidden",
  },
  propertyImage: { width: "100%", height: 120, objectFit: "cover" },
  propertyImagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: C.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  propertyBody: { padding: 12 },
  propertyTitle: { fontSize: 12, fontWeight: "bold", color: C.navy, marginBottom: 2 },
  propertyLocation: { fontSize: 9, color: C.gray, marginBottom: 6 },
  propertyPrice: { fontSize: 14, fontWeight: "bold", color: C.gold, marginBottom: 6 },
  propertyMeta: { flexDirection: "row", gap: 10, fontSize: 8, color: C.gray },

  // --- Depoimentos ---
  depoPage: { padding: 50 },
  depoCard: {
    backgroundColor: C.lightGray,
    borderRadius: 8,
    padding: 16,
    marginBottom: 14,
  },
  depoStars: { fontSize: 14, color: C.gold, marginBottom: 6 },
  depoText: { fontSize: 10, color: C.darkText, lineHeight: 1.5, marginBottom: 6, fontStyle: "italic" },
  depoAuthor: { fontSize: 9, fontWeight: "bold", color: C.navy },
  depoNegocio: { fontSize: 8, color: C.gray },

  // --- Servicos ---
  servicosPage: { padding: 50 },
  serviceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  serviceCard: {
    width: "47%",
    backgroundColor: C.lightGray,
    borderRadius: 8,
    padding: 14,
    marginBottom: 4,
  },
  serviceTitle: { fontSize: 12, fontWeight: "bold", color: C.navy, marginBottom: 4 },
  serviceDesc: { fontSize: 9, color: C.gray, lineHeight: 1.4 },

  // --- Contato ---
  contatoPage: {
    padding: 50,
    flex: 1,
    justifyContent: "center",
  },
  contatoRow: { flexDirection: "row", marginBottom: 10 },
  contatoIcon: { fontSize: 11, color: C.gold, width: 24 },
  contatoValue: { fontSize: 11, color: C.darkText },
  contatoSocialsRow: { flexDirection: "row", gap: 16, marginTop: 20 },
  contatoSocialLabel: { fontSize: 9, color: C.navy, fontWeight: "bold" },
  contatoSocialValue: { fontSize: 9, color: C.gray },
  brandingFooter: {
    position: "absolute",
    bottom: 30,
    left: 50,
    fontSize: 8,
    color: "rgba(0,0,0,0.3)",
  },
});

// ─── Services data ──────────────────────────────────────────────────────────

const SERVICOS = [
  { titulo: "Compra", desc: "Encontramos o imovel ideal para voce com consultoria personalizada e negociacao estrategica." },
  { titulo: "Venda", desc: "Valorizamos e divulgamos seu imovel nos melhores canais para atrair compradores qualificados." },
  { titulo: "Avaliacao", desc: "Analise de mercado completa para definir o valor justo do seu imovel com embasamento tecnico." },
  { titulo: "Locacao", desc: "Gestao completa de locacao, do anuncio ao contrato, com acompanhamento juridico." },
  { titulo: "Consultoria", desc: "Orientacao personalizada em investimentos imobiliarios e planejamento patrimonial." },
];

// ─── Props ──────────────────────────────────────────────────────────────────

export interface BookDocumentProps {
  site: CorretorSite;
  imoveis: SiteImovel[];
  depoimentos: SiteDepoimento[];
}

// ─── Document ───────────────────────────────────────────────────────────────

export default function BookDocument({ site, imoveis, depoimentos }: BookDocumentProps) {
  // Split properties into pairs for 2-per-page layout
  const propertyPages: SiteImovel[][] = [];
  for (let i = 0; i < imoveis.length; i += 2) {
    propertyPages.push(imoveis.slice(i, i + 2));
  }

  return (
    <Document title={`Book - ${site.nome_completo}`} author="NexoImob AI">
      {/* ── Page 1: Capa ───────────────────────────────────────────── */}
      <Page size="A4" style={s.page}>
        <View style={s.capa}>
          {site.foto_url ? (
            <Image
              src={site.foto_url}
              style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 24 }}
            />
          ) : (
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: "rgba(255,255,255,0.15)",
                marginBottom: 24,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 36, color: C.white }}>
                {(site.nome_completo || "C").charAt(0)}
              </Text>
            </View>
          )}
          <Text style={s.capaName}>{site.nome_completo || "Corretor Imobiliario"}</Text>
          {site.creci ? <Text style={s.capaCreci}>CRECI {site.creci}</Text> : null}
          {site.especialidades?.length > 0 && (
            <View style={s.capaTagsRow}>
              {site.especialidades.map((esp, i) => (
                <Text key={i} style={s.capaTag}>
                  {esp}
                </Text>
              ))}
            </View>
          )}
          <Text style={s.capaFooter}>NexoImob AI</Text>
        </View>
      </Page>

      {/* ── Page 2: Sobre Mim ──────────────────────────────────────── */}
      <Page size="A4" style={[s.page, s.sobrePage]}>
        <Text style={s.sectionTitle}>Sobre Mim</Text>
        <View style={s.goldLine} />
        <Text style={s.bioText}>
          {site.bio || "Profissional do mercado imobiliario comprometido em oferecer a melhor experiencia para voce encontrar o imovel dos seus sonhos."}
        </Text>
        <View style={s.statsGrid}>
          <View style={s.statBox}>
            <Text style={s.statNumber}>{site.anos_experiencia || 0}</Text>
            <Text style={s.statLabel}>Anos de experiencia</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statNumber}>{imoveis.length}</Text>
            <Text style={s.statLabel}>Imoveis no portfolio</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statNumber}>{depoimentos.length}</Text>
            <Text style={s.statLabel}>Clientes satisfeitos</Text>
          </View>
        </View>
      </Page>

      {/* ── Pages 3-4: Portfolio ────────────────────────────────────── */}
      {propertyPages.map((pair, pageIdx) => (
        <Page key={`port-${pageIdx}`} size="A4" style={[s.page, s.portfolioPage]}>
          {pageIdx === 0 && (
            <>
              <Text style={s.sectionTitle}>Portfolio de Imoveis</Text>
              <View style={s.goldLine} />
            </>
          )}
          {pair.map((imovel) => (
            <View key={imovel.id} style={{ marginBottom: 16 }}>
              <View style={s.propertyRow}>
                <View style={s.propertyCard}>
                  {imovel.foto_capa ? (
                    <Image src={imovel.foto_capa} style={s.propertyImage} />
                  ) : (
                    <View style={s.propertyImagePlaceholder}>
                      <Text style={{ fontSize: 9, color: C.gray }}>Sem foto</Text>
                    </View>
                  )}
                  <View style={s.propertyBody}>
                    <Text style={s.propertyTitle}>{imovel.titulo}</Text>
                    <Text style={s.propertyLocation}>
                      {[imovel.bairro, imovel.cidade, imovel.estado].filter(Boolean).join(", ")}
                    </Text>
                    <Text style={s.propertyPrice}>{formatBRL(imovel.preco)}</Text>
                    <View style={s.propertyMeta}>
                      {imovel.quartos > 0 && <Text>{imovel.quartos} quarto(s)</Text>}
                      {imovel.banheiros > 0 && <Text>{imovel.banheiros} banheiro(s)</Text>}
                      {imovel.area_total && <Text>{imovel.area_total} m2</Text>}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </Page>
      ))}

      {/* Fallback if no properties */}
      {imoveis.length === 0 && (
        <Page size="A4" style={[s.page, s.portfolioPage]}>
          <Text style={s.sectionTitle}>Portfolio de Imoveis</Text>
          <View style={s.goldLine} />
          <Text style={s.bioText}>
            Nenhum imovel em destaque no momento. Visite meu site para ver as opcoes disponiveis.
          </Text>
        </Page>
      )}

      {/* ── Page 5: Depoimentos ────────────────────────────────────── */}
      <Page size="A4" style={[s.page, s.depoPage]}>
        <Text style={s.sectionTitle}>O que dizem nossos clientes</Text>
        <View style={s.goldLine} />
        {depoimentos.length > 0 ? (
          depoimentos.map((dep) => (
            <View key={dep.id} style={s.depoCard}>
              <Text style={s.depoStars}>{renderStars(dep.avaliacao)}</Text>
              <Text style={s.depoText}>&quot;{dep.texto}&quot;</Text>
              <Text style={s.depoAuthor}>{dep.nome_cliente}</Text>
              {dep.tipo_negocio ? <Text style={s.depoNegocio}>{dep.tipo_negocio}</Text> : null}
            </View>
          ))
        ) : (
          <Text style={s.bioText}>Em breve depoimentos de clientes satisfeitos.</Text>
        )}
      </Page>

      {/* ── Page 6: Servicos ───────────────────────────────────────── */}
      <Page size="A4" style={[s.page, s.servicosPage]}>
        <Text style={s.sectionTitle}>Servicos</Text>
        <View style={s.goldLine} />
        <View style={s.serviceGrid}>
          {SERVICOS.map((srv, i) => (
            <View key={i} style={s.serviceCard}>
              <Text style={s.serviceTitle}>{srv.titulo}</Text>
              <Text style={s.serviceDesc}>{srv.desc}</Text>
            </View>
          ))}
        </View>
      </Page>

      {/* ── Page 7: Contato ────────────────────────────────────────── */}
      <Page size="A4" style={[s.page, s.contatoPage]}>
        <Text style={s.sectionTitle}>Entre em Contato</Text>
        <View style={s.goldLine} />

        {site.telefone && (
          <View style={s.contatoRow}>
            <Text style={s.contatoIcon}>Tel</Text>
            <Text style={s.contatoValue}>{site.telefone}</Text>
          </View>
        )}
        {site.whatsapp && (
          <View style={s.contatoRow}>
            <Text style={s.contatoIcon}>Wpp</Text>
            <Text style={s.contatoValue}>{site.whatsapp}</Text>
          </View>
        )}
        {site.email_contato && (
          <View style={s.contatoRow}>
            <Text style={s.contatoIcon}>@</Text>
            <Text style={s.contatoValue}>{site.email_contato}</Text>
          </View>
        )}

        {/* Social links */}
        <View style={s.contatoSocialsRow}>
          {site.instagram && (
            <View>
              <Text style={s.contatoSocialLabel}>Instagram</Text>
              <Text style={s.contatoSocialValue}>{site.instagram}</Text>
            </View>
          )}
          {site.facebook && (
            <View>
              <Text style={s.contatoSocialLabel}>Facebook</Text>
              <Text style={s.contatoSocialValue}>{site.facebook}</Text>
            </View>
          )}
          {site.linkedin && (
            <View>
              <Text style={s.contatoSocialLabel}>LinkedIn</Text>
              <Text style={s.contatoSocialValue}>{site.linkedin}</Text>
            </View>
          )}
          {site.youtube && (
            <View>
              <Text style={s.contatoSocialLabel}>YouTube</Text>
              <Text style={s.contatoSocialValue}>{site.youtube}</Text>
            </View>
          )}
        </View>

        {/* Site URL */}
        {site.slug && (
          <View style={{ marginTop: 24 }}>
            <Text style={{ fontSize: 10, color: C.gray }}>Acesse meu site:</Text>
            <Text style={{ fontSize: 12, color: C.navy, fontWeight: "bold", marginTop: 2 }}>
              imobcreatorai.com.br/{site.slug}
            </Text>
          </View>
        )}

        <Text style={s.brandingFooter}>Gerado por NexoImob AI</Text>
      </Page>
    </Document>
  );
}
