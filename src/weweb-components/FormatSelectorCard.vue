<template>
  <div
    class="format-card"
    :class="{ selected, disabled }"
    @click="!disabled && $emit('select', format)"
    role="button"
    :aria-pressed="selected"
    :aria-disabled="disabled"
  >
    <div class="check-badge" v-if="selected">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="8" fill="#8B5CF6"/>
        <path d="M5 8L7 10L11 6" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <div class="format-icon">
      <!-- Quadrado 1:1 -->
      <svg v-if="format === 'quadrado'" width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="3" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      <!-- Feed 4:5 -->
      <svg v-else-if="format === 'feed'" width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="6" y="3" width="20" height="26" rx="3" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      <!-- Stories 9:16 -->
      <svg v-else-if="format === 'stories'" width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="8" y="2" width="16" height="28" rx="3" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      <!-- Paisagem 16:9 -->
      <svg v-else-if="format === 'paisagem'" width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="2" y="7" width="28" height="18" rx="3" stroke="currentColor" stroke-width="1.5"/>
      </svg>
    </div>

    <span class="format-name">{{ formatLabel }}</span>
    <span class="format-ratio">{{ ratio }}</span>
  </div>
</template>

<script>
export default {
  name: 'FormatSelectorCard',
  props: {
    format: {
      type: String,
      required: true,
      validator: (v) => ['quadrado', 'feed', 'stories', 'paisagem'].includes(v),
    },
    ratio: {
      type: String,
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['select'],
  computed: {
    formatLabel() {
      const labels = {
        quadrado: 'Quadrado',
        feed: 'Feed',
        stories: 'Stories',
        paisagem: 'Paisagem',
      };
      return labels[this.format] || this.format;
    },
  },
};
</script>

<style scoped>
.format-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 12px;
  border-radius: 12px;
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.5);
}

.format-card:hover:not(.disabled) {
  border-color: rgba(139, 92, 246, 0.4);
  background: rgba(139, 92, 246, 0.04);
  color: rgba(255, 255, 255, 0.8);
}

.format-card.selected {
  border-color: #8B5CF6;
  background: rgba(139, 92, 246, 0.08);
  color: #8B5CF6;
}

.format-card.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.check-badge {
  position: absolute;
  top: 8px;
  right: 8px;
}

.format-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.format-name {
  font-size: 13px;
  font-weight: 600;
  color: inherit;
}

.format-ratio {
  font-size: 11px;
  opacity: 0.6;
  color: inherit;
}
</style>
