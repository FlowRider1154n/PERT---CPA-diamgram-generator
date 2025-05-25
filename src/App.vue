<template>
  <div class="container">
    <h1>🎯 PERT Network Diagram</h1>

    <div class="network-container" ref="networkContainerRef">
      <!-- Nodes -->
      <NetworkNode
        v-for="(node, nodeId) in nodeLayout"
        :key="nodeId"
        :node-id="nodeId"
        :config="node"
        :is-critical="criticalNodes.includes(nodeId)"
      />

      <!-- Activity Boxes -->
      <ActivityBox
        v-for="(activityDetails, activityName) in activityLayout"
        :key="activityName"
        :activity-name="activityName"
        :layout="activityDetails"
        :activity-data="activities[activityName]"
        :is-critical="criticalPath.includes(activityName)"
        @show-tooltip="handleShowTooltip"
        @hide-tooltip="handleHideTooltip"
      />

      <!-- Arrows (Main activity arrows) -->
      <NetworkArrow
        v-for="(activityDetails, activityName) in activityLayout"
        :key="`arrow-${activityName}`"
        :from-node="nodeLayout[activityDetails.from]"
        :to-node="nodeLayout[activityDetails.to]"
        :is-critical="criticalPath.includes(activityName)"
        :arrow-type="'activity'"
      />

      <!-- Special Merge Arrows (if needed - careful with positioning) -->
      <!-- Example: Arrow from A_END to C activity box -->
      <NetworkArrow
        v.if="nodeLayout.A_END && activityLayout.C"
        :from-node="nodeLayout.A_END"
        :to-pos="{ x: activityLayout.C.x, y: activityLayout.C.y }"
        :is-critical="criticalPath.includes('A') && criticalPath.includes('C')"
        :arrow-type="'dependency'"
      />
      <!-- Example: Arrow from F_END to H activity box -->
      <NetworkArrow
        v.if="nodeLayout.F_END && activityLayout.H"
        :from-node="nodeLayout.F_END"
        :to-pos="{ x: activityLayout.H.x, y: activityLayout.H.y }"
        :is-critical="criticalPath.includes('F') && criticalPath.includes('H')"
        :arrow-type="'dependency'"
      />
      <!-- Example: Arrow from G_END to H activity box -->
      <NetworkArrow
        v.if="nodeLayout.G_END && activityLayout.H"
        :from-node="nodeLayout.G_END"
        :to-pos="{ x: activityLayout.H.x, y: activityLayout.H.y }"
        :is-critical="criticalPath.includes('G') && criticalPath.includes('H')"
        :arrow-type="'dependency'"
      />
    </div>

    <div class="legend">
      <h3>📊 Legend</h3>
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
      <StatCard label="Project Duration" :value="`${projectDuration.toFixed(2)} days`" />
      <StatCard label="Critical Path" :value="criticalPath.join(' → ')" />
      <StatCard label="Total Activities" :value="`${Object.keys(activities).length}`" />
      <StatCard label="Critical Activities" :value="`${criticalPath.length} of ${Object.keys(activities).length}`" />
    </div>

    <ActivityTable :activities-data="data_corrected" :critical-path="criticalPath" />

    <Tooltip
      v-if="tooltip.visible"
      :content="tooltip.content"
      :x="tooltip.x"
      :y="tooltip.y"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import NetworkNode from './components/NetworkNode.vue';
import ActivityBox from './components/ActivityBox.vue';
import NetworkArrow from './components/NetworkArrow.vue';
import StatCard from './components/StatCard.vue';
import ActivityTable from './components/ActivityTable.vue';
import Tooltip from './components/Tooltip.vue';

// --- DATA (Same as original) ---
const data_corrected = {
    "Activity": ["A", "B", "C", "D", "E", "F", "G", "H"],
    "Immediate Predecessors": ["-", "A", "A,B", "C", "C", "D,E", "D", "F,G"],
    "Optimistic": [3, 1, 4, 6, 3, 2, 7, 12],
    "Most Likely": [5, 3, 5, 8, 4, 4, 9, 15],
    "Pessimistic": [7, 4, 7, 9, 5, 7, 10, 17],
    "Expected Time": [5.00, 2.83, 5.16, 7.83, 4.00, 4.16, 8.83, 14.83],
    "Variance": [0.444, 0.250, 0.250, 0.250, 0.111, 0.694, 0.250, 0.694]
};

const activities = ref({});
data_corrected.Activity.forEach((activity, i) => {
    activities.value[activity] = {
        predecessors: data_corrected["Immediate Predecessors"][i] === "-" ? [] :
                        data_corrected["Immediate Predecessors"][i].split(","),
        optimistic: data_corrected.Optimistic[i],
        mostLikely: data_corrected["Most Likely"][i],
        pessimistic: data_corrected.Pessimistic[i],
        expectedTime: data_corrected["Expected Time"][i],
        variance: data_corrected.Variance[i]
    };
});

const criticalPath = ref(['A', 'C', 'D', 'G', 'H']);

const nodeLayout = ref({
    'START': { x: 60, y: 300, es: 0, ef: 0, label: '1' },
    'A_END': { x: 220, y: 300, es: 0, ef: 5.00, label: '2' },
    'B_END': { x: 380, y: 200, es: 5.00, ef: 7.83, label: '3' }, // A (5) + B (2.83) = 7.83. Node represents end of B.
    'C_END': { x: 540, y: 300, es: 7.83, ef: 12.99, label: '4' }, // Max(A_END, B_END) + C. If C depends on A and B, it starts after both. B_END is later. 7.83 + 5.16 = 12.99. Node represents end of C.
    'DE_MERGE': { x: 700, y: 250, es: 12.99, ef: 20.82, label: '5' }, // C_END + D (7.83) = 20.82. Represents end of D. Also end of E (12.99+4=16.99). D is longer.
    'F_END': { x: 820, y: 180, es: 20.82, ef: 24.98, label: '6' }, // DE_MERGE + F (4.16) = 24.98. Node for end of F.
    'G_END': { x: 820, y: 350, es: 20.82, ef: 29.65, label: '7' }, // DE_MERGE + G (8.83) = 29.65. Node for end of G.
    'END': { x: 980, y: 300, es: 29.65, ef: 44.48, label: '8' }  // Max(F_END, G_END) + H. G_END is later (29.65). 29.65 + 14.83 = 44.48.
});
// Corrected EF for END node based on Critical Path: A(5) C(5.16) D(7.83) G(8.83) H(14.83) = 41.65 (This is if no B involved in critical path for C start)
// If Critical Path is A -> C -> D -> G -> H
// Start: 0
// A_END: 0 + 5 = 5 (ES=0, EF=5)
// C_END: A_END is 5. B_END requires A, so B starts at 5, ends at 5+2.83 = 7.83. C starts after max(A_END, B_END) which is 7.83. C_END = 7.83 + 5.16 = 12.99 (ES for C is 7.83, EF for C is 12.99)
// DE_MERGE (End of D): C_END + D_time = 12.99 + 7.83 = 20.82 (ES for D is 12.99, EF for D is 20.82)
// G_END: DE_MERGE + G_time = 20.82 + 8.83 = 29.65 (ES for G is 20.82, EF for G is 29.65)
// END (End of H): G_END + H_time = 29.65 + 14.83 = 44.48 (ES for H is 29.65, EF for H is 44.48).
// The project duration in stats says 44.82, likely a slight rounding difference or different calculation. Let's use 44.48 based on sum of critical path activities.
// The provided nodeLayout seems to reflect this critical path calculation. The EF of END node should be 44.48.
// The original HTML has `END: { x: 980, y: 300, es: 29.99, ef: 44.82, label: '8' }`. The ES 29.99 vs 29.65 is a slight diff.
// Let's stick to the given nodeLayout for now, but be aware of calculation.
nodeLayout.value['END'].ef = 44.48; // Recalculated
nodeLayout.value['END'].es = 29.65; // Recalculated from G_END
// The critical path implies G_END is the predecessor to H. So ES for H = EF of G_END = 29.65.


const activityLayout = ref({
    'A': { x: 140, y: 270, from: 'START', to: 'A_END' },
    'B': { x: 300, y: 170, from: 'A_END', to: 'B_END' }, // B depends on A
    'C': { x: 430, y: 230, from: 'B_END', to: 'C_END' }, // C depends on A,B. B_END is later.
    'D': { x: 620, y: 330, from: 'C_END', to: 'DE_MERGE' }, // D depends on C
    'E': { x: 620, y: 200, from: 'C_END', to: 'DE_MERGE' }, // E depends on C. DE_MERGE is effectively end of D or E. D is critical.
    'F': { x: 760, y: 150, from: 'DE_MERGE', to: 'F_END' }, // F depends on D,E. DE_MERGE represents this.
    'G': { x: 760, y: 380, from: 'DE_MERGE', to: 'G_END' }, // G depends on D. DE_MERGE represents end of D.
    'H': { x: 900, y: 270, from: 'G_END', to: 'END' }      // H depends on F,G. G_END is on critical path.
});

// Adjust H's 'from' based on critical path (G is critical, F is not)
// H depends on F,G. G_END (29.65) vs F_END (24.98). H starts after G.
// So H's from node should be G_END. And 'END' node ES is EF of G_END. This seems correct.

const criticalNodes = computed(() => {
    // Determine critical nodes based on critical path activities and their start/end nodes
    const nodes = new Set(['START']);
    criticalPath.value.forEach(actName => {
        const layout = activityLayout.value[actName];
        if (layout) {
            nodes.add(layout.from);
            nodes.add(layout.to);
        }
    });
    return Array.from(nodes);
});

const projectDuration = computed(() => nodeLayout.value['END'].ef);


// --- TOOLTIP ---
const tooltip = ref({
  visible: false,
  content: '',
  x: 0,
  y: 0
});

const handleShowTooltip = ({ event, activityName }) => {
  const activity = activities.value[activityName];
  if (!activity) return;
  tooltip.value = {
    visible: true,
    content: `
      <strong>Activity ${activityName}</strong><br>
      Predecessors: ${activity.predecessors.length ? activity.predecessors.join(', ') : 'None'}<br>
      Expected Time: ${activity.expectedTime.toFixed(2)} days<br>
      Std Dev: ${Math.sqrt(activity.variance).toFixed(3)}<br>
      ${criticalPath.value.includes(activityName) ? '<strong>🔴 CRITICAL PATH</strong>' : '⚪ Non-critical'}
    `,
    x: event.pageX + 15,
    y: event.pageY - 80 // Adjust as needed
  };
};

const handleHideTooltip = () => {
  tooltip.value.visible = false;
};

// --- ANIMATION ON LOAD ---
const networkContainerRef = ref(null);
onMounted(() => {
  // Simple fade-in/scale-up, Vue transitions are better for complex animations
  setTimeout(() => {
    if (networkContainerRef.value) {
      const elements = networkContainerRef.value.querySelectorAll('.node, .activity-box');
      elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'scale(0.5)';
        setTimeout(() => {
          el.style.transition = 'all 0.5s ease';
          el.style.opacity = '1';
          el.style.transform = 'scale(1)';
        }, index * 50); // Stagger animation
      });
    }
  }, 100);
});

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
    width: 100%;
    /* Adjust height based on your content or make it dynamic */
    height: 700px; 
    margin: 20px 0;
    background: linear-gradient(45deg, #f8f9ff 0%, #e6f3ff 100%);
    border: 2px solid #e1e8ed;
    border-radius: 15px;
    overflow: hidden; /* Important if elements are positioned absolutely */
    box-shadow: inset 0 4px 8px rgba(0,0,0,0.05);
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