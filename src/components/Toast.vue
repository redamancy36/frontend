<template>
  <TransitionGroup name="toast" tag="div" class="toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="['toast', `toast-${toast.type}`]"
    >
      <div class="toast-icon">
        <span v-if="toast.type === 'success'">✓</span>
        <span v-else-if="toast.type === 'error'">✗</span>
        <span v-else-if="toast.type === 'warning'">⚠</span>
        <span v-else>ℹ</span>
      </div>
      <div class="toast-content">
        <div class="toast-message">{{ toast.message }}</div>
        <div v-if="toast.description" class="toast-description">{{ toast.description }}</div>
      </div>
      <button v-if="toast.closable" @click="removeToast(toast.id)" class="toast-close">×</button>
    </div>
  </TransitionGroup>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

const toasts = ref([])
let toastIdCounter = 0

export default {
  name: 'Toast',
  setup() {
    return {
      toasts
    }
  },
  methods: {
    removeToast(id) {
      const index = toasts.value.findIndex(t => t.id === id)
      if (index > -1) {
        toasts.value.splice(index, 1)
      }
    }
  }
}

// Toast服务函数
export function showToast(message, type = 'info', options = {}) {
  const id = ++toastIdCounter
  const {
    duration = 3000,
    closable = true,
    description = null
  } = options

  const toast = {
    id,
    message,
    type, // 'success', 'error', 'warning', 'info'
    duration,
    closable,
    description
  }

  toasts.value.push(toast)

  // 自动移除
  if (duration > 0) {
    setTimeout(() => {
      const index = toasts.value.findIndex(t => t.id === id)
      if (index > -1) {
        toasts.value.splice(index, 1)
      }
    }, duration)
  }

  return id
}

// 便捷方法
export const toast = {
  success: (message, options) => showToast(message, 'success', options),
  error: (message, options) => showToast(message, 'error', options),
  warning: (message, options) => showToast(message, 'warning', options),
  info: (message, options) => showToast(message, 'info', options)
}

// 导出toasts以供组件使用
export { toasts }
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 320px;
  max-width: 480px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border-left: 4px solid;
  pointer-events: all;
  animation: slideIn 0.3s ease-out;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Toast类型样式 */
.toast-success {
  border-left-color: #28a745;
  background: linear-gradient(135deg, #ffffff 0%, #f0fff4 100%);
}

.toast-error {
  border-left-color: #e74c3c;
  background: linear-gradient(135deg, #ffffff 0%, #fff5f5 100%);
}

.toast-warning {
  border-left-color: #ffc107;
  background: linear-gradient(135deg, #ffffff 0%, #fffbf0 100%);
}

.toast-info {
  border-left-color: #667eea;
  background: linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%);
}

.toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  color: white;
}

.toast-success .toast-icon {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.toast-error .toast-icon {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

.toast-warning .toast-icon {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
}

.toast-info .toast-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-message {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  line-height: 1.5;
  margin-bottom: 4px;
}

.toast-description {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: #999;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.toast-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #333;
}

/* 动画 */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-enter-active {
  animation: slideIn 0.3s ease-out;
}

.toast-leave-active {
  animation: slideOut 0.3s ease-in;
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .toast-container {
    right: 10px;
    left: 10px;
    top: 10px;
  }
  
  .toast {
    min-width: auto;
    max-width: none;
  }
}
</style>

