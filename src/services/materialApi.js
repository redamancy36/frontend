import api from './api'

/**
 * 资源池API服务
 */

/**
 * 智能识别文件分类和科目
 */
export function classifyMaterial(goalId, fileName) {
  return api.post(`/goals/${goalId}/materials/classify`, {
    file_name: fileName
  })
}

/**
 * 获取上传凭证
 */
export function getUploadToken(goalId, fileInfo) {
  return api.post(`/goals/${goalId}/materials/upload/token`, {
    file_name: fileInfo.name,
    file_size: fileInfo.size
  })
}

/**
 * 创建资源记录（上传完成后）
 */
export function createMaterial(goalId, materialData) {
  return api.post(`/goals/${goalId}/materials`, materialData)
}

/**
 * 获取资源列表
 */
export function getMaterials(goalId, filters = {}) {
  const params = new URLSearchParams()
  if (filters.category) params.append('category', filters.category)
  if (filters.subject) params.append('subject', filters.subject)
  if (filters.file_type) params.append('file_type', filters.file_type)
  if (filters.search) params.append('search', filters.search)
  
  const queryString = params.toString()
  return api.get(`/goals/${goalId}/materials${queryString ? '?' + queryString : ''}`)
}

/**
 * 获取资源详情
 */
export function getMaterialDetail(goalId, materialId) {
  return api.get(`/goals/${goalId}/materials/${materialId}`)
}

/**
 * 获取下载/预览URL
 */
export function getMaterialUrl(goalId, materialId, expiresIn = 3600, forPreview = false) {
  const params = new URLSearchParams()
  params.append('expires_in', expiresIn)
  if (forPreview) {
    params.append('preview', 'true')
  }
  return api.get(`/goals/${goalId}/materials/${materialId}/url?${params.toString()}`)
}

/**
 * 更新资源元数据
 */
export function updateMaterial(goalId, materialId, updateData) {
  return api.patch(`/goals/${goalId}/materials/${materialId}`, updateData)
}

/**
 * 删除资源
 */
export function deleteMaterial(goalId, materialId) {
  return api.delete(`/goals/${goalId}/materials/${materialId}`)
}

/**
 * 更新资源OSS元数据（修复预览问题）
 */
export function updateMaterialMeta(goalId, materialId) {
  return api.post(`/goals/${goalId}/materials/${materialId}/update-meta`)
}

/**
 * 获取预览URL（通过后端代理）
 */
export function getMaterialPreviewUrl(goalId, materialId) {
  return `/api/goals/${goalId}/materials/${materialId}/preview`
}

