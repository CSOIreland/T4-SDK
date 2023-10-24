/* eslint-disable @typescript-eslint/no-explicit-any */

declare module 'orgchart.js' {
    export default class Orgchart {
        options: any;
        constructor(...options: any);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _createNode(nodeData: any, level: any): any;
        _buildJsonDS(li: any): any;
    }
}