<template>
  <div class="activity-table">
    <div class="table-header">📋 Activity Details</div>
    <div class="table-content">
      <table v-if="activitiesData && activitiesData.Activity"> <!-- Ensure base data exists -->
        <thead>
          <tr>
            <th>Activity</th>
            <th>Predecessors</th>
            <th v-if="diagramType === 'PERT'">Optimistic</th>
            <th v-if="diagramType === 'PERT'">Most Likely</th>
            <th v-if="diagramType === 'PERT'">Pessimistic</th>
            <th v-if="diagramType === 'CPA'">Duration</th>
            <th>Expected Time</th>
            <th v-if="diagramType === 'PERT'">Variance</th>
            <th>ES</th>
            <th>EF</th>
            <th>LS</th>
            <th>LF</th>
            <th>Slack</th>
            <th>Critical?</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(activityName, index) in activitiesData.Activity"
            :key="activityName"
            :class="{ 'critical-row': criticalPath.includes(activityName) }"
          >
            <td><strong>{{ activityName }}</strong></td>
            <td>{{ (activitiesData['Immediate Predecessors'] && activitiesData['Immediate Predecessors'][index] != null) ? activitiesData['Immediate Predecessors'][index] : 'N/A' }}</td>
            
            <td v-if="diagramType === 'PERT'">{{ (activitiesData.Optimistic && activitiesData.Optimistic[index] != null) ? activitiesData.Optimistic[index] : 'N/A' }}</td>
            <td v-if="diagramType === 'PERT'">{{ (activitiesData['Most Likely'] && activitiesData['Most Likely'][index] != null) ? activitiesData['Most Likely'][index] : 'N/A' }}</td>
            <td v-if="diagramType === 'PERT'">{{ (activitiesData.Pessimistic && activitiesData.Pessimistic[index] != null) ? activitiesData.Pessimistic[index] : 'N/A' }}</td>
            
            <td v-if="diagramType === 'CPA'">{{ (activitiesData.Duration && activitiesData.Duration[index] != null) ? activitiesData.Duration[index] : 'N/A' }}</td>
            
            <td><strong>{{ (activitiesData['Expected Time'] && activitiesData['Expected Time'][index] != null) ? activitiesData['Expected Time'][index].toFixed(2) : 'N/A' }}</strong></td>
            
            <td v-if="diagramType === 'PERT'">{{ (activitiesData.Variance && activitiesData.Variance[index] != null) ? activitiesData.Variance[index].toFixed(3) : 'N/A' }}</td>
            
            <td>{{ (activitiesData.ES && activitiesData.ES[index] != null) ? activitiesData.ES[index].toFixed(2) : 'N/A' }}</td>
            <td>{{ (activitiesData.EF && activitiesData.EF[index] != null) ? activitiesData.EF[index].toFixed(2) : 'N/A' }}</td>
            <td>{{ (activitiesData.LS && activitiesData.LS[index] != null) ? activitiesData.LS[index].toFixed(2) : 'N/A' }}</td>
            <td>{{ (activitiesData.LF && activitiesData.LF[index] != null) ? activitiesData.LF[index].toFixed(2) : 'N/A' }}</td>
            <td>{{ (activitiesData.Slack && activitiesData.Slack[index] != null) ? activitiesData.Slack[index].toFixed(2) : 'N/A' }}</td>
            
            <td>{{ criticalPath.includes(activityName) ? '🔴 Yes' : '⚪ No' }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else>
        Loading activity data or no data available...
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'; // Make sure watch is imported if you use it

// 1. Define your props - this makes them available directly in the template
//    and also gives you a 'props' object if you assign its result.
const componentProps = defineProps({ // Renamed to avoid conflict if you use 'props' elsewhere
  activitiesData: Object,
  criticalPath: Array,
  diagramType: String,
});

// 2. Now use `componentProps.propertyName` if you need to access them in script setup
//    OR, even better for watch, watch the specific prop.

// Corrected logging:
console.log(
  '[ActivityTable] Initial componentProps.activitiesData:',
  JSON.parse(JSON.stringify(componentProps.activitiesData || {}))
);
console.log('[ActivityTable] Initial componentProps.diagramType:', componentProps.diagramType);

// Corrected watch:
watch(
  () => componentProps.activitiesData, // Watch the specific prop
  (newData) => {
    console.log(
      '[ActivityTable] componentProps.activitiesData updated:',
      JSON.parse(JSON.stringify(newData || {}))
    );
  },
  { deep: true, immediate: true }
);

// If you had other logic directly using `props.someProp`, change it to `componentProps.someProp`
// Example: let type = props.diagramType; // WRONG
//          let type = componentProps.diagramType; // CORRECT
</script>

<style scoped>
/* Styles from previous ActivityTable.vue */
.activity-table {
  margin-top: 30px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  overflow: hidden;
}
.table-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  font-size: 1.2em;
  font-weight: bold;
}
.table-content {
  padding: 20px;
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
th, td {
  padding: 12px 15px;
  text-align: center;
  border-bottom: 1px solid #e9ecef;
}
th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
}
.critical-row {
  background: #fff5f5;
  border-left: 4px solid #ff4757;
}
</style>