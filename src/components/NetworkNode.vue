// src/components/NetworkNode.vue
<template>
  <div
    class="node"
    :class="{
      critical: isCritical && !config.isEventNode, // Regular nodes on critical path
      'event-node': config.isEventNode,
      'event-node-critical': config.isEventNode && isCritical // Event nodes on critical path
    }"
    :style="{
      left: `${config.x - (config.isEventNode ? 20 : 45)}px`, // Smaller size for event nodes
      top: `${config.y - (config.isEventNode ? 20 : 45)}px`,
      width: config.isEventNode ? '40px' : '90px',
      height: config.isEventNode ? '40px' : '90px',
      // Override background for event nodes if needed, or use classes
      // background: config.isEventNode ? (isCritical ? '#ff6347' : '#d3d3d3') : undefined
    }"
  >
    <div class="node-number" :class="{'event-node-text': config.isEventNode}">
      {{ config.label }}
    </div>
    <!-- Hide ES/EF for event nodes by default, or show them smaller -->
    <div class="node-times" v-if="!config.isEventNode">
      ES: {{ config.es.toFixed(1) }}<br />
      EF: {{ config.ef.toFixed(1) }}
    </div>
     <div class="node-times event-node-times" v-else> <!-- Smaller times for event nodes -->
      ES: {{ config.es.toFixed(0) }}<br />
      EF: {{ config.ef.toFixed(0) }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ // props is defined by defineProps
  nodeId: String,
  config: Object,
  isCritical: Boolean,
});
</script>

<style scoped>
.node {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 3px solid #ffffff; /* Slightly thinner border for event nodes if they are smaller */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  color: white;
  cursor: pointer;
  box-shadow: 0 6px 15px rgba(102, 126, 234, 0.25);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 10;
  text-align: center;
}

.node:hover {
  transform: scale(1.1) rotate(3deg);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

/* Regular critical node */
.node.critical {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  box-shadow: 0 6px 15px rgba(255, 107, 107, 0.3);
}
.node.critical:hover {
  box-shadow: 0 10px 25px rgba(255, 107, 107, 0.5);
}

/* Event Node Specific Styles */
.node.event-node {
  background: linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%); /* Greyish/darker for distinction */
  border-width: 2px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}
.node.event-node:hover {
  box-shadow: 0 6px 15px rgba(0,0,0,0.25);
}

/* Critical Event Node */
.node.event-node-critical {
  background: linear-gradient(135deg, #ff8c69 0%, #c0392b 100%); /* Critical event node color - distinct red */
  border-color: #fff;
  box-shadow: 0 4px 10px rgba(192, 57, 43, 0.4);
}
.node.event-node-critical:hover {
   box-shadow: 0 6px 15px rgba(192, 57, 43, 0.6);
}


.node-number {
  font-size: 20px;
  margin-bottom: 4px;
}
.node.event-node .node-number { /* Smaller text for event node label */
  font-size: 9px; /* Example: E-A, S-A */
  font-weight: normal;
  line-height: 1;
  margin-bottom: 0;
}

.node-times {
  font-size: 10px;
  text-align: center;
  line-height: 1.2;
}
.node.event-node .node-times { /* Smaller times for event nodes */
  font-size: 8px;
  line-height: 1.1;
}
</style>