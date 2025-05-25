<template>
  <div class="type-selection">
    <h2>Select Diagram Type</h2>
    <div class="button-group">
      <button @click="$emit('typeSelected', 'PERT')">PERT Diagram</button>
      <button @click="$emit('typeSelected', 'CPA')">CPA Diagram</button>
    </div>
    <button @click="$emit('back')" class="back-button-small">Back</button>
  </div>
</template>

<script setup>
defineEmits(['typeSelected', 'back']);
</script>

<style scoped>
.type-selection {
  text-align: center;
  padding: 30px;
}
h2 {
  margin-bottom: 30px;
  color: #333;
}
.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
}
button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 25px;
  font-size: 1em;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.back-button-small {
  background: #f0f0f0;
  color: #333;
  padding: 8px 15px;
  font-size: 0.9em;
}
</style>