<template>
  <div class="task-item">
    <div class="task-header">
      <h4>{{ task.title || '任务' }}</h4>
      <div class="task-meta">
        <span v-if="task.due_date" class="task-date">📅 {{ task.due_date }}</span>
        <span :class="['status-badge', `status-${task.status}`]">
          {{ getStatusText(task.status) }}
        </span>
      </div>
    </div>
    
    <div v-if="task.description" class="task-description">
      {{ task.description }}
    </div>
    
    <!-- 学习材料 -->
    <div v-if="learningMaterials.length > 0" class="learning-materials">
      <strong>📚 学习材料：</strong>
      <div v-for="(material, index) in learningMaterials" :key="index" class="material-item">
        <a :href="material.url" target="_blank" class="material-link">
          {{ material.icon }} {{ material.text }}
        </a>
      </div>
    </div>
    
    <!-- 自测题目 -->
    <div v-if="task.task_items && task.task_items.length > 0" class="task-items">
      <strong>📝 自测题目（{{ task.task_items.length }} 道）：</strong>
      <div
        v-for="(item, index) in task.task_items"
        :key="item.id || index"
        class="task-item-question"
      >
        <div class="question-header">
          <span class="question-type">{{ getQuestionTypeLabel(item.question_type) }}</span>
          <span class="difficulty">{{ '⭐'.repeat(item.difficulty_level || 1) }}</span>
          <span v-if="item.is_correct !== null" :class="['correct-badge', item.is_correct ? 'correct' : 'incorrect']">
            {{ item.is_correct ? '✓ 正确' : '✗ 错误' }}
          </span>
        </div>
        <div class="question-content">{{ item.content || '题目内容' }}</div>
        <div v-if="item.options" class="question-options">
          {{ formatOptions(item.options) }}
        </div>
        <div v-if="item.user_response" class="user-response">
          你的答案：{{ item.user_response }}
        </div>
      </div>
    </div>
    
    <div class="task-actions">
      <button
        class="btn btn-primary btn-sm"
        @click="handleSelfCheck"
      >
        {{ task.task_items && task.task_items.length > 0 ? '查看/提交自检' : '开始自检' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SelfCheckModal from './SelfCheckModal.vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  goalId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['self-check'])

const learningMaterials = computed(() => {
  if (!props.task.learning_materials) return []
  
  try {
    const materials = typeof props.task.learning_materials === 'string'
      ? JSON.parse(props.task.learning_materials)
      : props.task.learning_materials
    
    const result = []
    if (materials.videos && Array.isArray(materials.videos)) {
      materials.videos.forEach(url => {
        result.push({ icon: '📹', text: url, url })
      })
    }
    if (materials.documents && Array.isArray(materials.documents)) {
      materials.documents.forEach(url => {
        result.push({ icon: '📄', text: url, url })
      })
    }
    return result
  } catch {
    return []
  }
})

function getStatusText(status) {
  const statusMap = {
    'todo': '待办',
    'in_progress': '进行中',
    'completed': '已完成'
  }
  return statusMap[status] || status
}

function getQuestionTypeLabel(type) {
  const labels = {
    'MCQ': '单选题',
    'FILL': '填空题',
    'QA': '简答题',
    'CALC': '计算题'
  }
  return labels[type] || type || '题目'
}

function formatOptions(options) {
  if (typeof options === 'string') {
    try {
      options = JSON.parse(options)
    } catch {
      return options
    }
  }
  return Object.entries(options).map(([key, value]) => `${key}: ${value}`).join(', ')
}

function handleSelfCheck() {
  emit('self-check', props.task.id)
}
</script>

<style scoped>
.task-item {
  margin-bottom: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.task-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  margin-bottom: 8px;
}

.task-header h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
  flex: 1;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.task-date {
  color: #667eea;
  font-size: 13px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-todo {
  background: #e0e0e0;
  color: #666;
}

.status-in_progress {
  background: #fff3cd;
  color: #856404;
}

.status-completed {
  background: #d4edda;
  color: #155724;
}

.task-description {
  margin-top: 8px;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.learning-materials {
  margin-top: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.material-item {
  margin-top: 5px;
}

.material-link {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
}

.material-link:hover {
  text-decoration: underline;
}

.task-items {
  margin-top: 10px;
  padding: 10px;
  background: #fff3cd;
  border-radius: 6px;
}

.task-item-question {
  margin-bottom: 10px;
  padding: 8px;
  background: white;
  border-radius: 4px;
  border-left: 3px solid #667eea;
}

.question-header {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.question-type {
  font-weight: 500;
}

.difficulty {
  color: #ffc107;
}

.correct-badge {
  margin-left: 8px;
  font-weight: 500;
}

.correct-badge.correct {
  color: #28a745;
}

.correct-badge.incorrect {
  color: #dc3545;
}

.question-content {
  font-size: 15px;
  margin-bottom: 4px;
}

.question-options {
  font-size: 13px;
  color: #666;
  margin-left: 10px;
}

.user-response {
  margin-top: 4px;
  font-size: 13px;
  color: #667eea;
}

.task-actions {
  margin-top: 12px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}
</style>

