# Contexto para ImobCreator AI Studio

> Este arquivo deve ser colocado na raiz do repo imob-creator-studio como referência para o Claude Code.

## O que é este pacote

Resultado de uma auditoria completa do concorrente **Criador de Criativos** (https://criadordecriativos.app) + pesquisa de mercado com 18 concorrentes + análise visual de 50+ referências do Pinterest/Canva para o mercado imobiliário.

## Arquivos incluídos

| Arquivo | Descrição |
|---|---|
| `tools/analyze.js` | CLI de engenharia reversa — analisa imagens de referência e exporta temas JSON |
| `tools/src/reverse-engineer.js` | Módulo de análise profunda (imagem + vídeo) |
| `docs/RELATORIO_FINAL_IMOBCREATOR.md` | Pesquisa completa: concorrentes, categorias, estilos, regras de composição |
| `docs/visual-analysis-data.js` | 16 features mapeadas do concorrente |

## Conceito fundamental

O ImobCreator **NÃO gera fotos** — o cliente sobe a foto do imóvel dele. O sistema faz apenas **COMPOSIÇÃO** sobre a foto:
- Textos (título, subtítulo, preço, CTA)
- Cores e paletas
- Overlays e gradientes
- Badges e selos (À VENDA, VENDIDO, etc.)
- Ícones (quartos, vagas, m²)
- Efeitos visuais (glass morphism, sombras, bordas)
- Logo e dados de contato

## Estilos visuais para implementar (12 estilos)

1. Dark Premium (preto + dourado)
2. Moderno Clean (branco + azul)
3. Luxo Dourado (preto + ouro)
4. Glass Morphism (translúcido + blur)
5. Minimalista Branco (branco + 1 accent)
6. Colorido Vibrante (azul + laranja)
7. Natureza Verde (verde + bege)
8. Clássico Elegante (azul marinho + ouro)
9. Neon Futurista (preto + neon)
10. Pastel Suave (rosa + azul claro)
11. Urgência Vermelho (vermelho + preto)
12. Editorial Magazine (branco + serif)

## Categorias de criativos (20 tipos)

### MVP (8 categorias)
1. Imóvel à Venda
2. Imóvel para Alugar
3. Lançamento
4. Vendido/Alugado
5. Carrossel Tour
6. Stories Imóvel
7. Lead Magnet
8. Corretor Pessoal

### V2 (7 categorias)
9. Dicas Educativas
10. Open House
11. Depoimento Cliente
12. Market Update
13. Preço Reduzido
14. Comparativo
15. Guia do Bairro

### V3 (5 categorias)
16. Antes/Depois
17. Lifestyle
18. Institucional
19. Flyer Impresso
20. Newsletter

## Variáveis do cliente (campos do formulário)

```
{FOTO_IMOVEL}     → Foto principal (fundo da composição)
{TITULO}          → "Apartamento no Jardins"
{SUBTITULO}       → "3 suítes, 2 vagas, 180m²"
{PRECO}           → "R$ 1.200.000"
{ENDERECO}        → "Rua Augusta, 1000"
{BAIRRO}          → "Jardins"
{CIDADE}          → "São Paulo - SP"
{QUARTOS}         → 3
{BANHEIROS}       → 2
{VAGAS}           → 2
{METRAGEM}        → "180m²"
{CTA}             → "Agende uma Visita"
{WHATSAPP}        → "(11) 99999-9999"
{NOME_CORRETOR}   → "Douglas Bonanza"
{CRECI}           → "CRECI 12345-F"
{LOGO}            → Arquivo PNG do logo
{FOTO_CORRETOR}   → Foto do corretor (opcional)
{TIPO}            → "Venda" | "Aluguel" | "Lançamento"
{BADGE}           → "NOVO" | "EXCLUSIVO" | "OPORTUNIDADE"
```

## Concorrentes principais

| Plataforma | País | Temas Imob | Preço |
|---|---|---|---|
| Criador de Criativos | Brasil | 5 | Créditos R$29/20 |
| Lano | Brasil | Redecor IA | R$147/mês |
| ImobAI | Brasil | 6 estilos | Freemium |
| Xara | Global | Auto MLS | US$9/mês |
| Pedra.ai | Europa | Staging | €29/mês |

## Como usar a skill de engenharia reversa

```bash
# Instalar dependências
npm install

# Analisar imagem de referência do Pinterest/concorrente
export ANTHROPIC_API_KEY=sk-ant-...
node tools/analyze.js referencia.png

# Analisar pasta inteira
node tools/analyze.js ./referencias/

# Resultado → tools/reverse-engineered/imobcreator_export.json
# Importar este JSON como novo tema no motor de composição
```

## Regras de composição (overlay sobre foto do cliente)

### Overlays por estilo:
- **Dark Premium**: `linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)`
- **Moderno Clean**: faixa branca sólida nos 40% inferiores
- **Luxo Dourado**: `linear-gradient(180deg, rgba(20,15,10,0.2) 0%, rgba(20,15,10,0.9) 100%)`
- **Glass Morphism**: `backdrop-filter: blur(20px); background: rgba(255,255,255,0.15)`
- **Colorido**: barra sólida colorida inferior (40% da altura)

### Hierarquia de texto (ordem fixa):
1. TÍTULO (maior, bold, cor destaque) — máx 40 chars
2. PREÇO (grande, accent) — se aplicável
3. SUBTÍTULO (médio, secundária) — máx 80 chars
4. ÍCONES + DADOS (quartos, vagas, m²) — grid horizontal
5. CTA (botão accent) — máx 25 chars
6. CONTATO/WHATSAPP — discreto
7. LOGO + CRECI — canto inferior
