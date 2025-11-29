<template>
  <div class="header">
    <GradientText
      text="我的目标"
      :colors="['#667eea', '#764ba2', '#667eea']"
      :animation-speed="6"
      class="header-title"
    />
    <div class="header-user">
      <ClickSpark 
        v-if="!hideFocusMode"
        :spark-color="focusMode ? '#28a745' : '#667eea'" 
        :spark-count="12" 
        class="focus-mode-btn-wrapper"
      >
        <button class="focus-mode-btn" @click="$emit('toggle-focus-mode')">
          {{ focusMode ? '常规模式' : '专注模式' }}
        </button>
      </ClickSpark>
      <span class="user-info">用户</span>
      <ClickSpark spark-color="#e74c3c" :spark-count="12" class="logout-btn-wrapper">
      <button class="logout-btn" @click="$emit('logout')">退出登录</button>
      </ClickSpark>
    </div>
  </div>
</template>

<script setup>
import GradientText from '@/components/animations/GradientText.vue'
import ClickSpark from '@/components/animations/ClickSpark.vue'

defineProps({
  focusMode: {
    type: Boolean,
    default: false
  },
  hideFocusMode: {
    type: Boolean,
    default: false
  }
})

defineEmits(['logout', 'toggle-focus-mode'])
</script>

<style scoped>
.header {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(50px) saturate(200%);
  -webkit-backdrop-filter: blur(50px) saturate(200%);
  border-radius: 16px;
  padding: 20px 30px;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.6);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.header-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 15px;
}

.focus-mode-btn-wrapper {
  display: inline-block;
}

.focus-mode-btn {
  padding: 8px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.focus-mode-btn:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.focus-mode-btn:active {
  transform: translateY(0);
}

.user-info {
  color: #666;
}

.logout-btn-wrapper {
  display: inline-block;
}

.logout-btn {
  padding: 8px 20px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  position: relative;
  z-index: 2;
}

.logout-btn:hover {
  background: #c0392b;
}
</style>

