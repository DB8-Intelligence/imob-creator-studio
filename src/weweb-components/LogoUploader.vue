<template>
  <div class="logo-uploader">
    <!-- Current logo -->
    <div v-if="logo_url" class="current-logo">
      <img :src="logo_url" alt="Logo" class="logo-img" />
      <div class="logo-meta">
        <span class="logo-label">Logo ativa</span>
        <span class="logo-info">Posição: centro · 100% opacidade</span>
      </div>
      <button class="remove-logo" @click="$emit('remove')" aria-label="Remover logo">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M4 4L10 10M10 4L4 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <!-- Saved logos -->
    <div v-if="saved_logos.length > 0 && !logo_url" class="saved-logos">
      <span class="section-label">Logos salvas</span>
      <div class="logos-grid">
        <button
          v-for="logo in saved_logos"
          :key="logo.url"
          class="saved-logo-btn"
          @click="$emit('select-saved', logo.url)"
        >
          <img :src="logo.url" alt="Logo salva" class="saved-logo-img" />
        </button>
      </div>
    </div>

    <!-- Upload -->
    <label v-if="!logo_url" class="upload-area">
      <input
        type="file"
        accept="image/png,image/svg+xml,image/webp"
        class="file-input"
        @change="handleUpload"
      />
      <div class="upload-content">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" stroke-width="1.5"/>
          <path d="M12 8V16M8 12H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span class="upload-text">{{ logo_url ? 'Trocar logo' : 'Adicionar logo' }}</span>
        <span class="upload-hint">PNG ou SVG transparente recomendado</span>
      </div>
    </label>
  </div>
</template>

<script>
export default {
  name: 'LogoUploader',
  props: {
    logo_url: { type: String, default: '' },
    saved_logos: { type: Array, default: () => [] },
  },
  emits: ['upload', 'select-saved', 'remove'],
  methods: {
    handleUpload(e) {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        alert('Logo deve ter no máximo 5MB');
        return;
      }
      this.$emit('upload', file);
      e.target.value = '';
    },
  },
};
</script>

<style scoped>
.logo-uploader {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.current-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.logo-img {
  width: 44px;
  height: 44px;
  object-fit: contain;
  border-radius: 8px;
  background: white;
  padding: 4px;
}

.logo-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}

.logo-info {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.remove-logo {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  transition: all 0.2s;
}

.remove-logo:hover {
  color: #EF4444;
  background: rgba(239, 68, 68, 0.1);
}

.saved-logos {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
}

.logos-grid {
  display: flex;
  gap: 8px;
}

.saved-logo-btn {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  background: white;
  padding: 4px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.saved-logo-btn:hover {
  border-color: #8B5CF6;
}

.saved-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.upload-area {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: 10px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  color: rgba(255, 255, 255, 0.35);
}

.upload-area:hover {
  border-color: rgba(139, 92, 246, 0.4);
  background: rgba(139, 92, 246, 0.03);
  color: rgba(139, 92, 246, 0.6);
}

.file-input {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.upload-text {
  font-size: 13px;
  font-weight: 600;
}

.upload-hint {
  font-size: 11px;
  opacity: 0.6;
}
</style>
