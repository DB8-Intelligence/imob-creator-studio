# CLAUDE.md — Auto-Execução: Agente House For Sale Multi-Photo

## O que você deve fazer

Você é o Claude Code. Leia este arquivo e execute TUDO em sequência.
Não pergunte nada. Resolva automaticamente qualquer pendência que não
seja credencial externa. Só pare se encontrar erro de autenticação real.

## Contexto

Este pacote foi gerado pela Skill ImobCreator Creative Engine v4.4.
Contém o template "House For Sale Multi-Photo" para adicionar ao ImobCreator AI.
Estilo: flyer multi-foto com card azul título, fachada + 3 miniaturas,
painel de bônus, facilities, preço com desconto e specs do imóvel.

Repositório: C:/Users/Douglas/imob-creator-studio
Branch: feature/agent-house-for-sale-multi

## Arquivos neste pacote

- CLAUDE.md                                          ← este arquivo
- agent-house-for-sale-multi-20260406.json           ← dados completos do agente
- agent-house-for-sale-multi-20260406.html           ← preview visual (abrir no browser)
- reference-image.jpg                                ← imagem de referência do estilo
- reference-image-base64.txt                         ← mesma imagem em base64

## EXECUTE EM ORDEM — Sem pular etapas

### PASSO 1 — Criar branch
```bash
cd C:/Users/Douglas/imob-creator-studio
git checkout main && git pull
git checkout -b feature/agent-house-for-sale-multi
```

### PASSO 2 — Salvar imagem de referência como thumbnail
```bash
mkdir -p public/thumbnails
cp reference-image.jpg public/thumbnails/agent_house_for_sale_multi.jpg
```

Upload para Supabase Storage:
```bash
npx supabase storage cp reference-image.jpg \
  ss:///imobcreator-creatives/thumbnails/agent_house_for_sale_multi.jpg
```

### PASSO 3 — Copiar template JSON para o projeto
```bash
cp agent-house-for-sale-multi-20260406.json \
   src/templates/agent_house_for_sale_multi.json
```

### PASSO 4 — Salvar prompt_master
```bash
mkdir -p .claude/agents/agent_house_for_sale_multi
node -e "
const fs = require('fs');
const data = JSON.parse(
  fs.readFileSync('agent-house-for-sale-multi-20260406.json', 'utf8')
);
fs.writeFileSync(
  '.claude/agents/agent_house_for_sale_multi/prompt_master.txt',
  data.agent_registry.prompt_master
);
console.log('prompt_master salvo em .claude/agents/agent_house_for_sale_multi/');
"
```

### PASSO 5 — Criar e executar migration SQL
```bash
node -e "
const fs = require('fs');
const data = JSON.parse(
  fs.readFileSync('agent-house-for-sale-multi-20260406.json', 'utf8')
);
const sql = data.sql_migration.replace(
  '[copiar agent_registry.prompt_master deste arquivo]',
  data.agent_registry.prompt_master.replace(/'/g, \"''\")
);
fs.writeFileSync(
  'supabase/migrations/20260406120000_add_agent_house_for_sale_multi.sql',
  sql
);
console.log('migration salva');
"
npx supabase db push
```

### PASSO 6 — Registrar agente via API
```bash
node -e "
const fs = require('fs');
const data = JSON.parse(
  fs.readFileSync('agent-house-for-sale-multi-20260406.json', 'utf8')
);
const payload = JSON.stringify({
  name: data.agent_registry.name,
  description: data.agent_registry.description,
  prompt_master: data.agent_registry.prompt_master
});
fs.writeFileSync('/tmp/house_agent_payload.json', payload);
console.log('payload pronto');
" && curl -X POST http://localhost:3000/api/agents/create \
     -H 'Content-Type: application/json' \
     -d @/tmp/house_agent_payload.json
```

### PASSO 7 — Atualizar thumbnail_url no banco
```bash
node -e "
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const url = process.env.SUPABASE_URL.replace('https://', '')
  .replace('.supabase.co', '');
const thumbUrl = 'https://' + url + '.supabase.co/storage/v1/object/public/imobcreator-creatives/thumbnails/agent_house_for_sale_multi.jpg';
sb.from('creative_templates')
  .update({
    thumbnail_url: thumbUrl,
    preview_urls: JSON.stringify({
      post: thumbUrl,
      story: thumbUrl,
      square: thumbUrl
    })
  })
  .eq('id', 'agent_house_for_sale_multi')
  .then(({error}) => console.log(error || 'thumbnail_url atualizado: ' + thumbUrl));
"
```

### PASSO 8 — Adicionar campos_specs ao template no banco
```bash
node -e "
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const data = JSON.parse(fs.readFileSync('agent-house-for-sale-multi-20260406.json', 'utf8'));
sb.from('creative_templates')
  .update({ campos_specs: data.template_config.campos_specs })
  .eq('id', 'agent_house_for_sale_multi')
  .then(({error}) => console.log(error || 'campos_specs atualizados'));
"
```

### PASSO 9 — Verificar implementação completa
```bash
echo "=== Verificando agente ==="
curl -s http://localhost:3000/api/agents \
  | node -e "
const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
const a = d.find(x => x.slug === 'agent_house_for_sale_multi');
if (a) {
  console.log('AGENTE OK:', a.name);
  console.log('Stage:', a.pipeline_stage);
  console.log('Active:', a.active);
} else {
  console.log('ERRO: agente não encontrado');
  process.exit(1);
}"

echo "=== Teste de job ==="
curl -s -X POST http://localhost:3000/api/creative-jobs/create \
  -H 'Content-Type: application/json' \
  -d '{
    "mode": "form",
    "template_id": "agent_house_for_sale_multi",
    "formats": ["post"],
    "variation_count": 1,
    "image_count": 1,
    "input_images": ["https://picsum.photos/1080/1350"],
    "use_brand_identity": false,
    "user_description": "Casa moderna 4 quartos à venda",
    "specs": {
      "metragem": 280,
      "quartos": 4,
      "suites": 2,
      "vagas": 3,
      "preco_de": 350000,
      "preco_por": 290000,
      "bonus_1": "Piscina",
      "bonus_2": "Churrasqueira",
      "bonus_3": "Segurança 24h",
      "bonus_4": "Jardim"
    }
  }' | node -e "
const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
console.log('JOB CRIADO:', d.job_id || 'ERRO');
console.log('STATUS:', d.status || d.error);
"
```

### PASSO 10 — Commit e push
```bash
git add .
git commit -m "feat: add agent house_for_sale_multi — House For Sale Multi-Photo

Template estilo flyer multi-foto:
- Card azul com título bold
- Fachada principal + 3 miniaturas internas
- Painel de bônus 4 colunas
- Facilities com checks
- Preço com desconto automático
- Specs: m², quartos, suítes, vagas
- Suporte a 4 imagens simultâneas
- Thumbnail: public/thumbnails/agent_house_for_sale_multi.jpg

Gerado por: ImobCreator Creative Engine v4.4"

git push origin feature/agent-house-for-sale-multi
```

## Variáveis de ambiente — verificar antes de executar

```
ANTHROPIC_API_KEY       — necessário para análise e copy
SUPABASE_URL            — necessário para banco e storage
SUPABASE_SERVICE_ROLE_KEY — necessário para escrita no banco
SHOTSTACK_API_KEY       — necessário para render
```

Se alguma faltar no .env, parar imediatamente e informar qual está faltando.
Não tentar executar passos 5-8 sem essas variáveis.

## Localização final dos arquivos

```
imob-creator-studio/
├── src/templates/
│   └── agent_house_for_sale_multi.json       ← template Shotstack
├── public/thumbnails/
│   └── agent_house_for_sale_multi.jpg        ← imagem de referência
├── .claude/agents/
│   └── agent_house_for_sale_multi/
│       └── prompt_master.txt                 ← prompt do agente
└── supabase/
    └── migrations/
        └── 20260406120000_add_agent_house_for_sale_multi.sql
```

## Referência visual

Abrir `agent-house-for-sale-multi-20260406.html` no browser para
visualizar como o criativo vai ficar antes de implementar.
A imagem `reference-image.jpg` é o original que foi analisado para
gerar este template — use como referência e como thumbnail no dashboard.
