<template>
  <div class="data-input-table">
    <h2>Enter Activity Data for {{ diagramType }}</h2>
    <form @submit.prevent="submitData">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Description (Optional)</th>
            <th>Predecessors (comma-sep)</th>
            <th v-if="diagramType === 'PERT'">Optimistic (O)</th>
            <th v-if="diagramType === 'PERT'">Most Likely (M)</th>
            <th v-if="diagramType === 'PERT'">Pessimistic (P)</th>
            <th v-if="diagramType === 'CPA'">Duration</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(activity, index) in activities" :key="activity.tempId">
            <td><input type="text" v-model="activity.id" placeholder="e.g., A" required /></td>
            <td><input type="text" v-model="activity.description" placeholder="e.g., Task A" /></td>
            <td><input type="text" v-model="activity.predecessors" placeholder="e.g., B,C" /></td>
            <td v-if="diagramType === 'PERT'"><input type="number" min="0" step="any" v-model.number="activity.optimistic" required /></td>
            <td v-if="diagramType === 'PERT'"><input type="number" min="0" step="any" v-model.number="activity.mostLikely" required /></td>
            <td v-if="diagramType === 'PERT'"><input type="number" min="0" step="any" v-model.number="activity.pessimistic" required /></td>
            <td v-if="diagramType === 'CPA'"><input type="number" min="0" step="any" v-model.number="activity.duration" required /></td>
            <td><button type="button" @click="removeActivity(index)" class="remove-btn">Remove</button></td>
          </tr>
        </tbody>
      </table>
      <div class="action-buttons">
        <button type="button" @click="addActivity" class="add-btn">Add Activity</button>
        <button type="submit" class="generate-btn">Generate Diagram</button>
      </div>
    </form>
    <button @click="$emit('back')" class="back-button-small">Back to Type Selection</button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  diagramType: {
    type: String,
    required: true, // 'PERT' or 'CPA'
  },
});
const emit = defineEmits(['generateDiagram', 'back']);

let tempIdCounter = 0;
const createNewActivity = () => {
  const baseActivity = {
    tempId: tempIdCounter++, // For v-for key
    id: '',
    description: '',
    predecessors: '',
  };
  if (props.diagramType === 'PERT') {
    return { ...baseActivity, optimistic: null, mostLikely: null, pessimistic: null };
  } else { // CPA
    return { ...baseActivity, duration: null };
  }
};

const activities = ref([createNewActivity()]); // Start with one empty row

watch(() => props.diagramType, () => {
  // Reset activities when type changes if needed, or adapt existing ones
  activities.value = [createNewActivity()];
}, { immediate: true });


const addActivity = () => {
  activities.value.push(createNewActivity());
};

const removeActivity = (index) => {
  if (activities.value.length > 1) {
    activities.value.splice(index, 1);
  } else {
    alert("You must have at least one activity.");
  }
};

const validateActivities = () => {
  const activityIds = new Set();
  for (const act of activities.value) {
    if (!act.id.trim()) {
      alert("Activity ID cannot be empty.");
      return false;
    }
    if (activityIds.has(act.id.trim())) {
      alert(`Duplicate Activity ID found: ${act.id}. IDs must be unique.`);
      return false;
    }
    activityIds.add(act.id.trim());

    if (props.diagramType === 'PERT') {
      if (act.optimistic == null || act.mostLikely == null || act.pessimistic == null) {
        alert(`All PERT times (O, M, P) are required for activity ${act.id}.`);
        return false;
      }
      if (!(act.optimistic <= act.mostLikely && act.mostLikely <= act.pessimistic)) {
        alert(`For activity ${act.id}, times must be O <= M <= P.`);
        return false;
      }
    } else { // CPA
      if (act.duration == null || act.duration <=0) {
        alert(`Duration is required and must be positive for activity ${act.id}.`);
        return false;
      }
    }
  }
  return true;
};


const submitData = () => {
  if (!validateActivities()) {
    return;
  }
  // Clean up data before emitting (remove tempId, trim strings)
  const processedActivities = activities.value.map(act => {
    const { tempId, ...rest } = act;
    return {
      ...rest,
      id: act.id.trim(),
       // Ensure that if predecessors string is empty or only '-', it results in an empty array
      predecessors: act.predecessors.trim() === '' || act.predecessors.trim() === '-'
                      ? []
                      : act.predecessors.split(',').map(p => p.trim()).filter(p => p && p !== '-'),
    };
  });
  emit('generateDiagram', processedActivities);
};
</script>

<style scoped>
.data-input-table {
  padding: 20px;
}
h2 {
  text-align: center;
  margin-bottom: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  font-size: 0.9em;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
th {
  background-color: #f4f4f4;
}
input[type="text"], input[type="number"] {
  width: 95%;
  padding: 6px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.action-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.add-btn, .generate-btn, .remove-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  color: white;
}
.add-btn { background-color: #5cb85c; }
.generate-btn { background-color: #007bff; }
.remove-btn { background-color: #d9534f; font-size: 0.8em; padding: 5px 10px;}

.back-button-small {
  background: #f0f0f0;
  color: #333;
  padding: 8px 15px;
  font-size: 0.9em;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  display: block;
  margin: 20px auto 0;
}
</style>