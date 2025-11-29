<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content preview-modal">
      <div class="modal-header">
        <h3>{{ material.file_name }}</h3>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>
      
      <div class="modal-body">
        <div class="material-info">
          <p><strong>大小:</strong> {{ formatFileSize(material.file_size) }}</p>
          <p v-if="material.category"><strong>分类:</strong> {{ material.category }}</p>
          <p v-if="material.subject"><strong>科目:</strong> {{ material.subject }}</p>
          <p v-if="material.description"><strong>描述:</strong> {{ material.description }}</p>
          <p><strong>上传时间:</strong> {{ formatDate(material.created_at) }}</p>
          <p v-if="material.view_count !== undefined"><strong>查看次数:</strong> {{ material.view_count }}</p>
        </div>
        
        <div class="preview-actions">
          <button @click="handleDownload" class="btn-primary">
            ⬇️ 下载文件
          </button>
          <button @click="openInNewTab" class="btn-secondary" v-if="previewUrl">
            🔗 新标签页打开
          </button>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="preview-loading">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>
        
        <!-- 错误状态 -->
        <div v-else-if="error" class="preview-error">
          <p>⚠️ {{ error }}</p>
          <button @click="loadPreviewUrl" class="btn-retry">重试</button>
        </div>
        
        <!-- 预览内容 -->
        <div v-else-if="previewUrl" class="preview-container">
          <!-- 图片预览 -->
          <div v-if="isImage" class="preview-image-container">
            <img :src="previewUrl" :alt="material.file_name" class="preview-image" />
          </div>
          
          <!-- PDF预览 -->
          <div v-else-if="isPdf" class="preview-pdf-container">
            <!-- 使用embed标签或iframe预览PDF，确保以预览模式打开 -->
            <embed 
              v-if="previewUrl" 
              :src="previewUrl + '#toolbar=1&navpanes=1&scrollbar=1&view=FitH'" 
              type="application/pdf" 
              class="preview-pdf-embed"
            />
            <iframe 
              v-if="previewUrl" 
              :src="previewUrl + '#toolbar=1&navpanes=1&scrollbar=1&view=FitH'" 
              class="preview-iframe"
              @error="handlePreviewError"
            ></iframe>
          </div>
          
          <!-- 视频预览 -->
          <div v-else-if="isVideo" class="preview-video-container">
            <video :src="previewUrl" controls class="preview-video">
              您的浏览器不支持视频播放
            </video>
          </div>
          
          <!-- 文本文件预览 -->
          <div v-else-if="isText" class="preview-text-container">
            <pre v-if="textContent" class="preview-text">{{ textContent }}</pre>
            <div v-else class="text-loading">加载文本内容中...</div>
          </div>
          
          <!-- 其他文件类型（使用iframe尝试预览） -->
          <div v-else class="preview-other-container">
            <iframe :src="previewUrl" class="preview-iframe"></iframe>
            <div class="preview-fallback">
              <p>⚠️ 此文件类型可能无法直接预览</p>
              <p>建议点击上方"下载文件"按钮下载后查看</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getMaterialUrl, updateMaterialMeta, getMaterialPreviewUrl } from '@/services/materialApi'

export default {
  name: 'MaterialPreviewModal',
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
      previewUrl: null,
      loading: true,
      error: null,
      textContent: null,
      previewIssue: false  // 预览是否有问题（需要修复元数据）
    }
  },
  computed: {
    fileExtension() {
      const name = this.material.file_name || ''
      const parts = name.split('.')
      return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
    },
    isImage() {
      const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']
      return imageExts.includes(this.fileExtension)
    },
    isPdf() {
      return this.fileExtension === 'pdf'
    },
    isVideo() {
      const videoExts = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv']
      return videoExts.includes(this.fileExtension)
    },
    isText() {
      const textExts = ['txt', 'md', 'json', 'xml', 'csv', 'log']
      return textExts.includes(this.fileExtension)
    }
  },
  mounted() {
    this.loadPreviewUrl()
  },
  methods: {
    async loadPreviewUrl() {
      this.loading = true
      this.error = null
      try {
        // 使用后端代理预览URL，这样可以完全控制响应头
        // 后端代理会设置Content-Disposition=inline，确保浏览器预览而不是下载
        this.previewUrl = getMaterialPreviewUrl(this.goalId, this.material.id)
        
        console.log('预览URL（后端代理）:', this.previewUrl)
        console.log('文件类型:', this.fileExtension, 'isPdf:', this.isPdf)
        
        // 如果是文本文件，尝试加载内容
        if (this.isText) {
          await this.loadTextContent()
        }
        
        this.previewIssue = false
      } catch (error) {
        console.error('加载预览URL失败:', error)
        this.error = error.response?.data?.error || '加载预览失败，请尝试下载文件'
      } finally {
        this.loading = false
      }
    },
    async fixPreviewMeta() {
      // 调用API更新文件的Content-Disposition元数据
      try {
        this.loading = true
        const response = await updateMaterialMeta(this.goalId, this.material.id)
        
        if (response.data && response.data.message) {
          // 显示成功提示
          const { toast } = await import('@/utils/toast')
          toast.success(response.data.message)
          
          // 重新加载预览URL
          this.previewUrl = null
          await this.loadPreviewUrl()
        } else {
          const { toast } = await import('@/utils/toast')
          toast.error('修复失败，请重试')
        }
      } catch (error) {
        console.error('修复预览失败:', error)
        const errorMessage = error.response?.data?.error || '修复失败，请检查网络连接'
        
        // 显示错误提示
        const { toast } = await import('@/utils/toast')
        toast.error(errorMessage)
      } finally {
        this.loading = false
      }
    },
    async loadTextContent() {
      if (!this.previewUrl) return
      
      try {
        const response = await fetch(this.previewUrl)
        if (response.ok) {
          this.textContent = await response.text()
        }
      } catch (error) {
        console.warn('加载文本内容失败:', error)
        // 文本加载失败不影响预览URL的使用
      }
    },
    async handleDownload() {
      try {
        // 下载模式：不使用preview参数，让浏览器触发下载
        const response = await getMaterialUrl(this.goalId, this.material.id, 3600, false)
        const downloadUrl = response.data.url
        
        // 创建临时a标签触发下载
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = this.material.file_name
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        
        // 延迟移除，确保下载开始
        setTimeout(() => {
          document.body.removeChild(link)
        }, 100)
        
        // 显示成功提示
        const { toast } = await import('@/utils/toast')
        toast.success('文件下载已开始', { duration: 2000 })
      } catch (error) {
        console.error('获取下载链接失败:', error)
        const errorMessage = error.response?.data?.error || '下载失败'
        
        // 显示错误提示
        const { toast } = await import('@/utils/toast')
        toast.error(errorMessage)
      }
    },
    async openInNewTab() {
      try {
        // 使用后端代理URL，确保正确设置响应头
        const previewUrl = getMaterialPreviewUrl(this.goalId, this.material.id)
        
        // 构建完整URL（如果是相对路径，需要添加域名）
        const fullUrl = previewUrl.startsWith('http') 
          ? previewUrl 
          : `${window.location.origin}${previewUrl}`
        
        console.log('在新标签页打开预览URL（后端代理）:', fullUrl)
        console.log('文件类型:', this.fileExtension, 'isPdf:', this.isPdf, 'isImage:', this.isImage)
        
        // 直接在新标签页打开
        // 后端代理会设置正确的Content-Disposition响应头，确保浏览器预览
        const newWindow = window.open(fullUrl, '_blank', 'noopener,noreferrer')
        
        // 如果新窗口被阻止，提示用户
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          alert('无法打开新标签页，请检查浏览器是否阻止了弹出窗口')
        }
      } catch (error) {
        console.error('打开预览失败:', error)
        alert('打开预览失败，请重试')
      }
    },
    handlePreviewError(event) {
      console.warn('PDF预览加载失败:', event)
      // 如果预览失败，可能是Content-Disposition未设置，标记需要修复
      this.previewIssue = true
      // 提示用户可能需要修复元数据
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
.preview-modal {
  max-width: 900px;
}

.material-info {
  margin-bottom: 20px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
}

.material-info p {
  margin: 8px 0;
  font-size: 14px;
}

.preview-actions {
  margin-bottom: 20px;
}

.preview-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.btn-primary {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-fix {
  padding: 10px 20px;
  background: #ffc107;
  color: #333;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
  font-weight: 500;
}

.btn-fix:hover {
  background: #e0a800;
}

.preview-loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.preview-error {
  text-align: center;
  padding: 40px 20px;
  color: #dc3545;
}

.btn-retry {
  margin-top: 16px;
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.preview-container {
  width: 100%;
  min-height: 400px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  background: #f8f9fa;
}

/* 图片预览 */
.preview-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 20px;
  background: #f8f9fa;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* PDF预览 */
.preview-pdf-container {
  width: 100%;
  height: 70vh;
  min-height: 600px;
  position: relative;
}

.preview-pdf-embed {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
  display: block;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
  display: block;
}

/* 视频预览 */
.preview-video-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 20px;
  background: #000;
}

.preview-video {
  max-width: 100%;
  max-height: 70vh;
}

/* 文本预览 */
.preview-text-container {
  max-height: 70vh;
  overflow: auto;
  background: white;
  padding: 20px;
}

.preview-text {
  margin: 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.text-loading {
  padding: 40px;
  text-align: center;
  color: #666;
}

/* 其他文件类型 */
.preview-other-container {
  position: relative;
  width: 100%;
  height: 70vh;
  min-height: 400px;
}

.preview-fallback {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.preview-fallback p {
  margin: 8px 0;
  color: #666;
}
</style>

