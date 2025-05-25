<template>
  <div class="container">
    <HomeView v-if="currentView === 'home'" @create-new="handleCreateNew" />

    <TypeSelection
      v-if="currentView === 'selectType'"
      @type-selected="handleTypeSelected"
      @back="currentView = 'home'"
    />

    <DataInputTable
      v-if="currentView === 'dataInput'"
      :diagram-type="selectedDiagramType"
      @generate-diagram="handleGenerateDiagram"
      @back="currentView = 'selectType'"
    />

    <div v-if="currentView === 'viewDiagram' && projectData">
      <button @click="startNewDiagram" class="back-button">Create Another Diagram</button>
      <h1>🎯 {{ selectedDiagramType }} Network Diagram</h1>
      <div class="network-container" ref="networkContainerRef">
        <NetworkNode
          v-for="(node, nodeId) in projectData.nodeLayout"
          :key="nodeId"
          :node-id="nodeId"
          :config="node"
          :is-critical="projectData.criticalNodes.includes(nodeId)"
        />
        <ActivityBox
          v-for="(activityDetails, activityName) in projectData.activityLayout"
          :key="activityName"
          :activity-name="activityName"
          :layout="activityDetails"
          :activity-data="projectData.activities[activityName]"
          :is-critical="projectData.criticalPath.includes(activityName)"
          @show-tooltip="handleShowTooltip"
          @hide-tooltip="handleHideTooltip"
        />
        <NetworkArrow
          v-for="(activityDetails, activityName) in projectData.activityLayout"
          :key="`arrow-${activityName}`"
          :from-node="projectData.nodeLayout[activityDetails.from]"
          :to-node="projectData.nodeLayout[activityDetails.to]"
          :is-critical="projectData.criticalPath.includes(activityName)"
          arrow-type="activity"
        />
        <!-- Add logic for dependency arrows if needed, more complex with dynamic data -->
      </div>

      <div class="legend">
        <h3>📊 Legend</h3>
        <!-- Legend content (same as before) -->
        <div class="legend-grid">
            <div class="legend-item">
                <div class="legend-color" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
                Normal Path Nodes
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);"></div>
                Critical Path Nodes
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #ff9ff3; border: 2px solid #ff9ff3;"></div>
                Normal Activities
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #ffebee; border: 2px solid #ff4757;"></div>
                Critical Activities
            </div>
        </div>
      </div>

      <div class="stats">
        <StatCard label="Project Duration" :value="`${projectData.projectDuration.toFixed(2)} days`" />
        <StatCard label="Critical Path" :value="projectData.criticalPath.join(' → ')" />
        <StatCard label="Total Activities" :value="`${Object.keys(projectData.activities).length}`" />
        <StatCard label="Critical Activities" :value="`${projectData.criticalPath.length} of ${Object.keys(projectData.activities).length}`" />
      </div>

      <ActivityTable :activities-data="projectData.rawActivitiesForTable" :critical-path="projectData.criticalPath" :diagram-type="selectedDiagramType"/>
    </div>

    <Tooltip
      v-if="tooltip.visible"
      :content="tooltip.content"
      :x="tooltip.x"
      :y="tooltip.y"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import HomeView from './components/HomeView.vue';
import TypeSelection from './components/TypeSelection.vue';
import DataInputTable from './components/DataInputTable.vue';
import NetworkNode from './components/NetworkNode.vue';
import ActivityBox from './components/ActivityBox.vue';
import NetworkArrow from './components/NetworkArrow.vue';
import StatCard from './components/StatCard.vue';
import ActivityTable from './components/ActivityTable.vue'; // Modified to accept diagramType
import Tooltip from './components/Tooltip.vue';

import { useNetworkCalculator } from './composables/useNetworkCalculator';
import { generateLayout } from './utils/layoutGenerator'; // Uses d3-dag now

const currentView = ref('home'); // 'home', 'selectType', 'dataInput', 'viewDiagram'
const selectedDiagramType = ref(null); // 'PERT' or 'CPA'
const projectData = ref(null); // Will hold all calculated data for the diagram
const initialActivitiesInput = ref(null); // To store the input if we need to revert
const { calculateNetworkMetrics } = useNetworkCalculator();

const handleCreateNew = () => {
  currentView.value = 'selectType';
  projectData.value = null; // Clear previous data
};

const handleTypeSelected = (type) => {
  selectedDiagramType.value = type;
  currentView.value = 'dataInput';
};

const handleGenerateDiagram = async (activitiesInputFromTable) => {
  // Store the input in case of error, so DataInputTable can be repopulated if needed
  // (Though DataInputTable already holds its own state, this is a fallback/alternative)
  initialActivitiesInput.value = JSON.parse(JSON.stringify(activitiesInputFromTable)); 
  
  try {
    // Reset projectData before attempting to generate a new one
    // This ensures that if an error occurs, we don't show a partially updated diagram
    // from a previous successful attempt.
    projectData.value = null; 

    const { activities, networkAnalysis, rawActivitiesForTable } = calculateNetworkMetrics(activitiesInputFromTable, selectedDiagramType.value);
    
    const { nodeLayout, activityLayout, arrowDefinitions, dagRenderWidth, dagRenderHeight } = 
        generateLayout(activities, networkAnalysis.dependencies, networkAnalysis.levels);

    projectData.value = {
      activities,
      nodeLayout,
      activityLayout,
      arrowDefinitions,
      criticalPath: networkAnalysis.criticalPath,
      criticalNodes: getCriticalNodes(activities, networkAnalysis.criticalPath, nodeLayout),
      projectDuration: networkAnalysis.projectDuration,
      rawActivitiesForTable,
      dagRenderWidth,
      dagRenderHeight
    };

    // Only change view if everything is successful
    currentView.value = 'viewDiagram'; 
    await nextTick();
    animateDiagramElements();

  } catch (error) {
    console.error("Error generating diagram:", error);
    alert(`Error generating diagram: ${error.message}. Please check your input data and console for details.`);
    // IMPORTANT: Do NOT change currentView.value here. User stays on DataInputTable.
    // The DataInputTable component already holds the user's current input in its 'activities' ref.
    // So, the data is not lost from the input fields.
    projectData.value = null; // Ensure no stale diagram data is shown
  }
};

// Modified getCriticalNodes to use activities and their event nodes
const getCriticalNodes = (allActivities, criticalPathActivities, allNodeLayout) => {
    const criticalNodeIds = new Set();
    if (allNodeLayout['___VIRTUAL_START___']) criticalNodeIds.add('___VIRTUAL_START___');

    criticalPathActivities.forEach(actId => {
        if (allActivities[actId] && allActivities[actId].isCritical) {
            criticalNodeIds.add(`node_start_${actId}`);
            criticalNodeIds.add(`node_end_${actId}`);
        }
    });
     if (allNodeLayout['___VIRTUAL_END___']) { // Add if any critical path leads to it
        const lastCriticalActivityId = criticalPathActivities[criticalPathActivities.length - 1];
        if (lastCriticalActivityId && allActivities[lastCriticalActivityId]?.successors.length === 0) {
            criticalNodeIds.add('___VIRTUAL_END___');
        }
    }
    return Array.from(criticalNodeIds);
};


const startNewDiagram = () => {
  currentView.value = 'home';
  projectData.value = null;
  selectedDiagramType.value = null;
};

// --- TOOLTIP (same as before) ---
const tooltip = ref({ visible: false, content: '', x: 0, y: 0 });
const handleShowTooltip = ({ event, activityName }) => {
  if (!projectData.value || !projectData.value.activities[activityName]) return;
  const activity = projectData.value.activities[activityName];
  tooltip.value = {
    visible: true,
    content: `
      <strong>Activity ${activityName}</strong><br>
      Predecessors: ${activity.predecessors.length ? activity.predecessors.join(', ') : 'None'}<br>
      ES: ${activity.es.toFixed(2)}, EF: ${activity.ef.toFixed(2)}<br>
      LS: ${activity.ls.toFixed(2)}, LF: ${activity.lf.toFixed(2)}<br>
      Slack: ${activity.slack.toFixed(2)}<br>
      Expected Time: ${activity.expectedTime.toFixed(2)} days<br>
      ${selectedDiagramType.value === 'PERT' ? `Variance: ${activity.variance.toFixed(3)}<br>` : ''}
      ${projectData.value.criticalPath.includes(activityName) ? '<strong>🔴 CRITICAL PATH</strong>' : '⚪ Non-critical'}
    `,
    x: event.pageX + 15,
    y: event.pageY - 100 // Adjust as needed
  };
};
const handleHideTooltip = () => { tooltip.value.visible = false; };

// --- ANIMATION ---
const networkContainerRef = ref(null);
const animateDiagramElements = () => {
  if (networkContainerRef.value) {
    const elements = networkContainerRef.value.querySelectorAll('.node, .activity-box');
    elements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'scale(0.5)';
      setTimeout(() => {
        el.style.transition = 'all 0.5s ease';
        el.style.opacity = '1';
        el.style.transform = 'scale(1)';
      }, index * 50);
    });
  }
};

</script>

<style>

/* Global styles from original HTML - place non-scoped styles here */
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0; /* Ensure no default margin */
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 20px; /* Add padding to body instead of App's root for full bg */
    box-sizing: border-box;
}

/* Styles for .container and other top-level elements in App.vue */
.container {
    background: rgba(255, 255, 255, 0.95);
    padding: 30px;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    backdrop-filter: blur(10px);
    max-width: 1200px; /* Optional: constrain width */
    margin: 0 auto; /* Center container */
}

h1 {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 30px;
    font-size: 2.5em;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.network-container {
    position: relative;
    /* width: 100%; REMOVE or keep if you want scrollbars for very large d3-dag outputs */
    /* height: 700px; REMOVE or keep if you want scrollbars */
    margin: 20px 0;
    background: linear-gradient(45deg, #f8f9ff 0%, #e6f3ff 100%);
    border: 2px solid #e1e8ed;
    border-radius: 15px;
    overflow: auto; /* Add scrollbars if minWidth/minHeight from d3-dag is larger than available space */
    box-shadow: inset 0 4px 8px rgba(0,0,0,0.05);
    padding: 20px; /* Add some padding inside the container */
}

.legend {
    margin-top: 30px;
    padding: 25px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 15px;
    border-left: 6px solid #667eea;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.legend h3 {
    margin: 0 0 15px 0;
    color: #2c3e50;
    font-size: 1.3em;
}

.legend-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
}

.legend-item {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #495057;
}

.legend-color {
    width: 24px;
    height: 24px;
    margin-right: 12px;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stats {
    margin-top: 30px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}
/* ActivityTable styling will go into ActivityTable.vue or here if preferred */
</style>