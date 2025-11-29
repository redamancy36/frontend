<template>
  <div class="material-pool-container">
    <!-- 顶部操作栏 -->
    <div class="pool-header">
      <h2>资料库</h2>
      <div class="header-actions">
        <button @click="showUploadModal = true" class="btn-primary">
          ➕ 上传资料
        </button>
      </div>
    </div>
    
    <!-- 筛选和搜索 -->
    <div class="filter-bar">
      <input 
        v-model="searchQuery"
        @input="handleSearch"
        type="text" 
        placeholder="搜索资料..."
        class="search-input"
      />
      <select v-model="selectedCategory" @change="loadMaterials" class="filter-select">
        <option value="">全部分类</option>
        <option value="真题">真题</option>
        <option value="教材">教材</option>
        <option value="笔记">笔记</option>
        <option value="视频">视频</option>
        <option value="其他">其他</option>
      </select>
      <select v-model="selectedSubject" @change="loadMaterials" class="filter-select">
        <option value="">全部科目</option>
        <option value="数学">数学</option>
        <option value="英语">英语</option>
        <option value="政治">政治</option>
        <option value="专业课">专业课</option>
      </select>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    
    <!-- 资料列表 -->
    <div v-else-if="materials.length > 0" class="materials-grid">
      <MaterialCard
        v-for="material in materials"
        :key="material.id"
        :material="material"
        :goal-id="goalId"
        @preview="handlePreview"
        @delete="handleDelete"
        @download="handleDownload"
        @edit="handleEdit"
      />
    </div>
    
    <!-- 空状态 -->
    <div v-else class="empty-state">
      <p>还没有上传资料，点击上方按钮上传吧~</p>
    </div>
    
    <!-- 上传模态框 -->
    <MaterialUploadModal
      v-if="showUploadModal"
      :goal-id="goalId"
      @close="showUploadModal = false"
      @uploaded="handleMaterialUploaded"
    />
    
    <!-- 预览模态框 -->
    <MaterialPreviewModal
      v-if="previewMaterial"
      :material="previewMaterial"
      :goal-id="goalId"
      @close="previewMaterial = null"
    />
    
    <!-- 编辑模态框 -->
    <MaterialEditModal
      v-if="showEditModal && editingMaterial"
      :material="editingMaterial"
      :goal-id="goalId"
      @close="handleEditClose"
      @updated="handleMaterialUpdated"
    />
  </div>
</template>

<script>
import { getMaterials, deleteMaterial } from '@/services/materialApi'
import MaterialCard from './MaterialCard.vue'
import MaterialUploadModal from './MaterialUploadModal.vue'
import MaterialPreviewModal from './MaterialPreviewModal.vue'
import MaterialEditModal from './MaterialEditModal.vue'

export default {
  name: 'MaterialPool',
  components: {
    MaterialCard,
    MaterialUploadModal,
    MaterialPreviewModal,
    MaterialEditModal
  },
  props: {
    goalId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      materials: [],
      loading: false,
      showUploadModal: false,
      previewMaterial: null,
      showEditModal: false,
      editingMaterial: null,
      searchQuery: '',
      selectedCategory: '',
      selectedSubject: ''
    }
  },
  mounted() {
    this.loadMaterials()
  },
  methods: {
    async loadMaterials() {
      this.loading = true
      try {
        const filters = {}
        if (this.searchQuery) filters.search = this.searchQuery
        if (this.selectedCategory) filters.category = this.selectedCategory
        if (this.selectedSubject) filters.subject = this.selectedSubject
        
        const response = await getMaterials(this.goalId, filters)
        this.materials = response.data.materials || []
      } catch (error) {
        console.error('加载资料列表失败:', error)
        this.$emit('error', error.response?.data?.error || '加载资料列表失败')
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      // 防抖搜索
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.loadMaterials()
      }, 500)
    },
    handleMaterialUploaded() {
      this.showUploadModal = false
      this.loadMaterials()
    },
    // 暴露给父组件的方法：打开上传模态框
    openUploadModal() {
      this.showUploadModal = true
    },
    handlePreview(material) {
      this.previewMaterial = material
    },
    async handleDelete(material) {
      if (!confirm(`确定要删除《${material.file_name}》吗？`)) {
        return
      }
      
      try {
        await deleteMaterial(this.goalId, material.id)
        
        // 显示成功提示
        const { toast } = await import('@/utils/toast')
        toast.success('资料已成功删除')
        
        this.loadMaterials()
      } catch (error) {
        console.error('删除资料失败:', error)
        const errorMessage = error.response?.data?.error || '删除失败'
        
        // 显示错误提示
        const { toast } = await import('@/utils/toast')
        toast.error(errorMessage)
      }
    },
    handleDownload(material) {
      // MaterialCard组件内部处理下载
    },
    handleEdit(material) {
      this.editingMaterial = material
      this.showEditModal = true
    },
    handleEditClose() {
      this.showEditModal = false
      this.editingMaterial = null
    },
    handleMaterialUpdated(updatedMaterial) {
      // 更新列表中的资料信息
      const index = this.materials.findIndex(m => m.id === updatedMaterial.id)
      if (index !== -1) {
        this.materials[index] = updatedMaterial
      }
      
      // 如果当前预览的资料被更新，也更新previewMaterial
      if (this.previewMaterial && this.previewMaterial.id === updatedMaterial.id) {
        this.previewMaterial = updatedMaterial
      }
      
      // 关闭编辑模态框
      this.handleEditClose()
    }
  }
}
</script>

<style scoped>
.material-pool-container {
  padding: 20px;
}

.pool-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.pool-header h2 {
  margin: 0;
  font-size: 29px;  /* 从24px增加到29px */
  color: #1a1a1a;  /* 更深的颜色，提高对比度 */
  font-weight: 600;  /* 增加字体粗细 */
}

.header-actions .btn-primary {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.header-actions .btn-primary:hover {
  background: #0056b3;
}

.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.loading-container {
  text-align: center;
  padding: 40px;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

