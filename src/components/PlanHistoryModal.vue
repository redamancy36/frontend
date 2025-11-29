<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content history-modal">
      <div class="modal-header">
        <h3>📜 计划修改历史</h3>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>
      
      <div class="modal-body">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>
        
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="loadHistory" class="btn-retry">重试</button>
        </div>
        
        <div v-else-if="history.length === 0" class="empty-state">
          <p>暂无修改历史记录</p>
        </div>
        
        <div v-else class="history-list">
          <div
            v-for="item in history"
            :key="item.id"
            class="history-item"
            :class="getModificationTypeClass(item.modification_type)"
          >
            <div class="history-icon" :class="getModificationTypeIconClass(item.modification_type)">
              <span>{{ getModificationTypeIcon(item.modification_type) }}</span>
            </div>
            
            <div class="history-body">
              <div class="history-header">
                <h4>版本 {{ item.version }}</h4>
                <span class="history-type">{{ getModificationTypeLabel(item.modification_type) }}</span>
              </div>
              
              <div class="history-reason">
                <strong>修改原因：</strong>
                <span>{{ item.reason || '无说明' }}</span>
              </div>
              
              <!-- 如果是基于反馈的修改，显示反馈信息 -->
              <div v-if="item.feedback_info" class="history-feedback">
                <strong>用户反馈：</strong>
                <span>{{ item.feedback_info.feedback_text }}</span>
                <span class="feedback-type-badge" :class="`type-${item.feedback_info.feedback_type}`">
                  {{ getFeedbackTypeLabel(item.feedback_info.feedback_type) }}
                </span>
              </div>
              
              <div class="history-meta">
                <span class="meta-item">
                  <strong>修改者：</strong>{{ item.modified_by === 'user' ? '用户' : '系统' }}
                </span>
                <span class="meta-item">
                  <strong>时间：</strong>{{ formatDate(item.created_at) }}
                </span>
                <span v-if="item.base_version" class="meta-item">
                  <strong>基于版本：</strong>{{ item.base_version }}
                </span>
              </div>
              
              <!-- 显示修改详情（如果有） -->
              <div v-if="item.changes && Object.keys(item.changes).length > 0" class="history-changes">
                <details>
                  <summary>查看修改详情</summary>
                  <pre>{{ JSON.stringify(item.changes, null, 2) }}</pre>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary">关闭</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'PlanHistoryModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    goalId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      history: [],
      loading: false,
      error: null
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.loadHistory()
      }
    }
  },
  methods: {
    async loadHistory() {
      if (!this.goalId) return
      
      this.loading = true
      this.error = null
      
      try {
        const response = await api.get(`/goals/${this.goalId}/plan/modification-history`)
        this.history = response.data || []
      } catch (error) {
        console.error('[PlanHistoryModal] 加载修改历史失败:', error)
        this.error = error.response?.data?.error || '加载失败，请重试'
      } finally {
        this.loading = false
      }
    },
    
    getModificationTypeLabel(type) {
      const labels = {
        'user_feedback': '用户反馈调整',
        'profile_update': '用户画像更新',
        'stage_completion': '阶段完成',
        'auto_adjust': '自动调整',
        'system': '系统更新'
      }
      return labels[type] || type
    },
    
    getModificationTypeIcon(type) {
      const icons = {
        'user_feedback': '💬',
        'profile_update': '👤',
        'stage_completion': '✅',
        'auto_adjust': '⚙️',
        'system': '🔧'
      }
      return icons[type] || '📝'
    },
    
    getModificationTypeClass(type) {
      return `type-${type}`
    },
    
    getModificationTypeIconClass(type) {
      const classes = {
        'user_feedback': 'icon-feedback',
        'profile_update': 'icon-profile',
        'stage_completion': 'icon-complete',
        'auto_adjust': 'icon-auto',
        'system': 'icon-system'
      }
      return classes[type] || 'icon-default'
    },
    
    getFeedbackTypeLabel(type) {
      const labels = {
        'difficulty': '难度',
        'time': '时间',
        'content': '内容',
        'other': '其他'
      }
      return labels[type] || type
    },
    
    formatDate(value) {
      if (!value) return ''
      try {
        return new Date(value).toLocaleString('zh-CN', { hour12: false })
      } catch {
        return value
      }
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
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
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
  overflow-y: auto;
  flex: 1;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-retry {
  margin-top: 16px;
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.history-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.history-item.type-user_feedback {
  border-left: 4px solid #667eea;
}

.history-item.type-profile_update {
  border-left: 4px solid #10b981;
}

.history-item.type-stage_completion {
  border-left: 4px solid #f59e0b;
}

.history-item.type-auto_adjust {
  border-left: 4px solid #8b5cf6;
}

.history-icon {
  min-width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.icon-feedback {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.icon-profile {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.icon-complete {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.icon-auto {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.icon-system {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
}

.icon-default {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
}

.history-body {
  flex: 1;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-header h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.history-type {
  padding: 4px 12px;
  background: #f0f0f0;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
}

.history-reason,
.history-feedback {
  margin: 8px 0;
  font-size: 14px;
  color: #555;
  line-height: 1.6;
}

.history-feedback {
  background: #f5f3ff;
  padding: 10px;
  border-radius: 6px;
  border-left: 3px solid #667eea;
}

.feedback-type-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.feedback-type-badge.type-difficulty {
  background: #fee2e2;
  color: #991b1b;
}

.feedback-type-badge.type-time {
  background: #dbeafe;
  color: #1e40af;
}

.feedback-type-badge.type-content {
  background: #fef3c7;
  color: #92400e;
}

.feedback-type-badge.type-other {
  background: #f3e8ff;
  color: #6b21a8;
}

.history-meta {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  font-size: 12px;
  color: #888;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  gap: 4px;
}

.history-changes {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.history-changes details {
  cursor: pointer;
}

.history-changes summary {
  font-size: 13px;
  color: #667eea;
  margin-bottom: 8px;
}

.history-changes pre {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  font-size: 11px;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}
</style>

