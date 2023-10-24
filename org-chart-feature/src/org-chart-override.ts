/* eslint-disable @typescript-eslint/no-explicit-any */
import OrgChart from "orgchart.js";

// @TODO: Remove override if not needed
/**
 * Override 'OrgChart' with custom logic.
 */
export class OrgChartOverride extends OrgChart {
    constructor(...opts: any) {
        super(...opts);
    }

    _createNode(nodeData: any, level: any) {
        const promise = super._createNode(nodeData, level);

        return promise
      }

    _buildJsonDS(li: any) {
        const built = super._buildJsonDS(li);
        return built;
    }
}