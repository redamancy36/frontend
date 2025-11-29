<template>
  <div class="debug-console">
    <Header @logout="handleLogout" />
    <div class="container">
      <h1>调试控制台</h1>
      <div class="debug-filters">
        <select v-model="selectedGoalId" @change="loadLogs">
          <option value="">所有目标</option>
          <option v-for="goal in goals" :key="goal.id" :value="goal.id">
            {{ goal.title }}
          </option>
        </select>
        <select v-model="selectedType" @change="loadLogs">
          <option value="">所有类型</option>
          <option value="agent">Agent</option>
          <option value="rag">RAG</option>
          <option value="llm">LLM</option>
          <option value="data">数据</option>
        </select>
      </div>
      
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>
      
      <div v-else class="logs-container">
        <div
          v-for="(log, index) in filteredLogs"
          :key="index"
          class="log-entry"
          :class="`log-${log.type || 'info'}`"
        >
          <div class="log-header">
            <span class="log-timestamp">{{ formatTime(log.timestamp) }}</span>
            <span class="log-type">{{ log.type || 'info' }}</span>
            <span class="log-agent">{{ log.agent || '' }}</span>
          </div>
          <div class="log-message">{{ log.message }}</div>
          <div v-if="log.data" class="log-data">
            <details>
              <summary>数据详情</summary>
              <pre>{{ JSON.stringify(log.data, null, 2) }}</pre>
            </details>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Header from '@/components/Header.vue'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const goals = ref([])
const logs = ref([])
const loading = ref(false)
const selectedGoalId = ref('')
const selectedType = ref('')

const filteredLogs = computed(() => {
  let result = logs.value
  
  if (selectedGoalId.value) {
    result = result.filter(log => log.goal_id === parseInt(selectedGoalId.value))
  }
  
  if (selectedType.value) {
    result = result.filter(log => log.type === selectedType.value)
  }
  
  return result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
})

onMounted(async () => {
  await authStore.checkAuth()
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  await loadGoals()
  await loadLogs()
})

async function loadGoals() {
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
  }
}

async function loadLogs() {
  loading.value = true
  try {
    const url = selectedGoalId.value
      ? `/debug/goals/${selectedGoalId.value}/logs`
      : '/debug/logs'
    const response = await api.get(url)
    if (response.data) {
      logs.value = response.data.logs || []
    }
  } catch (error) {
    console.error('加载日志失败:', error)
  } finally {
    loading.value = false
  }
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleString('zh-CN')
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.debug-console {
  min-height: 100vh;
}

.debug-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.debug-filters select {
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
}

.logs-container {
  max-height: 70vh;
  overflow-y: auto;
}

.log-entry {
  padding: 15px;
  margin-bottom: 10px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.log-header {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
}

.log-timestamp {
  color: #999;
}

.log-type {
  padding: 2px 8px;
  background: #667eea;
  color: white;
  border-radius: 4px;
  font-size: 11px;
}

.log-agent {
  color: #667eea;
  font-weight: 500;
}

.log-message {
  color: #333;
  line-height: 1.6;
}

.log-data {
  margin-top: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.log-data pre {
  margin: 0;
  font-size: 12px;
  overflow-x: auto;
}
</style>

