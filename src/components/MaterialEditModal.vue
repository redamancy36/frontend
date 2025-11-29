<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content edit-modal">
      <div class="modal-header">
        <h3>编辑资料</h3>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- 文件名 -->
          <div class="form-group">
            <label for="file_name">文件名 <span class="required">*</span></label>
            <input
              id="file_name"
              v-model="formData.file_name"
              type="text"
              required
              placeholder="请输入文件名"
              maxlength="500"
            />
            <small class="form-hint">此名称仅用于显示，不会更改实际存储的文件</small>
          </div>
          
          <!-- 分类 -->
          <div class="form-group">
            <label for="category">分类</label>
            <select id="category" v-model="formData.category">
              <option value="">请选择分类</option>
              <option value="真题">真题</option>
              <option value="教材">教材</option>
              <option value="笔记">笔记</option>
              <option value="视频">视频</option>
              <option value="其他">其他</option>
            </select>
          </div>
          
          <!-- 科目 -->
          <div class="form-group">
            <label for="subject">科目</label>
            <select id="subject" v-model="formData.subject">
              <option value="">请选择科目</option>
              <option value="数学">数学</option>
              <option value="英语">英语</option>
              <option value="政治">政治</option>
              <option value="专业课">专业课</option>
              <option value="通用">通用</option>
            </select>
          </div>
          
          <!-- 标签 -->
          <div class="form-group">
            <label for="tags">标签</label>
            <input
              id="tags"
              v-model="tagsInput"
              type="text"
              placeholder="多个标签用逗号分隔，如：重要,复习,真题解析"
              @input="handleTagsInput"
            />
            <div v-if="formData.tags && formData.tags.length > 0" class="tags-preview">
              <span
                v-for="(tag, index) in formData.tags"
                :key="index"
                class="tag-item"
              >
                {{ tag }}
                <button
                  type="button"
                  @click="removeTag(index)"
                  class="tag-remove"
                >×</button>
              </span>
            </div>
            <small class="form-hint">输入标签后按回车或逗号添加</small>
          </div>
          
          <!-- 描述 -->
          <div class="form-group">
            <label for="description">描述</label>
            <textarea
              id="description"
              v-model="formData.description"
              rows="4"
              placeholder="请输入资料描述..."
              maxlength="2000"
            ></textarea>
            <small class="form-hint">{{ (formData.description || '').length }}/2000</small>
          </div>
          
          <!-- 文件信息（只读） -->
          <div class="form-group readonly-info">
            <label>文件信息</label>
            <div class="info-items">
              <div class="info-item">
                <span class="info-label">文件大小:</span>
                <span class="info-value">{{ formatFileSize(material.file_size) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">文件类型:</span>
                <span class="info-value">{{ material.file_type }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">上传时间:</span>
                <span class="info-value">{{ formatDate(material.created_at) }}</span>
              </div>
              <div v-if="material.view_count !== undefined" class="info-item">
                <span class="info-label">查看次数:</span>
                <span class="info-value">{{ material.view_count }}</span>
              </div>
            </div>
          </div>
          
          <!-- 错误提示 -->
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          
          <!-- 操作按钮 -->
          <div class="modal-actions">
            <button type="button" @click="$emit('close')" class="btn-cancel">
              取消
            </button>
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? '保存中...' : '保存更改' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { updateMaterial } from '@/services/materialApi'

export default {
  name: 'MaterialEditModal',
  props: {
    material: {
      type: Object,
      required: true
    },
    goalId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      formData: {
        file_name: '',
        category: '',
        subject: '',
        tags: [],
        description: ''
      },
      tagsInput: '',
      loading: false,
      error: null
    }
  },
  mounted() {
    // 初始化表单数据
    this.formData.file_name = this.material.file_name || ''
    this.formData.category = this.material.category || ''
    this.formData.subject = this.material.subject || ''
    this.formData.tags = Array.isArray(this.material.tags) 
      ? [...this.material.tags] 
      : (this.material.tags ? [this.material.tags] : [])
    this.formData.description = this.material.description || ''
    
    // 初始化标签输入框
    this.tagsInput = this.formData.tags.join(', ')
  },
  methods: {
    handleTagsInput(event) {
      const input = event.target.value
      // 如果输入包含逗号，自动分割标签
      if (input.includes(',')) {
        const newTags = input
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
        
        // 合并现有标签和新标签（去重）
        const allTags = [...this.formData.tags, ...newTags]
        this.formData.tags = [...new Set(allTags)]
        this.tagsInput = ''
      }
    },
    removeTag(index) {
      this.formData.tags.splice(index, 1)
    },
    async handleSubmit() {
      this.loading = true
      this.error = null
      
      try {
        const updateData = {
          file_name: this.formData.file_name.trim(),
          category: this.formData.category || null,
          subject: this.formData.subject || null,
          tags: this.formData.tags.length > 0 ? this.formData.tags : null,
          description: this.formData.description.trim() || null
        }
        
        const response = await updateMaterial(
          this.goalId,
          this.material.id,
          updateData
        )
        
        // 显示成功提示
        const { toast } = await import('@/utils/toast')
        toast.success('资料已成功更新')
        
        // 通知父组件更新成功
        this.$emit('updated', response.data || response)
        this.$emit('close')
      } catch (error) {
        console.error('更新资料失败:', error)
        const errorMessage = error.response?.data?.error || '更新失败，请重试'
        this.error = errorMessage
        
        // 显示错误提示
        const { toast } = await import('@/utils/toast')
        toast.error(errorMessage)
      } finally {
        this.loading = false
      }
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.edit-modal {
  max-width: 600px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
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
  color: #999;
  cursor: pointer;
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
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
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

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.form-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #666;
}

/* 标签相关样式 */
.tags-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 16px;
  font-size: 13px;
  gap: 6px;
}

.tag-remove {
  background: none;
  border: none;
  color: #1976d2;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.tag-remove:hover {
  background: rgba(25, 118, 210, 0.2);
}

/* 只读信息样式 */
.readonly-info {
  padding: 16px;
  background: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #eee;
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.info-label {
  color: #666;
}

.info-value {
  color: #333;
  font-weight: 500;
}

/* 错误提示 */
.error-message {
  padding: 12px;
  background: #fee;
  color: #c33;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

/* 操作按钮 */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn-cancel,
.btn-primary {
  padding: 10px 24px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f5f5f5;
  color: #333;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>

