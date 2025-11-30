<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content feedback-modal">
      <div class="modal-header">
        <h3>📝 计划反馈</h3>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>
      
      <div class="modal-body">
        <div class="feedback-info">
          <p>您的意见对我们很重要！请告诉我们您对当前学习计划的看法，我们会认真分析并根据您的反馈调整计划。</p>
          <p class="hint">💡 提示：为了保持计划稳定性，24小时内只能提交一次反馈。</p>
        </div>
        
        <form @submit.prevent="handleSubmit">
          <!-- 反馈类型 -->
          <div class="form-group">
            <label for="feedback_type">反馈类型 <span class="required">*</span></label>
            <select 
              id="feedback_type" 
              v-model="formData.feedback_type" 
              required
              class="form-select"
            >
              <option value="">请选择反馈类型</option>
              <option value="difficulty">难度问题（任务太难或太简单）</option>
              <option value="time">时间安排（任务量或时间安排不合理）</option>
              <option value="content">内容问题（任务内容不符合需求）</option>
              <option value="other">其他建议</option>
            </select>
          </div>
          
          <!-- 难度系数选择（仅在选择"难度问题"时显示） -->
          <div v-if="formData.feedback_type === 'difficulty'" class="form-group difficulty-select-group">
            <label>
              期望难度系数
              <span class="required">*</span>
            </label>
            <div class="difficulty-options">
              <button
                v-for="option in difficultyOptions"
                :key="option.value"
                type="button"
                :class="['difficulty-option', { active: formData.difficulty_score === option.value }]"
                @click="formData.difficulty_score = option.value"
              >
                {{ option.label }}
              </button>
            </div>
            <small class="form-hint">
              当前选择：<strong>{{ getDifficultyLabel(formData.difficulty_score) }}</strong>（{{ formData.difficulty_score }}分）
            </small>
          </div>
          
          <!-- 针对阶段（可选） -->
          <div class="form-group">
            <label for="target_stage">针对阶段（可选）</label>
            <select 
              id="target_stage" 
              v-model="formData.target_stage" 
              class="form-select"
            >
              <option value="">不指定（针对整个计划）</option>
              <option v-for="stage in availableStages" :key="stage.order_index" :value="stage.order_index">
                阶段{{ stage.order_index }}: {{ stage.name }}
              </option>
            </select>
          </div>
          
          <!-- 反馈内容 -->
          <div class="form-group">
            <label for="feedback_text">反馈内容 <span class="required">*</span></label>
            <textarea
              id="feedback_text"
              v-model="formData.feedback_text"
              rows="5"
              required
              placeholder="请详细描述您的意见或建议，例如：任务难度、时间安排、内容方向等..."
              class="form-textarea"
              maxlength="1000"
            ></textarea>
            <small class="form-hint">{{ formData.feedback_text.length }}/1000</small>
          </div>
          
          <!-- 具体建议（可选） -->
          <div class="form-group">
            <label for="suggestions">具体建议（可选）</label>
            <textarea
              id="suggestions"
              v-model="formData.suggestions"
              rows="3"
              placeholder="如果您有具体的改进建议，请在这里填写..."
              class="form-textarea"
              maxlength="500"
            ></textarea>
            <small class="form-hint">{{ formData.suggestions.length }}/500</small>
          </div>
          
          <!-- 错误提示 -->
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="$emit('close')" class="btn btn-secondary" :disabled="submitting">
              取消
            </button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <span v-if="submitting">
                <span class="spinner-small"></span>
                提交中...
              </span>
              <span v-else>提交反馈</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'PlanFeedbackModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    goalId: {
      type: Number,
      required: true
    },
    planStages: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      formData: {
        feedback_type: '',
        target_stage: '',
        target_task_id: null,
        difficulty_score: 50, // 默认中等（50分对应原70分）
        feedback_text: '',
        suggestions: ''
      },
      submitting: false,
      error: null,
      // 难度选项（对应新的难度映射）
      difficultyOptions: [
        { label: '超简单', value: 10, range: '0-20' },
        { label: '简单', value: 30, range: '21-40' },
        { label: '中等', value: 50, range: '41-60' },
        { label: '困难', value: 68, range: '61-75' },
        { label: '非常难', value: 83, range: '76-90' },
        { label: '超难', value: 95, range: '91-100' }
      ]
    }
  },
  computed: {
    availableStages() {
      return this.planStages.filter(stage => stage.order_index) || []
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        // 重置表单
        this.formData = {
          feedback_type: '',
          target_stage: '',
          target_task_id: null,
          difficulty_score: 50, // 默认中等（50分对应原70分）
          feedback_text: '',
          suggestions: ''
        }
        this.error = null
      }
    }
  },
  methods: {
    async handleSubmit() {
      this.submitting = true
      this.error = null
      
      try {
        // 处理target_stage（如果选择的是空字符串，设为null）
        const payload = {
          ...this.formData,
          target_stage: this.formData.target_stage ? parseInt(this.formData.target_stage) : null,
          target_task_id: this.formData.target_task_id || null
        }
        
        const response = await api.post(`/goals/${this.goalId}/plan/feedback`, payload)
        
        if (response.status === 201 || response.data) {
          // 显示成功提示
          const { toast } = await import('@/utils/toast')
          toast.success('反馈已提交！系统正在分析您的意见，我们会在24小时内处理...', { duration: 4000 })
          
          // 通知父组件
          this.$emit('submitted', response.data)
          this.$emit('close')
        } else {
          this.error = response.data?.error || '提交失败，请重试'
        }
      } catch (error) {
        console.error('提交反馈失败:', error)
        
        let errorMessage = '提交失败，请重试'
        if (error.response) {
          if (error.response.status === 429) {
            errorMessage = error.response.data?.error || '提交过于频繁，请稍后再试'
          } else {
            errorMessage = error.response.data?.error || `服务器错误: ${error.response.status}`
          }
        } else if (error.request) {
          errorMessage = '网络错误，请检查网络连接'
        }
        
        this.error = errorMessage
        
        // 显示错误提示
        const { toast } = await import('@/utils/toast')
        toast.error(errorMessage)
      } finally {
        this.submitting = false
      }
    },
    getDifficultyLabel(score) {
      const option = this.difficultyOptions.find(opt => opt.value === score)
      return option ? option.label : '未选择'
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f0f0f0;
  color: #333;
}

.modal-body {
  padding: 20px;
}

.feedback-info {
  background: linear-gradient(135deg, #f5f3ff 0%, #e0e7ff 100%);
  border-left: 4px solid #667eea;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.feedback-info p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #555;
  line-height: 1.6;
}

.feedback-info p:last-child {
  margin-bottom: 0;
}

.hint {
  font-size: 12px !important;
  color: #666 !important;
}

.form-group {
  margin-bottom: 20px;
}

.difficulty-select-group {
  margin-top: 4px;
}

.difficulty-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 8px;
}

@media (max-width: 600px) {
  .difficulty-options {
    grid-template-columns: repeat(2, 1fr);
  }
}

.difficulty-option {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.difficulty-option:hover {
  border-color: #667eea;
  background: #f5f3ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.difficulty-option.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.difficulty-option.active:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.required {
  color: #e74c3c;
}

.form-select,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #999;
  text-align: right;
}

.error-message {
  padding: 12px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 6px;
  color: #c33;
  font-size: 14px;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e0e0;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.spinner-small {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

