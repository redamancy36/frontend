<template>
  <div class="plan-node">
    <div class="node-header">
      <h3>{{ nodeTypeLabel }} - {{ node.title || `节点 ${index + 1}` }}</h3>
    </div>
    
    <div v-if="node.description" class="node-description">
      {{ node.description }}
    </div>
    
    <!-- 决策/报告类节点的payload -->
    <div v-if="node.node_type === 'decision' && node.payload" class="node-payload">
      <strong>📋 报告内容：</strong>
      <pre>{{ formatPayload(node.payload) }}</pre>
    </div>
    
    <!-- 任务列表 -->
    <div v-if="node.tasks && node.tasks.length > 0" class="node-tasks">
      <TaskItem
        v-for="(task, taskIndex) in node.tasks"
        :key="task.id || taskIndex"
        :task="task"
        :goal-id="goalId"
        @self-check="$emit('self-check', $event)"
      />
    </div>
    <div v-else class="empty-tasks">
      暂无任务
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TaskItem from './TaskItem.vue'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    default: 0
  },
  goalId: {
    type: Number,
    required: true
  }
})

defineEmits(['self-check'])

const nodeTypeLabel = computed(() => {
  const labels = {
    'decision': '📊 决策/报告',
    'study': '📚 学习/执行',
    'interaction': '💬 交互'
  }
  return labels[props.node.node_type] || '📋 节点'
})

function formatPayload(payload) {
  if (typeof payload === 'string') {
    try {
      return JSON.stringify(JSON.parse(payload), null, 2)
    } catch {
      return payload
    }
  }
  return JSON.stringify(payload, null, 2)
}
</script>

<style scoped>
.plan-node {
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.node-header h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}

.node-description {
  margin-top: 8px;
  color: #666;
  font-size: 14px;
}

.node-payload {
  margin-top: 10px;
  padding: 12px;
  background: #e7f3ff;
  border-radius: 6px;
  font-size: 14px;
}

.node-payload pre {
  white-space: pre-wrap;
  margin-top: 8px;
  font-family: inherit;
}

.node-tasks {
  margin-top: 15px;
}

.empty-tasks {
  margin-top: 10px;
  color: #999;
  font-size: 14px;
}
</style>

