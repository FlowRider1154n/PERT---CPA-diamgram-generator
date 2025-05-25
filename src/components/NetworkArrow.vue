<template>
  <div
    class="arrow"
    :class="{ critical: isCritical }"
    :style="arrowStyle"
  ></div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  fromNode: Object, // Contains x, y
  toNode: Object,   // Contains x, y (for activity arrows)
  toPos: Object,    // Contains x, y (for dependency/merge arrows pointing to activity boxes)
  isCritical: Boolean,
  arrowType: { // 'activity' (node-to-node) or 'dependency' (node-to-activitybox)
    type: String,
    default: 'activity'
  }
});

const arrowStyle = computed(() => {
  if (!props.fromNode || (!props.toNode && !props.toPos)) {
    return {}; // Not enough data to draw
  }

  const fromX = props.fromNode.x;
  const fromY = props.fromNode.y;
  
  let toX, toY;
  let offset = 0; // offset for arrow length

  if (props.arrowType === 'activity' && props.toNode) {
    toX = props.toNode.x;
    toY = props.toNode.y;
    offset = 45; // Half node width for node-to-node arrows
  } else if (props.arrowType === 'dependency' && props.toPos) {
    // For arrows pointing to activity boxes, adjust target to center of box approx.
    // Assuming activity box center based on its `x, y` props (which are top-left)
    // Activity box is 80px wide, 70px high by default.
    // The x,y in activityLayout is for top-left of the box (considering padding/border)
    // layout.x - 40, layout.y - 35. So center is roughly layout.x, layout.y.
    toX = props.toPos.x;
    toY = props.toPos.y;
    offset = 25; // Smaller offset for pointing to activity box
  } else {
    return {}; // Invalid config
  }

  const dx = toX - fromX;
  const dy = toY - fromY;
  
  let length = Math.sqrt(dx * dx + dy * dy);
  
  // Adjust length to not overlap nodes/boxes
  // For node-to-node, fromNode radius is 45, toNode radius is 45. total 90.
  // For node-to-box, fromNode radius is 45, box is roughly point.
  const lengthAdjustment = props.arrowType === 'activity' ? 90 : 45 + offset; // 45 for fromNode, 'offset' for target
  length = Math.max(0, length - lengthAdjustment);


  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  // Start arrow from edge of the 'from' node
  const startX = fromX + 45 * Math.cos(angle * Math.PI / 180);
  const startY = fromY + 45 * Math.sin(angle * Math.PI / 180);

  return {
    left: `${startX}px`,
    top: `${startY}px`,
    width: `${length}px`,
    transform: `rotate(${angle}deg)`,
  };
});
</script>

<style scoped>
.arrow {
  position: absolute;
  height: 3px;
  background: linear-gradient(90deg, #74b9ff 0%, #0984e3 100%);
  transform-origin: left center;
  border-radius: 2px;
  box-shadow: 0 2px 6px rgba(116, 185, 255, 0.3);
  z-index: 1;
}
.arrow.critical {
  background: linear-gradient(90deg, #ff7675 0%, #d63031 100%);
  height: 4px;
  box-shadow: 0 3px 8px rgba(255, 118, 117, 0.4);
}
.arrow::after {
  content: '';
  position: absolute;
  right: -10px; /* Position relative to the arrow's end */
  top: -4px;
  width: 0;
  height: 0;
  border-left: 10px solid #0984e3; /* Arrowhead color */
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.1));
}
.arrow.critical::after {
  border-left-color: #d63031;
}
</style>