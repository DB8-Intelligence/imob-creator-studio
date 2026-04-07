# PART 97 — Trust, Explanation & Audit Surfaces

## Modelo de Explainability/Audit

### Conceitos

| Conceito | Definicao | Exemplo |
|----------|-----------|---------|
| **ExplanationRecord** | Registro imutavel de por que algo aconteceu | "Template dark_premium selecionado por luxury_level=ultra" |
| **TrustSignal** | Indicador composto de confianca do sistema | confidence=0.85, risk=0.1, governance=compliant |
| **ConfidenceIndicator** | Score numerico (0-1) + fatores que contribuiram | 0.85 [template_match_strong, image_analyzed_ok] |
| **RiskIndicator** | Score de risco + mitigacao aplicada | 0.15 [fallback_used], mitigation: "used_cached_result" |
| **ActionTrace** | Rastreio input→output de uma acao | render_creative: inputs={template, image} → success (2300ms) |
| **AuditSurface** | Pacote consumivel por audience especifica | explanation + narrativas + relacionados |
| **AuditNarrative** | Resumo em linguagem natural para audience | Customer: "Seu criativo foi gerado com alta confianca" |
| **DecisionExplanation** | Explicacao de decisao com alternativas rejeitadas | "Escolheu dark_premium. Rejeitou minimal_clean: luxury_level insuficiente" |
| **PolicyExplanation** | Por que uma policy bloqueou/permitiu | "Publicacao bloqueada: limite 30/mes atingido (plano standard)" |
| **ExecutionExplanation** | Como um pipeline/job executou step-by-step | "5 etapas, 4200ms, 0 retries, status: success" |

### Hierarquia

```
ExplanationRecord (raiz)
├── TrustSignal
│   ├── ConfidenceIndicator
│   └── RiskIndicator
├── DecisionExplanation (opcional)
├── PolicyExplanation (opcional)
├── ExecutionExplanation (opcional)
├── ActionTrace[] (0..N)
└── AuditNarrative[] (por audience)
    ├── customer
    ├── admin
    ├── copilot
    └── support
```

### Relacao com modulos existentes

```
decision intelligence  ──→  DecisionExplanation
policy engine          ──→  PolicyExplanation
governance             ──→  TrustSignal.governanceStatus
execution/pipeline     ──→  ExecutionExplanation + ActionTrace
recovery               ──→  ExecutionExplanation.recoveryActions
billing/monetization   ──→  PolicyExplanation (control points)
dashboard              ──→  AuditSurface (audience=customer)
admin/ops              ──→  AuditSurface (audience=admin)
copilot/advisor        ──→  AuditSurface (audience=copilot)
```

## Arquitetura

### Persistencia (Supabase)

| Tabela | Proposito |
|--------|-----------|
| `bookagent_explanations` | Registro principal de explicacao (JSONB para decision/policy/execution) |
| `bookagent_trust_signals` | Trust signals denormalizados para queries rapidas por risco |
| `bookagent_audit_narratives` | Narrativas por audience, FK para explanations |

### Modulo Frontend (`src/modules/explainability/`)

| Arquivo | Responsabilidade |
|---------|-----------------|
| `types.ts` | Todos os DTOs e interfaces |
| `trust-builder.ts` | Composicao de TrustSignal a partir de inputs do sistema |
| `explainers.ts` | Funcoes por dominio (decision, policy, execution, etc.) |
| `narrative-builder.ts` | Gera narrativas por audience sem LLM |
| `explanation-recorder.ts` | Persiste no Supabase + queries |
| `audit-surfaces.ts` | Monta pacotes consumiveis |
| `index.ts` | Barrel export |

### API Routes (`server/src/routes/explainability.ts`)

| Route | Descricao |
|-------|-----------|
| `GET /api/explainability/decision/:id` | Explicacao de decisao |
| `GET /api/explainability/job/:id` | Todas as explicacoes de um job |
| `GET /api/explainability/reference/:type/:id` | Explicacao por referencia generica |
| `GET /api/audit/campaign/:id` | Audit surface de campanha |
| `GET /api/audit/publication/:id` | Audit surface de publicacao |
| `GET /api/audit/narratives/:explanationId` | Narrativas filtradas por audience |
| `GET /api/trust/tenant/:id` | Trust overview do tenant |
| `GET /api/trust/high-risk/:tenantId` | Sinais de alto risco |
| `GET /api/explainability/list` | Listar explicacoes com filtros |

## Como confianca e auditoria sao expostas

### Customer Dashboard
- Ve narrativa simplificada: resultado + confianca + bloqueios
- Highlights: "Confianca: Alta", "Opcao: dark_premium"
- Severity visual: success (verde), warning (amarelo), error (vermelho)

### Admin/Ops
- Ve narrativa detalhada: rationale + alternatives + policy + duracao
- Trust breakdown: confidence %, risk level, governance status
- Flags: fallback acionado, recovery, human review needed

### Copilot/Advisor
- Ve tudo: context JSON, thresholds, inputs checked, step-by-step
- Pode consumir para recomendar acoes ao usuario
- Formato tecnico para composicao com outras sources

### Support/Diagnostico
- Admin + diagnostico: risk factors explicitos, mitigacao, recovery actions
- Permite troubleshooting sem acessar logs brutos

## Limitacoes da V1

1. **Sem LLM para narrativas** — narrativas sao template-based, nao geradas por IA
2. **TTL fixo** — explanations expiram em 90 dias (configuravel por registro)
3. **Sem busca full-text** — queries por tenant_id, domain, reference_id apenas
4. **Sem streaming** — audit surfaces sao carregadas por request, sem realtime
5. **Sem tradução** — narrativas em portugues apenas
6. **Trust scores heuristicos** — baseados em regras fixas, nao em ML

## Proximo passo ideal

**PART 98 — Trust Dashboard UI**: componentes React para exibir AuditSurface
no customer dashboard e admin panel, consumindo os endpoints criados aqui.
Inclui: TrustScoreCard, ExplanationTimeline, RiskAlertBanner, NarrativePanel.
