// import { INIT_SELECTOR } from "config";
// import OrgChart from "orgchart.js";
import { MAIN_CONTAINER, DATA_SELECTOR } from "./constants.mjs";
import { getContainers } from "./utils/dom";
import { OrgChartContainer } from "./org-chart-container";
// import { exampleData } from "./data/example";

class CSOOrgChart {
    template!: Document;
    containers!: NodeListOf<HTMLDivElement>;

    chartInstances: OrgChartContainer[] = [];

    constructor(el?: HTMLElement) {
        console.log("Org chart init", MAIN_CONTAINER, DATA_SELECTOR);
        console.log("init element", el);
        console.log("Show constant", { MAIN_CONTAINER });
        this.init(el);
    }

    init(el: HTMLElement = document.body) {
        try {
            this.containers = getContainers();

            const data = document.querySelector(`.${process.env.INIT_SELECTOR}`);

            if (!data) {
                console.error("Can't find data");
                return;
            }

            // const orgchart = new OrgChart({
            //     'chartContainer': `.${MAIN_CONTAINER}`,
            //     'data': `#${DATA_SELECTOR}`,
            // })

            console.log("INIT section", { el, data });

        } catch (e) {
            console.error("Can't build template. Err: ", e);

            return;
        }

        console.log("Built template", { template: this.template });
        // this.appendChild(el, this.template)
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


    buildTemplate(temp: string) {
        console.log(
            "Building template",
            { temp },
        )
        const parser = new DOMParser();
        return parser.parseFromString(temp, 'text/html');
    }

    appendChild(target: HTMLElement, parsedDoc: Document) {
        const el = parsedDoc.body.firstElementChild;

        if (el) {
            target.appendChild(el);
        }
    }
}

export { CSOOrgChart };
export default CSOOrgChart