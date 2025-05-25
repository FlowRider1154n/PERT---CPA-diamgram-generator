<template>
  <div class="home-view">
    <h1>Welcome to PERT/CPA Diagram Generator</h1>
    <p>Create network diagrams to plan and manage your projects.</p>
    <button @click="$emit('createNew')">Create New Diagram</button>
  </div>
</template>

<script setup>
defineEmits(['createNew']);
</script>

<style scoped>
.home-view {
  text-align: center;
  padding: 40px;
}
.home-view h1 {
  font-size: 2.2em;
  margin-bottom: 20px;
}
.home-view p {
  font-size: 1.2em;
  color: #555;
  margin-bottom: 30px;
}
button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1.1em;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}
</style>