<template>
  <div class="study-timer">
    <div class="timer-display">
      <div class="time-display">
        <div class="time-main">{{ formattedTime }}</div>
        <div class="time-label">{{ isRunning ? '学习中...' : '已暂停' }}</div>
      </div>
      
      <div class="timer-controls">
        <button 
          @click="startTimer" 
          v-if="!isRunning && elapsedSeconds === 0"
          class="btn-timer btn-start"
        >
          开始专注
        </button>
        <button 
          @click="pauseTimer" 
          v-else-if="isRunning"
          class="btn-timer btn-pause"
        >
          暂停
        </button>
        <button 
          @click="resumeTimer" 
          v-else
          class="btn-timer btn-resume"
        >
          继续
        </button>
        <button 
          @click="resetTimer" 
          class="btn-timer btn-reset"
          :disabled="elapsedSeconds === 0"
        >
          重置
        </button>
      </div>
    </div>
    
    <!-- 番茄钟设置 -->
    <div class="pomodoro-settings">
      <label class="settings-label">专注时长（分钟）</label>
      <div class="duration-buttons">
        <button
          v-for="duration in presetDurations"
          :key="duration"
          :class="['duration-btn', { active: focusDuration === duration }]"
          @click="setDuration(duration)"
        >
          {{ duration }}分钟
        </button>
      </div>
      <div class="custom-duration">
        <input
          v-model.number="customDuration"
          type="number"
          min="5"
          max="120"
          placeholder="自定义"
          class="duration-input"
          @change="setCustomDuration"
        />
        <span class="duration-unit">分钟</span>
      </div>
    </div>
    
    <!-- 任务信息 -->
    <div v-if="taskTitle" class="current-task">
      <div class="task-label">当前任务</div>
      <div class="task-name">{{ taskTitle }}</div>
    </div>
    
    <!-- 完成提示 -->
    <div v-if="showCompleteMessage" class="complete-message">
      <div class="complete-icon">🎉</div>
      <div class="complete-text">专注时间完成！</div>
      <div class="complete-duration">已学习 {{ Math.floor(elapsedSeconds / 60) }} 分钟</div>
      <button @click="handleComplete" class="btn-complete">记录学习时长</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import api from '@/services/api'

const props = defineProps({
  taskId: {
    type: Number,
    default: null
  },
  taskTitle: {
    type: String,
    default: ''
  },
  goalId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['timer-complete'])

const elapsedSeconds = ref(0)
const isRunning = ref(false)
const focusDuration = ref(25) // 默认25分钟番茄钟
const customDuration = ref(25)
const showCompleteMessage = ref(false)
let timerInterval = null

const presetDurations = [15, 25, 45, 60]

const formattedTime = computed(() => {
  const hours = Math.floor(elapsedSeconds.value / 3600)
  const minutes = Math.floor((elapsedSeconds.value % 3600) / 60)
  const seconds = elapsedSeconds.value % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

// 从 localStorage 恢复计时器状态
function loadTimerState() {
  // 如果没有taskId，使用通用key加载
  const storageKey = props.taskId ? `studyTimer_${props.taskId}` : 'studyTimer_general'
  
  const saved = localStorage.getItem(storageKey)
  if (saved) {
    try {
      const state = JSON.parse(saved)
      elapsedSeconds.value = state.elapsedSeconds || 0
      focusDuration.value = state.focusDuration || 25
      
      // 如果之前正在运行，计算实际经过的时间
      if (state.isRunning && state.startTime) {
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000)
        elapsedSeconds.value = (state.elapsedSeconds || 0) + elapsed
        // 检查是否已经完成
        if (elapsedSeconds.value >= focusDuration.value * 60) {
          elapsedSeconds.value = focusDuration.value * 60
          showCompleteMessage.value = true
        } else {
          startTimer()
        }
      }
    } catch (e) {
      console.error('恢复计时器状态失败:', e)
    }
  }
}

// 保存计时器状态
function saveTimerState() {
  // 如果没有taskId，使用通用key保存
  const storageKey = props.taskId ? `studyTimer_${props.taskId}` : 'studyTimer_general'
  
  const state = {
    elapsedSeconds: elapsedSeconds.value,
    isRunning: isRunning.value,
    startTime: isRunning.value ? Date.now() : null,
    focusDuration: focusDuration.value
  }
  localStorage.setItem(storageKey, JSON.stringify(state))
}

function startTimer() {
  if (elapsedSeconds.value >= focusDuration.value * 60) {
    // 如果已经完成，先重置
    resetTimer()
  }
  
  isRunning.value = true
  saveTimerState()
  
  timerInterval = setInterval(() => {
    elapsedSeconds.value++
    saveTimerState()
    
    // 检查是否达到番茄钟时长
    if (elapsedSeconds.value >= focusDuration.value * 60) {
      pauseTimer()
      showCompleteMessage.value = true
      // 触发完成事件
      emit('timer-complete', {
        taskId: props.taskId,
        duration: Math.floor(elapsedSeconds.value / 60),
        seconds: elapsedSeconds.value
      })
    }
  }, 1000)
}

function pauseTimer() {
  isRunning.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  saveTimerState()
}

function resumeTimer() {
  startTimer()
}

function resetTimer() {
  pauseTimer()
  elapsedSeconds.value = 0
  showCompleteMessage.value = false
  saveTimerState()
}

function setDuration(duration) {
  focusDuration.value = duration
  customDuration.value = duration
  saveTimerState()
}

function setCustomDuration() {
  if (customDuration.value >= 5 && customDuration.value <= 120) {
    focusDuration.value = customDuration.value
    saveTimerState()
  }
}

async function handleComplete() {
  // 记录学习时长到后端
  if (props.goalId && props.taskId) {
    try {
      const durationMinutes = Math.floor(elapsedSeconds.value / 60)
      await api.post(`/goals/${props.goalId}/progress/record`, {
        task_id: props.taskId,
        duration_minutes: durationMinutes,
        date: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      console.error('记录学习时长失败:', error)
    }
  }
  
  showCompleteMessage.value = false
  resetTimer()
}

// 监听任务ID变化，切换任务时重置计时器
watch(() => props.taskId, (newId, oldId) => {
  if (newId !== oldId) {
    pauseTimer()
    elapsedSeconds.value = 0
    showCompleteMessage.value = false
    loadTimerState()
  }
})

onMounted(() => {
  loadTimerState()
})

onUnmounted(() => {
  pauseTimer()
})
</script>

<style scoped>
.study-timer {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  color: white;
}

.timer-display {
  text-align: center;
  margin-bottom: 24px;
}

.time-display {
  margin-bottom: 20px;
}

.time-main {
  font-size: 64px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.time-label {
  font-size: 16px;
  opacity: 0.9;
}

.timer-controls {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn-timer {
  padding: 10px 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
}

.btn-timer:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.btn-timer:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-start {
  background: rgba(40, 167, 69, 0.3);
  border-color: rgba(40, 167, 69, 0.5);
}

.btn-pause {
  background: rgba(255, 193, 7, 0.3);
  border-color: rgba(255, 193, 7, 0.5);
}

.btn-resume {
  background: rgba(40, 167, 69, 0.3);
  border-color: rgba(40, 167, 69, 0.5);
}

.btn-reset {
  background: rgba(231, 76, 60, 0.3);
  border-color: rgba(231, 76, 60, 0.5);
}

/* 番茄钟设置 */
.pomodoro-settings {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.settings-label {
  display: block;
  margin-bottom: 12px;
  font-size: 14px;
  opacity: 0.9;
}

.duration-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.duration-btn {
  padding: 6px 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.duration-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.duration-btn.active {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
}

.custom-duration {
  display: flex;
  align-items: center;
  gap: 8px;
}

.duration-input {
  width: 80px;
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 6px;
  font-size: 13px;
}

.duration-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.duration-unit {
  font-size: 13px;
  opacity: 0.9;
}

/* 当前任务 */
.current-task {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.task-label {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.task-name {
  font-size: 16px;
  font-weight: 600;
}

/* 完成提示 */
.complete-message {
  margin-top: 24px;
  padding: 20px;
  background: rgba(40, 167, 69, 0.2);
  border: 2px solid rgba(40, 167, 69, 0.5);
  border-radius: 12px;
  text-align: center;
}

.complete-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.complete-text {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.complete-duration {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 16px;
}

.btn-complete {
  padding: 10px 24px;
  background: rgba(40, 167, 69, 0.8);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-complete:hover {
  background: rgba(40, 167, 69, 1);
  transform: translateY(-2px);
}
</style>

