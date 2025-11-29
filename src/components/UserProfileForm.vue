<template>
  <div class="user-profile-form-container">
    <div class="form-header">
      <h3>📋 初始学习状态评估</h3>
      <p class="form-description">请详细填写您的学习情况，这将帮助我们为您制定更个性化的学习计划</p>
    </div>

    <form @submit.prevent="submitForm" class="profile-form">
      <!-- 基本信息 -->
      <div class="form-section">
        <h4 class="section-title">基本信息</h4>
        
        <div class="form-group">
          <label for="current_school">目前就读院校 <span class="required">*</span></label>
          <input
            id="current_school"
            v-model="formData.current_school"
            type="text"
            placeholder="例如：四川大学"
            required
          />
        </div>

        <div class="form-group">
          <label for="current_major">就读专业 <span class="required">*</span></label>
          <input
            id="current_major"
            v-model="formData.current_major"
            type="text"
            placeholder="例如：计算机科学与技术"
            required
          />
        </div>

        <div class="form-group">
          <label for="grade">年级 <span class="required">*</span></label>
          <select id="grade" v-model="formData.grade" required>
            <option value="">请选择</option>
            <option value="大一">大一</option>
            <option value="大二">大二</option>
            <option value="大三">大四</option>
            <option value="大四">大四</option>
            <option value="已毕业">已毕业</option>
          </select>
        </div>
      </div>

      <!-- 学习情况 -->
      <div class="form-section">
        <h4 class="section-title">学习情况</h4>
        
        <div class="form-group">
          <label for="major_courses">专业课学习情况 <span class="required">*</span></label>
          <textarea
            id="major_courses"
            v-model="formData.major_courses"
            rows="3"
            placeholder="请描述您的专业课学习情况，包括已学课程、掌握程度、薄弱环节等"
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label for="public_courses">公共课学习情况 <span class="required">*</span></label>
          <textarea
            id="public_courses"
            v-model="formData.public_courses"
            rows="3"
            placeholder="请描述您的数学、英语、政治等公共课学习情况"
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label for="learning_motivation">学习积极性 <span class="required">*</span></label>
          <select id="learning_motivation" v-model="formData.learning_motivation" required>
            <option value="">请选择</option>
            <option value="非常高">非常高</option>
            <option value="较高">较高</option>
            <option value="一般">一般</option>
            <option value="较低">较低</option>
            <option value="需要提升">需要提升</option>
          </select>
        </div>

        <div class="form-group">
          <label for="daily_study_time">每天可用于备战考研的时间 <span class="required">*</span></label>
          <select id="daily_study_time" v-model="formData.daily_study_time" required>
            <option value="">请选择</option>
            <option value="1-2小时">1-2小时</option>
            <option value="3-4小时">3-4小时</option>
            <option value="5-6小时">5-6小时</option>
            <option value="7-8小时">7-8小时</option>
            <option value="8小时以上">8小时以上</option>
          </select>
        </div>
      </div>

      <!-- 心理状态 -->
      <div class="form-section">
        <h4 class="section-title">心理状态</h4>
        
        <div class="form-group">
          <label for="has_pressure">是否有压力 <span class="required">*</span></label>
          <select id="has_pressure" v-model="formData.has_pressure" required>
            <option value="">请选择</option>
            <option value="压力很大">压力很大</option>
            <option value="有一定压力">有一定压力</option>
            <option value="压力适中">压力适中</option>
            <option value="压力较小">压力较小</option>
            <option value="没有压力">没有压力</option>
          </select>
        </div>

        <div class="form-group">
          <label for="why_graduate">为什么要考研 <span class="required">*</span></label>
          <textarea
            id="why_graduate"
            v-model="formData.why_graduate"
            rows="3"
            placeholder="请描述您考研的动机和目标，例如：提升学历、转专业、学术研究等"
            required
          ></textarea>
        </div>
      </div>

      <!-- 学习资源 -->
      <div class="form-section">
        <h4 class="section-title">学习资源</h4>
        
        <div class="form-group">
          <label for="has_study_materials">是否有自己的学习资料 <span class="required">*</span></label>
          <select id="has_study_materials" v-model="formData.has_study_materials" required>
            <option value="">请选择</option>
            <option value="有完整资料">有完整资料（教材、真题、辅导书等）</option>
            <option value="有部分资料">有部分资料</option>
            <option value="资料较少">资料较少</option>
            <option value="没有资料">没有资料</option>
          </select>
        </div>

        <div class="form-group">
          <label for="has_tutoring">是否报了辅导班</label>
          <select id="has_tutoring" v-model="formData.has_tutoring">
            <option value="">请选择</option>
            <option value="已报班">已报班</option>
            <option value="计划报班">计划报班</option>
            <option value="不报班">不报班</option>
          </select>
        </div>

        <div v-if="formData.has_tutoring === '已报班'" class="form-group">
          <label for="tutoring_details">辅导班详情</label>
          <input
            id="tutoring_details"
            v-model="formData.tutoring_details"
            type="text"
            placeholder="例如：新东方数学强化班"
          />
        </div>
      </div>

      <!-- 英语水平 -->
      <div class="form-section">
        <h4 class="section-title">英语水平</h4>
        
        <div class="form-group">
          <label for="english_level">英语水平 <span class="required">*</span></label>
          <select id="english_level" v-model="formData.english_level" required>
            <option value="">请选择</option>
            <option value="四级未过">四级未过</option>
            <option value="四级已过">四级已过</option>
            <option value="六级已过">六级已过</option>
            <option value="雅思">雅思（请填写分数）</option>
            <option value="托福">托福（请填写分数）</option>
            <option value="其他">其他</option>
          </select>
        </div>

        <div v-if="formData.english_level === '雅思' || formData.english_level === '托福'" class="form-group">
          <label for="english_score">分数</label>
          <input
            id="english_score"
            v-model="formData.english_score"
            type="text"
            placeholder="例如：雅思 7.0 或 托福 100"
          />
        </div>
      </div>

      <!-- 其他信息 -->
      <div class="form-section">
        <h4 class="section-title">其他信息</h4>
        
        <div class="form-group">
          <label for="additional_info">其他需要说明的情况</label>
          <textarea
            id="additional_info"
            v-model="formData.additional_info"
            rows="3"
            placeholder="例如：有实习经历、参加过竞赛、有科研经历等"
          ></textarea>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="form-actions">
        <button type="submit" class="btn-submit" :disabled="submitting">
          <span v-if="submitting">提交中...</span>
          <span v-else>提交评估</span>
        </button>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/services/api'

const props = defineProps({
  goalId: {
    type: Number,
    required: true
  },
  nodeId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['submitted', 'close'])

const formData = ref({
  current_school: '',
  current_major: '',
  grade: '',
  major_courses: '',
  public_courses: '',
  learning_motivation: '',
  daily_study_time: '',
  has_pressure: '',
  why_graduate: '',
  has_study_materials: '',
  has_tutoring: '',
  tutoring_details: '',
  english_level: '',
  english_score: '',
  additional_info: ''
})

const submitting = ref(false)
const error = ref('')

async function submitForm() {
  if (submitting.value) return
  
  submitting.value = true
  error.value = ''
  
  try {
    const response = await api.post(`/goals/${props.goalId}/profile/update`, {
      node_id: props.nodeId,
      profile_data: formData.value
    })
    
    if (response.data && response.data.success) {
      // 确保regenerating标志正确传递
      const regenerating = response.data.regenerating !== undefined ? response.data.regenerating : true
      console.log('[UserProfileForm] 提交成功，regenerating:', regenerating)
      
      // 显示成功提示
      const { toast } = await import('@/utils/toast')
      toast.success('用户画像已成功更新')
      
      emit('submitted', {
        nodeId: props.nodeId,
        profileData: formData.value,
        regenerating: regenerating
      })
    } else {
      const errorMsg = response.data?.message || '提交失败，请重试'
      error.value = errorMsg
      
      // 显示错误提示
      const { toast } = await import('@/utils/toast')
      toast.error(errorMsg)
    }
  } catch (err) {
    console.error('提交用户画像失败:', err)
    // 更详细的错误信息
    let errorMsg = '网络错误，请重试'
    if (err.response) {
      // 服务器返回了错误响应
      errorMsg = err.response.data?.message || err.response.data?.error || `服务器错误: ${err.response.status} ${err.response.statusText}`
    } else if (err.request) {
      // 请求已发出但没有收到响应
      errorMsg = '网络错误：无法连接到服务器，请检查网络连接'
    } else {
      // 其他错误
      errorMsg = err.message || '未知错误，请重试'
    }
    error.value = errorMsg
    
    // 显示错误提示
    const { toast } = await import('@/utils/toast')
    toast.error(errorMsg)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.user-profile-form-container {
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
}

.form-header {
  margin-bottom: 24px;
  text-align: center;
}

.form-header h3 {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.form-description {
  color: #666;
  font-size: 14px;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background: #fafafa;
}

.section-title {
  font-size: 18px;
  color: #667eea;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #667eea;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.required {
  color: #dc3545;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  margin-top: 8px;
  text-align: center;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background: #ffe6e6;
  border: 1px solid #ff9999;
  border-radius: 6px;
  color: #cc0000;
  text-align: center;
}
</style>

