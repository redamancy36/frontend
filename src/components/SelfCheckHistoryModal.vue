<template>
  <div v-if="show" class="modal active" @click.self="handleClose">
    <div class="modal-content history-modal">
      <div class="modal-header">
        <h2 class="modal-title">历史记录 - {{ taskTitle || '任务' }}</h2>
        <button class="close-btn" @click="handleClose">&times;</button>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>加载历史记录中...</p>
      </div>

      <div v-else>
        <div v-if="records.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <p>暂时没有历史记录，可先完成一次挑战。</p>
        </div>

        <div v-else class="history-list">
          <div
            v-for="record in records"
            :key="record.id"
            class="history-item"
          >
            <!-- 阶段1任务：不显示打分，只显示保存信息 -->
            <template v-if="record.is_stage1">
              <div class="history-icon stage1-icon">
                ✓
              </div>
              <div class="history-body">
                <div class="history-status">
                  <span class="status-text stage1-status">信息已保存</span>
                  <span class="history-attempt">第 {{ record.attempt_number || 1 }} 次提交</span>
                </div>
                <p class="history-verdict">
                  {{ record.message || '信息已成功保存到用户画像' }}
                </p>
                <div class="history-meta">
                  <span>{{ formatDate(record.created_at) }}</span>
                </div>
              </div>
            </template>
            
            <!-- 非阶段1任务：显示打分和评估信息 -->
            <template v-else>
              <div class="history-score" :class="{ passed: record.is_passed, failed: !record.is_passed }">
                {{ Math.round(record.score || 0) }} 分
              </div>
              <div class="history-body">
                <div class="history-status">
                  <span class="status-text" :class="{ passed: record.is_passed, failed: !record.is_passed }">
                    {{ record.is_passed ? '已通过' : '未达标' }}
                  </span>
                  <span class="history-attempt">第 {{ record.attempt_number || 1 }} 次挑战</span>
                </div>
                <p class="history-verdict">
                  {{ record.verdict || '暂无评语' }}
                </p>
                <div class="history-meta">
                  <span>{{ formatDate(record.created_at) }}</span>
                </div>
                <div v-if="record.mistakes && record.mistakes.length > 0" class="history-section mistakes">
                  <strong>待改进：</strong>
                  <ul>
                    <li v-for="(item, index) in record.mistakes" :key="index">{{ item }}</li>
                  </ul>
                </div>
                <div v-if="record.improvement_plan && record.improvement_plan.length > 0" class="history-section plan">
                  <strong>复习建议：</strong>
                  <ul>
                    <li v-for="(item, index) in record.improvement_plan" :key="index">{{ item }}</li>
                  </ul>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '@/services/api'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  goalId: {
    type: Number,
    required: true
  },
  taskId: {
    type: Number,
    default: null
  },
  taskTitle: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const records = ref([])
const loading = ref(false)

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      loadHistory()
    }
  }
)

watch(
  () => props.taskId,
  (newVal, oldVal) => {
    if (props.show && newVal !== oldVal) {
      loadHistory()
    }
  }
)

async function loadHistory() {
  if (!props.goalId || !props.taskId) {
    records.value = []
    return
  }
  loading.value = true
  try {
    const response = await api.get(`/goals/${props.goalId}/tasks/${props.taskId}/self_check/history`)
    records.value = response.data || []
  } catch (error) {
    console.error('[SelfCheckHistoryModal] 加载历史记录失败:', error)
    records.value = []
  } finally {
    loading.value = false
  }
}

function formatDate(value) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString('zh-CN', { hour12: false })
  } catch {
    return value
  }
}

function handleClose() {
  emit('close')
}
</script>

<style scoped>
.history-modal {
  max-width: 720px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.history-score {
  min-width: 90px;
  height: 90px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: #fff;
}

.history-score.passed {
  background: linear-gradient(135deg, #34d399, #059669);
}

.history-score.failed {
  background: linear-gradient(135deg, #f87171, #ef4444);
}

.history-icon {
  min-width: 90px;
  height: 90px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
  color: #fff;
}

.stage1-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.stage1-status {
  color: #667eea;
}

.history-body {
  flex: 1;
}

.history-status {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.status-text {
  font-weight: 600;
}

.status-text.passed {
  color: #059669;
}

.status-text.failed {
  color: #ef4444;
}

.history-verdict {
  margin: 4px 0 8px;
  color: #333;
  font-size: 15px;
}

.history-meta {
  font-size: 13px;
  color: #888;
}

.history-section {
  margin-top: 8px;
  font-size: 14px;
}

.history-section ul {
  padding-left: 18px;
  margin: 4px 0;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

.empty-icon {
  font-size: 36px;
  margin-bottom: 12px;
}
</style>

