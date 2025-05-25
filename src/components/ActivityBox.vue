<template>
  <div
    class="activity-box"
    :class="{ critical: isCritical }"
    :style="{ left: `${layout.x - 40}px`, top: `${layout.y - 35}px` }"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div class="activity-name">{{ activityName }}</div>
    <div class="activity-times">
      O: {{ activityData.optimistic }} | M: {{ activityData.mostLikely }} | P: {{ activityData.pessimistic }}<br />
      <span class="expected-time">TE: {{ activityData.expectedTime.toFixed(2) }}</span><br />
      Var: {{ activityData.variance.toFixed(3) }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  activityName: String,
  layout: Object,
  activityData: Object,
  isCritical: Boolean,
});

const emit = defineEmits(['showTooltip', 'hideTooltip']);

const onMouseEnter = (event) => {
  emit('showTooltip', { event, activityName: props.activityName });
};

const onMouseLeave = () => {
  emit('hideTooltip');
};
</script>

<style scoped>
.activity-box {
  position: absolute;
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  border: 3px solid #ff9ff3;
  border-radius: 12px;
  padding: 12px;
  font-size: 11px;
  text-align: center;
  min-width: 80px;
  box-shadow: 0 6px 15px rgba(255, 159, 243, 0.2);
  transition: all 0.3s ease;
  z-index: 5;
  cursor: help;
}
.activity-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(255, 159, 243, 0.3);
}
.activity-box.critical {
  background: linear-gradient(135deg, #ffebee 0%, #fce4ec 100%);
  border-color: #ff4757;
  box-shadow: 0 6px 15px rgba(255, 71, 87, 0.2);
}
.activity-box.critical:hover {
  box-shadow: 0 10px 25px rgba(255, 71, 87, 0.3);
}
.activity-name {
  font-weight: bold;
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 4px;
}
.activity-times {
  font-size: 9px;
  color: #555;
  line-height: 1.3;
}
.expected-time {
  font-weight: bold;
  color: #e74c3c;
  font-size: 12px;
}
</style>