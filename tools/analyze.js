#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { analyzeImage, analyzeVideo, batchAnalyze } from './src/reverse-engineer.js';

// ============================================================
// CLI — Engenharia Reversa de Imagens e Vídeos
// ============================================================
// Uso:
//   node reverse-engineer-cli.js <arquivo_ou_pasta> [--output <dir>]
//
// Exemplos:
//   node reverse-engineer-cli.js foto_anuncio.png
//   node reverse-engineer-cli.js video_tour.mp4
//   node reverse-engineer-cli.js ./referencias/ --output ./prompts/
//   ANTHROPIC_API_KEY=sk-... node reverse-engineer-cli.js imagem.jpg
// ============================================================

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🔍 Engenharia Reversa Visual — ImobCreator / NexoOmnix    ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Analisa imagens e vídeos com IA e gera:                    ║
║  - Análise completa de composição, cores, tipografia        ║
║  - Prompt reproduzível para Flux/SDXL/Midjourney            ║
║  - Para vídeos: roteiro cena a cena, câmera, transições     ║
║  - Prompt template parametrizável com variáveis             ║
║  - Biblioteca de prompts consolidada                         ║
║                                                              ║
║  Uso:                                                        ║
║    node reverse-engineer-cli.js <arquivo_ou_pasta> [opções]  ║
║                                                              ║
║  Opções:                                                     ║
║    --output <dir>    Pasta de saída (default: ./reverse-engineered) ║
║    --frames <n>      Frames para vídeo (default: 8)          ║
║                                                              ║
║  Variáveis de ambiente:                                      ║
║    ANTHROPIC_API_KEY  Chave da API Anthropic (obrigatória)   ║
║                                                              ║
║  Exemplos:                                                   ║
║    node reverse-engineer-cli.js anuncio.png                  ║
║    node reverse-engineer-cli.js video.mp4 --frames 12        ║
║    node reverse-engineer-cli.js ./referencias/ --output ./out║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);
  process.exit(0);
}

// Parse args
let inputPath = args[0];
let outputDir = './reverse-engineered';
let numFrames = 8;

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--output' && args[i + 1]) { outputDir = args[++i]; }
  if (args[i] === '--frames' && args[i + 1]) { numFrames = parseInt(args[++i], 10); }
}

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('\n[ERRO] ANTHROPIC_API_KEY não definida.');
  console.error('Defina: export ANTHROPIC_API_KEY=sk-ant-...\n');
  process.exit(1);
}

const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
const videoExts = ['.mp4', '.mov', '.avi', '.webm', '.mkv'];
const allExts = [...imageExts, ...videoExts];

async function main() {
  console.log('\n='.repeat(60));
  console.log('  🔍 Engenharia Reversa Visual');
  console.log('='.repeat(60));

  const stat = fs.statSync(inputPath);
  let files = [];

  if (stat.isDirectory()) {
    // Scan directory for images/videos
    const entries = fs.readdirSync(inputPath);
    files = entries
      .filter(f => allExts.includes(path.extname(f).toLowerCase()))
      .map(f => path.join(inputPath, f));
    console.log(`  Pasta: ${inputPath}`);
    console.log(`  Arquivos encontrados: ${files.length}`);
  } else {
    files = [inputPath];
    console.log(`  Arquivo: ${inputPath}`);
  }

  if (files.length === 0) {
    console.error('\n[ERRO] Nenhum arquivo de imagem ou vídeo encontrado.');
    process.exit(1);
  }

  console.log(`  Saída: ${outputDir}`);
  console.log('='.repeat(60));

  if (files.length === 1) {
    // Single file
    const file = files[0];
    const ext = path.extname(file).toLowerCase();
    const baseName = path.basename(file, ext);

    fs.mkdirSync(outputDir, { recursive: true });

    let result;
    if (videoExts.includes(ext)) {
      result = await analyzeVideo(file, apiKey, numFrames);
    } else {
      result = await analyzeImage(file, apiKey);
    }

    // Save result
    const outputFile = path.join(outputDir, `${baseName}_analysis.json`);
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('  RESULTADO');
    console.log('='.repeat(60));

    if (result.tipo === 'video') {
      console.log(`  Tipo: Vídeo`);
      console.log(`  Duração: ${result._source?.duration?.toFixed(1)}s`);
      console.log(`  Cenas: ${result.roteiro?.cenas?.length || '?'}`);
      console.log(`  Categoria: ${result.categoria}`);
      console.log(`  Nicho: ${result.nicho}`);
      if (result.roteiro?.tom) console.log(`  Tom: ${result.roteiro.tom}`);
      if (result.prompt_reproducao?.modelo_recomendado) {
        console.log(`  Modelo recomendado: ${result.prompt_reproducao.modelo_recomendado}`);
      }
      console.log(`\n  Prompt de reprodução:`);
      console.log(`  ${(result.prompt_reproducao?.prompt_video_pt || '').slice(0, 300)}...`);
    } else {
      console.log(`  Tipo: Imagem`);
      console.log(`  Categoria: ${result.categoria}`);
      console.log(`  Nicho: ${result.nicho}`);
      console.log(`  Estilo: ${result.cores?.estilo_cor}`);
      console.log(`  Layout: ${result.composicao?.layout}`);
      console.log(`  Paleta: ${result.cores?.paleta_principal?.join(', ')}`);
      console.log(`  Nível: ${result.qualidade?.nivel_profissional}`);
      if (result.prompt_reproducao?.modelo_recomendado) {
        console.log(`  Modelo recomendado: ${result.prompt_reproducao.modelo_recomendado}`);
      }
      console.log(`\n  Prompt de reprodução (EN):`);
      console.log(`  ${(result.prompt_reproducao?.prompt_imagem || '').slice(0, 300)}...`);
      console.log(`\n  Prompt template (parametrizável):`);
      console.log(`  ${(result.prompt_reproducao?.prompt_template || '').slice(0, 300)}...`);
    }

    console.log(`\n  Análise completa salva em: ${outputFile}`);
    console.log('='.repeat(60));
  } else {
    // Batch mode
    const { results, promptLibrary } = await batchAnalyze(files, apiKey, outputDir);

    console.log('\n' + '='.repeat(60));
    console.log('  RESULTADO DO LOTE');
    console.log('='.repeat(60));
    console.log(`  Total analisados: ${results.filter(r => !r.error).length}`);
    console.log(`  Erros: ${results.filter(r => r.error).length}`);
    console.log(`  Prompts gerados: ${promptLibrary.length}`);
    console.log(`  Biblioteca: ${path.join(outputDir, 'prompt_library.json')}`);
    console.log('='.repeat(60));
  }
}

main().catch(err => {
  console.error(`\n[FATAL] ${err.message}`);
  process.exit(1);
});
