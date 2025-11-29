<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">
        📬 消息更新
        <span v-if="unreadCount > 0" class="badge">
          <CountUp :to="unreadCount" :duration="1" />
        </span>
      </h3>
      <div class="header-actions">
        <ClickSpark 
          v-if="unreadCount > 0" 
          spark-color="#28a745" 
          :spark-count="8"
          class="action-btn-wrapper"
        >
          <button 
            class="action-btn" 
            @click="markAllAsRead" 
            title="全部标记为已读"
          >
            ✓
          </button>
        </ClickSpark>
        <ClickSpark 
          spark-color="#667eea" 
          :spark-count="8"
          class="refresh-btn-wrapper"
        >
          <button class="refresh-btn" @click="debouncedLoadUpdates" :disabled="loading" title="刷新">
            <span :class="{ 'spinning': loading }">🔄</span>
          </button>
        </ClickSpark>
      </div>
    </div>
    
    <!-- 搜索和筛选 -->
    <div v-if="updates.length > 0" class="filter-bar">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="搜索通知..."
      />
      <select v-model="filterSource" class="filter-select">
        <option value="">全部来源</option>
        <option value="规划系统">规划系统</option>
        <option value="自检系统">自检系统</option>
        <option value="系统">系统</option>
      </select>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
      <ClickSpark spark-color="#667eea" :spark-count="8" class="retry-btn-wrapper">
        <button @click="loadUpdates" class="retry-btn">重试</button>
      </ClickSpark>
    </div>
    
    <!-- 骨架屏加载 -->
    <div v-else-if="loading && updates.length === 0" class="loading">
      <div class="skeleton-list">
        <div v-for="i in 3" :key="i" class="skeleton-item">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-text"></div>
        </div>
      </div>
    </div>
    
    <div v-else-if="filteredUpdates.length === 0" class="empty-state">
      <div class="empty-state-icon">📭</div>
      <p>{{ searchQuery || filterSource ? '没有匹配的通知' : '暂无新消息' }}</p>
    </div>
    
    <div v-else class="updates-list">
      <TransitionGroup name="list" tag="div">
        <ClickSpark
          v-for="update in filteredUpdates"
          :key="update.id"
          spark-color="#667eea"
          :spark-count="8"
          class="update-item-wrapper"
        >
          <div
            class="update-item"
            :class="{ 'unread': !update.is_read, 'expanded': expandedItems.has(update.id) }"
          >
            <div class="update-content" @click="handleUpdateClick(update)">
              <div class="update-header">
                <div class="update-source-group">
                  <span class="update-source">{{ update.source || '系统' }}</span>
                  <span v-if="update.goal_title" class="update-goal">{{ update.goal_title }}</span>
                </div>
                <span class="update-time">{{ formatTime(update.created_at) }}</span>
              </div>
              <div 
                class="update-summary"
                :class="{ 'truncated': !expandedItems.has(update.id) && update.summary.length > 100 }"
              >
                {{ update.summary }}
              </div>
            </div>
            <div v-if="update.summary.length > 100" class="update-actions">
              <ClickSpark 
                spark-color="#667eea" 
                :spark-count="6"
                class="expand-btn-wrapper"
              >
                <button 
                  class="expand-btn"
                  @click.stop="toggleExpand(update.id)"
                >
                  {{ expandedItems.has(update.id) ? '收起' : '展开' }}
                </button>
              </ClickSpark>
            </div>
          </div>
        </ClickSpark>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import CountUp from '@/components/animations/CountUp.vue'
import ClickSpark from '@/components/animations/ClickSpark.vue'

const router = useRouter()

const updates = ref([])
const loading = ref(false)
const intervalId = ref(null)
const error = ref('')
const searchQuery = ref('')
const filterSource = ref('')
const expandedItems = ref(new Set())

// 计算未读数量
const unreadCount = computed(() => {
  return updates.value.filter(u => !u.is_read).length
})

// 过滤后的通知列表
const filteredUpdates = computed(() => {
  let result = updates.value
  
  // 按来源筛选
  if (filterSource.value) {
    result = result.filter(u => u.source === filterSource.value)
  }
  
  // 按搜索关键词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(u => 
      u.summary?.toLowerCase().includes(query) ||
      u.goal_title?.toLowerCase().includes(query) ||
      u.source?.toLowerCase().includes(query)
    )
  }
  
  return result
})

// 防抖函数
let debounceTimer = null
function debouncedLoadUpdates() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    loadUpdates()
  }, 300)
}

onMounted(async () => {
  await loadUpdates()
  startPolling()
  
  // 监听页面可见性变化，页面重新可见时立即刷新
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  stopPolling()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})

function handleVisibilityChange() {
  if (!document.hidden) {
    // 页面重新可见时立即刷新
    loadUpdates()
  }
}

async function loadUpdates() {
  loading.value = true
  error.value = ''
  try {
    // 使用统一API，一次性获取所有通知（避免N+1查询）
    const response = await api.get('/updates/all')
    if (Array.isArray(response.data)) {
      updates.value = response.data
    } else {
      updates.value = []
    }
  } catch (err) {
    console.error('加载消息失败:', err)
    error.value = '加载消息失败，请稍后重试'
    updates.value = []
  } finally {
    loading.value = false
  }
}

function toggleExpand(updateId) {
  if (expandedItems.value.has(updateId)) {
    expandedItems.value.delete(updateId)
  } else {
    expandedItems.value.add(updateId)
  }
}

async function markAllAsRead() {
  const unreadUpdates = updates.value.filter(u => !u.is_read)
  if (unreadUpdates.length === 0) return
  
  if (!confirm(`确定要将 ${unreadUpdates.length} 条通知全部标记为已读吗？`)) {
    return
  }
  
  try {
    // 批量标记为已读
    const promises = unreadUpdates.map(update => 
      api.post(`/notifications/${update.id}/read`, { type: 'info_update' }).catch(() => null)
    )
    await Promise.all(promises)
    
    // 更新本地状态
    updates.value.forEach(update => {
      if (!update.is_read) {
        update.is_read = true
      }
    })
  } catch (error) {
    console.error('批量标记已读失败:', error)
    alert('批量标记已读失败，请重试')
  }
}

function startPolling() {
  // 每30秒轮询一次（如果页面可见）
  intervalId.value = setInterval(() => {
    // 只在页面可见时轮询，节省资源
    if (!document.hidden && !loading.value) {
      loadUpdates()
    }
  }, 30000)
}

function stopPolling() {
  if (intervalId.value) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
}

function formatTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

async function handleUpdateClick(update) {
  // 标记为已读（如果还未读）
  if (!update.is_read && update.id) {
    try {
      await api.post(`/notifications/${update.id}/read`, { type: 'info_update' })
      update.is_read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (error) {
      console.error('标记已读失败:', error)
      // 即使标记失败，也继续跳转
    }
  }
  
  // 跳转
  if (update.link) {
    // 如果是相对路径，使用router导航
    if (update.link.startsWith('/')) {
      router.push(update.link)
    } else {
      // 如果是完整URL，在新窗口打开
      window.open(update.link, '_blank')
    }
  } else if (update.goal_id) {
    // 如果没有link但有goal_id，跳转到目标详情
    router.push(`/adventure/${update.goal_id}`)
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  background: #dc3545;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

.refresh-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  background: #f0f0f0;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinning {
  display: inline-block;
  animation: spin 1s linear infinite;
}

.error-message {
  padding: 12px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 6px;
  color: #856404;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.retry-btn {
  padding: 4px 12px;
  background: #ffc107;
  color: #333;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
}

.retry-btn:hover {
  background: #ffb300;
}

.loading {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #e0e0e0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-state-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.updates-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 4px;
}

/* 自定义滚动条样式 */
.updates-list::-webkit-scrollbar {
  width: 6px;
}

.updates-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.updates-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.updates-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.update-item-wrapper {
  width: 100%;
}

.update-item {
  padding: 12px;
  background: rgba(248, 249, 250, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  border-left: 3px solid #667eea;
  transition: all 0.3s;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.update-content {
  cursor: pointer;
  flex: 1;
}

.update-item.unread {
  background: rgba(255, 243, 205, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-left-color: #ffc107;
  font-weight: 500;
}

.update-item.unread::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: #ffc107;
  border-radius: 50%;
}

.update-content:hover {
  opacity: 0.9;
}

.update-item:hover {
  background: rgba(233, 236, 239, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
}

.update-item.unread:hover {
  background: rgba(255, 230, 156, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.update-summary.truncated {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.update-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.expand-btn {
  background: none;
  border: none;
  color: #667eea;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.expand-btn:hover {
  background: rgba(102, 126, 234, 0.1);
}

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  gap: 8px;
}

.update-source-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.update-source {
  font-size: 12px;
  font-weight: 600;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
  width: fit-content;
}

.update-goal {
  font-size: 11px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.update-time {
  font-size: 11px;
  color: #999;
}

.update-summary {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-btn-wrapper,
.refresh-btn-wrapper,
.retry-btn-wrapper,
.expand-btn-wrapper {
  display: inline-block;
}

.action-btn {
  background: #28a745;
  color: white;
  border: none;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
}

.action-btn:hover {
  background: #218838;
  transform: translateY(-1px);
}

/* 骨架屏 */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.skeleton-line {
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-title {
  width: 60%;
}

.skeleton-text {
  width: 100%;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 列表过渡动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>

