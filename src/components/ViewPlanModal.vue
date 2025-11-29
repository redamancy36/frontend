<template>
  <div class="modal active" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">查看计划</h2>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>
      
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>加载计划中...</p>
      </div>
      
      <div v-else-if="error" class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <p>{{ error }}</p>
      </div>
      
      <div v-else-if="plan" class="plan-container">
        <h2 class="plan-title">{{ plan.title || '计划' }}</h2>
        
        <!-- 计划描述和全局上下文 -->
        <div v-if="plan.description" class="plan-description">
          {{ plan.description }}
        </div>
        
        <div v-if="plan.global_context" class="plan-context">
          <p v-if="plan.global_context.target_school">
            <strong>目标院校：</strong>{{ plan.global_context.target_school }}
          </p>
          <p v-if="plan.global_context.major">
            <strong>专业：</strong>{{ plan.global_context.major }}
          </p>
          <p v-if="plan.global_context.total_duration">
            <strong>总时长：</strong>{{ plan.global_context.total_duration }}
          </p>
          <p v-if="plan.start_date">
            <strong>开始日期：</strong>{{ plan.start_date }}
          </p>
        </div>
        
        <!-- 新层级结构 -->
        <div v-if="hasNewStructure" class="plan-stages">
          <PlanStage
            v-for="(stage, index) in plan.stages"
            :key="stage.id || index"
            :stage="stage"
            :index="index"
            :goal-id="goalId"
            @self-check="handleSelfCheck"
          />
        </div>
        
        <!-- 潜在挑战 -->
        <div v-if="plan.potential_challenges && plan.potential_challenges.length > 0" class="challenges">
          <h3>潜在挑战与建议</h3>
          <div
            v-for="(challenge, index) in plan.potential_challenges"
            :key="index"
            class="challenge-item"
          >
            <strong>{{ getChallengeText(challenge) }}</strong>
            <p v-if="getChallengeSuggestion(challenge)">
              {{ getChallengeSuggestion(challenge) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import PlanStage from './PlanStage.vue'

const props = defineProps({
  goalId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['close', 'self-check'])

const plan = ref(null)
const loading = ref(true)
const error = ref('')

const hasNewStructure = computed(() => {
  return plan.value?.stages?.some(stage => stage.nodes && stage.nodes.length > 0)
})

onMounted(async () => {
  await loadPlan()
})

async function loadPlan() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await api.get(`/goals/${props.goalId}/plan`)
    if (response.data) {
      plan.value = response.data
    } else {
      error.value = '计划尚未生成，请稍后再试'
    }
  } catch (err) {
    console.error('加载计划失败:', err)
    error.value = err.response?.data?.message || '加载失败，请重试'
  } finally {
    loading.value = false
  }
}

function getChallengeText(challenge) {
  return typeof challenge === 'string' ? challenge : (challenge.challenge || challenge)
}

function getChallengeSuggestion(challenge) {
  return typeof challenge === 'object' ? challenge.suggestion : ''
}

function handleSelfCheck(taskId) {
  // 触发自检模态框
  emit('self-check', taskId)
}
</script>

<style scoped>
.plan-container {
  padding: 20px 0;
}

.plan-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.plan-description {
  margin-bottom: 20px;
  padding: 15px;
  background: #e7f3ff;
  border-radius: 8px;
  color: #333;
  line-height: 1.6;
}

.plan-context {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.plan-context p {
  margin: 8px 0;
}

.plan-stages {
  margin-top: 30px;
}

.challenges {
  margin-top: 30px;
  padding: 20px;
  background: #fff3cd;
  border-radius: 8px;
}

.challenges h3 {
  margin-bottom: 15px;
}

.challenge-item {
  margin-bottom: 10px;
}

.challenge-item p {
  margin-top: 5px;
  color: #666;
}
</style>

