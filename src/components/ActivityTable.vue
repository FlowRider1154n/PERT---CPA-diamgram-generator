<template>
  <div class="activity-table">
    <div class="table-header">📋 Activity Details</div>
    <div class="table-content">
      <table>
        <thead>
          <tr>
            <th>Activity</th>
            <th>Predecessors</th>
            <th>Optimistic</th>
            <th>Most Likely</th>
            <th>Pessimistic</th>
            <th>Expected Time</th>
            <th>Variance</th>
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
            <td>{{ activitiesData['Immediate Predecessors'][index] }}</td>
            <td>{{ activitiesData.Optimistic[index] }}</td>
            <td>{{ activitiesData['Most Likely'][index] }}</td>
            <td>{{ activitiesData.Pessimistic[index] }}</td>
            <td><strong>{{ activitiesData['Expected Time'][index].toFixed(2) }}</strong></td>
            <td>{{ activitiesData.Variance[index].toFixed(3) }}</td>
            <td>{{ criticalPath.includes(activityName) ? '🔴 Yes' : '⚪ No' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activitiesData: Object,
  criticalPath: Array,
});
</script>

<style scoped>
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