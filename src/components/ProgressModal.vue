<template>
  <div v-if="show" class="modal active" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">规划进度</h2>
        <button class="close-btn" @click="close">&times;</button>
      </div>
      
      <div v-if="progress" class="progress-content">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress.progress_percentage || 0}%` }"></div>
        </div>
        <div class="progress-text">
          {{ progress.progress_percentage || 0 }}% - {{ progress.status_text || '处理中...' }}
        </div>
        
        <div v-if="progress.current_agent" class="current-agent">
          <span class="agent-label">当前执行：</span>
          <span class="agent-name">{{ progress.current_agent }}</span>
        </div>
        
        <!-- 显示最新步骤详情 -->
        <div v-if="latestStepDetail" class="step-detail">
          <div class="step-icon">📋</div>
          <div class="step-text">{{ latestStepDetail }}</div>
        </div>
        
        <!-- 显示详细进度日志 -->
        <div v-if="progress.updates && progress.updates.length > 0" class="progress-updates">
          <h4>详细进度：</h4>
          <div class="updates-container">
            <div
              v-for="(update, index) in recentUpdates"
              :key="index"
              class="update-item"
              :class="getStatusClass(update.status)"
            >
              <div class="update-header">
                <span class="update-source">{{ update.agent || '系统' }}</span>
                <span class="update-status" :class="'status-' + (update.status || 'running')">
                  {{ getStatusText(update.status) }}
                </span>
              </div>
              <div v-if="update.message" class="update-message">{{ update.message }}</div>
              <div v-if="update.step_detail" class="update-step-detail">
                <span class="step-detail-icon">→</span>
                {{ update.step_detail }}
              </div>
              <div v-if="update.timestamp" class="update-time">{{ formatTime(update.timestamp) }}</div>
            </div>
          </div>
        </div>
        
        <!-- 如果没有详细日志，显示提示 -->
        <div v-else-if="progress && (progress.status === 'in_progress' || progress.status === 'pending')" class="no-updates">
          <p>正在处理中，请稍候...</p>
          <p v-if="progress.status_text" class="status-hint">{{ progress.status_text }}</p>
        </div>
      </div>
      
      <div v-else class="loading">
        <div class="spinner"></div>
        <p>正在连接服务器，获取进度信息...</p>
        <p v-if="props.goalId" class="loading-hint">目标ID: {{ props.goalId }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import api from '@/services/api'

const props = defineProps({
  show: {
    type: Boolean,
    default: true
  },
  goalId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['close', 'completed'])

const progress = ref(null)
const intervalId = ref(null)

watch(() => props.show, (newVal) => {
  if (newVal) {
    // 立即加载一次，然后开始轮询
    loadProgress().then(() => {
      startPolling()
    })
  } else {
    stopPolling()
  }
})

// 组件挂载时如果已经显示，立即加载
onMounted(() => {
  if (props.show) {
    loadProgress().then(() => {
      startPolling()
    })
  }
})

onUnmounted(() => {
  stopPolling()
})

async function loadProgress() {
  try {
    const response = await api.get(`/goals/${props.goalId}/progress`)
    
    // 调试：打印完整响应
    console.log('API响应:', response)
    console.log('响应数据:', response.data)
    
    if (response && response.data) {
      progress.value = response.data
      
      // 确保 updates 字段存在
      if (!progress.value.updates) {
        progress.value.updates = []
      }
      
      // 调试：打印进度数据
      console.log('进度数据:', {
        status: progress.value.status,
        progress_percentage: progress.value.progress_percentage,
        current_stage: progress.value.current_stage,
        status_text: progress.value.status_text,
        current_agent: progress.value.current_agent,
        updates_count: progress.value.updates?.length || 0,
        updates: progress.value.updates,
        latest_step_detail: latestStepDetail.value
      })
      
      // 如果完成或失败，停止轮询
      if (progress.value.status === 'completed' || progress.value.status === 'failed') {
        stopPolling()
        if (progress.value.status === 'completed') {
          emit('completed', props.goalId)
        }
      }
    } else {
      // 如果没有数据，初始化一个空对象以避免显示加载状态
      console.warn('API返回数据为空，使用默认值')
      progress.value = {
        status: 'pending',
        progress_percentage: 0,
        status_text: '等待开始...',
        current_stage: null,
        current_agent: null,
        updates: []
      }
    }
  } catch (error) {
    console.error('加载进度失败:', error)
    console.error('错误详情:', error.response?.data || error.message)
    // 即使出错也显示一个默认状态，避免一直显示加载中
    progress.value = {
      status: 'error',
      progress_percentage: 0,
      status_text: '无法加载进度信息',
      current_stage: null,
      current_agent: null,
      updates: []
    }
  }
}

function startPolling() {
  intervalId.value = setInterval(() => {
    loadProgress()
  }, 2000) // 每2秒轮询一次
}

function stopPolling() {
  if (intervalId.value) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
}

function close() {
  // 如果进度还在进行中，提示用户后台继续执行
  if (progress.value && (progress.value.status === 'in_progress' || progress.value.status === 'pending')) {
    if (confirm('计划正在后台生成中，关闭后将继续在后台执行。完成后会在消息列表中通知您。确定要关闭吗？')) {
      stopPolling()
      emit('close')
    }
  } else {
  stopPolling()
  emit('close')
  }
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString('zh-CN')
}

// 计算属性：获取最新的步骤详情
const latestStepDetail = computed(() => {
  if (!progress.value || !progress.value.updates || progress.value.updates.length === 0) {
    return null
  }
  const latest = progress.value.updates[progress.value.updates.length - 1]
  return latest.step_detail || null
})

// 计算属性：获取最近的更新（最多显示10条）
const recentUpdates = computed(() => {
  if (!progress.value || !progress.value.updates) {
    return []
  }
  return progress.value.updates.slice(-10).reverse() // 最新的在前
})

function getStatusClass(status) {
  const statusMap = {
    'running': 'status-running',
    'completed': 'status-completed',
    'error': 'status-error',
    'warning': 'status-warning'
  }
  return statusMap[status] || 'status-default'
}

function getStatusText(status) {
  const statusMap = {
    'running': '进行中',
    'completed': '已完成',
    'error': '错误',
    'warning': '警告'
  }
  return statusMap[status] || '未知'
}
</script>

<style scoped>
.progress-content {
  padding: 20px 0;
}

.progress-bar {
  width: 100%;
  height: 30px;
  background: #e0e0e0;
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.progress-text {
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20px;
}

.current-agent {
  text-align: center;
  color: #667eea;
  font-weight: 500;
  margin-bottom: 20px;
}

.progress-updates {
  margin-top: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.progress-updates h4 {
  margin-bottom: 10px;
}

.step-detail {
  display: flex;
  align-items: center;
  padding: 12px;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-left: 3px solid #667eea;
  border-radius: 6px;
  margin-bottom: 20px;
}

.step-icon {
  font-size: 20px;
  margin-right: 10px;
}

.step-text {
  flex: 1;
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.updates-container {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 5px;
}

.update-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 10px;
  border-left: 3px solid #ddd;
  transition: all 0.3s;
}

.update-item.status-running {
  border-left-color: #667eea;
  background: #f0f4ff;
}

.update-item.status-completed {
  border-left-color: #28a745;
  background: #f0fff4;
}

.update-item.status-error {
  border-left-color: #dc3545;
  background: #fff0f0;
}

.update-item.status-warning {
  border-left-color: #ffc107;
  background: #fffef0;
}

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.update-source {
  font-weight: 600;
  color: #667eea;
  font-size: 14px;
}

.update-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.status-running {
  background: #667eea;
  color: white;
}

.status-completed {
  background: #28a745;
  color: white;
}

.status-error {
  background: #dc3545;
  color: white;
}

.status-warning {
  background: #ffc107;
  color: #333;
}

.update-message {
  margin: 5px 0;
  color: #333;
  line-height: 1.5;
}

.update-step-detail {
  margin-top: 6px;
  padding: 6px 10px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 4px;
  font-size: 13px;
  color: #555;
  display: flex;
  align-items: center;
}

.step-detail-icon {
  margin-right: 6px;
  color: #667eea;
  font-weight: bold;
}

.update-time {
  font-size: 11px;
  color: #999;
  margin-top: 6px;
}

.no-updates {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 14px;
}

.status-hint {
  margin-top: 10px;
  color: #667eea;
  font-weight: 500;
}

.loading-hint {
  margin-top: 10px;
  font-size: 12px;
  color: #999;
}
</style>

