import OrgChart from "orgchart.js";
import { MAIN_CONTAINER } from "./constants.mjs";
import { CSOOrgChartAttribute, OrgChartData, OrgChartDataChild } from "./typings/cso-org-chart";
import { nodeAttributes } from "./utils/data";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    orgChartInstance!: OrgChart;

    data!: OrgChartData;


    constructor(node: HTMLDivElement) {
        // assign unique ids to container and nodes
        this.containerId = `${MAIN_CONTAINER}__${OrgChartContainer.idNum++}`
        node.id = this.containerId;

        if (!node) {
            console.error("OrgChart -> Can't initialize orgchart. Container not found.", 'Container id: ', this.containerId);
            return;
        }

        // assign container
        this.container = node;

        // extract data from the container
        this.extractDataFromContainer(node);

        this.init();
    }

    generateNodeId() {
        return `${this.containerId}__node__${this.nodeIdNum++}`;
    }


    /**
     * Initialize the orgchart.js library.
     */
    init() {
        if (!this.container && !this.data) {
            return console.error("OrgChart -> Container or data not found", "Container id: ", this.containerId);
        }
    }

    extractDataFromContainer(container: HTMLDivElement, isChild = false): OrgChartData | OrgChartDataChild | null {
        try {
            const dataNodes = container.querySelectorAll(`.${process.env.DATA_SELECTOR}`);

            if (dataNodes.length === 0) {
                console.error("Can't find data node", { containerId: this.containerId });
                return null;
            }

            Array.from(dataNodes).map((node) => {
                if (node) {
                    if (node.tagName?.toLowerCase() == 'li') {
                        if (isChild) {

                        } else {
                            const data: Partial<OrgChartData> | Partial<OrgChartDataChild> = {
                                id: this.generateNodeId(),
                            }

                            const nAttrs = nodeAttributes(node);

                            if (node.className) {
                              data.className = node.className;
                            }

                            (['name', 'title', 'imageSrc'] as CSOOrgChartAttribute[]).forEach(attr => {
                              if (nAttrs(attr)) {
                                data[attr] = nAttrs(attr) as string;
                              }
                            })

                            return data
                        }
                    }
                }
            })


            if (isChild) {

            } else {
                return {

                }
            }
            }
        } catch (e) {
            console.error("Can't extract data from container", {containerId: this.containerId});
        }

        return null;
    }
}