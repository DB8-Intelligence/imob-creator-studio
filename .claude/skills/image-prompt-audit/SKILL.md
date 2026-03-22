---
name: image-prompt-audit
description: >
  Audita uma URL e páginas internas do mesmo domínio para encontrar prompts e
  metadados de geração de imagem (prompt, negative_prompt, model, seed, steps,
  cfg, sampler, width, height). Use quando o usuário quiser inspecionar páginas
  de galeria, post, image, art ou generate, ou exportar resultados em JSON/CSV.
---

# Image Prompt Audit

## Quando usar

- Localizar prompts em HTML estático, DOM renderizado ou respostas JSON/API
- Inspecionar páginas de galeria, post, image, art ou generate
- Exportar resultados em JSON ou CSV para análise posterior
- Resumir achados por URL e campo

## Como executar

1. Confirme que o repositório possui `tools/image_prompt_audit.py`.
2. Prefira `--mode auto` (tenta HTML primeiro, usa browser se necessário).
3. Salve resultados em JSON e CSV quando a tarefa for investigativa.
4. Após a execução, resuma:
   - quantas páginas foram auditadas
   - quantos achados houve
   - quais campos apareceram
   - quais URLs parecem mais relevantes

## Comando padrão

```bash
bash .claude/skills/image-prompt-audit/run_scan.sh "$ARGUMENTS"
```

## Exemplos

```bash
# Modo automático, 20 páginas
bash .claude/skills/image-prompt-audit/run_scan.sh https://exemplo.com

# Modo browser, 15 páginas, exportar CSV
bash .claude/skills/image-prompt-audit/run_scan.sh https://exemplo.com --mode browser --max-pages 15 --csv-out resultados.csv

# Apenas campos prompt e model
bash .claude/skills/image-prompt-audit/run_scan.sh https://exemplo.com --fields prompt model
```

## Instalação das dependências

```bash
pip install requests beautifulsoup4
# Para modo browser:
pip install playwright && playwright install
```
