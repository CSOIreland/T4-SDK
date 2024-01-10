import { getContainers } from "./utils/dom";
import { OrgChartContainer } from "./org-chart-container";

class CSOOrgChart {
    template!: Document;
    containers!: NodeListOf<HTMLDivElement>;

    chartInstances: OrgChartContainer[] = [];

    constructor() {
        this.init();
    }

    init() {
        try {
            this.containers = getContainers();
            this.buildCharts();
        } catch (e) {
            console.error("Can't build template. Err: ", e);

            return;
        }
    }

    buildCharts() {
        if (!this.containers || this.containers.length === 0) {
            console.error("OrgChart -> No containers found");
            return;
        }

        this.containers.forEach((el) => {
            this.chartInstances.push(new OrgChartContainer(el));
        });
    }
}

export { CSOOrgChart };
export default CSOOrgChart