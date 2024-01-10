import { CSOOrgChartChildAttributes, CSOOrgChartParentAttributes } from "src/typings/button-options";

export function nodeAttributes(node: HTMLElement | Element) {
    return (attribute: CSOOrgChartChildAttributes | CSOOrgChartParentAttributes): string | null => {
        return node.getAttribute(`data-${attribute}`);
    }
}