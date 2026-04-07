<template>
  <div
    class="template-card"
    :class="{ selected }"
    @click="$emit('select', template)"
    role="button"
    :aria-pressed="selected"
  >
    <!-- Badge -->
    <div v-if="template.badge_tipo" class="badge" :class="'badge-' + template.badge_tipo">
      {{ template.badge_label || badgeDefault }}
    </div>

    <!-- Selected check -->
    <div v-if="selected" class="selected-check">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="10" fill="#10B981"/>
        <path d="M6 10L9 13L14 7" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <!-- Icon -->
    <div class="template-icon" :style="{ background: iconGradient }">
      <span class="icon-emoji">{{ iconEmoji }}</span>
    </div>

    <!-- Info -->
    <div class="template-info">
      <span class="template-name">{{ template.nome }}</span>
      <span class="template-desc">{{ template.descricao }}</span>
    </div>

    <!-- Favorite heart -->
    <button class="favorite-btn" @click.stop="$emit('favorite', template.id)" aria-label="Favoritar">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 14S1 9.5 1 5.5C1 3.5 2.5 2 4.5 2C5.8 2 7 2.7 8 3.8C9 2.7 10.2 2 11.5 2C13.5 2 15 3.5 15 5.5C15 9.5 8 14 8 14Z"
          stroke="currentColor" stroke-width="1.2" fill="none"/>
      </svg>
    </button>
  </div>
</template>

<script>
const CATEGORY_EMOJIS = {
  'Imobiliário': '🏠',
  'Vendas': '🎯',
  'Educativo': '📚',
  'Institucional': '🏢',
};

const BADGE_DEFAULTS = {
  recomendado: 'Recomendado',
  novo: 'Novo',
  popular: 'Popular',
};

export default {
  name: 'TemplateCard',
  props: {
    template: {
      type: Object,
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['select', 'favorite'],
  computed: {
    badgeDefault() {
      return BADGE_DEFAULTS[this.template.badge_tipo] || '';
    },
    iconEmoji() {
      return CATEGORY_EMOJIS[this.template.categoria] || '✨';
    },
    iconGradient() {
      const gradients = {
        dark_premium: 'linear-gradient(135deg, #1a1a2e, #D4AF37)',
        ia_express: 'linear-gradient(135deg, #1e1e1e, #EF4444)',
        expert_photoshop: 'linear-gradient(135deg, #0a0a0a, #60A5FA)',
        imobiliario_top: 'linear-gradient(135deg, #1A1A2E, #3B82F6)',
        ia_imobiliario: 'linear-gradient(135deg, #0F172A, #60A5FA)',
        classico_elegante: 'linear-gradient(135deg, #2C2925, #D4C5A9)',
      };
      return gradients[this.template.id] || 'linear-gradient(135deg, #1a1a2e, #8B5CF6)';
    },
  },
};
</script>

<style scoped>
.template-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  border: 1.5px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-card:hover {
  border-color: rgba(139, 92, 246, 0.3);
  background: rgba(139, 92, 246, 0.03);
}

.template-card.selected {
  border-color: #10B981;
  background: rgba(16, 185, 129, 0.05);
}

.badge {
  position: absolute;
  top: -6px;
  right: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-recomendado {
  background: #8B5CF6;
  color: white;
}

.badge-novo {
  background: #10B981;
  color: white;
}

.badge-popular {
  background: #F59E0B;
  color: #1a1a1a;
}

.selected-check {
  position: absolute;
  top: 10px;
  right: 10px;
}

.template-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-emoji {
  font-size: 20px;
}

.template-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.template-name {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.template-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.favorite-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.25);
  transition: color 0.2s;
  flex-shrink: 0;
}

.favorite-btn:hover {
  color: #EF4444;
}
</style>
