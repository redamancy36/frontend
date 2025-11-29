<template>
  <div v-if="show" class="modal active" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">自检</h2>
        <button class="close-btn" @click="close">&times;</button>
      </div>
      
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>加载任务信息中...</p>
      </div>
      
      <!-- 任务信息和表单（只在没有结果时显示） -->
      <div v-else-if="task">
        <div class="task-info">
          <h3>{{ task.title || '任务' }}</h3>
          <p>{{ task.description || '未提供描述' }}</p>
          <p v-if="task.due_date">📅 截止日期：{{ task.due_date }}</p>
        </div>
        
        <form @submit.prevent="handleSubmit" class="exam-answer-form">
          <div v-if="task.task_items && task.task_items.length > 0" class="task-questions">
            <div class="exam-paper-header">
              <h4 class="exam-section-title">自测题目</h4>
            </div>
            <div
              v-for="(item, index) in task.task_items"
              :key="item.id || index"
              class="exam-question-item"
            >
              <!-- 题目编号（标准考试格式） -->
              <div class="question-number">
                <span class="question-number-text">题目 {{ index + 1 }}</span>
                <span class="question-type-badge">{{ getQuestionTypeLabel(item.question_type) }}</span>
              </div>
              
              <!-- 题目内容（印刷风格） -->
              <div class="question-content-exam" v-html="renderMath(item.content || '题目内容')"></div>
              
              <!-- 选项（标准考试格式：垂直排列） -->
              <div v-if="item.options" class="question-options-exam">
                <div v-for="(value, key) in parseOptions(item.options)" :key="key" class="option-item-exam">
                  <span class="option-label">{{ key }}.</span>
                  <span class="option-content" v-html="renderMath(value)"></span>
                </div>
              </div>
              
              <!-- 用户答案（如果有历史答案则显示，但题目始终可见） -->
              <div v-if="item.user_response" class="user-response-exam">
                <span class="user-response-label">上次答案：</span>
                <span class="user-response-text">{{ item.user_response }}</span>
                <span v-if="item.is_correct !== null" :class="['result-badge-exam', item.is_correct ? 'correct' : 'incorrect']">
                  {{ item.is_correct ? '✓ 正确' : '✗ 错误' }}
                </span>
              </div>
              
              <!-- 答题区（始终显示，允许重复提交） -->
              <div class="question-answer-section">
                <label class="form-label-exam">你的答案：</label>
                <textarea
                  v-model="answers[index]"
                  class="form-input-exam question-answer-input"
                  rows="4"
                  :placeholder="item.user_response ? `重新作答题目 ${index + 1}（可修改上次答案）...` : `请输入题目 ${index + 1} 的答案...`"
                  :disabled="submitting"
                ></textarea>
              </div>
            </div>
          </div>
          
          <div v-if="error" class="error-message show">
            {{ error }}
          </div>
          <div class="modal-actions">
            <button type="button" class="btn" @click="close" :disabled="submitting">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="submitting || !hasAnyAnswer">
              {{ submitting ? '批改中...' : '提交' }}
            </button>
          </div>
        </form>
      </div>
      
      <div v-else-if="error && !loading && !submitting" class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <p>{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import api from '@/services/api'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  taskId: {
    type: Number,
    default: null
  },
  goalId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['close', 'submitted', 'evaluated'])

const task = ref(null)
const loading = ref(false)
const answers = ref([])  // 改为数组，存储每道题的答案
const submitting = ref(false)
const error = ref('')
const isStage1 = ref(false)  // 判断是否是阶段1任务
watch(() => props.show, async (newVal) => {
  if (newVal && props.taskId) {
    await loadTask()
  } else {
    reset()
  }
})

async function loadTask() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await api.get(`/goals/${props.goalId}/plan`)
    if (response.data) {
      // 查找任务
      const plan = response.data
      for (const stage of plan.stages || []) {
        for (const node of stage.nodes || []) {
          for (const t of node.tasks || []) {
            if (t.id === props.taskId) {
              task.value = t
              break
            }
          }
          if (task.value) break
        }
        if (task.value) break
      }
      
      if (!task.value) {
        error.value = '找不到指定的任务'
      } else {
        // 初始化答案数组，为每道题创建一个空答案
        const taskItemsCount = task.value.task_items?.length || 0
        answers.value = new Array(taskItemsCount).fill('')
        
        // 判断是否是阶段1（通过查找任务所属的阶段）
        for (const stage of plan.stages || []) {
          if (stage.order_index === 1) {
            for (const node of stage.nodes || []) {
              for (const t of node.tasks || []) {
                if (t.id === props.taskId) {
                  isStage1.value = true
                  break
                }
              }
              if (isStage1.value) break
            }
            if (isStage1.value) break
          }
        }
      }
    }
  } catch (err) {
    console.error('加载任务失败:', err)
    error.value = '加载任务信息失败'
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (submitting.value) return
  if (!task.value) {
    error.value = '无法找到任务，请刷新后重试'
    return
  }
  
  // 检查是否有任何答案
  const hasAnswer = answers.value.some(ans => ans && ans.trim())
  if (!hasAnswer) {
    error.value = '请至少填写一道题的答案'
    return
  }
  
  // 将每道题的答案组合成字符串
  const userAnswer = answers.value
    .map((ans, index) => {
      const trimmed = ans ? ans.trim() : ''
      if (trimmed) {
        return `题目 ${index + 1}: ${trimmed}`
      }
      return `题目 ${index + 1}: (未作答)`
    })
    .join('\n\n')
  
  error.value = ''
  submitting.value = true
  const currentTask = {
    id: task.value.id,
    title: task.value.title || '任务'
  }

  emit('submitted', {
    taskId: currentTask.id,
    taskTitle: currentTask.title
  })
  close()
  submitting.value = false

  try {
    const response = await api.post(`/goals/${props.goalId}/tasks/${currentTask.id}/self_check`, {
      user_answer: userAnswer
    })

    if (response.status === 200 && response.data) {
      // 阶段1任务返回不同的数据结构
      if (response.data.is_stage1) {
        emit('evaluated', {
          is_stage1: true,
          message: response.data.message || '信息已成功保存到用户画像',
          taskTitle: currentTask.title,
          taskId: currentTask.id,
          profile_updated: true
        })
      } else {
        emit('evaluated', {
          ...response.data,
          taskTitle: currentTask.title,
          taskId: currentTask.id
        })
      }
    } else {
      emit('evaluated', {
        error: true,
        message: response.data?.message || '自检失败，请稍后重试',
        taskTitle: currentTask.title,
        taskId: currentTask.id
      })
    }
  } catch (err) {
    console.error('[SelfCheckModal] 提交失败:', err)
    emit('evaluated', {
      error: true,
      message: err.response?.data?.message || '网络错误，请重试',
      taskTitle: currentTask.title,
      taskId: currentTask.id
    })
  }
}

function close() {
  emit('close')
  reset()
}

function reset() {
  task.value = null
  answers.value = []
  error.value = ''
}

// 计算属性：检查是否有任何答案
const hasAnyAnswer = computed(() => {
  return answers.value.some(ans => ans && ans.trim())
})

function getQuestionTypeLabel(type) {
  const labels = {
    'MCQ': '单选题',
    'FILL': '填空题',
    'QA': '简答题',
    'CALC': '计算题'
  }
  return labels[type] || type || '题目'
}

function parseOptions(options) {
  if (typeof options === 'string') {
    try {
      options = JSON.parse(options)
    } catch {
      return {}
    }
  }
  return options || {}
}

function formatOptions(options) {
  const parsed = parseOptions(options)
  return Object.entries(parsed).map(([key, value]) => `${key}: ${value}`).join(', ')
}

/**
 * 渲染包含 LaTeX 数学公式的文本
 * 支持行内公式 $...$ 和块级公式 $$...$$
 */
function renderMath(text) {
  if (!text || typeof text !== 'string') return text
  
  try {
    // 转义 HTML 特殊字符（除了我们需要的标签）
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    
    // 处理块级公式 $$...$$
    html = html.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), {
          displayMode: true,
          throwOnError: false,
          errorColor: '#cc0000'
        })
      } catch (e) {
        return `<span class="math-error">[公式错误: ${formula}]</span>`
      }
    })
    
    // 处理行内公式 $...$
    html = html.replace(/\$([^$\n]+)\$/g, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), {
          displayMode: false,
          throwOnError: false,
          errorColor: '#cc0000'
        })
      } catch (e) {
        return `<span class="math-error">[公式错误: ${formula}]</span>`
      }
    })
    
    // 处理 LaTeX 环境 \[...\] 和 \(...\)
    html = html.replace(/\\\[([^\]]+)\\\]/g, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), {
          displayMode: true,
          throwOnError: false,
          errorColor: '#cc0000'
        })
      } catch (e) {
        return `<span class="math-error">[公式错误: ${formula}]</span>`
      }
    })
    
    html = html.replace(/\\\(([^\)]+)\\\)/g, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), {
          displayMode: false,
          throwOnError: false,
          errorColor: '#cc0000'
        })
      } catch (e) {
        return `<span class="math-error">[公式错误: ${formula}]</span>`
      }
    })
    
    // 恢复 HTML 标签（如果有的话）
    html = html
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
    
    return html
  } catch (e) {
    console.error('渲染数学公式失败:', e)
    return text
  }
}

</script>

<style scoped>
/* ========== 标准考试试卷样式 ========== */

.exam-paper-container {
  background: #ffffff;
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.task-info-exam {
  margin-bottom: 24px;
  padding: 16px 0;
  border-bottom: 2px solid #333;
}

.task-title-exam {
  margin: 0 0 8px 0;
  color: #000;
  font-size: 18px;
  font-weight: bold;
  font-family: 'SimSun', 'STSong', 'Times New Roman', serif;
}

.task-description-exam {
  margin: 8px 0;
  color: #333;
  font-size: 14px;
  line-height: 1.6;
  font-family: 'SimSun', 'STSong', 'Times New Roman', serif;
}

.task-due-date-exam {
  margin: 8px 0 0 0;
  color: #666;
  font-size: 13px;
  font-family: 'SimSun', 'STSong', 'Times New Roman', serif;
}

.exam-paper-header {
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #333;
}

.exam-section-title {
  font-size: 18px;
  font-weight: bold;
  color: #000;
  margin: 0;
  font-family: 'SimSun', 'STSong', 'Times New Roman', serif;
  letter-spacing: 1px;
}

.exam-question-item {
  margin-bottom: 32px;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  page-break-inside: avoid; /* 避免题目被分页截断 */
}

/* 题目编号（标准考试格式） */
.question-number {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ddd;
}

.question-number-text {
  font-size: 16px;
  font-weight: bold;
  color: #000;
  font-family: 'SimSun', 'STSong', 'Times New Roman', serif;
  margin-right: 12px;
}

.question-type-badge {
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 3px;
  font-family: 'SimSun', 'STSong', 'Times New Roman', serif;
}

/* 题目内容（印刷风格） */
.question-content-exam {
  font-size: 16px;
  line-height: 2;
  color: #000;
  margin-bottom: 16px;
  font-family: 'Times New Roman', 'STSong', 'SimSun', serif;
  text-align: left;
  padding: 0;
  background: transparent;
  border: none;
}

.question-content-exam :deep(.katex) {
  font-size: 1em;
  color: #000;
}

.question-content-exam :deep(.katex-display) {
  margin: 16px 0;
  text-align: center;
  overflow-x: auto;
  overflow-y: hidden;
}

.question-content-exam :deep(.katex-display > .katex) {
  text-align: center;
  display: inline-block;
}

.math-error {
  color: #cc0000;
  font-style: italic;
  background: #ffe6e6;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
}

.question-options {
  font-size: 14px;
  color: #555;
  margin-left: 10px;
  margin-top: 8px;
}

.option-item {
  margin: 8px 0;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
  line-height: 1.6;
  font-family: 'Times New Roman', 'STSong', 'SimSun', serif;
}

.option-item :deep(.katex) {
  font-size: 1.05em;
}

.option-item strong {
  color: #667eea;
  margin-right: 8px;
}

.user-response {
  margin-top: 4px;
  font-size: 13px;
  color: #667eea;
}

.result-badge {
  margin-left: 10px;
  font-weight: 500;
}

.result-badge.correct {
  color: #28a745;
}

.result-badge.incorrect {
  color: #dc3545;
}

.self-check-result {
  margin-top: 20px;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
}

.result-header h3 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.result-badge-top {
  font-size: 36px;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 12px;
  min-width: 100px;
  text-align: center;
}

.score-excellent {
  background: #d4edda;
  color: #155724;
}

.score-good {
  background: #cce5ff;
  color: #004085;
}

.score-fair {
  background: #fff3cd;
  color: #856404;
}

.score-poor {
  background: #f8d7da;
  color: #721c24;
}

.verdict-box {
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid;
}

.verdict-excellent {
  background: #e7f5e7;
  border-color: #28a745;
}

.verdict-good {
  background: #e7f3ff;
  border-color: #007bff;
}

.verdict-fair {
  background: #fff8e1;
  border-color: #ffc107;
}

.verdict-poor {
  background: #ffe7e7;
  border-color: #dc3545;
}

.verdict-text {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.6;
  color: #333;
}

.result-section {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 16px;
  color: #333;
}

.section-icon {
  font-size: 20px;
}

.result-strengths {
  background: #e7f5e7;
  border-left: 4px solid #28a745;
}

.result-mistakes {
  background: #ffe7e7;
  border-left: 4px solid #dc3545;
}

.result-plan {
  background: #e7f3ff;
  border-left: 4px solid #007bff;
}

.result-reference {
  background: #fff8e1;
  border-left: 4px solid #ffc107;
}

.result-rag {
  background: #f0e7ff;
  border-left: 4px solid #667eea;
}

.section-list {
  margin: 0;
  padding-left: 25px;
}

.section-list li {
  margin-bottom: 8px;
  line-height: 1.6;
  color: #555;
}

.reference-content {
  padding: 12px;
  background: #fffbf0;
  border-radius: 6px;
  line-height: 1.8;
  color: #333;
  font-family: 'Times New Roman', 'STSong', 'SimSun', serif;
  font-size: 15px;
}

.reference-content :deep(.katex) {
  font-size: 1.1em;
}

.reference-content :deep(.katex-display) {
  margin: 1em 0;
  text-align: center;
  overflow-x: auto;
  overflow-y: hidden;
}

.reference-content :deep(.katex-display > .katex) {
  text-align: center;
  display: inline-block;
}

.rag-link {
  color: #667eea;
  text-decoration: none;
  margin-left: 10px;
  font-size: 14px;
}

.rag-link:hover {
  text-decoration: underline;
}

.submitting-message {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #e7f3ff;
  border-radius: 8px;
  margin: 15px 0;
}

.submitting-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #28a745;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  flex-shrink: 0;
}

.submitting-text {
  flex: 1;
}

.success-text {
  font-size: 16px;
  font-weight: 600;
  color: #28a745;
  margin: 0 0 5px 0;
}

.processing-text {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.submitting-full {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.submitting-icon-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #28a745;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 20px;
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.submitting-text-large {
  max-width: 400px;
}

.success-text-large {
  font-size: 24px;
  font-weight: 600;
  color: #28a745;
  margin: 0 0 15px 0;
}

.processing-text-large {
  font-size: 16px;
  color: #666;
  margin: 0 0 20px 0;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.loading-dots span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #667eea;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* ========== 考试答案表单样式 ========== */
.exam-answer-form {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #333;
}

.form-group-exam {
  margin-bottom: 20px;
}

.form-label-exam {
  display: block;
  margin-bottom: 12px;
  font-weight: bold;
  color: #000;
  font-size: 16px;
  font-family: 'SimSun', 'STSong', 'Times New Roman', serif;
}

.form-input-exam {
  width: 100%;
  padding: 16px;
  border: 2px solid #333;
  border-radius: 4px;
  font-size: 15px;
  font-family: 'Times New Roman', 'STSong', 'SimSun', serif;
  line-height: 1.8;
  resize: vertical;
  background: #ffffff;
  color: #000;
  transition: border-color 0.2s;
}

.form-input-exam:focus {
  outline: none;
  border-color: #000;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

.form-input-exam::placeholder {
  color: #999;
  font-style: italic;
}

/* 选项样式补充 */
.question-options-exam {
  margin: 16px 0;
  padding-left: 24px;
}

.option-item-exam {
  display: flex;
  align-items: flex-start;
  margin: 10px 0;
  line-height: 1.8;
  font-family: 'Times New Roman', 'STSong', 'SimSun', serif;
  font-size: 15px;
  color: #000;
  padding: 4px 0;
}

.option-label {
  font-weight: normal;
  color: #000;
  margin-right: 8px;
  min-width: 20px;
  font-family: 'Times New Roman', 'STSong', 'SimSun', serif;
}

.option-content {
  flex: 1;
  color: #000;
  line-height: 1.8;
}

.option-item-exam :deep(.katex) {
  font-size: 1em;
  color: #000;
}

/* 用户答案样式补充 */
.user-response-exam {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed #ccc;
  font-size: 14px;
  font-family: 'SimSun', 'STSong', 'Times New Roman', serif;
}

.user-response-label {
  color: #666;
  font-weight: normal;
}

.user-response-text {
  color: #000;
  margin-left: 8px;
}

.result-badge-exam {
  margin-left: 12px;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: bold;
}

.result-badge-exam.correct {
  background: #e8f5e9;
  color: #2e7d32;
}

.result-badge-exam.incorrect {
  background: #ffebee;
  color: #c62828;
}

/* 每道题下面的答题区样式 */
.question-answer-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed #ddd;
}

.question-answer-section .form-label-exam {
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
}

.question-answer-input {
  margin-top: 8px;
  border: 1px solid #ccc;
  font-size: 14px;
  padding: 12px;
  min-height: 80px;
}

.question-answer-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}
</style>

