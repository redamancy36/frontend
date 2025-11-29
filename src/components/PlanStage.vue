<template>
  <details class="plan-stage" :open="index === 0">
    <summary class="stage-summary">
      <div class="stage-header">
        <span>阶段 {{ stage.order_index || index + 1 }}：{{ stage.name || `阶段 ${index + 1}` }}</span>
        <span v-if="stageDateRange" class="stage-date">{{ stageDateRange }}</span>
      </div>
    </summary>
    <div class="stage-content">
      <div v-if="stage.description" class="stage-description">
        {{ stage.description }}
      </div>
      <PlanNode
        v-for="(node, nodeIndex) in stage.nodes"
        :key="node.id || nodeIndex"
        :node="node"
        :goal-id="goalId"
        @self-check="$emit('self-check', $event)"
      />
    </div>
  </details>
</template>

<script setup>
import { computed } from 'vue'
import PlanNode from './PlanNode.vue'

const props = defineProps({
  stage: {
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

const stageDateRange = computed(() => {
  if (props.stage.estimated_start_day && props.stage.estimated_end_day) {
    return `第 ${props.stage.estimated_start_day} - ${props.stage.estimated_end_day} 天`
  }
  return ''
})
</script>

<style scoped>
.plan-stage {
  margin-bottom: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.stage-summary {
  padding: 15px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  color: #667eea;
  user-select: none;
}

.stage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stage-date {
  color: #999;
  font-size: 14px;
  font-weight: normal;
}

.stage-content {
  padding: 15px;
  border-top: 1px solid #e0e0e0;
}

.stage-description {
  margin-bottom: 15px;
  padding: 12px;
  background: #f0f0f0;
  border-radius: 6px;
  color: #666;
  font-size: 14px;
}
</style>

