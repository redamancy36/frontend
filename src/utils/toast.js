// Toast工具函数 - 全局可用的提示服务
import { showToast } from '../components/Toast.vue'

export function showToastMessage(message, type = 'info', options = {}) {
  return showToast(message, type, options)
}

export const toast = {
  success: (message, options = {}) => {
    return showToast(message, 'success', { duration: 3000, ...options })
  },
  error: (message, options = {}) => {
    return showToast(message, 'error', { duration: 4000, ...options })
  },
  warning: (message, options = {}) => {
    return showToast(message, 'warning', { duration: 3500, ...options })
  },
  info: (message, options = {}) => {
    return showToast(message, 'info', { duration: 3000, ...options })
  }
}

export default toast

