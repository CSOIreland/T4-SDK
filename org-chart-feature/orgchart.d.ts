/* eslint-disable @typescript-eslint/no-explicit-any */

declare module 'orgchart.js' {
    export default class Orgchart {
        options: any;
        constructor(...options: any);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _createNode(nodeData: any, level: any): any;
        _buildJsonDS(li: any): any;
        _nextAll(el: any): any;
        _removeClass(el: any, className: any): void;
        _isVisible(el: any): boolean;
        _repaint(el: any): void;
        _one(el: any, type: any, listener: any, self: any): void;
        _isInAction(node: any): boolean;
        _switchVerticalArrow(arrow: any): void;
        _addClass(el: any, className: any): void;
    }
}