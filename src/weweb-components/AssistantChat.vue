<template>
  <div class="assistant-chat">
    <!-- Messages area -->
    <div class="messages-area" ref="messagesArea">
      <div
        v-for="msg in messages"
        :key="msg.timestamp"
        class="message-row"
        :class="msg.role"
      >
        <!-- Avatar -->
        <div class="avatar" :class="msg.role">
          <span v-if="msg.role === 'ia'">🤖</span>
          <span v-else>👤</span>
        </div>

        <!-- Bubble -->
        <div class="bubble" :class="msg.role">
          <!-- Text message -->
          <p v-if="msg.type === 'text' || !msg.type" class="msg-text">{{ msg.content }}</p>

          <!-- Template chips -->
          <div v-if="msg.type === 'template-chips' && msg.templates" class="template-chips">
            <p class="msg-text">{{ msg.content }}</p>
            <div class="chips-grid">
              <button
                v-for="tpl in msg.templates"
                :key="tpl.id"
                class="chip"
                @click="$emit('select-template', tpl.id)"
              >
                <span class="chip-name">{{ tpl.nome }}</span>
                <span v-if="tpl.badge" class="chip-badge">{{ tpl.badge }}</span>
              </button>
            </div>
          </div>

          <!-- Copy preview -->
          <div v-if="msg.type === 'copy-preview' && msg.copy" class="copy-preview">
            <p class="msg-text">{{ msg.content }}</p>
            <div class="copy-card">
              <p class="copy-titulo">{{ msg.copy.titulo }}</p>
              <p v-if="msg.copy.subtitulo" class="copy-subtitulo">{{ msg.copy.subtitulo }}</p>
              <p v-if="msg.copy.cta" class="copy-cta">{{ msg.copy.cta }}</p>
            </div>
            <div class="copy-actions">
              <button class="action-btn primary" @click="$emit('confirm-copy')">
                ✓ Gostei, continuar
              </button>
              <button class="action-btn secondary" @click="$emit('edit-copy')">
                ✏️ Editar
              </button>
              <button class="action-btn secondary" @click="$emit('regenerate')">
                🔄 Criar outra versão
              </button>
            </div>
          </div>

          <!-- Image upload confirmation -->
          <div v-if="msg.type === 'image-upload'" class="image-upload-msg">
            <p class="msg-text">{{ msg.content }}</p>
            <div class="upload-preview">📸</div>
          </div>

          <!-- Confirmation -->
          <div v-if="msg.type === 'confirmation'" class="confirmation-msg">
            <p class="msg-text">{{ msg.content }}</p>
          </div>
        </div>
      </div>

      <!-- Loading indicator -->
      <div v-if="loading" class="message-row ia">
        <div class="avatar ia"><span>🤖</span></div>
        <div class="bubble ia">
          <div class="typing-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Input area -->
    <div class="input-area" v-if="showInput">
      <input
        v-model="inputText"
        class="chat-input"
        :placeholder="inputPlaceholder"
        @keydown.enter="sendMessage"
      />
      <button class="send-btn" @click="sendMessage" :disabled="!inputText.trim()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 10L17 3L10 17L9 11L3 10Z" fill="currentColor"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AssistantChat',
  props: {
    messages: { type: Array, default: () => [] },
    step: { type: String, default: 'welcome' },
    loading: { type: Boolean, default: false },
  },
  emits: ['send-message', 'select-template', 'confirm-copy', 'edit-copy', 'regenerate'],
  data() {
    return {
      inputText: '',
    };
  },
  computed: {
    showInput() {
      return ['welcome', 'upload_image', 'description', 'copy_confirm'].includes(this.step);
    },
    inputPlaceholder() {
      const placeholders = {
        welcome: 'Digite uma mensagem...',
        upload_image: 'Ou cole a URL da imagem...',
        description: 'Descreva o imóvel, preço, diferenciais...',
        copy_confirm: 'Edite os textos como preferir...',
      };
      return placeholders[this.step] || 'Digite uma mensagem...';
    },
  },
  methods: {
    sendMessage() {
      if (!this.inputText.trim()) return;
      this.$emit('send-message', this.inputText.trim());
      this.inputText = '';
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const area = this.$refs.messagesArea;
        if (area) area.scrollTop = area.scrollHeight;
      });
    },
  },
  watch: {
    messages: {
      handler() { this.scrollToBottom(); },
      deep: true,
    },
    loading() { this.scrollToBottom(); },
  },
  mounted() {
    this.scrollToBottom();
  },
};
</script>

<style scoped>
.assistant-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 500px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  overflow: hidden;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-row {
  display: flex;
  gap: 10px;
  max-width: 85%;
}

.message-row.ia { align-self: flex-start; }
.message-row.user { align-self: flex-end; flex-direction: row-reverse; }

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
}

.avatar.ia { background: rgba(139, 92, 246, 0.15); }
.avatar.user { background: rgba(255, 255, 255, 0.08); }

.bubble {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
}

.bubble.ia {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
  border-top-left-radius: 4px;
}

.bubble.user {
  background: rgba(139, 92, 246, 0.15);
  color: rgba(255, 255, 255, 0.9);
  border-top-right-radius: 4px;
}

.msg-text {
  margin: 0;
  white-space: pre-wrap;
}

/* Template chips */
.chips-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid rgba(139, 92, 246, 0.3);
  background: rgba(139, 92, 246, 0.08);
  color: #A78BFA;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.chip:hover {
  background: rgba(139, 92, 246, 0.2);
  border-color: #8B5CF6;
}

.chip-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  background: #8B5CF6;
  color: white;
  font-weight: 600;
}

/* Copy preview */
.copy-card {
  margin-top: 10px;
  padding: 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.copy-titulo {
  font-size: 16px;
  font-weight: 700;
  color: white;
  margin: 0 0 4px;
}

.copy-subtitulo {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
  margin: 0 0 6px;
}

.copy-cta {
  font-size: 12px;
  color: #8B5CF6;
  font-weight: 600;
  margin: 0;
}

.copy-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.action-btn.primary {
  background: #8B5CF6;
  color: white;
}

.action-btn.primary:hover { background: #7C3AED; }

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Typing dots */
.typing-dots {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(139, 92, 246, 0.5);
  animation: bounce 1.4s infinite;
}

.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
}

/* Input area */
.input-area {
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  gap: 8px;
}

.chat-input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: white;
  font-size: 14px;
  outline: none;
}

.chat-input:focus {
  border-color: rgba(139, 92, 246, 0.4);
}

.chat-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: #8B5CF6;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  flex-shrink: 0;
}

.send-btn:hover { background: #7C3AED; }
.send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
