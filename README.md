# PERT/CPA Network Diagram Generator

This project is a web-based tool for creating, visualizing, and analyzing Project Evaluation and Review Technique (PERT) and Critical Path Analysis (CPA) network diagrams. It allows users to input project activities, their dependencies, and time estimates (for PERT) or durations (for CPA). The application then automatically generates an interactive visual diagram, highlights the critical path, and displays key project metrics and detailed activity data.

![Screenshot of PERT/CPA Diagram Generator](placeholder_screenshot.png)
*(Replace placeholder_screenshot.png with an actual screenshot of your application)*

## ✨ Features

*   **Dynamic Diagram Generation:** Users can create new PERT or CPA diagrams from scratch.
*   **Interactive Visualization:**
    *   Clear visual representation of activities, event nodes (start/end milestones for activities), and dependencies.
    *   Layout automatically generated using the Sugiyama algorithm via `d3-dag` for readability.
    *   Distinct styling for critical path nodes, activities, and arrows.
    *   Zoom/pan capabilities may be implicitly provided by browser if diagram overflows scrollable container.
*   **PERT Analysis:**
    *   Input Optimistic (O), Most Likely (M), and Pessimistic (P) time estimates for each activity.
    *   Automatic calculation of Expected Time (TE) and Variance for each activity.
*   **CPA (Critical Path Method) Analysis:**
    *   Input fixed duration for each activity.
    *   Automatic calculation of Early Start (ES), Early Finish (EF), Late Start (LS), Late Finish (LF), and Slack (Float) for each activity.
*   **Critical Path Identification:** Automatically identifies and visually distinguishes the critical path(s) in the diagram and table.
*   **Project Metrics Display:** Shows overall project duration, total number of activities, and number of critical activities.
*   **Detailed Activity Table:** Provides a comprehensive tabular summary of all input values and calculated metrics (O, M, P, Duration, TE, Variance, ES, EF, LS, LF, Slack, Critical status).
*   **Responsive Diagram Container:** The area displaying the network diagram adjusts its minimum size based on the diagram's calculated dimensions and provides scrollbars if the content exceeds the viewport or its defined area.
*   **Informative Tooltips:** Hover over activity boxes in the diagram to see a summary of their key details.
*   **User-Friendly Workflow:**
    1.  **Home:** Option to start a new diagram.
    2.  **Type Selection:** Choose between creating a PERT or CPA diagram.
    3.  **Data Input:** Enter activity details (ID, Description, Predecessors, Times/Duration) in an editable table.
    4.  **Diagram View:** View the generated network diagram, statistics, and detailed activity table.
    5.  Option to go back and create another diagram.
*   **Error Handling:** Provides alerts for common input errors (e.g., circular dependencies, invalid predecessors) and keeps the user on the data input screen to correct them.

## 🛠️ Technologies Used

*   **Frontend Framework:** Vue.js 3 (Composition API with `<script setup>`)
*   **Build Tool:** Vite
*   **Diagram Layout Engine:** `d3-dag` (a D3.js module for directed acyclic graph layout, specifically using the Sugiyama algorithm for layered drawing)
*   **Core Calculations & Logic:** Custom JavaScript implemented in Vue composables.
*   **Styling:** CSS3 (including Flexbox, Grid, custom properties, gradients, transitions).

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v16.x, v18.x, or v20.x recommended)
*   A package manager: npm (v7+), yarn (v1.22+), or pnpm (v7+)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://your-repository-url/pert-cpa-diagram-generator.git
    cd pert-cpa-diagram-generator
    ```
    *(Replace `https://your-repository-url/pert-cpa-diagram-generator.git` with the actual URL of your Git repository if applicable)*

2.  **Install dependencies:**
    Navigate to the project directory and run:
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```
    or
    ```bash
    pnpm install
    ```

### Running the Development Server

To start the application in development mode with hot-reloading:
```bash
npm run dev
```


#### This will typically start the server at ***http://localhost:5173*** (or the next available port). Open this URL in your web browser.

### Building for Production

To create an optimized build for deployment:
```bash
npm run build
```


This command generates a dist folder in the project root containing the static assets.

### Previewing the Production Build

After building, you can preview the production version locally:
```bash
npm run preview
```

# 📁 Project Structure
```
pert-cpa-diagram-generator/
├── public/                  # Static assets (e.g., favicon.ico) copied as-is
├── src/
│   ├── assets/              # Global CSS files, images, fonts
│   ├── components/          # Reusable Vue components
│   │   ├── ActivityBox.vue
│   │   ├── ActivityTable.vue
│   │   ├── DataInputTable.vue
│   │   ├── HomeView.vue
│   │   ├── NetworkArrow.vue
│   │   ├── NetworkNode.vue
│   │   ├── StatCard.vue
│   │   ├── Tooltip.vue
│   │   └── TypeSelection.vue
│   ├── composables/         # Vue Composables for reusable logic
│   │   └── useNetworkCalculator.js # Core PERT/CPA calculation logic
│   ├── utils/               # Utility/helper functions
│   │   └── layoutGenerator.js    # Diagram layout logic using d3-dag
│   ├── App.vue              # Main root Vue component, manages views and global state
│   └── main.js              # Entry point for the Vue application
├── .gitignore
├── index.html               # Main HTML page, Vite's entry point
├── package.json             # Project metadata and dependencies
├── README.md                # This file
└── vite.config.js           # Vite build tool configuration
```
# 📖 How It Works

### Application Workflow: Network Diagram Generation

The application follows a user-driven workflow to generate network diagrams:

## 1. View Management (`App.vue`)

The main `App.vue` component acts as an orchestrator, controlling which view is currently active based on user actions. The possible views include:

*   `HomeView`
*   `TypeSelection` (e.g., PERT or CPA)
*   `DataInputTable`
*   The diagram display view

### 2. User Input (`DataInputTable.vue`)

Users provide activity data through `DataInputTable.vue`. This includes:

*   Activity IDs
*   Descriptions
*   Predecessors (dependencies)
*   Relevant time estimates:
    *   For PERT: Optimistic (O), Most Likely (M), Pessimistic (P)
    *   For CPA: Fixed durations
*   Basic input validation is performed at this stage.

## 3. Network Calculation (`useNetworkCalculator.js`)

Upon submission, the raw input is processed by the `useNetworkCalculator.js` composable.

### PERT-Specific Calculations:

*   **Expected Time (TE):** `TE = (O + 4M + P) / 6`
*   **Variance (Var):** `Var = ((P - O) / 6)^2`

### CPA/Core Calculations (also used by PERT after TE is determined):

1.  **Graph Construction:** A graph representation is built with nodes (activities) and their successor/predecessor relationships.
2.  **Topological Sort:** Activities are processed in a topologically sorted order to respect dependencies.
3.  **Forward Pass:** Calculates:
    *   **Early Start (ES)** for each activity.
    *   **Early Finish (EF)** for each activity.
4.  **Project Duration:** Determined from the maximum EF of all terminal activities.
5.  **Backward Pass:** Calculates (starting from the project duration):
    *   **Late Finish (LF)** for each activity.
    *   **Late Start (LS)** for each activity.
6.  **Slack (Float):** Calculated as `LS - ES` (or `LF - EF`).
7.  **Critical Path Identification:**
    *   Activities with (near) zero slack are marked as critical.
    *   A primary critical path sequence is determined.

**Output:** The composable returns:
*   A `processedActivities` object containing all calculated metrics.
*   A `rawActivitiesForTable` object formatted for display in a table.

### 4. Diagram Layout (`layoutGenerator.js` with `d3-dag`)

The `layoutGenerator.js` module uses `d3-dag` to determine the visual layout of the network diagram.

1.  **Data Transformation:** The `processedActivities` data (especially IDs and predecessors) is transformed into a format suitable for `d3-dag`.
2.  **Virtual Nodes:** Virtual "start" and "end" nodes are added to the graph data. This provides clear entry and exit points for the layout algorithm, ensuring better graph orientation and handling of multiple start/end activities.
3.  **DAG Structure Creation:** `d3-dag`'s `graphStratify` (or a similar function like `dagStratify`) is used to create the DAG structure from the input data.
4.  **Sugiyama Layout Algorithm:** The Sugiyama algorithm is applied, which typically involves:
    *   **Layer Assignment:** Arranging nodes into hierarchical layers.
    *   **Vertex Ordering (Crossing Minimization):** Optimizing node order within layers to minimize edge crossings.
    *   **Coordinate Assignment:** Assigning `(x, y)` coordinates to each conceptual node in the graph.
5.  **Node Sizing:** `nodeSize` parameters (or equivalent like `nodeWidth` and `nodeHeight` depending on the specific d3-dag API used) are provided to `d3-dag` to help it allocate appropriate space for each activity unit (which might visually include its event nodes and the activity box).
6.  **Coordinate Translation:** The `(x, y)` coordinates generated by `d3-dag` are translated by `layoutGenerator.js` into:
    *   **`nodeLayout` Object:** Positions for distinct "event nodes" (e.g., `S-A` for the start event of activity A, `E-A` for the end event of activity A).
    *   **`activityLayout` Object:** Positions for "activity boxes" (displaying O, M, P, TE, slack, etc.).
    *   **`arrowDefinitions` Array:** An array specifying `fromNodeId`, `toNodeId`, `isCritical` status, and `type` (e.g., duration arrow within an activity, or dependency arrow between activities) for every arrow to be drawn.
7.  **Diagram Dimensions:** The overall `width` and `height` required for the diagram are calculated and returned.

### 5. Rendering in Vue (`App.vue` and Child Components)

`App.vue` receives the `projectData` (which includes `nodeLayout`, `activityLayout`, `arrowDefinitions`, overall metrics, etc.) from the layout and calculation steps.

*   **Container Sizing:** The `.network-container`'s `min-width` and `min-height` CSS properties are dynamically set to the calculated diagram dimensions, with `overflow: auto` to enable scrolling if the diagram is larger than the viewport.
*   **Component Rendering (using `v-for`):**
    *   **`NetworkNode.vue`:** Renders each event node based on `projectData.nodeLayout`. Styling is applied based on its `isEventNode` and `isCritical` status.
    *   **`ActivityBox.vue`:** Renders each activity's information box using data from `projectData.activityLayout`.
    *   **`NetworkArrow.vue`:** Renders each arrow defined in `projectData.arrowDefinitions`. Arrows connect the appropriate event nodes and are styled based on their `isCritical` status.
    *   **`StatCard.vue`:** Displays summary statistics about the project (e.g., total duration, number of critical activities).
    *   **`ActivityTable.vue`:** Presents the detailed activity data (from `rawActivitiesForTable` or `processedActivities`) in a sortable and filterable table.
    *   **`Tooltip.vue`:** Provides hover-based information for elements like activity boxes, showing detailed metrics.

# 🔮 Potential Future Enhancements

*   **Save & Load Project Data:** Implement functionality to save user input to local storage or a JSON file, and to load existing projects.
*   **Export Diagram:** Allow users to export the generated diagram as an SVG, PNG, or PDF.
*   **Advanced Layout Customization:** Provide options to adjust `d3-dag` parameters (e.g., spacing, algorithm variants) or potentially select different layout engines.
*   **Direct Diagram Interaction:** (Advanced) Allow users to drag and reposition nodes (with constraints), or visually edit dependencies.
*   **Resource & Cost Tracking:** Extend the data model to include resource allocation per activity and calculate project costs.
*   **Probability Analysis (PERT):** Calculate probabilities of meeting specific project deadlines based on PERT variances.
*   **Multiple Critical Paths:** Improve identification and visualization if multiple critical paths exist.
*   **Improved Error Highlighting:** Provide more specific visual feedback for input errors directly within the `DataInputTable`.
*   **UI/UX Refinements:** Enhance visual styling, add theming options, and improve overall user experience.
*   **Comprehensive Testing:** Implement unit tests for calculation logic and end-to-end tests for user flows.
*   **Internationalization (i18n):** Support for multiple languages.

🤝 Contributing

Contributions, issues, and feature requests are welcome! Please feel free to:

Check for existing issues or open a new issue to discuss your ideas or report a bug.

Fork the repository.

Create a feature branch (git checkout -b feature/YourAmazingFeature).

Commit your changes (git commit -m 'Add some AmazingFeature').

Push to the branch (git push origin feature/YourAmazingFeature).

Open a PullRequest.

Please adhere to the project's coding style and provide clear commit messages.

📄 License

This project is licensed under the MIT License.

**How to Use This README:**

1.  **Save as `README.md`:** Place this content in a file named `README.md` at the root of your project.
2.  **Replace Placeholder Screenshot:** Take a good screenshot of your application when it's working and rendering a diagram. Name it something like `screenshot.png` or `app-preview.png` and update the image link: `![Screenshot of PERT/CPA Diagram Generator](screenshot.png)`
3.  **Update Repository URL:** If you plan to host this on GitHub, GitLab, etc., replace `https://your-repository-url/pert-cpa-diagram-generator.git` with the actual URL.
4.  **Add a `LICENSE.md` file:** If you choose the MIT license (which is very common and permissive), create a file named `LICENSE.md` in your project root and paste the standard MIT License text into it. You can easily find templates online (search "MIT License template").
5.  **Review and Customize:** Read through the "Features," "How It Works," and "Future Enhancements" sections. Adjust them to accurately reflect your project's current state and your specific plans. For example, if you didn't implement a specific feature mentioned, remove it or move it to "Future Enhancements."

This README provides a good starting point for documenting your project effectively.
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
IGNORE_WHEN_COPYING_END