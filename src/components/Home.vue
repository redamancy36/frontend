<template>
  <div class="app-container">
    <AuroraBackground 
      :intensity="1.0"
      :amplitude="0.8"
      :blend="0.9"
      :speed="1.2"
      :color-stops="['#667eea', '#764ba2', '#667eea']"
      class="background-layer"
    />
    <div class="content-layer">
      <Header 
        :focus-mode="focusMode" 
        @logout="handleLogout" 
        @toggle-focus-mode="toggleFocusMode" 
      />
    
    <!-- 圆点指示器（位于Header下方） -->
    <div 
      class="focus-point"
      :class="{ 
        'pulsing': focusMode,
        'expanding': isAnimating,
        'visible': focusMode || isAnimating
      }"
    ></div>
    
    <!-- 时钟提示 -->
    <div 
      class="focus-clock"
      :class="{ centered: clockCentered }"
    >
      <!-- 时钟样式1: 数字时钟（默认） -->
      <div v-if="clockStyleIndex === 0" class="clock-style-1">
        <div class="clock-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9"></circle>
            <line x1="12" y1="7" x2="12" y2="12"></line>
            <line x1="12" y1="12" x2="15" y2="14"></line>
          </svg>
        </div>
        <div class="clock-info">
          <div class="clock-time">{{ currentTime }}</div>
          <div class="clock-date">{{ currentDate }}</div>
        </div>
      </div>
      
      <!-- 时钟样式2: 简约数字 -->
      <div v-else-if="clockStyleIndex === 1" class="clock-style-2">
        <div class="clock-time-large">{{ currentTime }}</div>
        <div class="clock-date-small">{{ currentDate }}</div>
      </div>
      
      <!-- 时钟样式3: 模拟时钟 -->
      <div v-else-if="clockStyleIndex === 2" class="clock-style-3">
        <div class="analog-clock">
          <div class="clock-face">
            <div 
              class="hour-hand" 
              :style="{ transform: `rotate(${hourAngle}deg)` }"
            ></div>
            <div 
              class="minute-hand" 
              :style="{ transform: `rotate(${minuteAngle}deg)` }"
            ></div>
            <div 
              class="second-hand" 
              :style="{ transform: `rotate(${secondAngle}deg)` }"
            ></div>
            <div class="clock-center"></div>
          </div>
        </div>
        <div class="clock-info">
          <div class="clock-time">{{ currentTime }}</div>
          <div class="clock-date">{{ currentDate }}</div>
        </div>
      </div>
      
      <!-- 时钟样式4: 大号时间 -->
      <div v-else-if="clockStyleIndex === 3" class="clock-style-4">
        <div class="clock-time-extra-large">{{ currentTime }}</div>
        <div class="clock-date-medium">{{ currentDate }}</div>
      </div>
      
      <!-- 样式切换按钮（仅在专注模式下显示） -->
      <div v-if="clockCentered" class="clock-style-controls">
        <button 
          class="style-btn prev-btn" 
          @click="changeClockStyle(-1)"
          :disabled="isAnimating"
        >
          ‹
        </button>
        <span class="style-indicator">{{ clockStyleIndex + 1 }} / {{ clockStyles.length }}</span>
        <button 
          class="style-btn next-btn" 
          @click="changeClockStyle(1)"
          :disabled="isAnimating"
        >
          ›
        </button>
      </div>
    </div>
    
    <div class="container">
      <div class="dashboard">
        <!-- 最上面：消息更新 -->
        <div 
          ref="infoUpdateCardRef"
          class="dashboard-section"
          :class="{ 'focus-mode-hidden': focusMode && !isAnimating }"
        >
          <InfoUpdateCard />
        </div>
        
        <!-- 中间：创建目标 -->
        <div 
          ref="createGoalCardRef"
          class="dashboard-section"
          :class="{ 'focus-mode-hidden': focusMode && !isAnimating }"
        >
        <CreateGoalCard @goal-created="handleGoalCreated" />
        </div>
        
        <!-- 最下面：目标列表 -->
        <div 
          ref="goalListCardRef"
          class="dashboard-section"
          :class="{ 'focus-mode-hidden': focusMode && !isAnimating }"
        >
        <GoalListCard 
          :goals="goals"
          :loading="goalsLoading"
          @view-plan="handleViewPlan"
          @delete-goal="handleDeleteGoal"
          @refresh="loadGoals"
        />
        </div>
      </div>
      </div>
    </div>

    <!-- 查看计划模态框 -->
    <ViewPlanModal
      v-if="selectedGoalId"
      :goal-id="selectedGoalId"
      @close="selectedGoalId = null"
      @self-check="handleSelfCheck"
    />

    <!-- 自检模态框 -->
    <SelfCheckModal
      :show="showSelfCheck"
      :task-id="selectedTaskId"
      :goal-id="selectedGoalId || 0"
      @close="showSelfCheck = false"
      @submitted="handleSelfCheckSubmitted"
    />

    <!-- 进度监控模态框 -->
    <ProgressModal
      v-if="progressGoalId"
      :show="!!progressGoalId"
      :goal-id="progressGoalId"
      @close="progressGoalId = null"
      @completed="handleProgressCompleted"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Header from '@/components/Header.vue'
import CreateGoalCard from '@/components/CreateGoalCard.vue'
import InfoUpdateCard from '@/components/InfoUpdateCard.vue'
import GoalListCard from '@/components/GoalListCard.vue'
import ViewPlanModal from '@/components/ViewPlanModal.vue'
import SelfCheckModal from '@/components/SelfCheckModal.vue'
import ProgressModal from '@/components/ProgressModal.vue'
// import AuroraBackground from '@/components/animations/AuroraBackground.vue' // 保留作为备用
import AuroraBackground from '@/components/animations/AuroraBackground.vue'
// import GradientBackground from '@/components/animations/GradientBackground.vue' // 保留作为备用
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const goals = ref([])
const goalsLoading = ref(false)
const selectedGoalId = ref(null)
const selectedTaskId = ref(null)
const showSelfCheck = ref(false)
const progressGoalId = ref(null)
const focusMode = ref(false)
const isAnimating = ref(false)

// 卡片引用
const infoUpdateCardRef = ref(null)
const createGoalCardRef = ref(null)
const goalListCardRef = ref(null)
const cardOriginalPositions = ref([])

// 时钟数据
const currentTime = ref('')
const currentDate = ref('')
const clockCentered = ref(false)
let clockInterval = null

// 时钟样式管理
const clockStyles = ['数字时钟', '简约数字', '模拟时钟', '大号时间']
const clockStyleIndex = ref(0)
const hourAngle = ref(0)
const minuteAngle = ref(0)
const secondAngle = ref(0)

// 从 localStorage 加载保存的时钟样式
function loadClockStyle() {
  const saved = localStorage.getItem('focusClockStyle')
  if (saved !== null) {
    const index = parseInt(saved, 10)
    if (index >= 0 && index < clockStyles.length) {
      clockStyleIndex.value = index
    }
  }
}

// 保存时钟样式到 localStorage
function saveClockStyle() {
  localStorage.setItem('focusClockStyle', clockStyleIndex.value.toString())
}

// 切换时钟样式
function changeClockStyle(direction) {
  if (isAnimating.value) return
  
  const newIndex = clockStyleIndex.value + direction
  if (newIndex >= 0 && newIndex < clockStyles.length) {
    clockStyleIndex.value = newIndex
    saveClockStyle()
  } else if (newIndex < 0) {
    clockStyleIndex.value = clockStyles.length - 1
    saveClockStyle()
  } else if (newIndex >= clockStyles.length) {
    clockStyleIndex.value = 0
    saveClockStyle()
  }
}

function updateClock() {
  const now = new Date()
  currentTime.value = now
    .toLocaleTimeString('zh-CN', { hour12: false })
    .replace(/:\d{2}$/, '') // 只显示到分钟
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  
  // 更新模拟时钟角度
  const hours = now.getHours() % 12
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
  
  hourAngle.value = (hours * 30) + (minutes * 0.5)
  minuteAngle.value = minutes * 6
  secondAngle.value = seconds * 6
}

onMounted(async () => {
  await authStore.checkAuth()
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  await loadGoals()
  // 如果有关闭的进度弹窗，检查是否有新的通知
  // InfoUpdateCard会自动轮询更新
  
  // 监听键盘快捷键
  window.addEventListener('keydown', handleKeyPress)

  // 加载保存的时钟样式
  loadClockStyle()

  // 初始化时钟
  updateClock()
  clockInterval = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
  if (clockInterval) {
    clearInterval(clockInterval)
  }
})

function handleKeyPress(event) {
  // Ctrl/Cmd + K 快速创建目标
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault()
    // 触发创建目标（需要从CreateGoalCard暴露方法或使用事件）
  }
}

async function loadGoals() {
  goalsLoading.value = true
  try {
    const response = await api.get('/goals')
    // Flask返回的是数组，不是{success: true, goals: []}
    if (Array.isArray(response.data)) {
      goals.value = response.data
    } else if (response.data.success) {
      goals.value = response.data.goals || []
    }
  } catch (error) {
    console.error('加载目标失败:', error)
  } finally {
    goalsLoading.value = false
  }
}

function handleViewPlan(goalId) {
  selectedGoalId.value = goalId
}

function handleDeleteGoal(goalId) {
  loadGoals()
}

function handleGoalCreated(goalData) {
  loadGoals()
  // 如果创建成功，打开进度监控
  if (goalData && goalData.id) {
    progressGoalId.value = goalData.id
  }
}

function handleSelfCheck(taskId) {
  selectedTaskId.value = taskId
  showSelfCheck.value = true
}

function handleSelfCheckSubmitted() {
  // 不要立即关闭模态框，让用户查看结果
  // 模态框会在用户点击"关闭"按钮时关闭
  // 这里可以触发计划重新加载以更新任务状态
  if (selectedGoalId.value) {
    // 可以触发计划重新加载
    console.log('[Home] 自检提交完成，可以刷新计划数据')
  }
}

function handleProgressCompleted(goalId) {
  progressGoalId.value = null
  loadGoals()
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

function toggleFocusMode() {
  // 允许中断当前动画，立即响应新的点击
  // 先清理当前动画状态
  if (isAnimating.value) {
    // 中断当前动画，重置所有元素状态
    resetAnimationState()
  }
  
  isAnimating.value = true
  
  if (!focusMode.value) {
    // 进入专注模式：先放大圆点，再吸收卡片
    expandAndAbsorb()
  } else {
    // 退出专注模式：先放大圆点，再释放卡片
    expandAndRelease()
  }
}

function resetAnimationState() {
  // 重置所有卡片的状态
  const cards = [
    infoUpdateCardRef.value,
    createGoalCardRef.value,
    goalListCardRef.value
  ]
  
  cards.forEach(card => {
    if (card) {
      card.style.transition = 'none'
      card.style.transform = ''
      card.style.opacity = ''
      card.style.filter = ''
      card.style.willChange = 'auto'
    }
  })
  
  // 重置圆点状态
  const focusPoint = document.querySelector('.focus-point')
  if (focusPoint) {
    focusPoint.classList.remove('expanding', 'expanded')
  }
  
  // 重置时钟状态
  clockCentered.value = focusMode.value
}

function expandAndAbsorb() {
  // 先显示并放大圆点
  const focusPoint = document.querySelector('.focus-point')
  if (focusPoint) {
    focusPoint.classList.add('visible', 'expanding')
    // 动画完成后保持放大状态
    setTimeout(() => {
      focusPoint.classList.remove('expanding')
      focusPoint.classList.add('expanded')
    }, 400)
  }
  
  // 等待圆点放大后，同时移动时钟并吸收卡片
  setTimeout(() => {
    clockCentered.value = true
    focusMode.value = true
    absorbCards()
  }, 420)
}

function expandAndRelease() {
  // 先放大圆点并保持放大状态
  const focusPoint = document.querySelector('.focus-point')
  if (focusPoint) {
    // 如果还没有expanded类，先播放放大动画
    if (!focusPoint.classList.contains('expanded')) {
      focusPoint.classList.add('expanding')
      setTimeout(() => {
        focusPoint.classList.remove('expanding')
        focusPoint.classList.add('expanded')
        // 放大完成后开始释放，同时收回时钟
        focusMode.value = false
        clockCentered.value = false
        releaseCards()
      }, 400)
      return // 等待放大动画完成
    } else {
      // 如果已经是放大状态，直接开始释放
      focusPoint.classList.add('expanded')
    }
  }

  // 圆点已经是放大状态，直接开始释放
  focusMode.value = false
  clockCentered.value = false
  releaseCards()
}

function absorbCards() {
  const cards = [
    infoUpdateCardRef.value,
    createGoalCardRef.value,
    goalListCardRef.value
  ]
  
  const focusPointX = 40 // 圆点中心X坐标（left + width/2）
  const focusPointY = 110 // 圆点中心Y坐标（top + height/2，100px + 10px）
  
  // 保存每个卡片的原始位置
  cardOriginalPositions.value = []
  
  cards.forEach((card, index) => {
    if (!card) {
      cardOriginalPositions.value.push(null)
      return
    }
    
    const rect = card.getBoundingClientRect()
    const startX = rect.left + rect.width / 2
    const startY = rect.top + rect.height / 2
    
    // 保存原始位置
    cardOriginalPositions.value.push({
      x: startX,
      y: startY
    })
    
    // 计算到圆点的距离和角度
    const deltaX = focusPointX - startX
    const deltaY = focusPointY - startY
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)
    
    // 使用 requestAnimationFrame 确保样式已应用
    requestAnimationFrame(() => {
      // 设置初始状态
      card.style.transformOrigin = 'center center'
      card.style.transition = 'none'
      card.style.transform = 'translate(0, 0) scale(1) rotate(0deg)'
      card.style.opacity = '1'
      card.style.filter = 'blur(0px)'
      card.style.willChange = 'transform, opacity, filter'
      
      // 延迟启动动画，创建序列效果（从下往上吸收）
      setTimeout(() => {
        const duration = 0.7 + index * 0.1
        card.style.transition = `all ${duration}s cubic-bezier(0.4, 0, 0.2, 1)`
        card.style.transform = `
          translate(${deltaX}px, ${deltaY}px) 
          scale(0.05) 
          rotate(${angle + 720}deg)
        `
        card.style.opacity = '0'
        card.style.filter = 'blur(8px)'
      }, index * 100)
    })
  })
  
  setTimeout(() => {
    isAnimating.value = false
    // 卡片完全吸收后，圆点缩小
    const focusPoint = document.querySelector('.focus-point')
    if (focusPoint) {
      focusPoint.classList.remove('expanded')
    }
    // 清理 will-change
    cards.forEach(card => {
      if (card) {
        card.style.willChange = 'auto'
      }
    })
  }, 1400)
}

function releaseCards() {
  const cards = [
    infoUpdateCardRef.value,
    createGoalCardRef.value,
    goalListCardRef.value
  ]
  
  const focusPointX = 40 // 圆点中心X坐标
  const focusPointY = 110 // 圆点中心Y坐标
  
  // 使用保存的原始位置，如果没有则重新计算
  const originalPositions = cardOriginalPositions.value.length > 0 
    ? cardOriginalPositions.value 
    : cards.map(card => {
        if (!card) return null
        // 临时移除focus-mode-hidden类以获取位置
        const wasHidden = card.classList.contains('focus-mode-hidden')
        card.classList.remove('focus-mode-hidden')
        // 强制重排以获取正确位置
        void card.offsetHeight
        const rect = card.getBoundingClientRect()
        if (wasHidden) card.classList.add('focus-mode-hidden')
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        }
      })
  
  cards.forEach((card, index) => {
    if (!card || !originalPositions[index]) return
    
    const originalX = originalPositions[index].x
    const originalY = originalPositions[index].y
    
    // 计算从圆点到原始位置的偏移
    const deltaX = originalX - focusPointX
    const deltaY = originalY - focusPointY
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)
    
    // 使用 requestAnimationFrame 确保样式已应用
    requestAnimationFrame(() => {
      // 设置初始状态（从圆点位置，反向旋转）
      card.style.transformOrigin = 'center center'
      card.style.transition = 'none'
      card.style.transform = `
        translate(${-deltaX}px, ${-deltaY}px) 
        scale(0.05) 
        rotate(${-angle - 720}deg)
      `
      card.style.opacity = '0'
      card.style.filter = 'blur(8px)'
      card.style.willChange = 'transform, opacity, filter'
      card.classList.remove('focus-mode-hidden')
      
      // 延迟启动动画，创建序列效果（从上往下释放）
      setTimeout(() => {
        const duration = 0.7 + (cards.length - 1 - index) * 0.1
        card.style.transition = `all ${duration}s cubic-bezier(0.34, 1.56, 0.64, 1)`
        card.style.transform = 'translate(0, 0) scale(1) rotate(0deg)'
        card.style.opacity = '1'
        card.style.filter = 'blur(0px)'
      }, (cards.length - 1 - index) * 100)
    })
  })
  
  setTimeout(() => {
    isAnimating.value = false
    // 卡片完全释放后，圆点缩小并消失
    const focusPoint = document.querySelector('.focus-point')
    if (focusPoint) {
      focusPoint.classList.remove('expanded')
      // 等待缩小动画完成后隐藏
      setTimeout(() => {
        focusPoint.classList.remove('visible')
      }, 300)
    }
    // 清理 will-change
    cards.forEach(card => {
      if (card) {
        card.style.willChange = 'auto'
      }
    })
    cardOriginalPositions.value = []
  }, 1400)
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  position: relative;
}

.background-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
}

.content-layer {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  background: transparent;
}

.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.dashboard-section {
  width: 100%;
  animation: fadeInUp 0.5s ease-out;
  will-change: transform, opacity;
}

.dashboard-section.focus-mode-hidden {
  pointer-events: none;
}

.focus-point {
  position: fixed;
  top: 100px; /* 位于Header下方 */
  left: 30px;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  z-index: 1000;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.6),
              0 0 40px rgba(102, 126, 234, 0.4),
              0 0 60px rgba(102, 126, 234, 0.2);
  pointer-events: none;
  opacity: 0;
  transform: scale(0);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.focus-point.visible {
  opacity: 1;
  transform: scale(1);
}

.focus-point.pulsing {
  animation: pulse 2s ease-in-out infinite;
}

.focus-point.expanded {
  transform: scale(3) !important;
  box-shadow: 0 0 40px rgba(102, 126, 234, 0.8),
              0 0 80px rgba(102, 126, 234, 0.6),
              0 0 120px rgba(102, 126, 234, 0.4) !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.focus-point.expanding {
  animation: expand 0.4s ease-out forwards;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

@keyframes expand {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(3);
  }
}

.focus-clock {
  position: fixed;
  top: 85px;
  right: 30px;
  left: auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 999px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
  border: 1px solid rgba(102, 126, 234, 0.2);
  color: #333;
  font-weight: 500;
  transition: top 0.7s cubic-bezier(0.4, 0, 0.2, 1),
              left 0.7s cubic-bezier(0.4, 0, 0.2, 1),
              right 0.7s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.7s cubic-bezier(0.4, 0, 0.2, 1),
              padding 0.7s cubic-bezier(0.4, 0, 0.2, 1),
              gap 0.7s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
  pointer-events: none;
  transform-origin: center center;
  transform: translate(0, 0) scale(1);
}

.focus-clock.centered {
  top: 50%;
  left: 50%;
  right: auto;
  flex-direction: column;
  transform: translate(-50%, -50%) scale(2.5);
  padding: 24px 36px;
  gap: 20px;
  box-shadow: 0 15px 45px rgba(102, 126, 234, 0.4);
  pointer-events: auto;
}

.clock-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.15);
  color: #667eea;
  flex-shrink: 0;
}

.clock-icon svg {
  width: 18px;
  height: 18px;
}

.focus-clock.centered .clock-icon {
  width: 48px;
  height: 48px;
}

.focus-clock.centered .clock-icon svg {
  width: 32px;
  height: 32px;
}

.clock-info {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.clock-time {
  font-size: 16px;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.focus-clock.centered .clock-time {
  font-size: 48px;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.clock-date {
  font-size: 12px;
  opacity: 0.85;
}

.focus-clock.centered .clock-date {
  font-size: 20px;
  opacity: 0.9;
}

/* 时钟样式容器 */
.focus-clock > div {
  display: flex;
  align-items: center;
  gap: 10px;
}

.focus-clock.centered > div {
  gap: 20px;
}

/* 样式1: 数字时钟（默认，已有样式） */

/* 样式2: 简约数字 */
.clock-style-2 {
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.clock-time-large {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.focus-clock.centered .clock-time-large {
  font-size: 56px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.clock-date-small {
  font-size: 12px;
  opacity: 0.85;
}

.focus-clock.centered .clock-date-small {
  font-size: 18px;
  opacity: 0.9;
}

/* 样式3: 模拟时钟 */
.clock-style-3 {
  flex-direction: row;
  align-items: center;
  gap: 20px;
}

.analog-clock {
  width: 28px;
  height: 28px;
  position: relative;
}

.focus-clock.centered .analog-clock {
  width: 120px;
  height: 120px;
}

.clock-face {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid #667eea;
  position: relative;
  background: rgba(255, 255, 255, 0.9);
}

.focus-clock.centered .clock-face {
  border-width: 6px;
}

.hour-hand,
.minute-hand,
.second-hand {
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: 50% 100%;
  border-radius: 2px;
}

.hour-hand {
  width: 6px;
  height: 30%;
  margin-left: -3px;
  margin-top: -30%;
  background: #667eea;
}

.minute-hand {
  width: 4px;
  height: 40%;
  margin-left: -2px;
  margin-top: -40%;
  background: #667eea;
}

.second-hand {
  width: 2px;
  height: 45%;
  margin-left: -1px;
  margin-top: -45%;
  background: #e74c3c;
  box-shadow: none;
}

.clock-center {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 8px;
  height: 8px;
  margin-left: -4px;
  margin-top: -4px;
  background: #667eea;
  border-radius: 50%;
  z-index: 10;
}

.focus-clock.centered .clock-center {
  width: 16px;
  height: 16px;
  margin-left: -8px;
  margin-top: -8px;
  background: #667eea;
  border: 2px solid rgba(255, 255, 255, 0.9);
}

.focus-clock.centered .hour-hand {
  width: 10px;
  height: 30%;
  margin-left: -5px;
  margin-top: -30%;
  border-radius: 5px;
}

.focus-clock.centered .minute-hand {
  width: 6px;
  height: 40%;
  margin-left: -3px;
  margin-top: -40%;
  border-radius: 4px;
}

.focus-clock.centered .second-hand {
  width: 3px;
  height: 45%;
  margin-left: -1.5px;
  margin-top: -45%;
}

/* 样式4: 大号时间 */
.clock-style-4 {
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.clock-time-extra-large {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.focus-clock.centered .clock-time-extra-large {
  font-size: 72px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.clock-date-medium {
  font-size: 14px;
  opacity: 0.85;
}

.focus-clock.centered .clock-date-medium {
  font-size: 24px;
  opacity: 0.9;
}

/* 样式切换控制按钮 */
.clock-style-controls {
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 10;
}

.style-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(102, 126, 234, 0.3);
  background: rgba(255, 255, 255, 0.95);
  color: #667eea;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.style-btn:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.5);
  transform: scale(1.1);
}

.style-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.style-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.style-indicator {
  font-size: 14px;
  color: #667eea;
  font-weight: 600;
  min-width: 50px;
  text-align: center;
}


@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计：小屏幕优化 */
@media (max-width: 768px) {
  .dashboard {
    gap: 16px;
  }
  
  .container {
    padding: 12px;
  }
  
  .dashboard-section {
    animation-duration: 0.3s;
  }
}

/* 大屏幕优化 */
@media (min-width: 1200px) {
  .container {
    max-width: 1400px;
  }
}
</style>

