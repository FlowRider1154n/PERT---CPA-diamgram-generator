<template>
  <div
    class="tooltip"
    :style="{ left: `${x}px`, top: `${y}px` }"
    v-html="content"
  >
  </div>
</template>

<script setup>
defineProps({
  content: String,
  x: Number,
  y: Number,
});
</script>

<style scoped>
.tooltip {
  position: fixed; /* Use fixed if page scrolls, absolute if network container scrolls */
  background: rgba(44, 62, 80, 0.95);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 12px;
  z-index: 1000;
  pointer-events: none; /* So it doesn't interfere with mouse events on elements below */
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  backdrop-filter: blur(5px);
  max-width: 250px;
  transform: translate(-50%, -100%); /* Adjust to position relative to cursor */
  /* The original JS had event.pageY - 80. This attempts to put the tooltip above the cursor.
     If you use `transform: translateY(-100%)` and `top: event.pageY - 10px` (small offset),
     it will position the bottom of the tooltip just above the cursor.
     The event.pageX + 15, event.pageY - 80 from original JS is a bit specific.
     Using fixed positioning and then adjusting x,y based on mouse event is common.
  */
}
</style>