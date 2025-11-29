<template>
  <div class="calendar-view-container">
    <Header @logout="handleLogout" :hide-focus-mode="true" />
    
    <div class="calendar-content">
      <!-- 顶部信息栏 -->
      <div class="calendar-header">
        <div class="header-info">
          <h2>{{ goalTitle || '日历视图' }}</h2>
          <div class="header-stats">
            <span>总任务: {{ statistics.total_tasks || 0 }}</span>
            <span>已完成: {{ statistics.completed_tasks || 0 }}</span>
            <span v-if="statistics.overdue_tasks > 0" class="overdue-count">
              逾期: {{ statistics.overdue_tasks }}
            </span>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-outline" @click="goBack">
            ← 返回计划视图
          </button>
          <button 
            class="btn-focus-mode" 
            :class="{ active: focusMode }"
            @click="toggleFocusMode"
          >
            {{ focusMode ? '退出专注' : '专注模式' }}
          </button>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>加载日历数据中...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
        <button @click="loadCalendarTasks" class="btn-retry">重试</button>
      </div>
      
      <!-- 日历主体 -->
      <div v-else>
        <!-- 专注模式：左右布局（左边计时器，右边任务列表） -->
        <div v-if="focusMode" class="focus-mode-layout">
          <!-- 左侧：计时器 -->
          <div class="timer-section">
            <StudyTimer
              :task-id="currentTask ? currentTask.id : null"
              :task-title="currentTask ? currentTask.title : '学习计时'"
              :goal-id="goalId"
              @timer-complete="handleTimerComplete"
            />
          </div>
          
          <!-- 右侧：任务列表 -->
          <div class="tasks-section">
            <!-- 选中日期头部 -->
            <div class="selected-date-header">
              <h3>{{ formatSelectedDate(selectedDate) }}</h3>
              <span class="task-count-badge">{{ selectedDateTasks.length }} 个任务</span>
            </div>
            
            <div class="task-list">
            <!-- 锁定提示 -->
            <div v-if="!isSelectedDateUnlocked && selectedDateTasks.length > 0" class="locked-warning">
              <p>🔒 请先完成前一天的所有任务才能进行今天的任务</p>
            </div>
            
            <div v-if="selectedDateTasks.length === 0" class="empty-tasks">
              <p>这一天没有任务</p>
            </div>
            
            <div
              v-for="task in sortedTasks"
              :key="task.id"
              :class="['task-card', {
                'active': currentTaskId === task.id,
                'completed': task.status === 'done' || task.status === 'completed',
                'overdue': task.is_overdue,
                'high-priority': task.priority >= 50,
                'locked': !isSelectedDateUnlocked
              }]"
              @click="isSelectedDateUnlocked && selectTask(task)"
            >
              <div class="task-header">
                <input
                  type="checkbox"
                  :checked="task.status === 'done' || task.status === 'completed'"
                  @change="toggleTaskComplete(task, $event)"
                  @click.stop
                />
                <h4 class="task-title">{{ task.title }}</h4>
                <span v-if="task.is_overdue" class="overdue-badge">逾期</span>
                <span v-if="task.priority >= 50" class="priority-badge">高优先级</span>
              </div>
              
              <p v-if="task.description" class="task-description">{{ task.description }}</p>
              
              <div class="task-meta">
                <span class="task-stage">阶段{{ task.stage.order_index }}: {{ task.stage.name }}</span>
                <span class="task-node">{{ task.node.title }}</span>
              </div>
              
              <div class="task-stats">
                <span class="task-items">
                  {{ task.task_items.total }} 道题
                  <span v-if="task.task_items.answered > 0">
                    (已完成 {{ task.task_items.answered }}/{{ task.task_items.total }})
                  </span>
                </span>
                <span v-if="task.task_items.completion_rate > 0" class="completion-rate">
                  完成率: {{ task.task_items.completion_rate }}%
                </span>
              </div>
              
              <div class="task-actions">
                <button
                  v-if="isSelectedDateUnlocked"
                  @click.stop="startSelfCheck(task)"
                  class="btn-task-action"
                  :class="{ 'completed': task.status === 'done' || task.status === 'completed' }"
                >
                  {{ task.status === 'done' || task.status === 'completed' ? '重新挑战' : '开始学习' }}
                </button>
                <button
                  v-if="task.status === 'done' || task.status === 'completed'"
                  @click.stop="viewTaskHistory(task)"
                  class="btn-task-action completed"
                >
                  查看记录
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
        
        <!-- 非专注模式：日历 + 任务列表 -->
        <div v-if="!focusMode" class="calendar-layout">
          <!-- 左侧：日历 -->
          <div class="calendar-section">
            <div class="calendar-wrapper">
              <!-- 月份导航 -->
              <div class="calendar-nav">
                <button @click="prevMonth" class="nav-btn">‹</button>
                <h3 class="month-title">{{ currentMonthText }}</h3>
                <button @click="nextMonth" class="nav-btn">›</button>
              </div>
              
              <!-- 星期标题 -->
              <div class="calendar-weekdays">
                <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
              </div>
              
              <!-- 日期网格 -->
              <div class="calendar-grid">
                <div
                  v-for="(date, index) in calendarDays"
                  :key="date ? date.key : `empty-${index}`"
                  :class="['calendar-day', {
                    'empty': !date,
                    'today': date && date.isToday,
                    'selected': date && date.isSelected,
                    'has-tasks': date && date.taskCount > 0,
                    'other-month': date && !date.isCurrentMonth,
                    'overdue': date && date.hasOverdue,
                    'completed': date && date.isCompleted,
                    'locked': date && !date.isUnlocked
                  }]"
                  @click="date && date.isUnlocked && selectDate(date.date)"
                >
                  <div v-if="date" class="day-number">
                    {{ date.day }}
                    <span v-if="!date.isUnlocked" class="lock-icon">🔒</span>
                  </div>
                  <div v-if="date && date.taskCount > 0" class="task-indicator">
                    <span class="task-count">{{ date.taskCount }}</span>
                    <span v-if="date.completedCount > 0" class="completed-dot"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 右侧：任务列表 -->
          <div class="tasks-section">
            <!-- 选中日期头部 -->
            <div class="selected-date-header">
              <h3>{{ formatSelectedDate(selectedDate) }}</h3>
              <span class="task-count-badge">{{ selectedDateTasks.length }} 个任务</span>
            </div>
            
            <div class="task-list">
            <!-- 锁定提示 -->
            <div v-if="!isSelectedDateUnlocked && selectedDateTasks.length > 0" class="locked-warning">
              <p>🔒 请先完成前一天的所有任务才能进行今天的任务</p>
            </div>
            
            <div v-if="selectedDateTasks.length === 0" class="empty-tasks">
              <p>这一天没有任务</p>
            </div>
            
            <div
              v-for="task in sortedTasks"
              :key="task.id"
              :class="['task-card', {
                'active': currentTaskId === task.id,
                'completed': task.status === 'done' || task.status === 'completed',
                'overdue': task.is_overdue,
                'high-priority': task.priority >= 50,
                'locked': !isSelectedDateUnlocked
              }]"
              @click="isSelectedDateUnlocked && selectTask(task)"
            >
              <div class="task-header">
                <input
                  type="checkbox"
                  :checked="task.status === 'done' || task.status === 'completed'"
                  @change="toggleTaskComplete(task, $event)"
                  @click.stop
                />
                <h4 class="task-title">{{ task.title }}</h4>
                <span v-if="task.is_overdue" class="overdue-badge">逾期</span>
                <span v-if="task.priority >= 50" class="priority-badge">高优先级</span>
              </div>
              
              <p v-if="task.description" class="task-description">{{ task.description }}</p>
              
              <div class="task-meta">
                <span class="task-stage">阶段{{ task.stage.order_index }}: {{ task.stage.name }}</span>
                <span class="task-node">{{ task.node.title }}</span>
              </div>
              
              <div class="task-stats">
                <span class="task-items">
                  {{ task.task_items.total }} 道题
                  <span v-if="task.task_items.answered > 0">
                    (已完成 {{ task.task_items.answered }}/{{ task.task_items.total }})
                  </span>
                </span>
                <span v-if="task.task_items.completion_rate > 0" class="completion-rate">
                  完成率: {{ task.task_items.completion_rate }}%
                </span>
              </div>
              
              <div class="task-actions">
                <button
                  v-if="isSelectedDateUnlocked"
                  @click.stop="startSelfCheck(task)"
                  class="btn-task-action"
                  :class="{ 'completed': task.status === 'done' || task.status === 'completed' }"
                >
                  {{ task.status === 'done' || task.status === 'completed' ? '重新挑战' : '开始学习' }}
                </button>
                <button
                  v-if="task.status === 'done' || task.status === 'completed'"
                  @click.stop="viewTaskHistory(task)"
                  class="btn-task-action completed"
                >
                  查看记录
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 自检模态框 -->
    <SelfCheckModal
      v-if="goalId && goalId > 0"
      :show="showSelfCheck"
      :task-id="selectedTaskId"
      :goal-id="goalId"
      @close="showSelfCheck = false"
      @submitted="handleSelfCheckSubmitted"
      @evaluated="handleSelfCheckEvaluated"
    />
    
    <!-- 自检历史模态框 -->
    <SelfCheckHistoryModal
      v-if="goalId && goalId > 0"
      :show="showHistoryModal"
      :goal-id="goalId"
      :task-id="historyTaskId"
      :task-title="historyTaskTitle"
      @close="closeHistoryModal"
    />
    
    <!-- Toast 提示 -->
    <div class="toast-container" v-if="toasts.length">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-item"
        :class="toast.type"
      >
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Header from '@/components/Header.vue'
import SelfCheckModal from '@/components/SelfCheckModal.vue'
import SelfCheckHistoryModal from '@/components/SelfCheckHistoryModal.vue'
import StudyTimer from '@/components/StudyTimer.vue'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 数据
const goalId = ref(null)
const goalTitle = ref('')
const tasksByDate = ref({})
const planStartDate = ref(null)
const loading = ref(true)
const error = ref('')
const statistics = ref({})

// UI状态
// 初始化当前月份（存储当前要显示的月份，而不是起始日期）
const now = new Date()
const currentMonth = ref(new Date(now.getFullYear(), now.getMonth(), 1)) // 存储当前月份的第一天

// 使用本地时间格式化日期字符串，避免时区问题
function formatDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const selectedDate = ref(formatDateString(new Date())) // YYYY-MM-DD
const currentTaskId = ref(null)
const currentTask = ref(null)
const showSelfCheck = ref(false)
const selectedTaskId = ref(null)
const showHistoryModal = ref(false)
const historyTaskId = ref(null)
const historyTaskTitle = ref('')
const focusMode = ref(false)
const toasts = ref([])

// 星期标题
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

// 计算属性
const currentMonthText = computed(() => {
  // 显示当前月份
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth() + 1
  return `${year}年${month}月`
})

// 检查前一天的所有任务是否完成
function isPreviousDayCompleted(dateStr) {
  if (!dateStr) return false
  
  // 获取前一天的日期
  const date = new Date(dateStr)
  date.setDate(date.getDate() - 1)
  const prevDateStr = formatDateString(date)
  
  // 获取前一天的任务
  const prevTasks = tasksByDate.value[prevDateStr] || []
  
  // 如果前一天没有任务，视为已完成（允许进入下一天）
  if (prevTasks.length === 0) return true
  
  // 检查前一天的所有任务是否都完成
  return prevTasks.every(task => {
    const status = task.status
    return status === 'done' || status === 'completed'
  })
}

// 检查日期是否可解锁（前一天已完成）
function isDateUnlocked(dateStr) {
  if (!dateStr) return false
  
  // 获取所有有任务的日期，按日期排序
  const allDates = Object.keys(tasksByDate.value).sort()
  
  // 如果这是第一个有任务的日期，直接解锁
  if (allDates.length > 0 && dateStr === allDates[0]) {
    return true
  }
  
  // 否则检查前一天是否完成
  return isPreviousDayCompleted(dateStr)
}

const calendarDays = computed(() => {
  // 只显示当前月的天数，其他格子留空
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  
  // 获取当月第一天和最后一天
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const lastDayDate = lastDay.getDate()
  
  // 获取第一天是星期几（0=周日）
  const firstDayWeek = firstDay.getDay()
  
  // 创建42个格子的数组（6行×7列）
  const days = new Array(42).fill(null)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // 填充当前月的所有天
  for (let day = 1; day <= lastDayDate; day++) {
    const date = new Date(year, month, day)
    const yearStr = date.getFullYear()
    const monthStr = String(date.getMonth() + 1).padStart(2, '0')
    const dayStr = String(date.getDate()).padStart(2, '0')
    const dateStr = `${yearStr}-${monthStr}-${dayStr}`
    const dateOnly = new Date(dateStr)
    dateOnly.setHours(0, 0, 0, 0)
    
    const tasks = tasksByDate.value[dateStr] || []
    const overdueTasks = tasks.filter(t => t.is_overdue && t.status !== 'done' && t.status !== 'completed')
    
    // 检查该日期是否解锁（前一天是否完成）
    const unlocked = isDateUnlocked(dateStr)
    
    // 计算在42格数组中的位置：firstDayWeek + (day - 1)
    const index = firstDayWeek + (day - 1)
    
    days[index] = {
      key: `current-${dateStr}`,
      date: dateStr,
      day: day,
      isCurrentMonth: true,
      isToday: dateOnly.getTime() === today.getTime(),
      isSelected: dateStr === selectedDate.value,
      taskCount: tasks.length,
      completedCount: tasks.filter(t => t.status === 'done' || t.status !== 'completed').length,
      hasOverdue: overdueTasks.length > 0,
      isCompleted: tasks.length > 0 && tasks.every(t => t.status === 'done' || t.status === 'completed'),
      isUnlocked: unlocked // 新增：是否解锁
    }
  }
  
  return days
})
const selectedDateTasks = computed(() => {
  return tasksByDate.value[selectedDate.value] || []
})

const sortedTasks = computed(() => {
  return [...selectedDateTasks.value].sort((a, b) => {
    // 先按优先级排序（高优先级在前）
    if (a.priority !== b.priority) {
      return b.priority - a.priority
    }
    // 再按day_offset排序
    return a.day_offset - b.day_offset
  })
})

// 检查当前选中的日期是否解锁
const isSelectedDateUnlocked = computed(() => {
  return isDateUnlocked(selectedDate.value)
})

// 生命周期
onMounted(() => {
  const paramGoalId = route.params.goalId
  if (!paramGoalId) {
    error.value = '无效的目标ID'
    loading.value = false
    return
  }
  
  const parsedId = parseInt(paramGoalId)
  if (isNaN(parsedId) || parsedId <= 0) {
    error.value = '无效的目标ID格式'
    loading.value = false
    return
  }
  
  goalId.value = parsedId
  loadCalendarTasks()
})

// 方法
async function loadCalendarTasks() {
  if (!goalId.value || goalId.value <= 0) {
    error.value = '无效的目标ID'
    loading.value = false
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await api.get(`/goals/${goalId.value}/calendar`)
    const data = response.data
    
    if (data) {
      tasksByDate.value = data.tasks_by_date || {}
      planStartDate.value = data.start_date
      statistics.value = data.statistics || {}
      
      // 获取目标标题
      if (data.start_date) {
        goalTitle.value = `日历视图 - ${new Date(data.start_date).getFullYear()}年`
      }
      
      // 如果当前选中的日期没有任务，选择今天或第一个有任务的日期
      if (!tasksByDate.value[selectedDate.value] || tasksByDate.value[selectedDate.value].length === 0) {
        const today = formatDateString(new Date())
        if (tasksByDate.value[today] && tasksByDate.value[today].length > 0) {
          selectedDate.value = today
        } else {
          // 选择第一个有任务的日期
          const datesWithTasks = Object.keys(tasksByDate.value).sort()
          if (datesWithTasks.length > 0) {
            selectedDate.value = datesWithTasks[0]
          }
        }
      }
    }
  } catch (err) {
    console.error('加载日历任务失败:', err)
    if (err.response) {
      if (err.response.status === 404) {
        error.value = '目标或计划不存在'
      } else {
        error.value = err.response.data?.message || `加载失败 (${err.response.status})`
      }
    } else {
      error.value = '网络错误，无法连接到服务器'
    }
  } finally {
    loading.value = false
  }
}

function prevMonth() {
  // 标准日历翻页：切换到上一个月的第一天
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  
  // 处理跨年情况
  if (month === 0) {
    // 当前是1月，切换到上一年的12月
    currentMonth.value = new Date(year - 1, 11, 1)
  } else {
    // 正常切换到上一个月
    currentMonth.value = new Date(year, month - 1, 1)
  }
}

function nextMonth() {
  // 标准日历翻页：切换到下一个月的第一天
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  
  // 处理跨年情况
  if (month === 11) {
    // 当前是12月，切换到下一年的1月
    currentMonth.value = new Date(year + 1, 0, 1)
  } else {
    // 正常切换到下一个月
    currentMonth.value = new Date(year, month + 1, 1)
  }
}

function selectDate(dateStr) {
  if (!dateStr) return
  
  // 检查前一天是否完成（连续闯关模式）
  if (!isDateUnlocked(dateStr)) {
    // 获取前一天的日期
    const date = new Date(dateStr)
    date.setDate(date.getDate() - 1)
    const prevDateStr = formatDateString(date)
    
    // 获取前一天的任务
    const prevTasks = tasksByDate.value[prevDateStr] || []
    const incompleteTasks = prevTasks.filter(task => {
      const status = task.status
      return status !== 'done' && status !== 'completed'
    })
    
    if (incompleteTasks.length > 0) {
      showToast(`请先完成 ${prevDateStr} 的所有任务（还有 ${incompleteTasks.length} 个未完成）`, 'warning')
      return
    }
  }
  
  selectedDate.value = dateStr
  currentTaskId.value = null
  currentTask.value = null
}

function selectTask(task) {
  currentTaskId.value = task.id
  currentTask.value = task
}

function toggleTaskComplete(task, event) {
  const isChecked = event.target.checked
  const newStatus = isChecked ? 'done' : 'todo'
  
  // 这里可以调用API更新任务状态
  // 暂时只更新本地状态
  task.status = newStatus
  
  // 重新加载数据以同步状态
  loadCalendarTasks()
}

function startSelfCheck(task) {
  // 检查当前日期是否解锁
  if (!isSelectedDateUnlocked.value) {
    const date = new Date(selectedDate.value)
    date.setDate(date.getDate() - 1)
    const prevDateStr = formatDateString(date)
    showToast(`请先完成 ${prevDateStr} 的所有任务才能开始今天的任务`, 'warning')
    return
  }
  
  selectedTaskId.value = task.id
  showSelfCheck.value = true
}

function viewTaskHistory(task) {
  historyTaskId.value = task.id
  historyTaskTitle.value = task.title
  showHistoryModal.value = true
}

function closeHistoryModal() {
  showHistoryModal.value = false
}

function handleSelfCheckSubmitted(payload) {
  const title = payload?.taskTitle || '任务'
  showToast(`《${title}》已提交，AI 正在批改...`, 'info')
}

function handleSelfCheckEvaluated(result) {
  if (!result || result.error) {
    const message = result?.message || '提交失败，请稍后重试'
    showToast(`《${result?.taskTitle || '任务'}》${message}`, 'error')
    return
  }
  
  // 阶段1任务：只显示保存成功消息
  if (result.is_stage1) {
    const message = result.message || `《${result.taskTitle || '任务'}》信息已成功保存`
    showToast(message, 'success')
    loadCalendarTasks()
    return
  }
  
  // 非阶段1任务：显示打分结果
  const passed = !!result.is_passed
  const score = typeof result.score === 'number' ? Math.round(result.score) : (result?.score ?? '--')
  const message = passed
    ? `《${result.taskTitle || '任务'}》得分 ${score} 分，挑战已通过！`
    : `《${result.taskTitle || '任务'}》得分 ${score} 分，尚未达标，请继续加油～`
  showToast(message, passed ? 'success' : 'warning')
  loadCalendarTasks()
}

function handleTimerComplete(data) {
  showToast(`专注时间完成！已学习 ${data.duration} 分钟`, 'success')
  // 可以在这里更新学习时长到 user_daily_progress
}

function toggleFocusMode() {
  focusMode.value = !focusMode.value
  if (focusMode.value && currentTask.value) {
    // 进入专注模式时，自动选择第一个未完成的任务
    const firstIncompleteTask = sortedTasks.value.find(
      t => t.status !== 'done' && t.status !== 'completed'
    )
    if (firstIncompleteTask) {
      selectTask(firstIncompleteTask)
    }
  }
}

function formatSelectedDate(dateStr) {
  if (!dateStr) return '未选择日期'
  try {
    const date = new Date(dateStr)
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const weekday = weekdays[date.getDay()]
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekday}`
  } catch {
    return dateStr
  }
}

function showToast(message, type = 'info') {
  const id = Date.now() + Math.random()
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    const index = toasts.value.findIndex(item => item.id === id)
    if (index >= 0) {
      toasts.value.splice(index, 1)
    }
  }, 4500)
}

function goBack() {
  router.push(`/adventure/${goalId.value}`)
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.calendar-view-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 40px;
}

.calendar-content {
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
}

/* 顶部信息栏 */
.calendar-header {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #333;
}

.header-stats {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #666;
}

.overdue-count {
  color: #e74c3c;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-outline {
  background: transparent;
  border: 1px solid #667eea;
  color: #667eea;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-outline:hover {
  background: #667eea;
  color: #fff;
}

.btn-focus-mode {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-focus-mode.active {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

/* 加载和错误状态 */
.loading-container,
.error-container {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  color: #666;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e0e0e0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-retry {
  margin-top: 20px;
  padding: 10px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

/* 日历布局 */
.calendar-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 1200px) {
  .calendar-layout {
    grid-template-columns: 1fr;
  }
}

.calendar-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.calendar-section.focus-mode-hidden {
  display: none;
}

/* 日历导航 */
.calendar-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.nav-btn {
  background: #f0f0f0;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: #667eea;
  color: white;
}

.month-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

/* 星期标题 */
.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-weight: 600;
  color: #667eea;
  padding: 8px;
  font-size: 14px;
}

/* 日期网格 */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.calendar-day:hover {
  background: #e9ecef;
  transform: scale(1.05);
}

.calendar-day.today {
  background: #667eea;
  color: white;
  font-weight: 600;
}

.calendar-day.selected {
  background: #764ba2;
  color: white;
  font-weight: 600;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
}

.calendar-day.has-tasks {
  border: 2px solid #667eea;
}

.calendar-day.overdue {
  border-color: #e74c3c;
  background: #ffe6e6;
}

.calendar-day.completed {
  background: #d4edda;
}

.calendar-day.other-month {
  opacity: 0.4;
}

.calendar-day.empty {
  background: transparent;
  cursor: default;
  border: none;
}

.calendar-day.empty:hover {
  background: transparent;
  transform: none;
}

.calendar-day.locked {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f0f0f0;
  position: relative;
}

.calendar-day.locked:hover {
  background: #f0f0f0;
  transform: none;
}

.lock-icon {
  font-size: 10px;
  margin-left: 2px;
  vertical-align: middle;
}

.day-number {
  font-size: 16px;
  font-weight: 500;
}

.task-indicator {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.task-count {
  font-size: 11px;
  background: #667eea;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.calendar-day.today .task-count,
.calendar-day.selected .task-count {
  background: rgba(255, 255, 255, 0.3);
}

.completed-dot {
  width: 6px;
  height: 6px;
  background: #28a745;
  border-radius: 50%;
}

/* 任务列表区域 */
.tasks-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.selected-date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e0e0e0;
}

.selected-date-header h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.task-count-badge {
  background: #667eea;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
}

/* 专注模式布局：左右排列（左边计时器，右边任务列表） */
.focus-mode-layout {
  display: flex;
  gap: 24px;
  width: 100%;
  align-items: flex-start;
}

.focus-mode-layout .timer-section {
  flex: 0 0 50%; /* 左侧计时器占一半屏幕 */
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  height: fit-content;
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.focus-mode-layout .tasks-section {
  flex: 1; /* 右侧任务列表占据剩余空间 */
  min-width: 0; /* 允许缩小 */
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

/* 响应式设计：小屏幕时专注模式布局改为上下排列 */
@media (max-width: 1200px) {
  .focus-mode-layout {
    flex-direction: column;
  }
  
  .focus-mode-layout .timer-section {
    flex: 1;
    position: static;
    width: 100%;
  }
  
  .focus-mode-layout .tasks-section {
    max-height: none;
  }
}

/* 计时器区域（非专注模式，已废弃但保留以防万一） */
.timer-section {
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

/* 任务列表 */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-tasks {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.locked-warning {
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  text-align: center;
}

.locked-warning p {
  margin: 0;
  color: #856404;
  font-weight: 500;
}

.task-card.locked {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.task-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.task-card.active {
  border-left-color: #667eea;
  background: #f0f2ff;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.task-card.completed {
  border-left-color: #28a745;
  background: #f0f9f0;
  opacity: 0.8;
}

.task-card.overdue {
  border-left-color: #e74c3c;
  background: #ffe6e6;
}

.task-card.high-priority {
  border-left-width: 6px;
}

.task-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.task-header input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.task-title {
  flex: 1;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.overdue-badge {
  background: #e74c3c;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.priority-badge {
  background: #ffc107;
  color: #333;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.task-description {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.task-meta {
  display: flex;
  gap: 12px;
  margin: 8px 0;
  font-size: 12px;
  color: #999;
}

.task-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0;
  font-size: 13px;
  color: #666;
}

.completion-rate {
  color: #667eea;
  font-weight: 600;
}

.task-actions {
  margin-top: 12px;
}

.btn-task-action {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.btn-task-action:hover {
  background: #764ba2;
  transform: scale(1.05);
}

.btn-task-action.completed {
  background: #28a745;
}

/* Toast 提示 */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast-item {
  background: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 250px;
  animation: slideIn 0.3s ease;
}

.toast-item.success {
  border-left: 4px solid #28a745;
}

.toast-item.error {
  border-left: 4px solid #e74c3c;
}

.toast-item.warning {
  border-left: 4px solid #ffc107;
}

.toast-item.info {
  border-left: 4px solid #667eea;
}

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
</style>

