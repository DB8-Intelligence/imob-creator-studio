# WeWeb — Variáveis Globais

Configurar no WeWeb em **Settings → Variables**. Cada variável é acessível em qualquer página/componente.

---

## Variáveis obrigatórias

| Variável | Tipo | Default | Descrição |
|---|---|---|---|
| `user_profile` | Object | `{}` | `UserBrandProfile` completo do usuário logado |
| `current_job` | Object | `{ id: null, status: 'idle', progress: 0, formats_done: [] }` | Job de geração ativo |
| `selected_template` | Object | `{ id: null, nome: null, badge_tipo: null }` | Template escolhido |
| `creator_mode` | String | `'form'` | Modo ativo: `'form'` ou `'assistant'` |
| `creator_step` | Number | `1` | Etapa atual no formulário (1 ou 2) |
| `upload_images` | Array | `[]` | URLs das imagens após upload para Supabase Storage |
| `upload_logo` | String | `''` | URL da logo após upload |
| `selected_formats` | Array | `['post']` | Formatos selecionados (`post`, `story`, `reels`, `quadrado`, `paisagem`) |
| `variation_count` | Number | `1` | Quantidade de variações (1 ou 5) |
| `image_count` | Number | `1` | Quantidade de imagens (1, 2 ou 3) |
| `user_description` | String | `''` | Texto do campo "O que você vende?" |
| `assistant_messages` | Array | `[]` | Array de `AssistantMessage` do chat |
| `assistant_step` | String | `'welcome'` | Etapa atual do assistente IA |
| `polling_interval` | Number | `null` | Referência do setInterval de polling |

---

## Tipos dos objetos

### user_profile (UserBrandProfile)
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "nome_corretor": "string",
  "nome_imobiliaria": "string | null",
  "creci": "string | null",
  "whatsapp": "string",
  "instagram": "string | null",
  "cidade_atuacao": "string",
  "nicho": "residencial | comercial | luxo | lancamentos | rural",
  "publico_alvo": "jovens | familias | investidores | alto_padrao | geral",
  "tom_comunicacao": "formal | sofisticado | amigavel | urgente | aspiracional",
  "logo_url": "string | null",
  "cores_marca": { "primaria": "#hex", "secundaria": "#hex", "neutra": "#hex", "fundo_preferido": "#hex" },
  "estilo_marca": "string | null",
  "onboarding_completo": true
}
```

### current_job
```json
{
  "id": "uuid | null",
  "status": "idle | pending | validating | processing_image | generating_copy | composing | rendering | done | error",
  "progress": 0,
  "formats_done": ["post", "story"],
  "error_message": "string | null"
}
```

### assistant_messages (AssistantMessage[])
```json
[
  {
    "role": "ia | user",
    "type": "text | template-chips | copy-preview | image-upload | confirmation",
    "content": "string",
    "templates": [{ "id": "dark_premium", "nome": "Dark Premium", "badge": "Recomendado" }],
    "copy": { "titulo": "string", "subtitulo": "string", "cta": "string" },
    "timestamp": "2026-04-07T00:00:00Z"
  }
]
```

---

## Inicialização

No evento **On Page Load** da página `/criar`:

1. Fetch `user_profile` do Supabase: `GET /rest/v1/user_brand_profiles?user_id=eq.{auth.uid}`
2. Se não existe → redirecionar para `/onboarding`
3. Resetar `current_job` para default
4. Resetar `creator_step` para 1
5. Resetar `assistant_messages` para `[]`
6. Resetar `assistant_step` para `'welcome'`
