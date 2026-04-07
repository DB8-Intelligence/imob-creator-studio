# WeWeb — Workflows

Workflows a configurar no WeWeb visual editor. Cada workflow é uma sequência de ações
disparada por um trigger (botão, evento, interval).

API Base URL: `https://seu-railway-app.railway.app` (variável `API_BASE_URL` no WeWeb)

---

## workflow: onSubmitForm

**Trigger:** Botão "Gerar criativo ✦" na etapa 2 do formulário

**Steps:**

1. **Validar campos obrigatórios**
   - `upload_images.length > 0` → senão toast "Envie pelo menos uma imagem"
   - `selected_template.id !== null` → senão toast "Escolha um template"
   - `user_description.length > 0 || manual_copy.titulo` → senão toast "Preencha a descrição ou título"

2. **Chamar API**
   ```
   POST {{API_BASE_URL}}/api/creative-jobs/create
   Headers: { Content-Type: application/json, x-user-id: {{auth.uid}} }
   Body: {
     mode: {{creator_mode}},
     template_id: {{selected_template.id}},
     formats: {{selected_formats}},
     variation_count: {{variation_count}},
     image_count: {{image_count}},
     input_images: {{upload_images}},
     logo_url: {{upload_logo || null}},
     use_brand_identity: {{use_brand_identity}},
     user_description: {{user_description}},
     generated_copy: {{generated_copy || {}}},
     manual_copy: {{manual_copy || {}}}
   }
   ```

3. **Salvar job_id**
   - `current_job.id = response.job_id`
   - `current_job.status = 'pending'`
   - `current_job.progress = 0`

4. **Mostrar ProgressOverlay**
   - Set `current_job.status = 'pending'` (overlay reage a status !== 'idle')

5. **Iniciar polling**
   - `polling_interval = setInterval(pollJobStatus, 2000)`

---

## workflow: pollJobStatus

**Trigger:** setInterval de 2 segundos (referência em `polling_interval`)

**Steps:**

1. **Chamar API**
   ```
   GET {{API_BASE_URL}}/api/creative-jobs/{{current_job.id}}/status
   ```

2. **Atualizar variáveis**
   - `current_job.status = response.status`
   - `current_job.progress = response.progress`
   - `current_job.formats_done = response.formats_done`

3. **Se status === 'done':**
   - `clearInterval(polling_interval)`
   - `polling_interval = null`
   - Aguardar 1s (animação de conclusão)
   - Navegar para `/minhas-criacoes`

4. **Se status === 'error':**
   - `clearInterval(polling_interval)`
   - `polling_interval = null`
   - `current_job.error_message = response.error_message`
   - Toast de erro

**Alternativa Realtime (preferida):**
```javascript
// Em vez de polling, subscribe na tabela creative_jobs
const channel = supabase
  .channel('job-' + current_job.id)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'creative_jobs',
    filter: 'id=eq.' + current_job.id
  }, (payload) => {
    current_job.status = payload.new.status;
    current_job.progress = payload.new.progress;
    if (payload.new.status === 'done') {
      supabase.removeChannel(channel);
      // navegar para /minhas-criacoes
    }
  })
  .subscribe();
```

---

## workflow: onLogoUpload

**Trigger:** Evento `upload` do LogoUploader

**Steps:**

1. **Upload para Supabase Storage**
   ```
   POST {{SUPABASE_URL}}/storage/v1/object/imobcreator-creatives/logos/{{auth.uid}}/{{timestamp}}.png
   Headers: { Authorization: Bearer {{supabase_token}}, Content-Type: image/png }
   Body: <file binary>
   ```

2. **Chamar API de análise de cores**
   ```
   POST {{API_BASE_URL}}/api/onboarding/logo-analyze
   Content-Type: multipart/form-data
   Body: { logo: <file>, user_id: {{auth.uid}} }
   ```

3. **Atualizar variáveis**
   - `upload_logo = response.logo_url`
   - `user_profile.logo_url = response.logo_url`
   - `user_profile.cores_marca = response.cores`

4. **Atualizar preview do LogoUploader**

---

## workflow: onImageUpload

**Trigger:** Evento `upload` do ImageUploader

**Steps:**

1. **Upload para Supabase Storage**
   ```
   POST {{SUPABASE_URL}}/storage/v1/object/imobcreator-creatives/uploads/{{auth.uid}}/{{timestamp}}.jpg
   Headers: { Authorization: Bearer {{supabase_token}}, Content-Type: image/jpeg }
   Body: <file binary>
   ```

2. **Obter URL pública**
   ```
   {{SUPABASE_URL}}/storage/v1/object/public/imobcreator-creatives/uploads/{{auth.uid}}/{{timestamp}}.jpg
   ```

3. **Adicionar ao array**
   - `upload_images.push(public_url)`

4. **Atualizar preview no ImageUploader**

---

## workflow: assistantTransition

**Trigger:** Eventos do AssistantChat (`send-message`, `select-template`, `confirm-copy`, `edit-copy`, `regenerate`)

**Steps:**

1. **Mapear evento para transição**
   ```
   send-message (step=description) → event: 'description_sent', payload: { description: text }
   select-template                 → event: 'template_selected', payload: { template_id: id }
   confirm-copy                    → event: 'copy_confirmed'
   edit-copy                       → event: 'copy_edit'
   regenerate                      → event: 'copy_regenerate'
   ```

2. **Executar transição**
   ```javascript
   const { transition, addUserMessage } = window.AssistantStateMachine;
   
   // Adicionar mensagem do usuário
   state = addUserMessage(state, userText);
   
   // Transicionar
   state = transition(state, event, payload);
   ```

3. **Atualizar variáveis WeWeb**
   - `assistant_step = state.step`
   - `assistant_messages = state.messages`

4. **Ações especiais por step:**
   - `copy_preview`: Chamar API de análise para gerar copy preview
     ```
     POST {{API_BASE_URL}}/api/creative-jobs/create
     Body: { mode: 'assistant', ... }
     ```
     Depois: `transition(state, 'copy_generated', { copy: apiResponse })`
   
   - `generating`: Executar workflow `onSubmitForm` adaptado
   
   - `done`: Mostrar botão "Ver em Minhas Criações"

---

## workflow: onOnboardingComplete

**Trigger:** Botão "Salvar" na tela de onboarding

**Steps:**

1. **Chamar API**
   ```
   POST {{API_BASE_URL}}/api/onboarding/brand
   Body: {
     user_id: {{auth.uid}},
     nome_corretor: {{form.nome}},
     whatsapp: {{form.whatsapp}},
     cidade_atuacao: {{form.cidade}},
     nicho: {{form.nicho}},
     publico_alvo: {{form.publico}},
     tom_comunicacao: {{form.tom}}
   }
   ```

2. **Atualizar variável**
   - `user_profile = response.profile`

3. **Navegar para `/criar`**
