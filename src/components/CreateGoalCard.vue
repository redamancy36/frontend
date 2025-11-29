<template>
  <div class="card">
    <h3 class="card-title">创建新目标</h3>
    <GlareHover
      glare-color="#667eea"
      :glare-opacity="0.4"
      class="create-goal-wrapper"
    >
      <ClickRipple
        color="#667eea"
        :duration="800"
        :max-scale="5"
        :opacity="0.5"
        class="create-goal-btn-container"
      >
        <ClickSpark
          spark-color="#ffffff"
          :spark-count="24"
          :spark-radius="80"
          :spark-size="20"
          class="create-goal-btn-spark"
        >
    <button class="create-goal-btn" @click="showModal = true">
      <span class="plus-icon">+</span>
      创建目标
    </button>
        </ClickSpark>
      </ClickRipple>
    </GlareHover>

    <!-- 创建目标模态框 -->
    <Transition name="modal">
    <div v-if="showModal" class="modal active" @click.self="closeModal">
        <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">创建新目标</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
              <label class="form-label">目标标题 <span class="required">*</span></label>
            <input
              v-model="form.title"
              type="text"
              class="form-input"
              placeholder="例如：考研四川大学计算机学院"
              required
                :disabled="loading"
                autofocus
            />
          </div>
          <div class="form-group">
            <label class="form-label">目标描述（可选）</label>
            <textarea
              v-model="form.description"
              class="form-input"
              rows="4"
              placeholder="详细描述你的目标..."
                :disabled="loading"
            ></textarea>
          </div>
          <div v-if="error" class="error-message show">
            {{ error }}
          </div>
          <div class="modal-actions">
            <ClickSpark spark-color="#6c757d" :spark-count="8" class="modal-btn-wrapper">
              <button type="button" class="btn" @click="closeModal" :disabled="loading">取消</button>
            </ClickSpark>
            <ClickSpark spark-color="#667eea" :spark-count="12" class="modal-btn-wrapper">
            <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="btn-loading">
                  <span class="spinner-small"></span>
                  创建中...
                </span>
                <span v-else>创建</span>
            </button>
            </ClickSpark>
          </div>
        </form>
      </div>
    </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/services/api'
import GlareHover from '@/components/animations/GlareHover.vue'
import ClickSpark from '@/components/animations/ClickSpark.vue'
import ClickRipple from '@/components/animations/ClickRipple.vue'

const emit = defineEmits(['goal-created'])

const showModal = ref(false)
const loading = ref(false)
const error = ref('')

const form = ref({
  title: '',
  description: ''
})

function closeModal() {
  showModal.value = false
  form.value = { title: '', description: '' }
  error.value = ''
}

async function handleSubmit() {
  error.value = ''
  loading.value = true

  try {
    const response = await api.post('/goals', {
      title: form.value.title,
      description: form.value.description || null
    })

    if (response.ok || response.status === 202) {
      closeModal()
      emit('goal-created', response.data)
    } else {
      error.value = response.data.message || '创建失败'
    }
  } catch (err) {
    error.value = err.response?.data?.message || '网络错误，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(50px) saturate(200%);
  -webkit-backdrop-filter: blur(50px) saturate(200%);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.6);
  text-align: center;
  position: relative;
  z-index: 1;
}

.card-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.create-goal-wrapper {
  width: 100%;
  border-radius: 12px;
}

.create-goal-btn-container {
  width: 100%;
  border-radius: 12px;
  position: relative;
  min-height: 100px; /* 确保有足够的高度 */
}

.create-goal-btn-spark {
  width: 100%;
  height: 100%;
}

.create-goal-btn {
  width: 100%;
  padding: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  z-index: 2;
  pointer-events: auto; /* 确保可以点击 */
}

.create-goal-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.plus-icon {
  font-size: 32px;
  font-weight: 300;
}

.modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  justify-content: center;
  align-items: center;
}

.modal.active {
  display: flex;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.modal-btn-wrapper {
  display: inline-block;
}

textarea.form-input {
  resize: vertical;
  min-height: 100px;
}

.required {
  color: #dc3545;
}

/* 模态框过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(-20px);
  opacity: 0;
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner-small {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

