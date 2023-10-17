import OrgChart from "orgchart.js";
import { MAIN_CONTAINER } from "./constants.mjs";
import { CSOOrgChartChildAttributes, CSOOrgChartParentAttributes, OrgChartData, OrgChartDataChild } from "./typings/cso-org-chart";
import { nodeAttributes } from "./utils/data";

const CHILD_ATTRS: CSOOrgChartChildAttributes[] = ['name', 'title', 'imageSrc'];
const PARENT_ATTRS: CSOOrgChartParentAttributes[] = [...CHILD_ATTRS, 'direction'];

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
    container!: HTMLElement;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    orgChartInstance!: OrgChart;

    data!: OrgChartData;


    constructor(node: HTMLElement) {
        // assign unique ids to container and nodes
        this.containerId = `${MAIN_CONTAINER}__${OrgChartContainer.idNum++}`
        node.id = this.containerId;

        if (!node) {
            console.error("OrgChart -> Can't initialize orgchart. Container not found.", 'Container id: ', this.containerId);
            return;
        }

        // generate node ids
        node.querySelectorAll('li, ul')?.forEach((node) => {
            node.id = this.generateNodeId();
        });

        // assign container
        this.container = node;

        // extract data from the container
        console.log('extracted data', this.extractDataFromContainer(node));

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

        this.data = this.extractDataFromContainer(this.container) as OrgChartData;

        if (this.data) {
            this.orgChartInstance = new OrgChart({
                chartContainer: `#${this.containerId}`,
                data: this.data,
                nodeContent: 'title',
                createNode: (node: HTMLElement, data: OrgChartDataChild) => {
                    console.log("createNode", { node, data });
                },
                depth: 3,
                toggleSiblingsResp: false,
            });
        }
    }

    getDataFromChildNode(node: HTMLElement): OrgChartDataChild | null {
        const nAttrs = nodeAttributes(node);
        let data: Partial<OrgChartDataChild> | null = null

        CHILD_ATTRS.forEach((attr) => {
            if (nAttrs(attr) ?? false) {
                if (data) {
                    data[attr] = nAttrs(attr) as string;
                } else {
                    data = {[attr]: nAttrs(attr) as string};
                }
            }
        })

        return data;
    }

    getDataFromParentNode(node: HTMLElement): OrgChartData | null {
        const nAttrs = nodeAttributes(node);
        let data: Partial<OrgChartData> | null = null;

        PARENT_ATTRS.forEach((attr) => {
            if (nAttrs(attr) ?? false) {
                if (data) {
                    // avoid type error
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (data as any)[attr as string] = nAttrs(attr) as string;
                } else {
                    data = {[attr]: nAttrs(attr) as string};
                }
            }
        })

        return data;
    }

    extractDataFromContainer(dataNode: HTMLElement, isChild = false): OrgChartData | OrgChartDataChild | null {
        try {
            if (isChild) {
                    if (dataNode) {
                        const data =  this.getDataFromParentNode(dataNode);
                        if (data) {
                            const childList = dataNode.querySelector('ul');
                            if (childList) {
                                const childNodes = childList.querySelectorAll(`#${childList.id}>li`);

                                if (childNodes.length > 0) {
                                    data.children = Array.from(childNodes).map((node) => {
                                        return this.extractDataFromContainer(node as HTMLElement, true);
                                    }) as OrgChartDataChild[];
                                }
                            }

                            return data as OrgChartData;
                        }
                    }
            } else {
                // Check if its a list element or a ul element. If its a ul element, get the first li element.
                // We check for only a single li element because the orgchart.js library doesn't support multiple root nodes.
                const node = dataNode?.tagName?.toLowerCase() == 'li' ? dataNode : dataNode?.querySelector('li');

                if (node) {
                    const data =  this.getDataFromParentNode(node as HTMLElement);
                    if (data) {
                        const childList = node.querySelector('ul');
                        if (childList) {
                            const childNodes = childList.querySelectorAll(`#${childList.id}>li`);

                            if (childNodes.length > 0) {
                                data.children = Array.from(childNodes).map((node) => {
                                    return this.extractDataFromContainer(node as HTMLElement, true);
                                }) as OrgChartDataChild[];
                            }
                        }

                        return data as OrgChartData;
                    }
                }
            }
        } catch (e) {
            console.error("Can't extract data from container", {containerId: this.containerId});
        }

        return null;
    }
}