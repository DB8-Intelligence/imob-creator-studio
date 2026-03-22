# Desenho técnico — compositor final do módulo de vídeo

## Objetivo
Definir a arquitetura do compositor final do módulo de vídeo do ImobCreatorAI.

O compositor é responsável por transformar múltiplos segmentos/clipes em um vídeo final único, pronto para preview, download e publicação futura.

---

# 1. Papel do compositor no pipeline

## Pipeline ideal
1. usuário envia imagens
2. sistema cria `video_job`
3. sistema cria `video_job_segments`
4. cada segmento representa ou gera um clipe de 5 segundos
5. compositor final junta os segmentos válidos
6. output final é salvo em storage
7. vídeo final aparece na biblioteca do usuário

---

# 2. Responsabilidades do compositor

O compositor deve:
- respeitar a ordem dos segmentos (`sequence_index`)
- ignorar segmentos inválidos, falhos ou `skipped`
- concatenar os clipes válidos
- aplicar acabamento visual quando necessário
- renderizar o vídeo final conforme o plano
- salvar o resultado em storage
- atualizar o `video_job`

---

# 3. Inputs esperados

## Do `video_job`
- `id`
- `workspace_id`
- `format`
- `style`
- `resolution`
- `metadata`

## De `video_job_segments`
- `video_job_id`
- `sequence_index`
- `status`
- `output_clip_url`
- `metadata`

## Regras de elegibilidade
Usar apenas segmentos:
- com `status = completed`
- com `output_clip_url` válido

Ignorar segmentos:
- `failed`
- `skipped`
- sem `output_clip_url`

---

# 4. Output esperado

## Output principal
- vídeo final composto

## Output secundário
Metadata final sugerida:

```json
{
  "video_job_id": "uuid",
  "segments_total": 18,
  "segments_used": 16,
  "segments_skipped": 2,
  "final_duration_seconds": 80,
  "resolution": "4K Ultra HD",
  "format": "reels",
  "composition_mode": "simple_concat_with_branding"
}
```

---

# 5. Modos de composição

## Modo 1 — simple concat
### Objetivo
- juntar os segmentos em ordem
- sem efeitos complexos
- foco em robustez

## Modo 2 — concat + branding
### Objetivo
- adicionar logo opcional
- adicionar título/assinatura
- fade simples no final

## Modo 3 — concat + branding + trilha
### Objetivo
- adicionar música
- aplicar volume e fade out

## Modo 4 — composição inteligente (futuro)
### Objetivo
- ritmo por tipo de imagem
- seleção automática das melhores imagens
- duração variável por cena

---

# 6. Recomendação de implementação

## Fase inicial recomendada
Implementar primeiro:

### `simple_concat_with_branding`

Esse modo entrega:
- baixo risco
- velocidade de implementação
- resultado comercialmente utilizável

---

# 7. Onde o compositor deve viver

## Opção recomendada
Criar uma edge function dedicada:

- `supabase/functions/compose-video/index.ts`

## Motivo
Separar responsabilidades:

### `generate-video`
- gera/organiza os segmentos
- prepara metadata

### `compose-video`
- busca segmentos concluídos
- concatena clipes
- aplica branding/trilha
- salva vídeo final

Benefícios:
- manutenção mais fácil
- debug mais claro
- maior escalabilidade

---

# 8. Fluxo técnico recomendado do compositor

## Etapa 1 — buscar segmentos do job
- selecionar `video_job_segments` por `video_job_id`

## Etapa 2 — filtrar segmentos válidos
- `status = completed`
- `output_clip_url != null`

## Etapa 3 — ordenar por sequência
- `sequence_index ASC`

## Etapa 4 — compor timeline
- montar lista ordenada de clipes
- usar concat simples como base

## Etapa 5 — aplicar acabamento
Opcional na primeira fase:
- logo
- texto final
- fade in/out

## Etapa 6 — salvar output final
- bucket `video-outputs`

## Etapa 7 — atualizar `video_jobs`
Atualizar:
- `status = completed`
- `output_url`
- metadata final

---

# 9. Tratamento de falhas

## Caso 1 — nenhum segmento concluído
- marcar job final como `failed`

## Caso 2 — alguns segmentos falharam
- compor com os válidos
- registrar no metadata quantos ficaram de fora

## Caso 3 — compositor falha
- marcar `video_job` como `failed`
- registrar erro no metadata

---

# 10. Dependências do compositor

## Técnicas
- acesso a `video_job_segments`
- `output_clip_url` por segmento
- ferramenta de composição (ex.: ffmpeg)
- upload no storage

## De produto
- regras de branding
- formato final desejado
- resolução final por plano

---

# 11. Backlog técnico do compositor

## COMP-001 — Criar edge function `compose-video`
**Prioridade:** alta

## COMP-002 — Buscar segmentos concluídos por `video_job_id`
**Prioridade:** alta

## COMP-003 — Ordenar segmentos por `sequence_index`
**Prioridade:** alta

## COMP-004 — Compor vídeo final com concat simples
**Prioridade:** alta

## COMP-005 — Salvar output final em `video-outputs`
**Prioridade:** alta

## COMP-006 — Atualizar `video_jobs` com metadata final
**Prioridade:** alta

## COMP-007 — Adicionar branding opcional
**Prioridade:** média

## COMP-008 — Suportar trilha opcional
**Prioridade:** média

## COMP-009 — Tratar falhas parciais de segmentos
**Prioridade:** média

---

# 12. Evolução recomendada da arquitetura

## Estado atual
- `video_jobs`
- `video_job_segments`
- `video-assets`
- `video-outputs`

## Próxima evolução recomendada
Adicionar bucket para clipes intermediários:
- `video-segments`

Objetivo:
- persistir os microclipes individuais
- facilitar debug
- permitir recomposição futura sem rerender total

---

# 13. Conclusão

O compositor final deve ser tratado como um componente separado do pipeline, simples no início e escalável depois.

Arquitetura recomendada:
- `generate-video` = camada de geração/organização
- `compose-video` = camada de composição final

Essa separação deixa o módulo mais robusto para evoluir de uma renderização monolítica para um pipeline real de segmentos.
