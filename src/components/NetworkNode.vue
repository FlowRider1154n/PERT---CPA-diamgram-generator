<template>
  <div
    class="node"
    :class="{ critical: isCritical }"
    :style="{ left: `${config.x - 45}px`, top: `${config.y - 45}px` }"
  >
    <div class="node-number">{{ config.label }}</div>
    <div class="node-times">
      ES: {{ config.es.toFixed(1) }}<br />
      EF: {{ config.ef.toFixed(1) }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  nodeId: String,
  config: Object,
  isCritical: Boolean,
});
</script>

<style scoped>
.node {
  position: absolute;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 4px solid #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  color: white;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 10;
}
.node:hover {
  transform: scale(1.15) rotate(5deg);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.5);
}
.node.critical {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4);
}
.node.critical:hover {
  box-shadow: 0 12px 30px rgba(255, 107, 107, 0.6);
}
.node-number {
  font-size: 20px;
  margin-bottom: 4px;
}
.node-times {
  font-size: 10px;
  text-align: center;
  line-height: 1.2;
}
</style>