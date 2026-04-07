<template>
  <div class="image-uploader">
    <!-- Uploaded images -->
    <div v-for="(img, i) in images" :key="i" class="image-preview">
      <img :src="img" alt="Preview" class="preview-img" />
      <div class="preview-check">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="7" fill="#10B981"/>
          <path d="M4 7L6 9L10 5" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <button class="remove-btn" @click="$emit('remove', i)" aria-label="Remover imagem">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 3L9 9M9 3L3 9" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
      <button v-if="images.length > 1" class="swap-btn" @click="$emit('swap', i)" aria-label="Trocar posição">
        ⟳
      </button>
    </div>

    <!-- Upload slot -->
    <label
      v-if="images.length < max_images"
      class="upload-slot"
      :class="{ 'drag-over': isDragOver }"
      @dragover.prevent="isDragOver = true"
      @dragleave="isDragOver = false"
      @drop.prevent="handleDrop"
    >
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="file-input"
        @change="handleFileSelect"
        :multiple="max_images - images.length > 1"
      />
      <div class="upload-content">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M14 4V24M4 14H24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span class="upload-label">{{ uploadLabel }}</span>
        <span class="upload-hint">JPG, PNG ou WebP · máx 10MB</span>
      </div>
    </label>
  </div>
</template>

<script>
export default {
  name: 'ImageUploader',
  props: {
    images: { type: Array, default: () => [] },
    max_images: { type: Number, default: 1, validator: (v) => [1, 2, 3].includes(v) },
  },
  emits: ['upload', 'remove', 'swap'],
  data() {
    return { isDragOver: false };
  },
  computed: {
    uploadLabel() {
      if (this.images.length === 0) return 'Enviar imagem';
      return `Adicionar imagem (${this.images.length}/${this.max_images})`;
    },
  },
  methods: {
    handleFileSelect(e) {
      const files = Array.from(e.target.files || []);
      this.processFiles(files);
      e.target.value = '';
    },
    handleDrop(e) {
      this.isDragOver = false;
      const files = Array.from(e.dataTransfer?.files || []);
      this.processFiles(files);
    },
    processFiles(files) {
      const remaining = this.max_images - this.images.length;
      const valid = files
        .filter((f) => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024)
        .slice(0, remaining);
      for (const file of valid) {
        this.$emit('upload', file);
      }
    },
  },
};
</script>

<style scoped>
.image-uploader {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.image-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  border: 1.5px solid rgba(255, 255, 255, 0.1);
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-check {
  position: absolute;
  top: 6px;
  left: 6px;
}

.remove-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.85);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.remove-btn:hover { background: #EF4444; }

.swap-btn {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.upload-slot {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  border: 2px dashed rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: rgba(255, 255, 255, 0.35);
}

.upload-slot:hover,
.upload-slot.drag-over {
  border-color: rgba(139, 92, 246, 0.5);
  background: rgba(139, 92, 246, 0.04);
  color: rgba(139, 92, 246, 0.7);
}

.file-input {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
}

.upload-label {
  font-size: 11px;
  font-weight: 600;
  text-align: center;
}

.upload-hint {
  font-size: 9px;
  opacity: 0.6;
  text-align: center;
}
</style>
