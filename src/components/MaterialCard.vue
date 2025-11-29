<template>
  <div class="material-card">
    <div class="card-header">
      <div class="file-icon">{{ getFileIcon(material.file_type) }}</div>
      <div class="file-info">
        <h4 class="file-name" :title="material.file_name">{{ material.file_name }}</h4>
        <div class="file-meta">
          <span class="file-size">{{ formatFileSize(material.file_size) }}</span>
          <span class="file-date">{{ formatDate(material.created_at) }}</span>
        </div>
      </div>
    </div>
    
    <div class="card-body">
      <div v-if="material.category" class="material-tag category">
        {{ material.category }}
      </div>
      <div v-if="material.subject" class="material-tag subject">
        {{ material.subject }}
      </div>
      <div v-if="material.description" class="material-description">
        {{ material.description }}
      </div>
    </div>
    
    <div class="card-footer">
      <button @click="$emit('preview', material)" class="btn-icon" title="预览">
        👁️
      </button>
      <button @click="handleDownload" class="btn-icon" title="下载">
        ⬇️
      </button>
      <button @click="$emit('edit', material)" class="btn-icon" title="编辑">
        ✏️
      </button>
      <button @click="$emit('delete', material)" class="btn-icon btn-delete" title="删除">
        🗑️
      </button>
    </div>
  </div>
</template>

<script>
import { getMaterialUrl } from '@/services/materialApi'

export default {
  name: 'MaterialCard',
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
  methods: {
    getFileIcon(fileType) {
      const icons = {
        'document': '📄',
        'image': '🖼️',
        'archive': '📦',
        'other': '📎'
      }
      return icons[fileType] || '📎'
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
      return date.toLocaleDateString('zh-CN')
    },
    async handleDownload() {
      try {
        // 明确使用下载模式（preview=false）
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
      } catch (error) {
        console.error('获取下载链接失败:', error)
        alert(error.response?.data?.error || '下载失败')
      }
    }
  }
}
</script>

<style scoped>
.material-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.2s;
}

.material-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.file-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

.card-body {
  margin-bottom: 12px;
}

.material-tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 8px;
  margin-bottom: 8px;
}

.material-tag.category {
  background: #e3f2fd;
  color: #1976d2;
}

.material-tag.subject {
  background: #f3e5f5;
  color: #7b1fa2;
}

.material-description {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
  margin-top: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-footer {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: #f5f5f5;
}

.btn-delete:hover {
  background: #ffebee;
}
</style>

