<template>
  <div class="auth-container">
    <div class="auth-box">
      <h1 class="auth-title">Project Companion</h1>
      <p class="auth-subtitle">AI规划伴侣</p>
      
      <div class="auth-tabs">
        <button 
          :class="['auth-tab', { active: activeTab === 'login' }]"
          @click="activeTab = 'login'"
        >
          登录
        </button>
        <button 
          :class="['auth-tab', { active: activeTab === 'register' }]"
          @click="activeTab = 'register'"
        >
          注册
        </button>
      </div>

      <!-- 登录表单 -->
      <form 
        v-if="activeTab === 'login'"
        class="auth-form active"
        @submit.prevent="handleLogin"
      >
        <div class="form-group">
          <label class="form-label">邮箱</label>
          <input
            v-model="loginForm.email"
            type="email"
            class="form-input"
            placeholder="请输入邮箱"
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label">密码</label>
          <input
            v-model="loginForm.password"
            type="password"
            class="form-input"
            placeholder="请输入密码"
            required
          />
        </div>
        <div v-if="loginError" class="error-message show">
          {{ loginError }}
        </div>
        <button 
          type="submit" 
          class="form-button"
          :disabled="loginLoading"
        >
          {{ loginLoading ? '登录中...' : '登录' }}
        </button>
      </form>

      <!-- 注册表单 -->
      <form 
        v-if="activeTab === 'register'"
        class="auth-form active"
        @submit.prevent="handleRegister"
      >
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input
            v-model="registerForm.username"
            type="text"
            class="form-input"
            placeholder="请输入用户名"
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label">邮箱</label>
          <input
            v-model="registerForm.email"
            type="email"
            class="form-input"
            placeholder="请输入邮箱"
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label">密码</label>
          <input
            v-model="registerForm.password"
            type="password"
            class="form-input"
            placeholder="请输入密码"
            required
          />
        </div>
        <div v-if="registerError" class="error-message show">
          {{ registerError }}
        </div>
        <button 
          type="submit" 
          class="form-button"
          :disabled="registerLoading"
        >
          {{ registerLoading ? '注册中...' : '注册' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('login')
const loginLoading = ref(false)
const registerLoading = ref(false)
const loginError = ref('')
const registerError = ref('')

const loginForm = ref({
  email: '',
  password: ''
})

const registerForm = ref({
  username: '',
  email: '',
  password: ''
})

async function handleLogin() {
  loginError.value = ''
  loginLoading.value = true
  
  try {
    const result = await authStore.login(loginForm.value.email, loginForm.value.password)
    if (result.success) {
      router.push('/')
    } else {
      loginError.value = result.message
    }
  } catch (error) {
    loginError.value = '登录失败，请重试'
  } finally {
    loginLoading.value = false
  }
}

async function handleRegister() {
  registerError.value = ''
  registerLoading.value = true
  
  try {
    const result = await authStore.register(
      registerForm.value.email,
      registerForm.value.password,
      registerForm.value.username
    )
    if (result.success) {
      alert(result.message || '注册成功，请登录')
      activeTab.value = 'login'
      registerForm.value = { username: '', email: '', password: '' }
    } else {
      registerError.value = result.message
    }
  } catch (error) {
    registerError.value = '注册失败，请重试'
  } finally {
    registerLoading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.auth-box {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.auth-title {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
  color: #667eea;
}

.auth-subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

.auth-tabs {
  display: flex;
  margin-bottom: 30px;
  border-bottom: 2px solid #eee;
}

.auth-tab {
  flex: 1;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  border: none;
  background: none;
  font-size: 16px;
  color: #999;
  transition: all 0.3s;
}

.auth-tab.active {
  color: #667eea;
  border-bottom: 2px solid #667eea;
  margin-bottom: -2px;
}

.auth-form {
  display: block;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.form-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.form-button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.form-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  font-size: 14px;
  margin-top: 8px;
  display: none;
}

.error-message.show {
  display: block;
}
</style>

