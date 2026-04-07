<template>
  <Transition name="overlay">
    <div v-if="visible" class="progress-overlay">
      <div class="progress-content">
        <!-- Animated preview placeholder -->
        <div class="preview-container">
          <div class="preview-shimmer"></div>
          <div class="preview-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="8" width="40" height="32" rx="4" stroke="#8B5CF6" stroke-width="2" opacity="0.5"/>
              <circle cx="16" cy="20" r="4" stroke="#8B5CF6" stroke-width="1.5" opacity="0.4"/>
              <path d="M4 32L16 24L24 30L36 20L44 26V36C44 38.2 42.2 40 40 40H8C5.8 40 4 38.2 4 36V32Z" fill="#8B5CF6" opacity="0.15"/>
            </svg>
          </div>
        </div>

        <!-- Steps -->
        <div class="steps-row">
          <div
            v-for="(step, i) in STEPS"
            :key="step.id"
            class="step-item"
          >
            <div class="step-circle" :class="stepClass(i)">
              <!-- Completed -->
              <svg v-if="i < currentStepIndex" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 8L7 11L12 5" stroke="white" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <!-- Current: spinner -->
              <div v-else-if="i === currentStepIndex" class="spinner"></div>
              <!-- Pending: number -->
              <span v-else class="step-num">{{ i + 1 }}</span>
            </div>
            <span class="step-label" :class="{ active: i === currentStepIndex }">{{ step.label }}</span>
          </div>
        </div>

        <!-- Current step description -->
        <div class="current-step-info">
          <span class="step-title">{{ currentStepLabel }}</span>
          <span class="step-desc">{{ current_step_desc }}</span>
        </div>

        <!-- Progress bar -->
        <div class="progress-bar-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <div class="progress-meta">
            <span class="progress-pct">{{ progress }}%</span>
            <span class="progress-time">~{{ estimatedTime }}s</span>
          </div>
        </div>

        <!-- Rotating tip -->
        <div class="tip-container">
          <span class="tip-icon">💡</span>
          <span class="tip-text">{{ currentTip }}</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
const STEPS = [
  { id: 'validating', label: 'Validando' },
  { id: 'processing_image', label: 'Analisando' },
  { id: 'generating_copy', label: 'Escrevendo' },
  { id: 'composing', label: 'Compondo' },
  { id: 'rendering', label: 'Renderizando' },
];

const TIPS = [
  'Teste diferentes variações para melhores resultados',
  'Criativos com foto de qualidade convertem até 3x mais',
  'Adicione sua logo para reforçar o branding',
  'Story e Feed juntos aumentam o alcance',
  'Use o tema IA Express para campanhas de urgência',
];

const STEP_STATUS_MAP = {
  pending: -1,
  validating: 0,
  processing_image: 1,
  generating_copy: 2,
  composing: 3,
  rendering: 4,
  done: 5,
};

export default {
  name: 'ProgressOverlay',
  props: {
    visible: { type: Boolean, default: false },
    progress: { type: Number, default: 0 },
    current_step: { type: String, default: 'pending' },
    current_step_desc: { type: String, default: '' },
    steps_completed: { type: Number, default: 0 },
  },
  data() {
    return {
      STEPS,
      tipIndex: 0,
      tipInterval: null,
    };
  },
  computed: {
    currentStepIndex() {
      return STEP_STATUS_MAP[this.current_step] ?? -1;
    },
    currentStepLabel() {
      if (this.currentStepIndex >= 0 && this.currentStepIndex < STEPS.length) {
        return STEPS[this.currentStepIndex].label;
      }
      return 'Preparando...';
    },
    currentTip() {
      return TIPS[this.tipIndex % TIPS.length];
    },
    estimatedTime() {
      const remaining = 100 - this.progress;
      return Math.max(1, Math.round(remaining * 0.3));
    },
  },
  methods: {
    stepClass(index) {
      if (index < this.currentStepIndex) return 'completed';
      if (index === this.currentStepIndex) return 'current';
      return 'pending';
    },
  },
  watch: {
    visible(val) {
      if (val) {
        this.tipIndex = 0;
        this.tipInterval = setInterval(() => {
          this.tipIndex++;
        }, 4000);
      } else if (this.tipInterval) {
        clearInterval(this.tipInterval);
        this.tipInterval = null;
      }
    },
  },
  beforeUnmount() {
    if (this.tipInterval) {
      clearInterval(this.tipInterval);
    }
  },
};
</script>

<style scoped>
.progress-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.progress-content {
  width: 100%;
  max-width: 480px;
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
}

/* Preview */
.preview-container {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(139, 92, 246, 0.08);
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.preview-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 25%, rgba(139, 92, 246, 0.1) 50%, transparent 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.preview-icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Steps row */
.steps-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 72px;
}

.step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.step-circle.completed {
  background: #10B981;
}

.step-circle.current {
  background: rgba(139, 92, 246, 0.2);
  border: 2px solid #8B5CF6;
}

.step-circle.pending {
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
}

.step-num {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 600;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-top-color: #8B5CF6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.step-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
  line-height: 1.2;
}

.step-label.active {
  color: #8B5CF6;
  font-weight: 600;
}

/* Current step info */
.current-step-info {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.step-title {
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.step-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

/* Progress bar */
.progress-bar-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #8B5CF6, #A78BFA);
  transition: width 0.5s ease;
}

.progress-meta {
  display: flex;
  justify-content: space-between;
}

.progress-pct {
  font-size: 13px;
  font-weight: 600;
  color: #8B5CF6;
}

.progress-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
}

/* Tip */
.tip-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.tip-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.tip-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

/* Transitions */
.overlay-enter-active { transition: opacity 0.3s; }
.overlay-leave-active { transition: opacity 0.3s; }
.overlay-enter-from,
.overlay-leave-to { opacity: 0; }
</style>
