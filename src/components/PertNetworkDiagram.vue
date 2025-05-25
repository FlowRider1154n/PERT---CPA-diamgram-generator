<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  projectData: {
    type: Object,
    required: true,
    default: () => ({
      activities: [],
      predecessors: [],
      optimistic: [],
      mostLikely: [],
      pessimistic: [],
      expectedTime: [],
      variance: []
    })
  }
})

const networkContainer = ref(null)
const nodes = ref([])
const links = ref([])

const tooltip = reactive({
  show: false,
  content: '',
  x: 0,
  y: 0
})

const criticalPath = computed(() => {
  return calculateCriticalPath(props.projectData)
})

const processedActivities = computed(() => {
  return props.projectData.activities.map((activity, index) => ({
    id: activity,
    predecessors: props.projectData.predecessors[index].split(',').filter(p => p !== '-'),
    optimistic: props.projectData.optimistic[index],
    mostLikely: props.projectData.mostLikely[index],
    pessimistic: props.projectData.pessimistic[index],
    expectedTime: props.projectData.expectedTime[index],
    variance: props.projectData.variance[index],
    isCritical: criticalPath.value.includes(activity)
  }))
})

function calculateCriticalPath(data) {
  const activities = data.activities.map((activity, index) => ({
    id: activity,
    duration: data.expectedTime[index],
    predecessors: data.predecessors[index].split(',').filter(p => p !== '-')
  }))

  const earliest = {}
  activities.forEach(activity => {
    earliest[activity.id] = {
      start: 0,
      finish: activity.duration
    }
  })

  activities.forEach(activity => {
    activity.predecessors.forEach(pred => {
      const predFinish = earliest[pred].finish
      if (predFinish > earliest[activity.id].start) {
        earliest[activity.id].start = predFinish
        earliest[activity.id].finish = predFinish + activity.duration
      }
    })
  })

  const projectDuration = Math.max(...Object.values(earliest).map(t => t.finish))
  const criticalActivities = activities.filter(activity => 
    Math.abs(earliest[activity.id].finish - projectDuration) < 0.001
  )

  return criticalActivities.map(activity => activity.id)
}

function showTooltip(event, activity) {
  tooltip.show = true
  tooltip.content = `
    Activity: ${activity.id}<br>
    Duration: ${activity.expectedTime}<br>
    Variance: ${activity.variance}<br>
    ${activity.isCritical ? '(Critical Path)' : ''}
  `
  tooltip.x = event.clientX + 10
  tooltip.y = event.clientY - 10
}

function hideTooltip() {
  tooltip.show = false
}

onMounted(() => {
  const width = networkContainer.value.clientWidth
  const height = networkContainer.value.clientHeight

  // Initialize nodes with positions
  const nodeObjects = processedActivities.value.map(activity => ({
    id: activity.id,
    x: width / 2 + (Math.random() - 0.5) * 200,
    y: height / 2 + (Math.random() - 0.5) * 200,
    ...activity
  }))
  nodes.value = nodeObjects

  // Create links with proper references to node objects
  links.value = []
  processedActivities.value.forEach(activity => {
    const targetNode = nodeObjects.find(n => n.id === activity.id)
    activity.predecessors.forEach(pred => {
      const sourceNode = nodeObjects.find(n => n.id === pred)
      if (sourceNode && targetNode) {
        links.value.push({
          source: sourceNode,
          target: targetNode,
          isCritical: activity.isCritical
        })
      }
    })
  })

  // Initialize force simulation
  const simulation = d3.forceSimulation(nodeObjects)
    .force('link', d3.forceLink(links.value).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(40))

  simulation.on('tick', () => {
    nodes.value = [...nodeObjects]
    links.value = [...links.value]
  })
})
</script>

<template>
  <div class="pert-diagram">
    <div ref="networkContainer" class="network-container">
      <!-- Links -->
      <svg class="network-svg">
        <g class="links">
          <line
            v-for="link in links"
            :key="`${link.source.id}-${link.target.id}`"
            :x1="link.source.x"
            :y1="link.source.y"
            :x2="link.target.x"
            :y2="link.target.y"
            :class="{ 'critical': link.isCritical }"
          />
        </g>
      </svg>

      <!-- Nodes -->
      <div
        v-for="node in nodes"
        :key="node.id"
        class="node"
        :style="{
          left: `${node.x}px`,
          top: `${node.y}px`
        }"
        @mouseenter="showTooltip($event, processedActivities.find(a => a.id === node.id))"
        @mouseleave="hideTooltip"
      >
        {{ node.id }}
      </div>

      <!-- Tooltip -->
      <div
        v-if="tooltip.show"
        class="tooltip"
        :style="{
          left: `${tooltip.x}px`,
          top: `${tooltip.y}px`
        }"
        v-html="tooltip.content"
      />
    </div>
  </div>
</template>

<style scoped>
.pert-diagram {
  width: 100%;
  height: 600px;
  position: relative;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.network-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.network-svg {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.links line {
  stroke: #999;
  stroke-width: 2px;
}

.links line.critical {
  stroke: #ff4444;
  stroke-width: 3px;
}

.node {
  position: absolute;
  transform: translate(-50%, -50%);
  background: white;
  border: 2px solid #666;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.node:hover {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  transform: translate(-50%, -50%) scale(1.1);
}

.tooltip {
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  z-index: 1000;
}
</style>