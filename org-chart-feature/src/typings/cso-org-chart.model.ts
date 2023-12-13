import { Instance } from "@popperjs/core";

/**
 * Top node and config object for org charts.
 */
export interface OrgChartData extends OrgChartDataChild {
    /**
     * Avoid using this attribute. The popper implementation probably needs to be fine tuned.
     * Use popper implementation to show the bio dialog instead of fancybox.
     * @warn Doesn't support URLs.
     * @value true - use popper implementation
     * @value false - use fancybox
     */
    popperDialog?: boolean
    /**
     * If true the chart will try to be responsive (detect if the view is mobile) and automatically set the vertical depth.
     * @default undefined
     */
    responsive?: 'true' | 'false' | null;
    /**
     * Indicates at what depth the nodes start to stack vertically.
     * Note: This is only used if responsive is false.
     */
    verticalDepth?: number;
    /**
     * Indicates to which depth the nodes are 
     */
    depth?: number;
    /**
     * Children nodes.
     * @internalUse
     */
    children: OrgChartDataChild[];
    /**
     * Indicates if the node is the main node.
     * @internalUse
     */
    mainNode?: boolean;
    /**
     * Indicates node direction.
     * @default 't2b'
     * @value 't2b' - top to bottom
     * @value 'l2r' - left to right
     * @value 'r2l' - right to left
     * @value 'b2t' - bottom to top
     */
    direction?: string;
}

/**
 * Child node and config object for org charts.
 */
export interface OrgChartDataChild {
    /**
     * The name of the person.
     */
    name?: string;
    /**
     * The title of the person.
     */
    title?: string;
    /**
     * Image of the person.
     */
    imageSrc?: string;
    /**
     * Biography of the person.
     * @value is url for bio page (opened in i frame) or html string 
     */
    bio?: string;
    /**
     * The variant of the person.
     * @value 1 - 3
     */
    variant?: string;
    /**
     * Puts acting in front of the title.
     * @value 'true' - show acting in front of the title
     */
    acting?: string;
    /**
     * The department of the person.
     */
    department?: string; 
    /**
     * Children nodes.
     * @internalUse
     */
    children: OrgChartDataChild[];
    /**
     * Reference to the popper dialog.
     * @internalUse
     */
    popperInstance?: Instance;
    /**
     * The id of the data reference.
     * @internalUse
     */
    dataRefId?: string;
}

export type CSOOrgChartChildAttributes = 'name' | 'title' | 'imageSrc' | 'bio' | 'variant' | 'acting' | 'department';
export type CSOOrgChartParentAttributes = CSOOrgChartChildAttributes | 'direction' | 'verticalDepth' | 'depth' | 'popperDialog' | 'responsive';