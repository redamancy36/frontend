<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>上传资料</h3>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>
      
      <div class="modal-body">
        <!-- 文件选择 -->
        <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
          <input 
            ref="fileInput"
            type="file" 
            multiple 
            @change="handleFileSelect"
            style="display: none"
          />
          <div v-if="selectedFiles.length === 0" class="upload-placeholder">
            <p>点击选择文件或拖拽文件到此处</p>
            <p class="upload-hint">支持 PDF、DOC、图片、压缩包等格式，最大 100MB</p>
          </div>
          <div v-else class="file-list">
            <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
              <div class="file-main-info">
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
              </div>
              <!-- 显示智能识别结果 -->
              <div v-if="fileClassifications[file.name]" class="file-classification">
                <span v-if="fileClassifications[file.name].category" 
                      class="classification-tag category">
                  {{ fileClassifications[file.name].category }}
                </span>
                <span v-if="fileClassifications[file.name].subject" 
                      class="classification-tag subject">
                  {{ fileClassifications[file.name].subject }}
                </span>
                <span v-if="fileClassifications[file.name].confidence < 0.5" 
                      class="confidence-hint">
                  (识别置信度较低，建议手动确认)
                </span>
              </div>
              <button @click="removeFile(index)" class="btn-remove">×</button>
            </div>
          </div>
        </div>
        
        <!-- 元数据表单 -->
        <div v-if="selectedFiles.length > 0" class="metadata-form">
          <div class="form-group">
            <label>
              分类
              <span v-if="selectedFiles.length === 1 && fileClassifications[selectedFiles[0].name]" 
                    class="auto-filled-hint">
                (已自动识别)
              </span>
            </label>
            <select v-model="formData.category">
              <option value="">请选择分类</option>
              <option value="真题">真题</option>
              <option value="教材">教材</option>
              <option value="笔记">笔记</option>
              <option value="视频">视频</option>
              <option value="其他">其他</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>
              科目
              <span v-if="selectedFiles.length === 1 && fileClassifications[selectedFiles[0].name]" 
                    class="auto-filled-hint">
                (已自动识别)
              </span>
            </label>
            <select v-model="formData.subject">
              <option value="">请选择科目</option>
              <option value="数学">数学</option>
              <option value="英语">英语</option>
              <option value="政治">政治</option>
              <option value="专业课">专业课</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>描述（可选）</label>
            <textarea 
              v-model="formData.description" 
              rows="3"
              placeholder="请输入资料描述..."
            ></textarea>
          </div>
          
          <div v-if="selectedFiles.length > 1" class="multi-file-notice">
            <p>⚠️ 批量上传时，所有文件将使用相同的分类和科目设置</p>
          </div>
        </div>
        
        <!-- 上传进度 -->
        <div v-if="uploading" class="upload-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
          </div>
          <p>上传中... {{ uploadProgress }}%</p>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-cancel">取消</button>
        <button 
          @click="handleUpload" 
          :disabled="selectedFiles.length === 0 || uploading"
          class="btn-primary"
        >
          {{ uploading ? '上传中...' : '上传' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { getUploadToken, createMaterial, classifyMaterial } from '@/services/materialApi'
import axios from 'axios'

export default {
  name: 'MaterialUploadModal',
  props: {
    goalId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      selectedFiles: [],
      uploading: false,
      uploadProgress: 0,
      formData: {
        category: '',
        subject: '',
        description: ''
      },
      // 存储每个文件的智能识别结果
      fileClassifications: {} // { fileName: { category, subject, confidence } }
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    async handleFileSelect(event) {
      const files = Array.from(event.target.files)
      this.selectedFiles = [...this.selectedFiles, ...files]
      
      // 自动识别每个文件的分类和科目
      for (const file of files) {
        await this.classifyFile(file)
      }
    },
    async handleDrop(event) {
      const files = Array.from(event.dataTransfer.files)
      this.selectedFiles = [...this.selectedFiles, ...files]
      
      // 自动识别每个文件的分类和科目
      for (const file of files) {
        await this.classifyFile(file)
      }
    },
    async classifyFile(file) {
      // 为每个文件智能识别分类和科目
      try {
        const response = await classifyMaterial(this.goalId, file.name)
        const result = response.data
        
        // 保存识别结果
        this.fileClassifications[file.name] = result
        
        // 如果只有一个文件，自动填充表单
        if (this.selectedFiles.length === 1) {
          if (result.category && result.confidence > 0.3) {
            this.formData.category = result.category
          }
          if (result.subject && result.confidence > 0.3) {
            this.formData.subject = result.subject
          }
        }
      } catch (error) {
        console.warn('文件分类识别失败:', error)
        // 识别失败不影响上传，只是不自动填充
      }
    },
    removeFile(index) {
      const file = this.selectedFiles[index]
      delete this.fileClassifications[file.name]
      this.selectedFiles.splice(index, 1)
      
      // 如果删除后只剩一个文件，重新填充表单
      if (this.selectedFiles.length === 1) {
        const remainingFile = this.selectedFiles[0]
        const classification = this.fileClassifications[remainingFile.name]
        if (classification) {
          if (classification.category && classification.confidence > 0.3) {
            this.formData.category = classification.category
          }
          if (classification.subject && classification.confidence > 0.3) {
            this.formData.subject = classification.subject
          }
        }
      } else if (this.selectedFiles.length === 0) {
        // 清空表单
        this.formData.category = ''
        this.formData.subject = ''
      }
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    },
    async handleUpload() {
      if (this.selectedFiles.length === 0) return
      
      this.uploading = true
      this.uploadProgress = 0
      
      try {
        // 逐个上传文件
        for (let i = 0; i < this.selectedFiles.length; i++) {
          const file = this.selectedFiles[i]
          await this.uploadSingleFile(file, i)
        }
        
        this.$emit('uploaded')
        this.$emit('close')
        this.selectedFiles = []
        this.formData = { category: '', subject: '', description: '' }
        this.fileClassifications = {}  // 清空识别结果
      } catch (error) {
        console.error('上传失败:', error)
        // 更详细的错误信息
        let errorMessage = '上传失败'
        if (error.response) {
          errorMessage = error.response.data?.error || error.response.data?.message || `服务器错误: ${error.response.status}`
        } else if (error.request) {
          errorMessage = '网络错误：无法连接到OSS服务器，请检查CORS配置'
        } else {
          errorMessage = error.message || '上传失败'
        }
        alert(errorMessage)
      } finally {
        this.uploading = false
        this.uploadProgress = 0
      }
    },
    async uploadSingleFile(file, index) {
      try {
        // 1. 获取上传凭证
        const tokenResponse = await getUploadToken(this.goalId, file)
        const { upload_token, oss_key } = tokenResponse.data
        
        // 2. 上传到OSS（使用POST方式）
        const formData = new FormData()
        formData.append('key', oss_key)
        formData.append('policy', upload_token.policy)
        formData.append('OSSAccessKeyId', upload_token.access_key_id)
        formData.append('signature', upload_token.signature)
        formData.append('file', file)
        
        console.log('开始上传到OSS:', {
          post_url: upload_token.post_url,
          oss_key: oss_key,
          file_name: file.name,
          file_size: file.size
        })
        
        const uploadResponse = await axios.post(upload_token.post_url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                ((index * 100 + (progressEvent.loaded / progressEvent.total * 100)) / this.selectedFiles.length)
              )
              this.uploadProgress = progress
            }
          }
        })
        
        console.log('OSS上传响应:', uploadResponse.status, uploadResponse.data)
        
        // OSS POST上传成功通常返回204或200状态码
        if (uploadResponse.status !== 200 && uploadResponse.status !== 204) {
          throw new Error(`OSS上传失败，状态码: ${uploadResponse.status}`)
        }
        
        // 3. 创建资源记录
        // 优先使用表单数据，如果表单为空则使用智能识别的结果
        const classification = this.fileClassifications[file.name] || {}
        const finalCategory = this.formData.category || classification.category || null
        const finalSubject = this.formData.subject || classification.subject || null
        
        await createMaterial(this.goalId, {
          oss_key: oss_key,
          file_name: file.name,
          file_size: file.size,
          category: finalCategory,
          subject: finalSubject,
          description: this.formData.description || null
        })
        
      } catch (error) {
        console.error(`上传文件 ${file.name} 失败:`, error)
        console.error('错误详情:', {
          message: error.message,
          response: error.response,
          responseData: error.response?.data,
          responseStatus: error.response?.status,
          responseStatusText: error.response?.statusText,
          request: error.request
        })
        throw error
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
  border-radius: 8px;
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
  font-size: 18px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.btn-close:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.upload-area:hover {
  border-color: #007bff;
}

.upload-placeholder p {
  margin: 8px 0;
  color: #999;
}

.upload-hint {
  font-size: 12px;
}

.file-list {
  text-align: left;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 8px;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  color: #999;
  font-size: 12px;
}

.btn-remove {
  background: #ff5252;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.metadata-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
}

.auto-filled-hint {
  font-size: 12px;
  color: #00CED1;
  font-weight: normal;
  margin-left: 4px;
}

.multi-file-notice {
  padding: 12px;
  background: #fff3cd;
  border-left: 3px solid #ffc107;
  border-radius: 4px;
  margin-top: 16px;
}

.multi-file-notice p {
  margin: 0;
  font-size: 13px;
  color: #856404;
}

.upload-progress {
  margin-top: 20px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
}

.btn-cancel,
.btn-primary {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-cancel {
  background: #f5f5f5;
  color: #333;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>

