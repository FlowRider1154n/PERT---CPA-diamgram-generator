// src/composables/useNetworkCalculator.js
import { ref } from 'vue';

export function useNetworkCalculator() {
    const calculateNetworkMetrics = (activitiesInput, diagramType) => {
        const activities = {};
            
        const rawActivitiesForTable = { // For the final table display
            Activity: [],
            "Immediate Predecessors": [],
            Optimistic: [],
            "Most Likely": [],
            Pessimistic: [],
            Duration: [], // For CPA
            "Expected Time": [], // Key for expected time
            Variance: [],
            ES: [], EF: [], LS: [], LF: [], Slack: []
        };

        // 1. Initialize activities and calculate PERT values if needed
        activitiesInput.forEach(input => {
            let expectedTime;
            let variance = 0;

            if (diagramType === 'PERT') {
                const { optimistic: o, mostLikely: m, pessimistic: p } = input;
                expectedTime = (o + 4 * m + p) / 6;
                variance = Math.pow((p - o) / 6, 2);
                rawActivitiesForTable.Optimistic.push(o);
                rawActivitiesForTable["Most Likely"].push(m);
                rawActivitiesForTable.Pessimistic.push(p);
            } else { // CPA
                expectedTime = input.duration;
                rawActivitiesForTable.Duration.push(input.duration);
            }

            activities[input.id] = {
                id: input.id,
                description: input.description,
                predecessors: input.predecessors,
                successors: [], // Will be populated later
                expectedTime,
                variance,
                es: 0, ef: 0, ls: 0, lf: 0, slack: 0,
                isCritical: false
            };

            rawActivitiesForTable.Activity.push(input.id);
            rawActivitiesForTable["Immediate Predecessors"].push(input.predecessors.join(', ') || '-');
            rawActivitiesForTable["Expected Time"].push(expectedTime);
            rawActivitiesForTable.Variance.push(variance);
        });

        // 2. Build successor list and identify start nodes
        const activityIds = Object.keys(activities);
        const dependencies = {}; // activityId -> [predecessorIds]
        const levels = {}; // activityId -> level (for layout)
        const inDegree = {}; // For topological sort

        activityIds.forEach(id => {
            dependencies[id] = activities[id].predecessors;
            inDegree[id] = activities[id].predecessors.length;
            activities[id].predecessors.forEach(predId => {
                if (activities[predId]) {
                    activities[predId].successors.push(id);
                } else {
                    throw new Error(`Invalid predecessor '${predId}' for activity '${id}'.`);
                }
            });
        });
        
        // 3. Topological Sort (Kahn's algorithm) & Forward Pass (ES, EF)
        const queue = [];
        activityIds.forEach(id => {
            if (inDegree[id] === 0) {
                queue.push(id);
                levels[id] = 0; // Assign level 0 to start nodes
            }
        });

        const sortedActivities = [];
        let currentLevel = 0;
        while (queue.length > 0) {
            const u = queue.shift();
            sortedActivities.push(u);
            levels[u] = currentLevel; // This level assignment is basic, needs refinement for parallel paths

            // ES and EF calculation
            let maxPredEf = 0;
            activities[u].predecessors.forEach(predId => {
                maxPredEf = Math.max(maxPredEf, activities[predId].ef);
            });
            activities[u].es = maxPredEf;
            activities[u].ef = activities[u].es + activities[u].expectedTime;

            activities[u].successors.forEach(vId => {
                inDegree[vId]--;
                if (inDegree[vId] === 0) {
                    queue.push(vId);
                    // A simple way to increment level - better layout algos exist
                    if (activities[u].successors.length > 0) currentLevel++;
                }
            });
        }
        
        if (sortedActivities.length !== activityIds.length) {
            throw new Error("Circular dependency detected in activities. Cannot proceed.");
        }

        // 4. Project Duration
        let projectDuration = 0;
        activityIds.forEach(id => {
            if (activities[id].successors.length === 0) { // Terminal activities
                projectDuration = Math.max(projectDuration, activities[id].ef);
            }
        });

        // 5. Backward Pass (LS, LF)
        for (let i = sortedActivities.length - 1; i >= 0; i--) {
            const u = sortedActivities[i];
            if (activities[u].successors.length === 0) { // Terminal activity
                activities[u].lf = projectDuration;
            } else {
                let minSuccLs = Infinity;
                activities[u].successors.forEach(succId => {
                    minSuccLs = Math.min(minSuccLs, activities[succId].ls);
                });
                activities[u].lf = minSuccLs;
            }
            activities[u].ls = activities[u].lf - activities[u].expectedTime;
        }

        // 6. Calculate Slack and Identify Critical Path
        const criticalPath = [];
        activityIds.forEach(id => {
            activities[id].slack = activities[id].ls - activities[id].es;
             // Allow for small floating point inaccuracies
            if (Math.abs(activities[id].slack) < 0.01) { // Increased tolerance slightly
                activities[id].isCritical = true;
                criticalPath.push(id); // This needs to be ordered
            }
            // Populate for table
            const tableIndex = rawActivitiesForTable.Activity.indexOf(id);
            if (tableIndex > -1) {
                rawActivitiesForTable.ES[tableIndex] = activities[id].es;
                rawActivitiesForTable.EF[tableIndex] = activities[id].ef;
                rawActivitiesForTable.LS[tableIndex] = activities[id].ls;
                rawActivitiesForTable.LF[tableIndex] = activities[id].lf;
                rawActivitiesForTable.Slack[tableIndex] = activities[id].slack;
            }
        });
        
        // Order critical path (simple sort by ES for now, better to trace it)
        criticalPath.sort((a, b) => activities[a].es - activities[b].es);

        console.log('[useNetworkCalculator] Returning rawActivitiesForTable:', JSON.parse(JSON.stringify(rawActivitiesForTable)));
        if (!rawActivitiesForTable.hasOwnProperty("Expected Time")) {
            console.error("[useNetworkCalculator] CRITICAL: 'Expected Time' key is MISSING from rawActivitiesForTable before return!");
        }
        if (!rawActivitiesForTable.hasOwnProperty("ES")) {
            console.error("[useNetworkCalculator] CRITICAL: 'ES' key is MISSING from rawActivitiesForTable before return!");
        }

        return {
            activities, // Processed activities with all metrics
            networkAnalysis: {
                projectDuration,
                criticalPath,
                dependencies, // For layout
                levels      // For layout
            },
            rawActivitiesForTable // For the ActivityTable component
        };
    };

    return { calculateNetworkMetrics };
}