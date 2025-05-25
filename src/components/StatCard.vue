<template>
  <div class="stat-card">
    <div class="stat-label">{{ label }}</div>
    <div class="stat-value">{{ value }}</div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: String,
});
</script>

<style scoped>
.stat-card {
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  padding: 25px;
  border-radius: 15px;
  border-left: 6px solid #667eea; /* Default color, can be prop if needed */
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}
.stat-card:hover {
  transform: translateY(-5px);
}
.stat-label {
  font-size: 12px;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
  margin-top: 8px;
}
</style>