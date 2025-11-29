<template>
  <div class="card">
    <h3 class="card-title">我的目标列表</h3>
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>
    <div v-else-if="goals.length === 0" class="empty-state">
      <div class="empty-state-icon">📋</div>
      <p>暂无目标，创建你的第一个目标吧！</p>
    </div>
    <div v-else class="goal-list">
      <GlareHover
        v-for="goal in goals" 
        :key="goal.id"
        glare-color="#667eea"
        :glare-opacity="0.2"
        class="goal-item-wrapper"
      >
        <div class="goal-item">
        <div class="goal-content">
          <h4 class="goal-title">{{ goal.title }}</h4>
          <div class="goal-meta">
            <span :class="['status-badge', `status-${goal.status}`]">
              {{ getStatusText(goal.status) }}
            </span>
            <span class="goal-date">
              {{ formatDate(goal.created_at) }}
            </span>
          </div>
        </div>
        <div class="goal-actions">
          <ClickRipple color="#667eea" :max-scale="3" class="btn-wrapper">
            <ClickSpark spark-color="#ffffff" :spark-count="16" :spark-radius="50" class="btn-spark">
          <button 
            class="btn btn-primary btn-sm"
            @click="$emit('view-plan', goal.id)"
          >
            查看计划
          </button>
            </ClickSpark>
          </ClickRipple>
          <ClickRipple 
            v-if="goal.status === 'active' || goal.status === 'in_progress'"
            color="#28a745" 
            :max-scale="3"
            class="btn-wrapper"
          >
            <ClickSpark spark-color="#ffffff" :spark-count="16" :spark-radius="50" class="btn-spark">
              <button 
                class="btn btn-success btn-sm"
                @click="handleAdventure(goal.id)"
          >
            🎮 开始冒险
          </button>
            </ClickSpark>
          </ClickRipple>
          <ClickRipple color="#dc3545" :max-scale="3" class="btn-wrapper">
            <ClickSpark spark-color="#ffffff" :spark-count="16" :spark-radius="50" class="btn-spark">
          <button 
            class="btn btn-danger btn-sm"
            @click="handleDelete(goal.id, goal.title)"
          >
            删除
          </button>
            </ClickSpark>
          </ClickRipple>
        </div>
      </div>
      </GlareHover>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import GlareHover from '@/components/animations/GlareHover.vue'
import ClickSpark from '@/components/animations/ClickSpark.vue'
import ClickRipple from '@/components/animations/ClickRipple.vue'

const router = useRouter()

const props = defineProps({
  goals: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['view-plan', 'delete-goal', 'refresh'])

function handleAdventure(goalId) {
  router.push(`/adventure/${goalId}`)
}

function getStatusText(status) {
  const statusMap = {
    'pending': '待处理',
    'in_progress': '进行中',
    'active': '进行中',
    'completed': '已完成',
    'failed': '失败'
  }
  return statusMap[status] || status
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

async function handleDelete(goalId, goalTitle) {
  if (!confirm(`确定要删除目标"${goalTitle}"吗？\n\n删除后，相关的计划、进度和更新信息都将被永久删除，此操作不可恢复。`)) {
    return
  }

  try {
    const response = await api.delete(`/goals/${goalId}`)
    if (response.ok) {
      emit('delete-goal', goalId)
      emit('refresh')
    } else {
      alert(response.data.message || '删除失败')
    }
  } catch (error) {
    console.error('删除目标失败:', error)
    alert('网络错误，请重试')
  }
}
</script>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(50px) saturate(200%);
  -webkit-backdrop-filter: blur(50px) saturate(200%);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.6);
  position: relative;
  z-index: 1;
}

.goal-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.goal-item-wrapper {
  width: 100%;
  border-radius: 8px;
}

.goal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(248, 249, 250, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  transition: all 0.3s;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.goal-item:hover {
  background: rgba(233, 236, 239, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
}

.goal-content {
  flex: 1;
}

.goal-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.goal-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending,
.status-in_progress,
.status-active {
  background: #d4edda;
  color: #155724;
}

.status-completed {
  background: #cce5ff;
  color: #004085;
}

.status-failed {
  background: #f8d7da;
  color: #721c24;
}

.goal-date {
  color: #999;
  font-size: 12px;
}

.goal-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-wrapper {
  display: inline-block;
  position: relative;
}

.btn-spark {
  width: 100%;
  height: 100%;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}
</style>

