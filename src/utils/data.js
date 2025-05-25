  const activitiesData = {
        "A": { id: "A", predecessors: [], successors: ["B", "C"], es: 0, ef: 5, isCritical: true, variance: 0, optimistic:0, mostLikely:0, pessimistic:0, description: "Task A", slack:0, ls:0, lf:0 },
        "B": { id: "B", predecessors: ["A"], successors: ["D"], es: 5, ef: 10, isCritical: true, variance: 0, optimistic:0, mostLikely:0, pessimistic:0, description: "Task B", slack:0, ls:0, lf:0 },
        "C": { id: "C", predecessors: ["A"], successors: ["D"], es: 5, ef: 8, isCritical: false, variance: 0, optimistic:0, mostLikely:0, pessimistic:0, description: "Task C", slack:0, ls:0, lf:0 },
        "D": { id: "D", predecessors: ["B", "C"], successors: [], es: 10, ef: 15, isCritical: true, variance: 0, optimistic:0, mostLikely:0, pessimistic:0, description: "Task D", slack:0, ls:0, lf:0 }
    };

      const activitiesData = { // HARDCODED TEST DATA - REMOVE/COMMENT FOR REAL DATA
        "A": { id: "A", predecessors: [], successors: ["B", "C"], es: 0, ef: 5, isCritical: true, variance: 0, optimistic: 0, mostLikely: 0, pessimistic: 0, description: "Task A", slack: 0, ls: 0, lf: 0 },
        "B": { id: "B", predecessors: ["A"], successors: ["D"], es: 5, ef: 10, isCritical: true, variance: 0, optimistic: 0, mostLikely: 0, pessimistic: 0, description: "Task B", slack: 0, ls: 0, lf: 0 },
        "C": { id: "C", predecessors: ["A"], successors: ["D"], es: 5, ef: 8, isCritical: false, variance: 0, optimistic: 0, mostLikely: 0, pessimistic: 0, description: "Task C", slack: 0, ls: 0, lf: 0 },
        "D": { id: "D", predecessors: ["B", "C"], successors: [], es: 10, ef: 15, isCritical: true, variance: 0, optimistic: 0, mostLikely: 0, pessimistic: 0, description: "Task D", slack: 0, ls: 0, lf: 0 }
    };
    console.log("[layoutGenerator] USING HARDCODED TEST DATA!");
//```````````````````-------------------------------------------------------------------------------------------
    // src/utils/layoutGenerator.js
import * as d3dag from 'd3-dag';

export function generateLayout(activitiesData, dependenciesMap, activityLevelsMapUnused) {
    const nodeLayout = {};    // Will store { id: { x, y, es, ef, label, ... } }
    const activityLayout = {};// Will store { id: { x, y, from, to, width, height } }

    if (Object.keys(activitiesData).length === 0) {
        return { nodeLayout, activityLayout };
    }

    // 1. Construct the graph data for d3-dag
    // d3-dag expects an array of objects, each with an 'id' and 'parentIds'
    const dagData = Object.values(activitiesData).map(act => ({
        id: act.id,
        parentIds: act.predecessors, // d3-dag uses 'parentIds'
        // Store activity data for later use
        _activity: act,
    }));

    // Add a virtual START and END node if activitiesData doesn't have explicit ones.
    // This helps d3-dag orient the graph properly.
    const activityIds = Object.keys(activitiesData);
    const startNodes = activityIds.filter(id => activitiesData[id].predecessors.length === 0);
    const endNodes = activityIds.filter(id => activitiesData[id].successors.length === 0);

    const VIRTUAL_START_ID = '___VIRTUAL_START___';
    const VIRTUAL_END_ID = '___VIRTUAL_END___';

    dagData.push({ id: VIRTUAL_START_ID, parentIds: [] });
    startNodes.forEach(startId => {
        const node = dagData.find(d => d.id === startId);
        if (node) {
            node.parentIds.push(VIRTUAL_START_ID); // Connect actual start nodes to virtual start
        }
    });

    dagData.push({ id: VIRTUAL_END_ID, parentIds: endNodes }); // Virtual end depends on actual end nodes

    // 2. Create the DAG structure using d3-dag
    let dag;
    try {
        dag = d3dag.dagStratify()(dagData);
    } catch (error) {
        console.error("Error creating DAG structure with d3-dag:", error);
        // Fallback or re-throw, depending on desired behavior
        throw new Error(`Failed to create DAG structure: ${error.message}. Check for cycles or invalid IDs.`);
    }


    // 3. Define layout parameters (these are approximate for activity boxes and event nodes)
    const nodeWidth = 90;  // For our event nodes
    const nodeHeight = 90;
    const activityBoxWidth = 100; // Approximate width of an activity box
    const activityBoxHeight = 70; // Approximate height

    // Use Sugiyama layout (a common layered graph drawing algorithm)
    // Decrossing and coordinate assignment are key parts.
    const layout = d3dag.sugiyama()
        .nodeSize(() => [nodeHeight + 60, nodeWidth + 100]) // [height, width] + spacing for nodes (event nodes + activity boxes combined conceptually for spacing)
        .gap([50,50]) // gap for dummy nodes - may not be used directly by this API version
        // .coord(d3dag.coordGreedy()) // Example coordinate assignment, explore others
        // .decross(d3dag.decrossOpt()) // Example decrossing algorithm
        ;

    try {
        const { width: dagWidth, height: dagHeight } = layout(dag);

        // 4. Extract layout information for our nodes and activities
        // d3-dag positions the center of the nodes.

        const nodePadding = 20; // Padding around the diagram

        dag.each((node) => {
            if (node.id === VIRTUAL_START_ID || node.id === VIRTUAL_END_ID) {
                // We might draw these differently or hide them, but d3-dag needs them for layout.
                // For now, let's create minimal entries in nodeLayout if needed for arrows.
                nodeLayout[node.id] = {
                    id: node.id,
                    x: node.x + nodePadding,
                    y: node.y + nodePadding,
                    es: 0, ef: 0, // Placeholder
                    label: node.id === VIRTUAL_START_ID ? 'Start' : 'End',
                    isVirtual: true,
                    width: 0, height: 0 // Virtual nodes don't take space
                };
                return; // Skip creating activity boxes for virtual nodes
            }

            const originalActivity = node.data._activity; // Get our activity data back

            // --- Create "Event" Nodes for Start and End of each Activity ---
            // The activity box will be between these two conceptual event nodes.
            const activityCenterX = node.x + nodePadding;
            const activityCenterY = node.y + nodePadding;

            const eventNodeRadius = nodeWidth / 2; // For event nodes

            // Start Event Node for the activity
            const startEventNodeId = `node_start_${originalActivity.id}`;
            nodeLayout[startEventNodeId] = {
                id: startEventNodeId,
                x: activityCenterX - activityBoxWidth / 2 - eventNodeRadius - 5, // Place to the left of activity box
                y: activityCenterY,
                es: originalActivity.es,
                ef: originalActivity.es, // Event node, 0 duration
                label: `S-${originalActivity.id}`,
                isEventNode: true,
            };

            // End Event Node for the activity
            const endEventNodeId = `node_end_${originalActivity.id}`;
            nodeLayout[endEventNodeId] = {
                id: endEventNodeId,
                x: activityCenterX + activityBoxWidth / 2 + eventNodeRadius + 5, // Place to the right of activity box
                y: activityCenterY,
                es: originalActivity.ef,
                ef: originalActivity.ef, // Event node
                label: `E-${originalActivity.id}`,
                isEventNode: true,
            };

            // --- Position the Activity Box ---
            activityLayout[originalActivity.id] = {
                id: originalActivity.id,
                x: activityCenterX - activityBoxWidth / 2, // Centered based on d3-dag's node.x
                y: activityCenterY - activityBoxHeight / 2, // Centered based on d3-dag's node.y
                from: startEventNodeId, // Activity is conceptually between its start and end event nodes
                to: endEventNodeId,     // The arrows will connect these event nodes
                width: activityBoxWidth,
                height: activityBoxHeight
            };
        });

        // 5. Connect event nodes with arrows based on original dependencies
        // This part is crucial. The `NetworkArrow` component connects nodes specified in `activityLayout`'s from/to.
        // We need to adjust what `activityLayout[actId].from` and `activityLayout[actId].to` refer to.
        // Actually, NetworkArrow should draw arrows between *event nodes*.
        // So, we need a separate list of arrows.

        // For now, `activityLayout` stores the activity box positions.
        // The `NetworkArrow` in `App.vue` iterates over `activityLayout` and tries to draw an arrow
        // from `nodeLayout[activityDetails.from]` to `nodeLayout[activityDetails.to]`.
        // This means `activityDetails.from` and `activityDetails.to` for an *activity* in `App.vue`'s loop
        // should point to the event nodes that bracket the *actual task represented by the arrow*.

        // The current `App.vue` arrow drawing loop:
        // <NetworkArrow v-for="(activityDetails, activityName) in projectData.activityLayout" ...
        // This implies one arrow per activity, representing the activity itself.
        // This arrow should go from the activity's start event node to its end event node.

        // Modify activityLayout for App.vue's arrow drawing loop
        Object.keys(activityLayout).forEach(actId => {
            activityLayout[actId].from = `node_start_${actId}`; // Arrow for activity duration
            activityLayout[actId].to = `node_end_${actId}`;   // Arrow for activity duration
        });

        // Additionally, we need arrows for *dependencies* between activities.
        // Arrow from `node_end_PREDECESSOR` to `node_start_SUCCESSOR`.
        // This requires modifying App.vue or creating a new list of dependency arrows.

        // For now, let's assume App.vue's main loop is for activity duration arrows.
        // Dependency arrows need to be handled separately or the loop needs to be smarter.


        // Let's simplify: the `activityLayout` in App.vue will now be just for activity *boxes*.
        // We'll need to generate a separate `arrowList` for all arrows.
        // OR: We stick to the current `App.vue` arrow drawing, which means an "activity arrow"
        // represents the duration of that activity. So, it goes from its start event node to its end event node.
        // The arrows between *different* activities (dependencies) are NOT directly handled by this loop.

        // The `NetworkArrow` component uses fromNode and toNode objects directly.
        // The current `layoutGenerator` needs to provide `nodeLayout` (for node positions)
        // and an `activityLayout` that is suitable for both placing ActivityBox AND defining arrows.

        // Let's stick to the idea: each entry in activityLayout results in one ActivityBox and one Arrow.
        // The arrow represents the activity itself.
        // So, activityLayout[actId].from = start_event_node_for_actId
        // and activityLayout[actId].to   = end_event_node_for_actId

        // The connections *between* activities (dependencies) need to be implicitly handled by
        // how the ES/EF times are set on the event nodes and their positions.
        // The visual lines connecting `end_event_node_of_pred` to `start_event_node_of_succ` are the tricky part
        // if we only have one arrow per activity in App.vue's main loop.

        // Simpler Approach for this iteration:
        // The `nodeLayout` has all event nodes positioned by d3-dag (indirectly).
        // The `activityLayout` has activity boxes positioned.
        // We need to create an `arrowDefinitions` array.
        const arrowDefinitions = [];

        // Arrows representing activity durations
        Object.values(activitiesData).forEach(act => {
            arrowDefinitions.push({
                id: `arrow_dur_${act.id}`,
                fromNodeId: `node_start_${act.id}`,
                toNodeId: `node_end_${act.id}`,
                isCritical: act.isCritical, // Assuming activitiesData has this
                type: 'duration'
            });
        });

        // Arrows representing dependencies
        Object.values(activitiesData).forEach(successorActivity => {
            successorActivity.predecessors.forEach(predecessorId => {
                if (activitiesData[predecessorId]) { // Ensure predecessor exists
                    arrowDefinitions.push({
                        id: `arrow_dep_${predecessorId}_${successorActivity.id}`,
                        fromNodeId: `node_end_${predecessorId}`,
                        toNodeId: `node_start_${successorActivity.id}`,
                        // Criticality of dependency arrows can be complex;
                        // usually critical if both connected activities are critical.
                        isCritical: activitiesData[predecessorId].isCritical && successorActivity.isCritical,
                        type: 'dependency'
                    });
                }
            });
        });
         // Add arrows from VIRTUAL_START to actual start nodes
        startNodes.forEach(startId => {
            arrowDefinitions.push({
                id: `arrow_dep_${VIRTUAL_START_ID}_${startId}`,
                fromNodeId: VIRTUAL_START_ID,
                toNodeId: `node_start_${startId}`,
                isCritical: activitiesData[startId]?.isCritical, // If start activity is critical
                type: 'dependency'
            });
        });

        // Add arrows from actual end nodes to VIRTUAL_END
        endNodes.forEach(endId => {
            arrowDefinitions.push({
                id: `arrow_dep_${endId}_${VIRTUAL_END_ID}`,
                fromNodeId: `node_end_${endId}`,
                toNodeId: VIRTUAL_END_ID,
                isCritical: activitiesData[endId]?.isCritical,
                type: 'dependency'
            });
        });


        // Hide virtual nodes from rendering by default, or handle them specially in NetworkNode
        nodeLayout[VIRTUAL_START_ID].hidden = true;
        nodeLayout[VIRTUAL_END_ID].hidden = true;


        return { nodeLayout, activityLayout, arrowDefinitions, dagRenderWidth: dagWidth + 2*nodePadding, dagRenderHeight: dagHeight + 2*nodePadding };

    } catch (error) {
        console.error("Error during d3-dag layout processing:", error);
        throw new Error(`d3-dag layout failed: ${error.message}`);
    }
}