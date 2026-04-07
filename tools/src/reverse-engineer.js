import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { tmpdir } from 'os';

// ============================================================
// REVERSE ENGINEER — Análise Visual + Geração de Prompts
// Recebe imagem ou vídeo, retorna prompt reproduzível
// ============================================================

const IMAGE_ANALYSIS_SYSTEM = `Você é um especialista em engenharia reversa visual e criação de prompts para IA generativa.

Ao receber uma imagem, analise TODOS os seguintes aspectos e retorne APENAS JSON válido (sem markdown, sem code fences):

{
  "tipo": "imagem | video_frame",
  "categoria": "anuncio_imovel | post_feed | stories | carrossel | banner | flyer | thumbnail | depoimento | educativo | lancamento | vendido | comparativo | lifestyle | outro",
  "nicho": "imobiliario | advocacia | beleza | restaurante | saude | educacao | tecnologia | automotivo | pet | outro",

  "composicao": {
    "layout": "descrição do layout (ex: split-screen, foto full-bleed com overlay, grid, card centralizado)",
    "proporcao": "1:1 | 4:5 | 9:16 | 16:9 | outro",
    "grid": "descrição da estrutura de grid/colunas",
    "hierarquia_visual": "ordem de leitura dos elementos (ex: título > foto > preço > CTA)",
    "ponto_focal": "onde o olho é direcionado primeiro",
    "espacamento": "densidade visual (apertado | equilibrado | arejado)",
    "margens": "com margem | sem margem (full-bleed)"
  },

  "cores": {
    "paleta_principal": ["#hex1", "#hex2", "#hex3"],
    "paleta_secundaria": ["#hex4", "#hex5"],
    "fundo": "cor ou descrição (ex: gradiente escuro, foto com overlay 40%)",
    "texto_principal": "#hex",
    "texto_secundario": "#hex",
    "accent": "#hex (cor de destaque/CTA)",
    "estilo_cor": "luxo_dourado | moderno_clean | dark_premium | glass_morphism | classico | natureza | urgencia | vibrante | pastel | monocromatico",
    "contraste": "alto | medio | baixo",
    "temperatura": "quente | fria | neutra"
  },

  "tipografia": {
    "fonte_titulo": "nome estimado da fonte ou família (ex: Montserrat Bold, Playfair Display)",
    "fonte_corpo": "nome estimado",
    "tamanho_titulo": "muito grande | grande | medio",
    "peso_titulo": "black | extra-bold | bold | semi-bold",
    "peso_corpo": "regular | light | medium",
    "estilo_titulo": "maiusculas | minusculas | capitalizado | misto",
    "alinhamento": "esquerda | centro | direita",
    "efeitos_texto": "sombra | outline | gradiente | nenhum | glow | 3D",
    "num_fontes": 1,
    "hierarquia_tipografica": "descrição das camadas de texto (título, subtítulo, corpo, CTA)"
  },

  "elementos_graficos": {
    "foto_principal": "descrição (ex: fachada de prédio, interior sala de estar, pessoa)",
    "foto_tratamento": "original | filtro_escuro | filtro_claro | preto_e_branco | saturacao_alta | dessaturado",
    "overlay": "tipo de overlay (ex: gradiente escuro inferior 50%, cor sólida 30%, nenhum)",
    "icones": ["lista de ícones visíveis (ex: cama, banheiro, carro, localização, whatsapp)"],
    "badges": ["lista de badges/selos (ex: À VENDA, NOVO, EXCLUSIVO, 20% OFF)"],
    "shapes": ["formas geométricas usadas (ex: retângulo arredondado, círculo, linha divisória, diagonal)"],
    "bordas": "com borda | sem borda | moldura decorativa",
    "sombras": "sim | nao — em quais elementos",
    "efeitos_especiais": "blur | glass_morphism | neon | 3d_elements | particles | nenhum",
    "logo": "posição e tamanho do logo (ex: inferior direito, 15% da área)",
    "qr_code": true,
    "foto_pessoa": "descrição se houver pessoa na imagem (ex: corretor de terno, família sorrindo)"
  },

  "textos_encontrados": {
    "titulo": "texto exato do título",
    "subtitulo": "texto exato do subtítulo",
    "corpo": "texto do corpo se houver",
    "cta": "texto do call-to-action",
    "preco": "preço se visível",
    "contato": "telefone/whatsapp se visível",
    "dados_tecnicos": "quartos, vagas, metragem se visíveis",
    "outros_textos": ["qualquer outro texto na imagem"]
  },

  "prompt_reproducao": {
    "prompt_imagem": "Prompt completo em inglês para gerar uma imagem similar usando Flux/SDXL/Midjourney. Inclua estilo, composição, cores, elementos, iluminação, mood. Seja extremamente detalhado e específico.",
    "prompt_imagem_pt": "Mesmo prompt traduzido para português",
    "negative_prompt": "Elementos a evitar na geração",
    "prompt_template": "Versão parametrizada do prompt com variáveis entre chaves {VARIAVEL} para reutilização",
    "variaveis": {
      "lista": ["TITULO", "SUBTITULO", "PRECO", "etc — todas as variáveis do template"]
    },
    "modelo_recomendado": "flux_pro | sdxl | midjourney | dall_e | ideogram | comfyui_pipeline",
    "steps_recomendados": 30,
    "cfg_scale": 7.5,
    "sampler": "euler_a | dpm_2m | ddim"
  },

  "qualidade": {
    "nivel_profissional": "amador | intermediario | profissional | premium",
    "estimativa_ferramenta": "canva | photoshop | figma | ia_generativa | design_manual | template_editavel",
    "pontos_fortes": ["lista do que funciona bem neste criativo"],
    "pontos_fracos": ["lista do que poderia melhorar"],
    "sugestoes_melhoria": ["sugestões específicas para versão melhorada"]
  }
}`;

const VIDEO_ANALYSIS_SYSTEM = `Você é um especialista em engenharia reversa de vídeos publicitários e criação de roteiros para IA generativa de vídeo.

Ao receber frames de um vídeo, analise TODOS os seguintes aspectos e retorne APENAS JSON válido (sem markdown, sem code fences):

{
  "tipo": "video",
  "duracao_estimada": "duração estimada em segundos",
  "fps_estimado": 30,
  "proporcao": "9:16 | 16:9 | 1:1 | 4:5",
  "categoria": "anuncio_imovel | tour_virtual | depoimento | lancamento | antes_depois | lifestyle | institucional | reels | stories | outro",
  "nicho": "imobiliario | advocacia | beleza | restaurante | saude | outro",

  "roteiro": {
    "estrutura_narrativa": "descrição da estrutura (ex: gancho > problema > solução > CTA)",
    "tom": "profissional | emocional | urgente | educativo | inspiracional | divertido",
    "cenas": [
      {
        "numero": 1,
        "duracao_segundos": 3,
        "descricao": "descrição detalhada do que acontece na cena",
        "tipo_shot": "establishing | close_up | medium | wide | aerial | POV | pan | tilt | tracking | dolly | zoom_in | zoom_out | static | slider | orbita",
        "movimento_camera": "descrição do movimento (ex: pan lento da esquerda para direita, dolly-in suave)",
        "angulo_camera": "eye_level | low_angle | high_angle | bird_eye | worm_eye | dutch_angle",
        "iluminacao": "natural | studio | golden_hour | neon | dramatica | suave | contraluz",
        "elementos_visuais": ["lista de elementos visíveis na cena"],
        "texto_overlay": "texto sobreposto se houver",
        "transicao_entrada": "cut | fade | dissolve | slide | zoom | morph | whip_pan | nenhuma",
        "transicao_saida": "cut | fade | dissolve | slide | zoom | morph | whip_pan",
        "audio": "descrição do áudio (música, narração, efeito sonoro)",
        "mood": "sentimento da cena"
      }
    ]
  },

  "audio": {
    "musica": {
      "genero": "estilo musical (ex: corporate, cinematic, upbeat, lo-fi)",
      "bpm_estimado": 120,
      "mood": "energético | calmo | inspiracional | dramático | alegre",
      "instrumentos": ["lista de instrumentos dominantes"]
    },
    "narracao": {
      "presente": true,
      "idioma": "pt-BR",
      "tom_voz": "profissional | amigável | urgente | suave | autoritário",
      "genero_voz": "masculina | feminina",
      "texto_narrado": "transcrição se possível"
    },
    "efeitos_sonoros": ["lista de efeitos (ex: whoosh, click, notification, ambiente)"]
  },

  "edicao": {
    "ritmo": "lento | moderado | rapido | dinamico",
    "cortes_por_segundo": 0.5,
    "efeitos_visuais": ["zoom_kenburns | parallax | split_screen | picture_in_picture | slow_motion | speed_ramp | glitch | nenhum"],
    "color_grading": "descrição da colorização (ex: tons quentes, cinema desaturado, vibrante)",
    "textos_animados": "estilo de animação do texto (ex: fade-in, typewriter, slide-up, bounce)",
    "lower_thirds": "descrição se houver terço inferior com info"
  },

  "prompt_reproducao": {
    "prompt_video": "Prompt completo para gerar vídeo similar usando Runway/Kling/Sora. Extremamente detalhado com movimentos de câmera, iluminação, composição.",
    "prompt_video_pt": "Mesmo em português",
    "roteiro_completo": "Roteiro formatado cena-a-cena pronto para produção",
    "storyboard_textual": "Descrição de cada frame-chave para storyboard",
    "modelo_recomendado": "runway_gen3 | kling | sora | pika | minimax | luma",
    "prompt_por_cena": [
      {
        "cena": 1,
        "prompt": "Prompt individual para gerar esta cena específica",
        "duracao": "3s",
        "camera": "descrição do movimento de câmera para o prompt"
      }
    ]
  },

  "qualidade": {
    "nivel_producao": "amador | intermediario | profissional | cinematografico",
    "estimativa_ferramenta": "capcut | premiere | after_effects | davinci | ia_generativa | celular",
    "pontos_fortes": ["lista"],
    "pontos_fracos": ["lista"],
    "sugestoes_melhoria": ["lista"]
  }
}`;

function callClaudeViaCurl(apiKey, messages, systemPrompt) {
  const body = JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: systemPrompt,
    messages
  });

  const tmpFile = path.join(tmpdir(), `re_req_${Date.now()}_${Math.random().toString(36).slice(2)}.json`);
  fs.writeFileSync(tmpFile, body);

  try {
    const result = execSync(
      `curl -sS --connect-timeout 30 --max-time 180 -X POST "https://api.anthropic.com/v1/messages" -H "Content-Type: application/json" -H "x-api-key: ${apiKey}" -H "anthropic-version: 2023-06-01" -d @${tmpFile}`,
      { maxBuffer: 20 * 1024 * 1024, timeout: 190000 }
    );

    const parsed = JSON.parse(result.toString('utf-8'));
    if (parsed.error) {
      throw new Error(`API error: ${parsed.error.message || JSON.stringify(parsed.error)}`);
    }
    return parsed;
  } finally {
    try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
  }
}

function extractFramesFromVideo(videoPath, outputDir, numFrames = 8) {
  fs.mkdirSync(outputDir, { recursive: true });

  // Get video duration
  let duration;
  try {
    const probe = execSync(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 "${videoPath}"`,
      { timeout: 15000 }
    ).toString().trim();
    duration = parseFloat(probe);
  } catch {
    duration = 30; // fallback
  }

  const interval = duration / (numFrames + 1);
  const frames = [];

  for (let i = 1; i <= numFrames; i++) {
    const timestamp = (interval * i).toFixed(2);
    const framePath = path.join(outputDir, `frame_${String(i).padStart(2, '0')}.jpg`);
    try {
      execSync(
        `ffmpeg -y -ss ${timestamp} -i "${videoPath}" -vframes 1 -q:v 2 "${framePath}"`,
        { timeout: 15000, stdio: 'pipe' }
      );
      if (fs.existsSync(framePath)) {
        frames.push({ path: framePath, timestamp: parseFloat(timestamp), index: i });
      }
    } catch (err) {
      console.warn(`[ReverseEngineer] Failed to extract frame at ${timestamp}s: ${err.message?.slice(0, 80)}`);
    }
  }

  return { frames, duration };
}

function imageToBase64Content(imagePath) {
  const buffer = fs.readFileSync(imagePath);
  const ext = path.extname(imagePath).toLowerCase();
  const mediaType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  return {
    type: 'image',
    source: {
      type: 'base64',
      media_type: mediaType,
      data: buffer.toString('base64')
    }
  };
}

// ============================================================
// MAIN: Analyze Image
// ============================================================
export async function analyzeImage(imagePath, apiKey) {
  if (!apiKey) apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY required');

  console.log(`[ReverseEngineer] Analyzing image: ${imagePath}`);

  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image not found: ${imagePath}`);
  }

  const content = [
    imageToBase64Content(imagePath),
    { type: 'text', text: 'Analise esta imagem em detalhes e retorne o JSON completo conforme instruído. Seja extremamente detalhado e específico em cada campo, especialmente no prompt_reproducao.' }
  ];

  const response = callClaudeViaCurl(apiKey, [{ role: 'user', content }], IMAGE_ANALYSIS_SYSTEM);
  const textBlock = response.content?.find(b => b.type === 'text');
  if (!textBlock) throw new Error('No text response from API');

  let jsonStr = textBlock.text.trim();
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonStr = fenceMatch[1].trim();

  const result = JSON.parse(jsonStr);
  result._source = { file: path.basename(imagePath), analyzed_at: new Date().toISOString() };

  console.log(`[ReverseEngineer] Image analyzed: ${result.categoria} / ${result.nicho} / ${result.cores?.estilo_cor}`);
  return result;
}

// ============================================================
// MAIN: Analyze Video
// ============================================================
export async function analyzeVideo(videoPath, apiKey, numFrames = 8) {
  if (!apiKey) apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY required');

  console.log(`[ReverseEngineer] Analyzing video: ${videoPath}`);

  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video not found: ${videoPath}`);
  }

  // Extract key frames
  const framesDir = path.join(tmpdir(), `re_frames_${Date.now()}`);
  const { frames, duration } = extractFramesFromVideo(videoPath, framesDir, numFrames);

  if (frames.length === 0) {
    throw new Error('Could not extract any frames from video');
  }

  console.log(`[ReverseEngineer] Extracted ${frames.length} frames from ${duration.toFixed(1)}s video`);

  // Build content with all frames
  const content = [];

  for (const frame of frames) {
    content.push(imageToBase64Content(frame.path));
    content.push({ type: 'text', text: `Frame ${frame.index}/${frames.length} — Timestamp: ${frame.timestamp.toFixed(1)}s` });
  }

  content.push({
    type: 'text',
    text: `Este vídeo tem ${duration.toFixed(1)} segundos e ${frames.length} frames-chave foram extraídos. Analise a sequência completa e retorne o JSON detalhado conforme instruído. Reconstrua o roteiro completo cena a cena, identifique movimentos de câmera, transições, e gere prompts individuais por cena para reprodução com IA generativa de vídeo.`
  });

  const response = callClaudeViaCurl(apiKey, [{ role: 'user', content }], VIDEO_ANALYSIS_SYSTEM);
  const textBlock = response.content?.find(b => b.type === 'text');
  if (!textBlock) throw new Error('No text response from API');

  let jsonStr = textBlock.text.trim();
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonStr = fenceMatch[1].trim();

  const result = JSON.parse(jsonStr);
  result._source = {
    file: path.basename(videoPath),
    duration,
    frames_analyzed: frames.length,
    analyzed_at: new Date().toISOString()
  };

  // Cleanup temp frames
  try {
    for (const frame of frames) fs.unlinkSync(frame.path);
    fs.rmdirSync(framesDir);
  } catch { /* ignore */ }

  console.log(`[ReverseEngineer] Video analyzed: ${result.roteiro?.cenas?.length || 0} scenes identified`);
  return result;
}

// ============================================================
// MAIN: Batch Analyze (múltiplas imagens/vídeos)
// ============================================================
export async function batchAnalyze(filePaths, apiKey, outputDir = './reverse-engineered') {
  if (!apiKey) apiKey = process.env.ANTHROPIC_API_KEY;
  fs.mkdirSync(outputDir, { recursive: true });

  const results = [];
  const videoExts = ['.mp4', '.mov', '.avi', '.webm', '.mkv'];

  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i];
    const ext = path.extname(filePath).toLowerCase();
    const baseName = path.basename(filePath, ext);

    console.log(`\n[ReverseEngineer] (${i + 1}/${filePaths.length}) Processing: ${filePath}`);

    try {
      let result;
      if (videoExts.includes(ext)) {
        result = await analyzeVideo(filePath, apiKey);
      } else {
        result = await analyzeImage(filePath, apiKey);
      }

      // Save individual result
      const outputFile = path.join(outputDir, `${baseName}_analysis.json`);
      fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
      console.log(`[ReverseEngineer] Saved: ${outputFile}`);

      results.push(result);
    } catch (err) {
      console.error(`[ReverseEngineer] Failed: ${filePath} — ${err.message?.slice(0, 150)}`);
      results.push({ error: err.message, file: filePath });
    }

    // Rate limiting
    if (i < filePaths.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Save consolidated report
  const reportFile = path.join(outputDir, 'consolidated_analysis.json');
  fs.writeFileSync(reportFile, JSON.stringify({
    total_analyzed: results.filter(r => !r.error).length,
    total_errors: results.filter(r => r.error).length,
    analyzed_at: new Date().toISOString(),
    results
  }, null, 2));

  // Generate prompt library
  const promptLibrary = results
    .filter(r => !r.error && r.prompt_reproducao)
    .map(r => ({
      source: r._source?.file,
      categoria: r.categoria,
      nicho: r.nicho,
      estilo: r.cores?.estilo_cor,
      prompt_en: r.prompt_reproducao?.prompt_imagem || r.prompt_reproducao?.prompt_video,
      prompt_pt: r.prompt_reproducao?.prompt_imagem_pt || r.prompt_reproducao?.prompt_video_pt,
      prompt_template: r.prompt_reproducao?.prompt_template,
      negative_prompt: r.prompt_reproducao?.negative_prompt,
      modelo: r.prompt_reproducao?.modelo_recomendado
    }));

  const libraryFile = path.join(outputDir, 'prompt_library.json');
  fs.writeFileSync(libraryFile, JSON.stringify(promptLibrary, null, 2));

  console.log(`\n[ReverseEngineer] Done. ${results.filter(r => !r.error).length} analyzed, ${results.filter(r => r.error).length} errors.`);
  console.log(`[ReverseEngineer] Reports: ${reportFile}`);
  console.log(`[ReverseEngineer] Prompts: ${libraryFile}`);

  return { results, promptLibrary };
}
