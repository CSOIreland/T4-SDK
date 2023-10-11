// import { INIT_SELECTOR } from "config";
import OrgChart from "orgchart.js";
// import { exampleData } from "./data/example";

class CSOOrgChart {
    template!: Document;

    constructor(el?: HTMLElement) {
        console.log("Org chart init", process.env.INIT_SELECTOR, process.env.DATA_SELECTOR);
        console.log("init element", el);
        this.init(el);
    }

    init(el: HTMLElement = document.body) {
        try {
            const data = document.querySelector(`.${process.env.INIT_SELECTOR}`);

            if (!data) {
                console.error("Can't find data");
                return;
            }

            const orgchart = new OrgChart({
                'chartContainer': `.${process.env.INIT_SELECTOR}`,
                'data': `#${process.env.DATA_SELECTOR}`,
                // 'data': exampleData,
            })

            console.log("INIT section", { el, orgchart, data });

        } catch (e) {
            console.error("Can't build template. Err: ", e);

            return;
        }

        console.log("Built template", { template: this.template });
        // this.appendChild(el, this.template)
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