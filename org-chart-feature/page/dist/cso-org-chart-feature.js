const MAIN_CONTAINER = "cso-org-chart-feature-container";
const DATA_SELECTOR = "cso-org-chart-feature-data";

function getContainers() {
    return this.document.querySelectorAll(`.${MAIN_CONTAINER}`);
}

class OrgChartContainer {
    constructor(node) {
        this.nodeIdNum = 0;
        this.containerId = `${MAIN_CONTAINER}__${OrgChartContainer.idNum++}`;
        node.id = this.containerId;
        if (!node) {
            console.error("OrgChart -> Can't initialize orgchart. Container not found.", 'Container id: ', this.containerId);
            return;
        }
        this.container = node;
        this.extractDataFromContainer(node);
        this.init();
    }
    init() {
        if (!this.container && !this.data) {
            return console.error("OrgChart -> Container or data not found", "Container id: ", this.containerId);
        }
    }
    extractDataFromContainer(container, isChild = false) {
        try {
            const dataNodes = container.querySelectorAll(`.${"cso-org-chart-feature-data"}`);
            if (dataNodes.length === 0) {
                console.error("Can't find data node", { containerId: this.containerId });
                return null;
            }
        }
        catch (e) {
            console.error("Can't extract data from container", { containerId: this.containerId });
        }
    }
}
OrgChartContainer.idNum = 1;

class CSOOrgChart {
    constructor(el) {
        this.chartInstances = [];
        console.log("Org chart init", MAIN_CONTAINER, DATA_SELECTOR);
        console.log("init element", el);
        console.log("Show constant", { MAIN_CONTAINER });
        this.init(el);
    }
    init(el = document.body) {
        try {
            this.containers = getContainers();
            const data = document.querySelector(`.${"cso-org-chart-feature-container"}`);
            if (!data) {
                console.error("Can't find data");
                return;
            }
            console.log("INIT section", { el, data });
        }
        catch (e) {
            console.error("Can't build template. Err: ", e);
            return;
        }
        console.log("Built template", { template: this.template });
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
    buildTemplate(temp) {
        console.log("Building template", { temp });
        const parser = new DOMParser();
        return parser.parseFromString(temp, 'text/html');
    }
    appendChild(target, parsedDoc) {
        const el = parsedDoc.body.firstElementChild;
        if (el) {
            target.appendChild(el);
        }
    }
}

const socket = new WebSocket("ws://localhost:3000");
socket.addEventListener("message", event => {
    if (event.data === "RELOAD") {
        window.location.reload();
    }
});
new CSOOrgChart();
//# sourceMappingURL=cso-org-chart-feature.js.map
