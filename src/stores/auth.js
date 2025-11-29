import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  async function login(email, password) {
    try {
      const response = await api.post('/login', { email, password })
      if (response.status === 200) {
        // Flask返回成功，设置认证状态
        token.value = 'authenticated'
        user.value = {
          id: response.data.user_id,
          username: response.data.username || email.split('@')[0],
          email: email
        }
        localStorage.setItem('token', token.value)
        return { success: true }
      }
      return { success: false, message: response.data.message || '登录失败' }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '网络错误，请重试' 
      }
    }
  }

  async function register(email, password, username) {
    try {
      const response = await api.post('/register', { email, password, username })
      if (response.status === 201) {
        return { success: true, message: '注册成功，请登录' }
      }
      return { success: false, message: response.data.message || '注册失败' }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '网络错误，请重试' 
      }
    }
  }

  async function logout() {
    try {
      await api.post('/logout')
    } catch (error) {
      console.error('登出请求失败:', error)
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
    }
  }

  async function checkAuth() {
    // 通过尝试获取goals来检查认证状态
    try {
      const response = await api.get('/goals')
      if (response.status === 200 && response.data.success) {
        // 已认证，可以获取用户信息（如果需要）
        return true
      }
    } catch (error) {
      if (error.response?.status === 401) {
        token.value = null
        localStorage.removeItem('token')
        return false
      }
    }
    return false
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth
  }
})

