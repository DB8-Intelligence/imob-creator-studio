# Onboarding — Captura de Marca (1º Login)

## Fluxo na interface (WeWeb)

```
Tela 1: Boas-vindas
  → "Vamos configurar seu perfil em 2 minutos"
  → Campos: Nome, Imobiliária, CRECI, WhatsApp, Cidade, Instagram

Tela 2: Sua foto profissional (opcional)
  → Upload foto do corretor (usada em templates "Corretor Pessoal")

Tela 3: Sua logomarca
  → Upload PNG/SVG com transparência (máx 5MB)
  → "Não tem logo? Pule esta etapa — usaremos as cores do seu imóvel"
  → SE upload → chamar /api/onboarding/logo-analyze

Tela 4: Seu estilo
  → Nicho: [Residencial] [Comercial] [Luxo] [Lançamentos] [Rural]
  → Público: [Famílias] [Investidores] [Alto Padrão] [Jovens] [Geral]
  → Tom: [Sofisticado] [Amigável] [Direto] [Urgente]

Tela 5: Preview do perfil
  → Exibe as cores extraídas da logo com bolinhas coloridas
  → "Estas são as cores da sua marca que usaremos nos criativos"
  → Botão: "Começar a criar"
```

## API: POST /api/onboarding/logo-analyze

```typescript
// src/services/onboarding/logo-analyzer.service.ts

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function analyzeLogoColors(logoBase64: string): Promise<BrandColors> {

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: 'image/png', data: logoBase64 }
        },
        {
          type: 'text',
          text: `Analise esta logomarca e extraia as cores principais para um sistema de design.
          
Retorne APENAS este JSON, sem texto adicional:
{
  "primaria": "#hex (cor mais dominante e representativa da marca)",
  "secundaria": "#hex (segunda cor mais presente, ou complementar)",
  "neutra": "#hex (cor neutra/cinza usada na logo, ou #888888 se não houver)",
  "fundo_preferido": "#hex (cor escura harmoniosa com a primária, para usar como fundo de criativos)",
  "estilo_detectado": "moderno|classico|minimalista|bold|elegante",
  "tem_fundo_transparente": true,
  "descricao_marca": "string (2-3 palavras descrevendo o estilo visual da marca)"
}`
        }
      ]
    }]
  });

  return JSON.parse(response.content[0].text) as BrandColors;
}

// API Route
// POST /api/onboarding/logo-analyze
export async function logoAnalyzeRoute(req, res) {
  const file = req.file; // multipart upload via multer
  const base64 = file.buffer.toString('base64');

  try {
    const colors = await analyzeLogoColors(base64);

    // Salvar no storage do Supabase
    const { data: uploadData } = await supabase.storage
      .from('imobcreator-creatives')
      .upload(`logos/${req.user.id}/logo.png`, file.buffer, {
        contentType: 'image/png',
        upsert: true
      });

    const logoUrl = supabase.storage
      .from('imobcreator-creatives')
      .getPublicUrl(`logos/${req.user.id}/logo.png`).data.publicUrl;

    // Salvar no perfil do usuário
    await supabase
      .from('user_brand_profiles')
      .upsert({
        user_id: req.user.id,
        logo_url: logoUrl,
        cores_marca: colors,
        estilo_marca: colors.estilo_detectado,
      });

    return res.json({
      success: true,
      logo_url: logoUrl,
      cores: colors
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
```

## API: POST /api/onboarding/brand

```typescript
// Salvar perfil completo após tela 4

export async function saveBrandProfile(req, res) {
  const {
    nome_corretor,
    nome_imobiliaria,
    creci,
    whatsapp,
    instagram,
    cidade_atuacao,
    nicho,
    publico_alvo,
    tom_comunicacao
  } = req.body;

  await supabase
    .from('user_brand_profiles')
    .upsert({
      user_id: req.user.id,
      nome_corretor,
      nome_imobiliaria,
      creci,
      whatsapp,
      instagram,
      cidade_atuacao,
      nicho,
      publico_alvo,
      tom_comunicacao,
      onboarding_completo: true,
      updated_at: new Date().toISOString()
    });

  return res.json({ success: true });
}
```

## Tela de preview de cores (WeWeb component)

```html
<!-- Componente de preview das cores extraídas -->
<div class="brand-colors-preview">
  <h3>Cores da sua marca</h3>
  <div class="color-swatches">
    <div class="swatch" :style="{ background: brandColors.primaria }">
      <span>Primária</span>
    </div>
    <div class="swatch" :style="{ background: brandColors.secundaria }">
      <span>Secundária</span>
    </div>
    <div class="swatch" :style="{ background: brandColors.fundo_preferido }">
      <span>Fundo</span>
    </div>
  </div>
  <p class="hint">
    {{ brandColors.fonte === 'marca' 
      ? 'Cores extraídas da sua logomarca' 
      : 'Cores serão extraídas de cada imóvel' }}
  </p>
</div>
```
