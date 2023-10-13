import { CSOOrgChartAttribute } from "src/typings/cso-org-chart";

export function nodeAttributes(node: HTMLElement | Element) {
    return (attribute: CSOOrgChartAttribute): string | null => {
        return node.getAttribute(attribute);
    }
}