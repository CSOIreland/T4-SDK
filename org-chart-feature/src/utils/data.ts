import { CSOOrgChartChildAttributes, CSOOrgChartParentAttributes } from "src/typings/cso-org-chart.model";

export function nodeAttributes(node: HTMLElement | Element) {
    return (attribute: CSOOrgChartChildAttributes | CSOOrgChartParentAttributes): string | null => {
        return node.getAttribute(`data-${attribute}`);
    }
}