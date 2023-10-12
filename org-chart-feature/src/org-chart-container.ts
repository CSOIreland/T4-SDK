// import OrgChart from "orgchart.js";
import { MAIN_CONTAINER } from "./constants.mjs";

/**
 * Every container should get a unique id and each container node should have it's unique id.
 * The OrgChart.js package doesn't support class query selectors, so we need to generate unique ids.
 */
export class OrgChartContainer {
    static idNum = 1;
    nodeIdNum: number = 0;
    /**
     * Every container should get a unique id.
     */
    containerId!: string;
    container!: HTMLDivElement;


    constructor(node: HTMLDivElement) {
        // assign unique id
        this.containerId = `${MAIN_CONTAINER}__${OrgChartContainer.idNum++}`
        node.id = this.containerId;

        this.container = node;

        this.buildChart();
    }

    buildChart() {
        /**
         * Initialize the orgchart.js library.
         */

    }
}