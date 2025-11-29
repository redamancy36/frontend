<template>
  <div v-if="show" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content tip-modal">
      <div class="modal-header">
        <div class="header-icon">📚</div>
        <h3>温馨提示：上传真题的重要性</h3>
        <button @click="handleClose" class="btn-close">×</button>
      </div>
      
      <div class="modal-body">
        <div class="tip-content">
          <div class="tip-main-message">
            <p class="highlight-text">
              <strong>强烈建议您上传历年真题！</strong>
            </p>
            <p class="main-description">
              真题是我们为您制定个性化学习计划的重要依据。上传真题后，系统可以：
            </p>
          </div>
          
          <div class="benefits-list">
            <div class="benefit-item">
              <div class="benefit-icon">🎯</div>
              <div class="benefit-content">
                <h4>精准评估难度</h4>
                <p>根据真题难度为您匹配最适合的学习任务，避免题目太简单或太困难</p>
              </div>
            </div>
            
            <div class="benefit-item">
              <div class="benefit-icon">📊</div>
              <div class="benefit-content">
                <h4>识别重点知识点</h4>
                <p>分析真题中高频出现的知识点，帮您更有针对性地复习</p>
              </div>
            </div>
            
            <div class="benefit-item">
              <div class="benefit-icon">⏰</div>
              <div class="benefit-content">
                <h4>优化时间规划</h4>
                <p>根据真题题型分布，合理分配各科目的学习时间</p>
              </div>
            </div>
            
            <div class="benefit-item">
              <div class="benefit-icon">🚀</div>
              <div class="benefit-content">
                <h4>提升计划质量</h4>
                <p>基于真题数据制定的计划更加贴合实际考试要求，学习效果更好</p>
              </div>
            </div>
          </div>
          
          <div class="tip-footer">
            <p class="footer-note">
              💡 小贴士：您可以上传PDF、Word、图片等多种格式的真题文件，系统会自动识别并整理
            </p>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <label class="dont-show-again">
          <input 
            type="checkbox" 
            v-model="dontShowAgain"
            @change="handleDontShowAgain"
          />
          <span>不再显示此提示</span>
        </label>
        <button @click="handleClose" class="btn-primary">
          我知道了，开始上传
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MaterialUploadTipModal',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dontShowAgain: false
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    handleDontShowAgain() {
      // 保存到localStorage
      if (this.dontShowAgain) {
        localStorage.setItem('material_upload_tip_hidden', 'true')
      } else {
        localStorage.removeItem('material_upload_tip_hidden')
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
  z-index: 10000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.tip-modal {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}

.header-icon {
  font-size: 32px;
  line-height: 1;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.btn-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f0f0f0;
  color: #666;
}

.modal-body {
  padding: 24px;
}

.tip-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.tip-main-message {
  text-align: center;
  padding: 16px;
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border-radius: 12px;
  border: 2px solid #ffc107;
}

.highlight-text {
  font-size: 18px;
  color: #856404;
  margin: 0 0 12px 0;
}

.main-description {
  font-size: 15px;
  color: #856404;
  margin: 0;
  line-height: 1.6;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.benefit-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #667eea;
  transition: all 0.3s;
}

.benefit-item:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.benefit-icon {
  font-size: 32px;
  flex-shrink: 0;
  line-height: 1;
}

.benefit-content {
  flex: 1;
}

.benefit-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.benefit-content p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.tip-footer {
  padding: 16px;
  background: #e3f2fd;
  border-radius: 12px;
  border-left: 4px solid #2196f3;
}

.footer-note {
  margin: 0;
  font-size: 14px;
  color: #1976d2;
  line-height: 1.6;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.dont-show-again {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.dont-show-again input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.btn-primary {
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

@media (max-width: 600px) {
  .tip-modal {
    width: 95%;
    max-height: 95vh;
  }
  
  .modal-header h3 {
    font-size: 18px;
  }
  
  .benefit-item {
    flex-direction: column;
    gap: 12px;
  }
  
  .modal-footer {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn-primary {
    width: 100%;
  }
}
</style>

