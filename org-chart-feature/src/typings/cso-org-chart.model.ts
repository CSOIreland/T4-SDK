import { Instance } from "@popperjs/core";

export interface OrgChartData extends OrgChartDataChild {
    /**
     * Use popper implementation to show the bio dialog instead of fancybox.
     * @warn Doesn't support URLs.
     * @value true - use popper implementation
     * @value false - use fancybox
     */
    popperDialog?: boolean
    /**
     * Indicates at what depth the nodes start to stack vertically.
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
export type CSOOrgChartParentAttributes = CSOOrgChartChildAttributes | 'direction' | 'verticalDepth' | 'depth' | 'popperDialog';