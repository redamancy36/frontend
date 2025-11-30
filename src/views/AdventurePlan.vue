<template>
  <div class="adventure-plan-container">
    <Header @logout="handleLogout" :hide-focus-mode="true" />
    
    <div class="adventure-content">
      <!-- 顶部进度条 -->
      <div class="progress-header">
        <div class="progress-info">
          <h2>{{ goalTitle || '冒险之旅' }}</h2>
          <div class="progress-stats">
            <span>已完成: {{ completedTasks }}/{{ totalTasks }}</span>
            <span class="progress-percent">{{ progressPercent }}%</span>
          </div>
        </div>
        <div class="progress-actions">
          <button class="btn-outline" @click="openProfileModal">
            查看用户画像
          </button>
          <button class="btn-outline btn-calendar" @click="switchToCalendar">
            📅 日历模式
          </button>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>
      
      <!-- 消息提示 -->
      <div v-if="!loading && !error && infoUpdates.length" class="updates-panel">
        <div class="updates-header">
          <h3>最新消息</h3>
          <button class="btn-link" @click="loadUpdates">刷新</button>
        </div>
        <div class="updates-list">
          <div
            v-for="update in infoUpdates.slice(0, 5)"
            :key="update.id"
            class="update-item"
            @click="navigateToUpdate(update)"
          >
            <div class="update-summary">{{ update.summary }}</div>
            <div class="update-time">{{ formatDate(update.created_at) }}</div>
          </div>
        </div>
      </div>

      <!-- 返回按钮 -->
      <div class="back-button">
        <button @click="goBack" class="btn-back">← 返回目标列表</button>
        <button @click="showFeedbackModal = true" class="btn-feedback">
          💬 计划反馈
        </button>
        <button @click="showPlanHistoryModal = true" class="btn-history">
          📜 修改历史
        </button>
      </div>

      <!-- 标签页切换 -->
      <div class="tabs-container">
        <button 
          :class="['tab-button', { active: activeTab === 'plan' }]"
          @click="activeTab = 'plan'"
        >
          📋 学习计划
        </button>
        <button 
          :class="['tab-button', { active: activeTab === 'materials' }]"
          @click="activeTab = 'materials'"
        >
          📚 资料库
        </button>
      </div>

      <!-- 资料库视图 -->
      <div v-if="activeTab === 'materials'" class="materials-tab-content">
        <MaterialPool ref="materialPoolRef" :goal-id="goalId" @uploaded="handleMaterialUploaded" />
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>加载冒险地图中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
        <button @click="loadPlan" class="btn-retry">重试</button>
      </div>

      <!-- 计划视图 -->
      <div v-else-if="plan && activeTab === 'plan'" class="adventure-map">
        <!-- 起点 -->
        <div class="start-point">
          <div class="point-icon">🚀</div>
          <div class="point-label">起点</div>
        </div>

        <!-- 阶段列表 -->
        <div class="stages-container">
          <div
            v-for="(stage, stageIndex) in plan.stages"
            :key="stage.id || stageIndex"
            class="stage-section"
            :class="{ 'expanded': expandedStages.has(stage.id || stageIndex) }"
          >
            <!-- 阶段标题（可点击展开/折叠） -->
            <div
              class="stage-header"
              @click="toggleStage(stage.id || stageIndex)"
            >
              <div class="stage-info">
                <span class="stage-number">阶段 {{ stage.order_index || stageIndex + 1 }}</span>
                <h3 class="stage-title">{{ stage.name }}</h3>
                <span class="stage-progress">
                  <span v-if="isStageGenerating(stage)" class="generating-indicator">
                    <span class="spinner-small"></span>
                    正在生成任务...
                  </span>
                  <span v-else>
                    {{ getStageProgress(stage) }}/{{ getStageTotalTasks(stage) }} 完成
                  </span>
                </span>
              </div>
              <div class="stage-actions">
                <!-- 提交阶段报告按钮（所有阶段都可以手动提交，但只能提交一次） -->
                <div
                  v-if="stage.is_submitted"
                  class="stage-submitted"
                >
                  <span class="submitted-icon">✓</span>
                  <span>阶段报告已提交</span>
                  <span v-if="stage.submitted_at" class="submitted-time">
                    {{ formatDate(stage.submitted_at) }}
                  </span>
                </div>
                <button
                  v-else-if="isStageCompleted(stage) && !isStageAnalyzing(stage)"
                  @click.stop="completeStage(stage)"
                  class="btn-complete-stage"
                  :disabled="completingStages.has(stage.id || stageIndex)"
                >
                  {{ completingStages.has(stage.id || stageIndex) ? '处理中...' : '提交阶段报告' }}
                </button>
                <div
                  v-else-if="isStageAnalyzing(stage)"
                  class="stage-analyzing"
                >
                  <span class="spinner-small"></span>
                  <span>正在分析并生成下一阶段...</span>
                </div>
              </div>
              <div class="stage-toggle">
                <span v-if="expandedStages.has(stage.id || stageIndex)">▼</span>
                <span v-else>▶</span>
              </div>
            </div>
            
            <!-- 阶段概述highlight -->
            <div
              v-if="expandedStages.has(stage.id || stageIndex)"
              class="stage-highlight"
            >
              <div class="highlight-icon">💡</div>
              <div class="highlight-content">
                <strong class="highlight-title">阶段目标：</strong>
                <p class="highlight-description">{{ getStageObjective(stage) }}</p>
                <div v-if="getStageWarnings(stage)" class="stage-warning">
                  <strong>注意：</strong>
                  <p>{{ getStageWarnings(stage) }}</p>
                </div>
              </div>
            </div>

            <!-- 阶段内容（岛屿群） -->
            <div
              v-if="expandedStages.has(stage.id || stageIndex)"
              class="stage-content"
            >
              <div class="islands-container">
                <div
                  v-for="(node, nodeIndex) in stage.nodes"
                  :key="node.id || nodeIndex"
                  class="island-wrapper"
                  :class="{
                    'expanded': expandedNodes.has(node.id || nodeIndex),
                    'locked': !isNodeUnlocked(node, stage, stageIndex, nodeIndex),
                    'completed': isNodeCompleted(node)
                  }"
                >
                  <!-- 路线连接线 -->
                  <div
                    v-if="nodeIndex > 0"
                    class="connection-line"
                    :class="{ 'completed': isNodeCompleted(stage.nodes[nodeIndex - 1]) }"
                  ></div>

                  <!-- 岛屿卡片 -->
                  <div
                    class="island-card"
                    @click="toggleNode(node.id || nodeIndex)"
                  >
                    <div class="island-icon">
                      <span v-if="isNodeCompleted(node)">✅</span>
                      <span v-else-if="!isNodeUnlocked(node, stage, stageIndex, nodeIndex)">🔒</span>
                      <span v-else>{{ getNodeIcon(node.node_type) }}</span>
                    </div>
                    <div class="island-info">
                      <h4 class="island-title">{{ node.title }}</h4>
                      <p class="island-type">{{ getNodeTypeLabel(node.node_type) }}</p>
                      <div class="island-progress">
                        {{ getNodeProgress(node) }}/{{ getNodeTotalTasks(node) }} 关卡
                      </div>
                    </div>
                    <div class="island-toggle">
                      <span v-if="expandedNodes.has(node.id || nodeIndex)">▼</span>
                      <span v-else>▶</span>
                    </div>
                  </div>

                  <!-- 岛屿内容（关卡群或表单） -->
                  <div
                    v-if="expandedNodes.has(node.id || nodeIndex)"
                    class="island-content"
                  >
                    <!-- Decision类型节点：显示用户画像表单 -->
                    <div v-if="node.node_type === 'decision' && (!node.tasks || node.tasks.length === 0)" class="decision-form-container">
                      <UserProfileForm
                        :goal-id="goalId"
                        :node-id="node.id"
                        @submitted="handleProfileSubmitted"
                      />
                    </div>
                    
                    <!-- Study类型节点：显示任务列表 -->
                    <div v-else-if="node.tasks && node.tasks.length > 0" class="tasks-container">
                      <div
                        v-for="(task, taskIndex) in node.tasks"
                        :key="task.id || taskIndex"
                        class="task-card"
                        :class="{
                          'locked': !isTaskUnlocked(task, node, nodeIndex, taskIndex),
                          'completed': isTaskCompleted(task),
                          'active': isTaskActive(task),
                          'material-upload-task': isMaterialUploadTask(task) && !isTaskCompleted(task)
                        }"
                        @click="handleTaskClick(task)"
                      >
                        <div class="task-status-icon">
                          <span v-if="isTaskCompleted(task)">✓</span>
                          <span v-else-if="!isTaskUnlocked(task, node, nodeIndex, taskIndex)">🔒</span>
                          <span v-else>⚔️</span>
                        </div>
                        <div class="task-info">
                          <h5 class="task-title">{{ task.title }}</h5>
                          <p v-if="task.description" class="task-description">{{ task.description }}</p>
                          <div class="task-meta">
                            <span v-if="task.due_date" class="task-date">📅 {{ task.due_date }}</span>
                            <span class="task-items-count">
                              {{ task.task_items?.length || 0 }} 道题目
                            </span>
                          </div>
                          <div class="task-score-row" v-if="isFormTask(task) || task.is_stage1">
                            <span class="score-pill form" :class="{ passed: task.status === 'done' || isTaskCompleted(task) }">
                              {{ (task.status === 'done' || isTaskCompleted(task)) ? '信息已提交，正在用于画像构建' : '请先完成表单填写' }}
                            </span>
                          </div>
                          <div class="task-score-row" v-else-if="task.latest_submission">
                            <span class="score-pill" :class="{ passed: task.latest_submission.is_passed || task.has_passed_before, failed: !task.latest_submission.is_passed && !task.has_passed_before }">
                              最新 {{ Math.round(task.latest_submission.score || 0) }} 分 · {{ (task.latest_submission.is_passed || task.has_passed_before) ? '已通过' : '未达标' }}
                              <span v-if="task.has_passed_before && !task.latest_submission.is_passed" class="passed-badge">（曾通过）</span>
                            </span>
                            <span class="score-time">{{ formatDate(task.latest_submission.created_at) }}</span>
                          </div>
                          <div class="task-score-row pending" v-else>
                            尚未完成挑战
                          </div>
                        </div>
                        <div class="task-actions">
                          <!-- 资料上传任务：显示标记完成按钮 -->
                          <button
                            v-if="isMaterialUploadTask(task) && isTaskUnlocked(task, node, nodeIndex, taskIndex)"
                            @click.stop="markMaterialUploadTaskComplete(task)"
                            class="btn-task-action"
                            :class="{ 'completed': isTaskCompleted(task) }"
                            :disabled="isTaskCompleted(task)"
                          >
                            {{ isTaskCompleted(task) ? '已完成' : '标记任务完成' }}
                          </button>
                          <button
                            v-else-if="isFormTask(task) && isTaskUnlocked(task, node, nodeIndex, taskIndex)"
                            @click.stop="startSelfCheck(task)"
                            class="btn-task-action"
                            :class="{ 'completed': isTaskCompleted(task) }"
                          >
                            {{ isTaskCompleted(task) ? '重新填写' : '填写表单' }}
                          </button>
                          <button
                            v-else-if="!isFormTask(task) && isTaskUnlocked(task, node, nodeIndex, taskIndex)"
                            @click.stop="startSelfCheck(task)"
                            class="btn-task-action"
                            :class="{ 'completed': isTaskCompleted(task) }"
                          >
                            {{ isTaskCompleted(task) ? '重新挑战' : '开始挑战' }}
                          </button>
                          <button
                            v-else-if="!isFormTask(task)"
                            @click.stop="openHistory(task)"
                            class="btn-task-action completed"
                          >
                            查看评价
                          </button>
                          <button
                            class="btn-task-history"
                            @click.stop="openHistory(task)"
                          >
                            历史记录
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 终点 -->
        <div class="end-point" :class="{ 'reached': progressPercent === 100 }">
          <div class="point-icon">🏆</div>
          <div class="point-label">终点</div>
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

    <SelfCheckHistoryModal
      v-if="goalId && goalId > 0"
      :show="showHistoryModal"
      :goal-id="goalId"
      :task-id="historyTaskId"
      :task-title="historyTaskTitle"
      @close="closeHistoryModal"
    />

    <!-- 规划进度模态框（用于显示计划重新生成进度，复用创建任务时的提示模块） -->
    <ProgressModal
      v-if="goalId && goalId > 0"
      :show="showProgressModal"
      :goal-id="goalId"
      @close="showProgressModal = false"
      @completed="handlePlanRegenerated"
    />

    <UserProfileModal
      v-if="goalId && goalId > 0"
      :key="profileModalKey"
      :show="showProfileModal"
      :goal-id="goalId"
      @close="showProfileModal = false"
    />

    <!-- 计划反馈模态框 -->
    <PlanFeedbackModal
      v-if="goalId && goalId > 0"
      :show="showFeedbackModal"
      :goal-id="goalId"
      :plan-stages="plan?.stages || []"
      @close="showFeedbackModal = false"
      @submitted="handleFeedbackSubmitted"
    />

    <!-- 计划修改历史模态框 -->
    <PlanHistoryModal
      v-if="goalId && goalId > 0"
      :show="showPlanHistoryModal"
      :goal-id="goalId"
      @close="showPlanHistoryModal = false"
    />

    <!-- 资料上传提示模态框 -->
    <MaterialUploadTipModal
      :show="showMaterialUploadTip"
      @close="handleCloseMaterialUploadTip"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import SelfCheckModal from '@/components/SelfCheckModal.vue'
import UserProfileForm from '@/components/UserProfileForm.vue'
import ProgressModal from '@/components/ProgressModal.vue'
import SelfCheckHistoryModal from '@/components/SelfCheckHistoryModal.vue'
import UserProfileModal from '@/components/UserProfileModal.vue'
import MaterialPool from '@/components/MaterialPool.vue'
import PlanFeedbackModal from '@/components/PlanFeedbackModal.vue'
import PlanHistoryModal from '@/components/PlanHistoryModal.vue'
import MaterialUploadTipModal from '@/components/MaterialUploadTipModal.vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const materialPoolRef = ref(null)  // 用于访问MaterialPool组件的方法

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 数据
const goalId = ref(null)
const goalTitle = ref('')
const plan = ref(null)
const loading = ref(true)
const error = ref('')

// UI状态
const expandedStages = ref(new Set())
const expandedNodes = ref(new Set())
const showSelfCheck = ref(false)
const selectedTaskId = ref(null)
const infoUpdates = ref([])
const showHistoryModal = ref(false) // 自检历史模态框
const historyTaskId = ref(null)
const historyTaskTitle = ref('')
const showProfileModal = ref(false)
const profileModalKey = ref(0) // 用于强制刷新画像模态框
const showFeedbackModal = ref(false) // 反馈模态框显示状态
const showPlanHistoryModal = ref(false) // 计划修改历史模态框显示状态
const showMaterialUploadTip = ref(false) // 资料上传提示模态框显示状态
const completingStages = ref(new Set()) // 正在完成分析的阶段ID集合
const autoRefreshInterval = ref(null) // 自动刷新定时器
const activeTab = ref('plan') // 标签页：'plan' 或 'materials'

// 计算属性
const totalTasks = computed(() => {
  if (!plan.value) return 0
  let count = 0
  plan.value.stages?.forEach(stage => {
    stage.nodes?.forEach(node => {
      count += node.tasks?.length || 0
    })
  })
  return count
})

const completedTasks = computed(() => {
  if (!plan.value) return 0
  let count = 0
  plan.value.stages?.forEach(stage => {
    stage.nodes?.forEach(node => {
      node.tasks?.forEach(task => {
        if (isTaskCompleted(task)) {
          count++
        }
      })
    })
  })
  return count
})

const progressPercent = computed(() => {
  if (totalTasks.value === 0) return 0
  return Math.round((completedTasks.value / totalTasks.value) * 100)
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
  loadPlan()
  
  // 启动智能自动刷新：只在检测到阶段正在生成时才刷新，且使用静默刷新
  autoRefreshInterval.value = setInterval(() => {
    // 如果页面可见且有阶段正在生成，则静默刷新（不显示loading）
    if (!document.hidden && completingStages.value.size > 0) {
      silentRefreshPlan() // 使用静默刷新，不显示loading状态
      loadUpdates()
    }
  }, 15000) // 改为15秒刷新一次，减少刷新频率
})

onUnmounted(() => {
  // 清理自动刷新定时器
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value)
    autoRefreshInterval.value = null
  }
})

// 方法
async function loadPlan(showLoading = true) {
  if (!goalId.value || goalId.value <= 0) {
    error.value = '无效的目标ID'
    loading.value = false
    return
  }
  
  if (showLoading) {
    loading.value = true
  }
  error.value = ''
  
  try {
    // 先加载计划（计划接口会验证目标是否存在）
    const planResponse = await api.get(`/goals/${goalId.value}/plan`)
    
    if (planResponse.data) {
      plan.value = planResponse.data
      
      // 从计划数据中获取目标标题（如果有的话）
      // 或者从全局上下文获取
      if (plan.value.global_context) {
        const context = typeof plan.value.global_context === 'string' 
          ? JSON.parse(plan.value.global_context) 
          : plan.value.global_context
        goalTitle.value = context.target_school || context.goal_title || plan.value.title || '冒险之旅'
      } else {
        goalTitle.value = plan.value.title || '冒险之旅'
      }
      
      // 默认展开第一个阶段
      if (plan.value.stages && plan.value.stages.length > 0) {
        const firstStage = plan.value.stages[0]
        expandedStages.value.add(firstStage.id || firstStage.order_index || 0)
      }

      await loadUpdates()
      
      // 更新阶段生成状态
      updateStageGenerationStatus()
      
      // 检查阶段1是否完成但任务状态可能不正确，自动修复
      const stage1 = plan.value.stages?.find(s => (s.order_index || 0) === 1)
      if (stage1) {
        const stage1Progress = getStageProgress(stage1)
        const stage1Total = getStageTotalTasks(stage1)
        const stage2 = plan.value.stages?.find(s => (s.order_index || 0) === 2)
        const stage2HasTasks = stage2 && stage2.nodes?.some(n => n.tasks && n.tasks.length > 0)
        
        // 如果阶段1显示完成但阶段2没有任务，可能是旧数据需要修复
        if (stage1Progress === stage1Total && stage1Total > 0 && !stage2HasTasks) {
          // 检查是否有任务状态不正确（有记录但状态不是done）
          let needsFix = false
          stage1.nodes?.forEach(node => {
            node.tasks?.forEach(task => {
              if (task.status !== 'done' && task.status !== 'completed') {
                // 可能是旧数据，需要修复
                needsFix = true
              }
            })
          })
          
          if (needsFix) {
            console.log('检测到阶段1任务状态可能需要修复，自动调用修复接口...')
            try {
              await api.post(`/goals/${goalId.value}/stages/fix`)
              // 修复后重新加载计划
              await loadPlan()
            } catch (fixErr) {
              console.warn('自动修复失败:', fixErr)
            }
          }
        }
      }
    } else {
      error.value = '计划尚未生成，请稍后再试'
    }
  } catch (err) {
    console.error('加载计划失败:', err)
    
    // 更详细的错误处理
    if (err.response) {
      if (err.response.status === 404) {
        error.value = '目标或计划不存在，请检查目标ID是否正确'
      } else if (err.response.status === 403) {
        error.value = '无权访问此目标'
      } else {
        error.value = err.response.data?.message || `加载失败 (${err.response.status})，请重试`
      }
    } else if (err.request) {
      error.value = '网络错误，无法连接到服务器'
    } else {
      error.value = err.message || '加载失败，请重试'
    }
  } finally {
    if (showLoading) {
      loading.value = false
    }
  }
}

// 静默刷新：不显示loading状态，只更新数据
async function silentRefreshPlan() {
  if (!goalId.value || goalId.value <= 0) {
    return
  }
  
  try {
    const planResponse = await api.get(`/goals/${goalId.value}/plan`)
    
    if (planResponse.data) {
      // 检查是否有实际变化，避免不必要的UI更新
      const newPlan = planResponse.data
      const hasChanges = checkPlanChanges(plan.value, newPlan)
      
      if (hasChanges) {
        plan.value = newPlan
        
        // 从计划数据中获取目标标题
        if (plan.value.global_context) {
          const context = typeof plan.value.global_context === 'string' 
            ? JSON.parse(plan.value.global_context) 
            : plan.value.global_context
          goalTitle.value = context.target_school || context.goal_title || plan.value.title || '冒险之旅'
        } else {
          goalTitle.value = plan.value.title || '冒险之旅'
        }
        
        // 检查阶段生成状态
        updateStageGenerationStatus()
      }
    }
  } catch (err) {
    // 静默刷新失败时不显示错误，避免干扰用户
    console.warn('静默刷新计划失败:', err)
  }
}

// 检查计划是否有变化
function checkPlanChanges(oldPlan, newPlan) {
  if (!oldPlan || !newPlan) return true
  
  // 检查阶段数量
  if ((oldPlan.stages?.length || 0) !== (newPlan.stages?.length || 0)) {
    return true
  }
  
  // 检查每个阶段的任务数量
  for (let i = 0; i < (newPlan.stages?.length || 0); i++) {
    const oldStage = oldPlan.stages?.[i]
    const newStage = newPlan.stages?.[i]
    
    if (!oldStage || !newStage) return true
    
    // 检查节点数量
    if ((oldStage.nodes?.length || 0) !== (newStage.nodes?.length || 0)) {
      return true
    }
    
    // 检查每个节点的任务数量
    for (let j = 0; j < (newStage.nodes?.length || 0); j++) {
      const oldNode = oldStage.nodes?.[j]
      const newNode = newStage.nodes?.[j]
      
      if (!oldNode || !newNode) return true
      
      const oldTaskCount = oldNode.tasks?.length || 0
      const newTaskCount = newNode.tasks?.length || 0
      
      if (oldTaskCount !== newTaskCount) {
        return true
      }
    }
  }
  
  return false
}

// 更新阶段生成状态
function updateStageGenerationStatus() {
  if (!plan.value || !plan.value.stages) return
  
  // 检查哪些阶段正在生成（有阶段但任务数为0）
  const generatingStages = new Set()
  
  plan.value.stages.forEach(stage => {
    const stageId = stage.id || stage.order_index
    const hasTasks = stage.nodes?.some(node => (node.tasks?.length || 0) > 0)
    const stageOrder = stage.order_index || 0
    
    // 如果阶段2-5没有任务，且不是阶段1，可能正在生成
    if (stageOrder > 1 && !hasTasks) {
      // 检查上一阶段是否已完成
      const prevStage = plan.value.stages.find(s => (s.order_index || 0) === stageOrder - 1)
      if (prevStage) {
        const prevProgress = getStageProgress(prevStage)
        const prevTotal = getStageTotalTasks(prevStage)
        // 如果上一阶段已完成，当前阶段可能正在生成
        if (prevTotal > 0 && prevProgress === prevTotal) {
          generatingStages.add(stageId)
        }
      }
    }
  })
  
  completingStages.value = generatingStages
}

function toggleStage(stageId) {
  if (expandedStages.value.has(stageId)) {
    expandedStages.value.delete(stageId)
    // 折叠阶段时，也折叠该阶段下的所有节点
    if (plan.value) {
      plan.value.stages?.forEach(stage => {
        if (stage.id === stageId || stage.order_index === stageId) {
          stage.nodes?.forEach(node => {
            expandedNodes.value.delete(node.id || node.order_index)
          })
        }
      })
    }
  } else {
    expandedStages.value.add(stageId)
  }
}

function toggleNode(nodeId) {
  if (expandedNodes.value.has(nodeId)) {
    expandedNodes.value.delete(nodeId)
  } else {
    expandedNodes.value.add(nodeId)
  }
}

function getStageProgress(stage) {
  let count = 0
  stage.nodes?.forEach(node => {
    node.tasks?.forEach(task => {
      if (isTaskCompleted(task)) {
        count++
      }
    })
  })
  return count
}

function getStageTotalTasks(stage) {
  let count = 0
  stage.nodes?.forEach(node => {
    count += node.tasks?.length || 0
  })
  return count
}

function getStageObjective(stage) {
  const stageName = stage.name || ''
  const orderIndex = stage.order_index || 0
  if (stage.user_highlight) return stage.user_highlight
  if (stage.objective) return stage.objective
  if (stage.focus) return stage.focus
  if (stage.description) return stage.description

  if (orderIndex === 1 || stageName.includes('初始') || stageName.includes('评估')) {
    return '完成用户画像、学习经历、情绪与资源盘点，建立个性化备考基线。'
  } else if (orderIndex === 2 || stageName.includes('决策') || stageName.includes('规划')) {
    return '根据画像制定复习规划，明确择校/分科策略与基础复习节奏。'
  } else if (orderIndex === 3 || stageName.includes('基础') || stageName.includes('夯实')) {
    return '针对薄弱点进行强化训练，逐步过渡到中高难知识点。'
  } else if (orderIndex === 4 || stageName.includes('核心') || stageName.includes('执行')) {
    return '大量真题与模拟演练，建立错题复盘与应试策略。'
  } else if (orderIndex === 5 || stageName.includes('冲刺') || stageName.includes('复试')) {
    return '总结易错点，准备复试/调剂方案，确保最终冲刺阶段稳定发挥。'
  }
  return '完成本阶段的学习任务，逐步推进备考进度。'
}

function getStageWarnings(stage) {
  if (Array.isArray(stage.warnings)) {
    return stage.warnings.join('；')
  }
  return stage.warnings || ''
}

function isFormTask(task) {
  return task?.task_type === 'form'
}

function isMaterialUploadTask(task) {
  // 判断是否是资料上传任务
  return task.title && task.title.includes('备考资料上传与整理任务')
}

function getNodeProgress(node) {
  if (!node.tasks) return 0
  return node.tasks.filter(task => isTaskCompleted(task)).length
}

function getNodeTotalTasks(node) {
  return node.tasks?.length || 0
}

function isNodeUnlocked(node, stage, stageIndex, nodeIndex) {
  // 第一个阶段的第一个节点总是解锁的
  if (stageIndex === 0 && nodeIndex === 0) return true
  
  // 如果前一个节点已完成，则当前节点解锁
  if (nodeIndex > 0) {
    const prevNode = stage.nodes[nodeIndex - 1]
    return isNodeCompleted(prevNode)
  }
  
  // 如果是新阶段的第一个节点，需要前一个阶段的最后一个节点完成
  if (nodeIndex === 0 && stageIndex > 0) {
    const prevStage = plan.value.stages[stageIndex - 1]
    if (prevStage && prevStage.nodes && prevStage.nodes.length > 0) {
      const lastNode = prevStage.nodes[prevStage.nodes.length - 1]
      return isNodeCompleted(lastNode)
    }
  }
  
  return false
}

function isNodeCompleted(node) {
  // Decision类型节点：检查是否有完成的task（包括虚拟task）
  if (node.node_type === 'decision') {
    if (!node.tasks || node.tasks.length === 0) return false
    return node.tasks.some(task => 
      isTaskCompleted(task) || 
      (task.title && task.title.includes('完成'))
    )
  }
  // Study类型节点：所有task都必须完成
  if (!node.tasks || node.tasks.length === 0) return false
  return node.tasks.every(task => isTaskCompleted(task))
}

function isTaskUnlocked(task, node, nodeIndex, taskIndex) {
  // 首先检查节点是否解锁
  if (!plan.value) return false
  
  // 找到节点所在的阶段
  let stageIndex = -1
  let actualNodeIndex = -1
  for (let s = 0; s < plan.value.stages.length; s++) {
    const stage = plan.value.stages[s]
    for (let n = 0; n < (stage.nodes || []).length; n++) {
      if (stage.nodes[n].id === node.id || stage.nodes[n] === node) {
        stageIndex = s
        actualNodeIndex = n
        break
      }
    }
    if (stageIndex >= 0) break
  }
  
  if (stageIndex < 0) return false
  
  // 检查节点是否解锁
  const stage = plan.value.stages[stageIndex]
  if (!isNodeUnlocked(node, stage, stageIndex, actualNodeIndex)) {
    return false
  }
  
  // 第一个任务总是解锁的（如果节点已解锁）
  if (taskIndex === 0) return true
  
  // 如果前一个任务已完成，则当前任务解锁
  if (node.tasks && taskIndex > 0) {
    const prevTask = node.tasks[taskIndex - 1]
    return isTaskCompleted(prevTask)
  }
  
  return false
}

function isTaskCompleted(task) {
  // 阶段1任务：如果有 is_stage1 标记，或者 status 是 done，或者有记录但状态不是初始状态
  if (task.is_stage1 || isFormTask(task)) {
    return task.status === 'done' || task.status === 'completed'
  }
  // 其他阶段任务：检查状态或最新提交
  return task.status === 'done' || task.status === 'completed' || (!!task.latest_submission && !!task.latest_submission.is_passed)
}

function isTaskActive(task) {
  return task.status === 'in_progress' || task.status === 'active'
}

function isStageCompleted(stage) {
  const progress = getStageProgress(stage)
  const total = getStageTotalTasks(stage)
  return total > 0 && progress === total
}

function isStageAnalyzing(stage) {
  const stageId = stage.id || stage.order_index
  return completingStages.value.has(stageId)
}

// 检查阶段是否正在生成任务（有阶段但任务数为0，且上一阶段已完成）
function isStageGenerating(stage) {
  const stageOrder = stage.order_index || 0
  if (stageOrder <= 1) return false // 阶段1不会生成
  
  const hasTasks = stage.nodes?.some(node => (node.tasks?.length || 0) > 0)
  if (hasTasks) return false // 已有任务，不在生成中
  
  // 检查上一阶段是否已完成
  if (!plan.value || !plan.value.stages) return false
  const prevStage = plan.value.stages.find(s => (s.order_index || 0) === stageOrder - 1)
  if (!prevStage) return false
  
  const prevProgress = getStageProgress(prevStage)
  const prevTotal = getStageTotalTasks(prevStage)
  
  // 如果上一阶段已完成，当前阶段可能正在生成
  return prevTotal > 0 && prevProgress === prevTotal
}

async function completeStage(stage) {
  const stageId = stage.id || stage.order_index
  const stageOrderIndex = stage.order_index || stageId
  
  if (!stageOrderIndex || stageOrderIndex < 1 || stageOrderIndex > 5) {
    showToast('无效的阶段编号', 'error')
    return
  }
  
  // 检查阶段是否真的完成
  if (!isStageCompleted(stage)) {
    showToast('请先完成本阶段的所有任务', 'warning')
    return
  }
  
  // 标记为正在处理
  completingStages.value.add(stageId)
  
  try {
    const response = await api.post(`/goals/${goalId.value}/stages/${stageOrderIndex}/complete_and_analyze`)
    
    if (response.data.success) {
      showToast(`阶段${stageOrderIndex}已完成！系统正在分析您的学习表现并生成下一阶段任务...`, 'success')
      
      // 如果下一阶段正在生成，标记下一阶段为分析中
      if (response.data.next_stage_generating && response.data.next_stage_id) {
        const nextStageId = response.data.next_stage_id
        completingStages.value.add(nextStageId)
        
        // 启动更频繁的自动刷新（每5秒），直到任务生成完成
        if (autoRefreshInterval.value) {
          clearInterval(autoRefreshInterval.value)
        }
        
        const checkInterval = setInterval(async () => {
          if (!document.hidden) {
            await silentRefreshPlan() // 使用静默刷新，不显示loading
            await loadUpdates()
            
            // 检查下一阶段是否已有任务，如果有则停止频繁刷新
            const updatedPlan = plan.value
            if (updatedPlan && updatedPlan.stages) {
              const nextStageData = updatedPlan.stages.find(s => (s.order_index || s.id) === nextStageId)
              if (nextStageData && nextStageData.nodes) {
                const hasTasks = nextStageData.nodes.some(node => node.tasks && node.tasks.length > 0)
                if (hasTasks) {
                  // 任务已生成，恢复正常的刷新频率
                  completingStages.value.delete(nextStageId)
                  clearInterval(checkInterval)
                  
                  if (completingStages.value.size === 0) {
                    // 所有阶段都已完成，恢复默认刷新
                    autoRefreshInterval.value = setInterval(() => {
                      if (!document.hidden && completingStages.value.size > 0) {
                        silentRefreshPlan() // 使用静默刷新
                        loadUpdates()
                      }
                    }, 15000) // 改为15秒，减少刷新频率
                  } else {
                    // 还有其他阶段在生成，继续使用当前刷新频率
                    autoRefreshInterval.value = checkInterval
                  }
                  
                  showToast(`阶段${nextStageId}任务已生成完成！`, 'success')
                }
              }
            }
          }
        }, 12000) // 改为12秒刷新一次，减少刷新频率和页面闪烁
        
        autoRefreshInterval.value = checkInterval
      }
      
      // 重新加载计划以获取更新
      await loadPlan()
      
      // 加载更新消息
      await loadUpdates()
      
      // 如果画像模态框是打开的，强制刷新画像数据
      if (showProfileModal.value) {
        profileModalKey.value += 1
      }
    } else {
      showToast(response.data.message || '完成阶段失败', 'error')
    }
    } catch (err) {
    console.error('完成阶段失败:', err)
    const errorMsg = err.response?.data?.error || err.response?.data?.message || '完成阶段失败，请重试'
    
    // 如果是已经提交过的错误，显示特殊提示并重新加载计划
    if (err.response?.data?.already_submitted) {
      showToast(err.response.data.message || '该阶段已经提交过报告，无法重复提交', 'warning')
      // 重新加载计划以更新状态
      await loadPlan()
    } else {
      showToast(errorMsg, 'error')
    }
  } finally {
    // 延迟移除标记，给用户一些反馈时间
    setTimeout(() => {
      completingStages.value.delete(stageId)
    }, 2000)
  }
}

function getNodeIcon(nodeType) {
  const icons = {
    'decision': '📊',
    'study': '📚',
    'execution': '⚔️',
    'interaction': '💬',
    'report': '📝'
  }
  return icons[nodeType] || '🏝️'
}

function getNodeTypeLabel(nodeType) {
  const labels = {
    'decision': '决策/报告',
    'study': '学习/执行',
    'execution': '执行',
    'interaction': '交互',
    'report': '报告'
  }
  return labels[nodeType] || nodeType || '节点'
}

function handleTaskClick(task) {
  // 检查是否是资料上传任务
  if (task.title && task.title.includes('备考资料上传与整理任务')) {
    // 检查是否需要显示提示（如果用户之前选择了"不再显示"，则不再显示）
    const tipHidden = localStorage.getItem('material_upload_tip_hidden')
    if (!tipHidden) {
      // 显示提示弹窗
      showMaterialUploadTip.value = true
    } else {
      // 直接打开上传模态框
      openMaterialUploadModal()
    }
    return
  }
  
  // 找到任务所在的节点和索引
  let taskIndex = -1
  let parentNode = null
  
  if (!plan.value) return
  
  for (const stage of plan.value.stages || []) {
    for (const node of stage.nodes || []) {
      if (node.tasks) {
        taskIndex = node.tasks.findIndex(t => t.id === task.id || t === task)
        if (taskIndex >= 0) {
          parentNode = node
          break
        }
      }
    }
    if (taskIndex >= 0) break
  }
  
  if (taskIndex < 0 || !parentNode) return
  
  if (!isTaskUnlocked(task, parentNode, 0, taskIndex)) return
  
  if (isTaskCompleted(task)) {
    viewTaskResult(task)
  } else {
    startSelfCheck(task)
  }
}

function startSelfCheck(task) {
  selectedTaskId.value = task.id
  showSelfCheck.value = true
}

function viewTaskResult(task) {
  // 可以打开一个结果查看页面或模态框
  console.log('查看任务结果:', task)
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
  
  // 阶段1任务：只显示保存成功消息，不显示打分
  if (result.is_stage1) {
    const message = result.message || `《${result.taskTitle || '任务'}》信息已成功保存到用户画像`
    showToast(message, 'success')
    loadPlan()
    loadUpdates()
    return
  }
  
  // 非阶段1任务：显示打分结果
  const passed = !!result.is_passed
  const score = typeof result.score === 'number' ? Math.round(result.score) : (result?.score ?? '--')
  const message = passed
    ? `《${result.taskTitle || '任务'}》得分 ${score} 分，挑战已通过！`
    : `《${result.taskTitle || '任务'}》得分 ${score} 分，尚未达标，请继续加油～`
  showToast(message, passed ? 'success' : 'warning')
  loadPlan()
  loadUpdates()
}

function openHistory(task) {
  historyTaskId.value = task.id
  historyTaskTitle.value = task.title
  showHistoryModal.value = true
}

function closeHistoryModal() {
  showHistoryModal.value = false
}

async function markMaterialUploadTaskComplete(task) {
  if (!task || !task.id) {
    showToast('无法识别任务，请重试', 'error')
    return
  }
  
  try {
    const response = await api.post(`/goals/${goalId.value}/tasks/${task.id}/mark-complete`)
    
    if (response.status === 200 || response.data) {
      showToast('任务已标记为完成', 'success')
      // 重新加载计划以更新任务状态
      await loadPlan()
    } else {
      showToast(response.data?.error || '标记失败，请重试', 'error')
    }
  } catch (error) {
    console.error('标记任务完成失败:', error)
    const errorMsg = error.response?.data?.error || error.response?.data?.message || '网络错误，请重试'
    showToast(errorMsg, 'error')
  }
}

// 打开资料上传模态框
function openMaterialUploadModal() {
  // 跳转到资料库标签页
  activeTab.value = 'materials'
  // 等待DOM更新后打开上传模态框
  setTimeout(() => {
    if (materialPoolRef.value && typeof materialPoolRef.value.openUploadModal === 'function') {
      materialPoolRef.value.openUploadModal()
    }
  }, 100)
}

// 关闭资料上传提示弹窗
function handleCloseMaterialUploadTip() {
  showMaterialUploadTip.value = false
  // 关闭提示后自动打开上传模态框
  openMaterialUploadModal()
}

// 处理资料上传成功事件
async function handleMaterialUploaded() {
  if (!plan.value || !plan.value.stages) {
    return
  }
  
  // 查找未完成的材料上传任务
  for (const stage of plan.value.stages || []) {
    for (const node of stage.nodes || []) {
      if (node.tasks) {
        for (const task of node.tasks) {
          // 检查是否是材料上传任务且未完成
          if (isMaterialUploadTask(task) && !isTaskCompleted(task)) {
            // 自动标记为完成
            await markMaterialUploadTaskComplete(task)
            return // 只标记第一个找到的未完成任务
          }
        }
      }
    }
  }
}

async function loadUpdates() {
  if (!goalId.value) {
    infoUpdates.value = []
    return
  }
  try {
    const response = await api.get(`/goals/${goalId.value}/updates`)
    infoUpdates.value = response.data || []
  } catch (err) {
    console.error('[AdventurePlan] 加载消息失败:', err)
    infoUpdates.value = []
  }
}

function navigateToUpdate(update) {
  if (update.link) {
    router.push(update.link)
  }
}

function openProfileModal() {
  if (!goalId.value) return
  showProfileModal.value = true
}

function formatDate(value) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString('zh-CN', { hour12: false })
  } catch {
    return value
  }
}

// 使用统一的Toast组件
async function showToast(message, type = 'info') {
  const { toast } = await import('@/utils/toast')
  if (type === 'success') {
    toast.success(message)
  } else if (type === 'error') {
    toast.error(message)
  } else if (type === 'warning') {
    toast.warning(message)
  } else {
    toast.info(message)
    }
}

async function handleProfileSubmitted(data) {
  // 用户画像提交成功
  console.log('[AdventurePlan] 用户画像提交成功，data:', data)
  
  // 如果正在重新生成计划，显示进度模态框
  // 注意：即使regenerating为false，如果后端返回了regenerating=true，也应该显示
  if (data.regenerating !== false) {
    // 显示进度模态框（复用创建任务时的提示模块）
    console.log('[AdventurePlan] 显示进度模态框，goalId:', goalId)
    showProgressModal.value = true
  } else {
    // 只刷新计划数据以显示节点完成状态
    await loadPlan()
  }
  console.log('用户画像已更新，节点标记为已完成')
}

function handlePlanRegenerated(goalId) {
  // 计划重新生成完成，刷新计划数据
  console.log('[AdventurePlan] 计划重新生成完成，goalId:', goalId)
  showProgressModal.value = false
  loadPlan()
  console.log('计划已重新生成，已刷新数据')
}

// 进度模态框
const showProgressModal = ref(false)

function goBack() {
  router.push('/')
}

function handleFeedbackSubmitted(feedbackData) {
  // 反馈提交成功后的处理
  console.log('[AdventurePlan] 反馈已提交:', feedbackData)
  // 可以刷新计划或显示提示
  loadUpdates()
}

function switchToCalendar() {
  router.push(`/calendar/${goalId.value}`)
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.adventure-plan-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 40px;
}

.adventure-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* 进度头部 */
.progress-header {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-info h2 {
  margin: 0;
  font-size: 33px;  /* 从28px增加到33px */
  color: #1a1a1a;  /* 更深的颜色，提高对比度 */
  font-weight: 600;  /* 增加字体粗细 */
}

.progress-stats {
  display: flex;
  gap: 16px;
  align-items: center;
  font-size: 16px;
  color: #666;
}

.progress-percent {
  font-weight: bold;
  color: #667eea;
  font-size: 20px;
}

.progress-actions {
  display: flex;
  justify-content: flex-end;
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

.progress-bar-container {
  width: 100%;
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
  transition: width 0.3s ease;
}

/* 返回按钮 */
.back-button {
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-back {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.3s;
}

.btn-back:hover {
  background: white;
  transform: translateX(-4px);
}

.btn-feedback {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: white;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-feedback:hover {
  background: linear-gradient(135deg, #5568d3 0%, #654391 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-history {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: white;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-history:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
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

/* 冒险地图 */
.adventure-map {
  position: relative;
}

.start-point,
.end-point {
  text-align: center;
  margin: 40px 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.point-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.point-label {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.end-point.reached .point-icon {
  animation: bounce 0.6s ease;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 阶段容器 */
.stages-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stage-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stage-section.expanded {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  cursor: pointer;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transition: all 0.3s;
}

.stage-header:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.stage-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.stage-number {
  font-size: 14px;
  opacity: 0.9;
}

.stage-title {
  margin: 0;
  font-size: 22px;
  font-weight: bold;
}

.stage-progress {
  margin-left: auto;
  font-size: 14px;
  opacity: 0.9;
}

.stage-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-right: 16px;
}

.btn-complete-stage {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-complete-stage:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-complete-stage:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.stage-analyzing {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-size: 14px;
  opacity: 0.9;
}

.stage-submitted {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-size: 14px;
  opacity: 0.9;
  padding: 6px 12px;
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid rgba(76, 175, 80, 0.5);
  border-radius: 6px;
}

.submitted-icon {
  color: #4caf50;
  font-weight: bold;
  font-size: 16px;
}

.submitted-time {
  font-size: 12px;
  opacity: 0.8;
  margin-left: 4px;
}

.generating-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #ff9800;
  font-size: 13px;
  font-weight: 500;
}

.generating-indicator .spinner-small {
  border: 2px solid rgba(255, 152, 0, 0.3);
  border-top-color: #ff9800;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.stage-toggle {
  font-size: 20px;
  margin-left: 16px;
}

.stage-highlight {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-left: 4px solid #667eea;
  border-radius: 8px;
  padding: 16px 20px;
  margin: 12px 0;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.highlight-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.highlight-content {
  flex: 1;
}

.highlight-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 6px;
}

.highlight-description {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #555;
}

.stage-content {
  padding: 24px;
  background: #f8f9fa;
}

/* 岛屿容器 */
.islands-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  position: relative;
}

.island-wrapper {
  position: relative;
  flex: 1;
  min-width: 300px;
  max-width: 400px;
}

.connection-line {
  position: absolute;
  left: -20px;
  top: 50%;
  width: 20px;
  height: 3px;
  background: #ccc;
  z-index: 0;
}

.connection-line.completed {
  background: #667eea;
}

.island-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.island-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.island-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.island-card.completed {
  border: 2px solid #28a745;
}

.island-icon {
  font-size: 36px;
  flex-shrink: 0;
}

.island-info {
  flex: 1;
}

.island-title {
  margin: 0 0 4px 0;
  font-size: 18px;
  color: #333;
}

.island-type {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #666;
}

.island-progress {
  font-size: 12px;
  color: #999;
}

.island-toggle {
  font-size: 16px;
  color: #999;
}

.island-content {
  margin-top: 16px;
  padding-left: 20px;
}

.decision-form-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

/* 任务容器 */
.tasks-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  border-left: 4px solid transparent;
}

.task-card:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.task-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.task-card.completed {
  border-left-color: #28a745;
  background: #f0f9f0;
}

.task-card.active {
  border-left-color: #667eea;
  background: #f0f2ff;
  animation: pulse 2s infinite;
}

/* 资料上传任务特殊高亮样式 */
.task-card.material-upload-task {
  border: 2px solid #ff9800;
  border-left-width: 6px;
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
  position: relative;
  animation: highlightPulse 2s infinite;
}

.task-card.material-upload-task::before {
  content: '⭐';
  position: absolute;
  top: -8px;
  right: -8px;
  font-size: 20px;
  background: #ff9800;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.4);
  animation: bounce 1.5s infinite;
}

.task-card.material-upload-task:hover {
  transform: translateX(4px) translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 152, 0, 0.4);
}

@keyframes highlightPulse {
  0%, 100% { 
    box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
  }
  50% { 
    box-shadow: 0 6px 20px rgba(255, 152, 0, 0.5);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.task-status-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.task-info {
  flex: 1;
}

.task-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
}

.task-description {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #666;
}

.task-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

.task-score-row {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.task-score-row.pending {
  color: #999;
}

.score-pill {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
}

.score-pill.passed {
  background: #28a745;
}

.score-pill.failed {
  background: #dc3545;
}

.score-pill.form {
  background: #e6f0ff;
  color: #3056d6;
}

/* 标签页样式 */
.tabs-container {
  display: flex;
  gap: 0;
  margin: 20px 0;
  border-bottom: 2px solid #e0e0e0;
}

.tab-button {
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 19px;  /* 从14px增加到19px */
  color: #333;  /* 从#666改为#333，提高对比度 */
  transition: all 0.2s;
  margin-bottom: -2px;
  font-weight: 500;  /* 增加字体粗细，提高可读性 */
}

.tab-button:hover {
  color: #00CED1;  /* 青色，提高对比度 */
  background: #f0f0f0;  /* 更明显的背景色 */
}

.tab-button.active {
  color: #00CED1;  /* 青色，提高对比度 */
  border-bottom-color: #00CED1;  /* 与文字颜色一致 */
  font-weight: 600;  /* 增加激活状态的字体粗细 */
  background: rgba(0, 206, 209, 0.05);  /* 添加青色背景色，提高可见性 */
}

.materials-tab-content {
  margin-top: 20px;
}

.score-time {
  color: #999;
  font-size: 12px;
}

.stage-warning {
  margin-top: 10px;
  padding: 10px 12px;
  background: #fff8e5;
  border-left: 3px solid #f0ad4e;
  border-radius: 6px;
  font-size: 13px;
  color: #a46300;
}

.task-actions {
  flex-shrink: 0;
}

.btn-task-action {
  padding: 6px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.btn-task-action:hover {
  background: #764ba2;
  transform: scale(1.05);
}

.btn-task-action.completed {
  background: #28a745;
}
</style>

