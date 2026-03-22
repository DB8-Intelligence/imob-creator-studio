---
name: image-prompt-audit
description: >
  Audita uma URL e páginas internas do mesmo domínio para encontrar prompts e
  metadados de geração de imagem em HTML, DOM e JSON/API.
---

# Image Prompt Audit

Quando precisar investigar páginas de sites para encontrar prompts de geração de imagem,
siga este fluxo:

1. Execute o script local `tools/image_prompt_audit.py`.
2. Use `--mode auto` por padrão.
3. Salve JSON e CSV quando houver muitos achados.
4. Responda com:
   - resumo executivo
   - principais URLs com achados
   - principais campos encontrados
   - possíveis pontos de origem (DOM, script embutido, API JSON)

## Execução padrão

```bash
bash openclaw-workspace/skills/image-prompt-audit/run_scan.sh "$ARGUMENTS"
```

## Observações

- Prefira páginas com `/image`, `/gallery`, `/art`, `/post` ou `/generate`.
- Se não houver achados em HTML, use `--mode browser`.
- Agrupe resultados repetidos por URL e campo antes de responder.
- Respeite robots.txt e termos de uso do site auditado.
