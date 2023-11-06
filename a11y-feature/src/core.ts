import { getTemplate } from "./template";

export default class CSOA11y {
    template!: Document;

    constructor() {
        console.log('A11y initialized');
        this.init();
    }

    init() {
        try {
            // console.log("Template string test", { tempstr: getTemplateStr() });
            this.attachToDOM();
        } catch (e) {
            console.error("Can't build template. Err: ", e);

            return;
        }
    }

    // init() {
    //     try {
    //         console.log("Template string test", { tempstr: getTemplateStr() });
    //         this.template = this.buildTemplate(getTemplateStr());
    //     } catch (e) {
    //         console.error("Can't build template. Err: ", e);

    //         return;
    //     }

    //     console.log("Built template", { template: this.template });
    // }


    attachToDOM() {
        const temp = getTemplate();

        globalThis.document.body.appendChild(temp);
    }
}