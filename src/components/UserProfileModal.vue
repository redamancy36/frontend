<template>
  <div v-if="show" class="modal active" @click.self="handleClose">
    <div class="modal-content profile-modal">
      <div class="modal-header">
        <h2 class="modal-title">我的画像</h2>
        <button class="close-btn" @click="handleClose">&times;</button>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>加载画像中...</p>
      </div>

      <div v-else>
        <div v-if="!profileData" class="empty-state">
          <p>暂未生成画像，请先完成阶段 1 的信息收集。</p>
        </div>

        <div v-else class="profile-sections">
          <div class="profile-summary">
            <div>
              <p class="summary-title">{{ profileData.goal_title }}</p>
              <p class="summary-status">
                阶段1完成状态：
                <strong>{{ profileData.stage1_completed ? '已完成' : '进行中' }}</strong>
              </p>
            </div>
            <div class="summary-meta">
              <span>最近更新：{{ formatDate(profileData.last_updated) }}</span>
              <span>数据来源：{{ (profileData.data_sources || []).join('、') || '系统自动生成' }}</span>
            </div>
          </div>

          <section v-if="optimizedProfile" class="profile-section">
            <h3>优化画像概览</h3>
            <div class="profile-rows">
              <div class="profile-row">
                <span class="row-label">学习风格</span>
                <p class="row-value">{{ optimizedProfile.learning_style || '—' }}</p>
              </div>
              <div class="profile-row">
                <span class="row-label">优势领域</span>
                <p class="row-value">{{ formatList(optimizedProfile.strengths) }}</p>
              </div>
              <div class="profile-row">
                <span class="row-label">关注点</span>
                <p class="row-value">{{ formatList(optimizedProfile.needs) }}</p>
              </div>
              <div class="profile-row">
                <span class="row-label">偏好设置</span>
                <p class="row-value">{{ formatPreferences(optimizedProfile.preferences) }}</p>
              </div>
            </div>
            <div v-if="optimizedProfile.recommendations && optimizedProfile.recommendations.length" class="recommendations">
              <h4>个性化建议</h4>
              <ul>
                <li v-for="(item, idx) in optimizedProfile.recommendations" :key="idx">{{ item }}</li>
              </ul>
            </div>
          </section>

          <section
            v-for="(section, key) in detailSections"
            :key="key"
            class="profile-section"
          >
            <h3>{{ section.title }}</h3>
            <div class="detail-list">
              <div v-for="(value, field) in section.data" :key="field" class="detail-item">
                <span class="label">{{ field }}</span>
                <p>{{ formatValue(value) }}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import api from '@/services/api'

const props = defineProps({
  show: { type: Boolean, default: false },
  goalId: { type: Number, required: true }
})

const emit = defineEmits(['close'])

const profileData = ref(null)
const loading = ref(false)
const error = ref('')

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      loadProfile()
    }
  }
)

async function loadProfile() {
  if (!props.goalId) return
  loading.value = true
  error.value = ''
  profileData.value = null
  try {
    const response = await api.get(`/goals/${props.goalId}/profile`)
    profileData.value = response.data || null
  } catch (err) {
    console.error('[UserProfileModal] 加载画像失败:', err)
    error.value = err.response?.data?.message || '加载用户画像失败'
  } finally {
    loading.value = false
  }
}

function hasContent(obj) {
  return obj && typeof obj === 'object' && Object.keys(obj).length > 0
}

function buildOptimizedFromDynamic(dynamicProfile) {
  if (!hasContent(dynamicProfile)) return null

  const strengths =
    dynamicProfile.strengths ||
    dynamicProfile.key_insights ||
    []

  const needs =
    dynamicProfile.needs ||
    dynamicProfile.risk_alerts ||
    []

  const preferences =
    dynamicProfile.preferences ||
    dynamicProfile.study_preferences ||
    {}

  const recommendations =
    dynamicProfile.recommendations ||
    dynamicProfile.recommended_interventions ||
    []

  return {
    learning_style:
      dynamicProfile.learning_style ||
      dynamicProfile.motivation_level ||
      '',
    strengths,
    needs,
    preferences,
    recommendations
  }
}

const optimizedProfile = computed(() => {
  const raw = profileData.value
  if (!raw) return null

  // 1）优先使用后端直接提供的 optimized_profile
  if (hasContent(raw.optimized_profile)) {
    return raw.optimized_profile
  }

  const pd = raw.profile_data || {}

  // 2）其次尝试使用 dynamic_profile（统计画像）
  // 首先尝试从最新的阶段分析中提取数据
  if (hasContent(pd.dynamic_profile)) {
    // 查找最新的阶段分析数据
    const stageKeys = Object.keys(pd.dynamic_profile).filter(k => k.startsWith('stage_') && k.endsWith('_analysis'))
    if (stageKeys.length > 0) {
      // 按阶段ID排序，获取最新的阶段分析
      stageKeys.sort((a, b) => {
        const aNum = parseInt(a.match(/stage_(\d+)_analysis/)?.[1] || '0')
        const bNum = parseInt(b.match(/stage_(\d+)_analysis/)?.[1] || '0')
        return bNum - aNum // 降序，最新的在前
      })
      const latestAnalysis = pd.dynamic_profile[stageKeys[0]]
      if (latestAnalysis && hasContent(latestAnalysis)) {
        // 从最新的阶段分析中构建优化画像
        return {
          learning_style: latestAnalysis.summary || '',
          strengths: latestAnalysis.strengths || [],
          needs: latestAnalysis.improvements || [],
          preferences: {},
          recommendations: latestAnalysis.recommendations || []
        }
      }
    }
    // 如果没有阶段分析，尝试从 dynamic_profile 根级别提取
    return buildOptimizedFromDynamic(pd.dynamic_profile)
  }

  // 3）最后尝试直接从 profile_data 根上推断（兼容旧数据结构）
  if (hasContent(pd)) {
    return buildOptimizedFromDynamic(pd)
  }

  return null
})

const detailSections = computed(() => {
  if (!profileData.value || !profileData.value.profile_data) return []
  const data = profileData.value.profile_data
  const sections = []
  const mapping = [
    { key: 'learning_habits', title: '学习习惯' },
    { key: 'learning_experience', title: '学习经历' },
    { key: 'emotional_state', title: '情绪与心理状态' },
    { key: 'resources', title: '资料与资源' },
    { key: 'general_assessment', title: '其他信息' }
  ]
  mapping.forEach(({ key, title }) => {
    if (data[key] && typeof data[key] === 'object' && Object.keys(data[key]).length > 0) {
      sections.push({
        title,
        data: data[key]
      })
    }
  })

  // 如果阶段1的细分区块都还没有，但存在 dynamic_profile，就额外展示一块「系统统计画像」
  if (!sections.length && hasContent(data.dynamic_profile)) {
    sections.push({
      title: '系统统计画像（最近30天）',
      data: data.dynamic_profile
    })
  }

  return sections
})

function handleClose() {
  emit('close')
}

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString('zh-CN', { hour12: false })
  } catch {
    return value
  }
}

function formatList(arr) {
  if (!arr || arr.length === 0) return '—'
  if (Array.isArray(arr)) return arr.join('、')
  return arr
}

function formatPreferences(prefs) {
  if (!prefs) return '—'
  if (typeof prefs === 'string') return prefs
  try {
    return Object.entries(prefs)
      .map(([k, v]) => `${k}：${Array.isArray(v) ? v.join('、') : v}`)
      .join('；')
  } catch {
    return JSON.stringify(prefs)
  }
}

function formatValue(value) {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return value
}
</script>

<style scoped>
.profile-modal {
  width: 90%;
  max-width: 900px;
  max-height: 80vh;
  overflow-y: auto;
  padding-bottom: 24px;
}

.profile-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-summary {
  background: #f4f6ff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.summary-status {
  margin: 4px 0 0;
  font-size: 14px;
}

.summary-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: #666;
}

.profile-section {
  background: #fff;
  border-radius: 12px;
  padding: 18px;
  border: 1px solid #f0f0f0;
}

.profile-section h3 {
  margin: 0 0 12px;
  font-size: 16px;
}

.label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.profile-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.profile-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 14px;
  line-height: 1.6;
}

.row-label {
  flex: 0 0 80px;
  font-weight: 600;
  color: #444;
}

.row-value {
  flex: 1;
  margin: 0;
  color: #333;
  white-space: pre-line;
}

.recommendations ul {
  padding-left: 18px;
  margin: 8px 0 0;
  line-height: 1.6;
}

.detail-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.detail-item {
  background: #f9fafc;
  border-radius: 8px;
  padding: 12px;
}
</style>

