import OrgChart from "orgchart.js";
import { CLASS_PREFIX, MAIN_CONTAINER } from "./constants.mjs";
import {
  CSOOrgChartChildAttributes,
  CSOOrgChartParentAttributes,
  OrgChartData,
  OrgChartDataChild,
} from "./typings/cso-org-chart.model";
import { nodeAttributes } from "./utils/data";
import { OrgChartOverride } from "./org-chart-override";
import { createPopper } from "@popperjs/core";
import { looseParseOnlyElements } from "./utils/dom";
import { isMobile, isTablet, isUrl } from "./utils/helpers";

const CHILD_ATTRS: CSOOrgChartChildAttributes[] = [
  "name",
  "title",
  "imageSrc",
  "bio",
  "variant",
  "acting",
  "department"
];
const PARENT_ATTRS: CSOOrgChartParentAttributes[] = [
  ...CHILD_ATTRS,
  "responsive",
  "direction",
  "verticalDepth",
  "depth",
  "popperDialog",
];

/**
 * Note:
 * data attributes are case insensitive.
 */

/**
 * Every container should get a unique id and each container node should have it's unique id.
 * The OrgChart.js package doesn't support class query selectors, so we need to generate unique ids.
 */
export class OrgChartContainer {
  static idNum = 1;
  nodeIdNum: number = 0;
  /**
   * Every container should get a unique id.
   */
  containerId!: string;
  container!: HTMLElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orgChartInstance!: OrgChart | null;

  data!: OrgChartData;
  dataSerialized!: string;
  /**
   * This id is used to reference the data from the node.
   * The id is located on the data node element.
   * When we create a node (initialise OrgChart lib) then the id is assigned to the node element as '[data-dataRefId]={dataRefId}'
   */
  dataByNodeId: Record<string, OrgChartData | OrgChartDataChild> = {};

  isMobileOrTablet = isTablet();

  constructor(node: HTMLElement) {
    // assign unique ids to container and nodes
    this.containerId = `${MAIN_CONTAINER}__${OrgChartContainer.idNum++}`;
    node.id = this.containerId;

    if (!node) {
      console.error(
        "OrgChart -> Can't initialize orgchart. Container not found.",
        "Container id: ",
        this.containerId
      );
      return;
    }

    // generate node ids
    node.querySelectorAll("li, ul")?.forEach((node) => {
      node.id = this.generateNodeId();
    });

    // assign container
    this.container = node;

    this.init();
  }

  generateNodeId() {
    return `${this.containerId}__node__${this.nodeIdNum++}`;
  }

  /**
   * This method is called by OrgChart.js to create a node.
   * @param node The node element created by OrgChart.js
   * @param data Node data
   */
  createNode(node: HTMLElement, data?: OrgChartDataChild) {
    console.log("Create node", node, data);
    // add image element if imageSrc is provided
    if (data?.imageSrc) {
      const imgContainer = globalThis.document.createElement("div");
      imgContainer.classList.add(`${CLASS_PREFIX}-avatar--container`);
      const imgSubContainer = globalThis.document.createElement("div");
      imgSubContainer.classList.add(`${CLASS_PREFIX}-avatar--sub-container`);
      const imgEl = globalThis.document.createElement("img");
      imgEl.srcset = data.imageSrc;

      imgSubContainer.appendChild(imgEl);
      imgContainer.appendChild(imgSubContainer);

      node.prepend(imgContainer);
      node.classList.add(`${CLASS_PREFIX}__node--with-image`);
    }

    if (data?.dataRefId) {
      const mainData = this.dataByNodeId[data.dataRefId] as OrgChartData;
      // link node with data
      node.setAttribute("data-dataRefId", data.dataRefId);

      this.addFancyBoxDialog(node, mainData);
      this.addAriaLabels(node, mainData);
    }

    // add acting text
    if (data?.acting === "true") {
      const content = node.querySelector(".content") as HTMLElement | null;

      if(content && content.innerText) {
        content.innerText = `Acting ${content.innerText}`;
      } 
    }

    if (data?.department) {
      const content = node.querySelector(".content") as HTMLElement | null;

      if (content) {
        const department = globalThis.document.createElement("div");
        department.classList.add("department");
        department.innerText = data.department;

        node.appendChild(department);
        node.classList.add("with-department");
      }
    }

    node.classList.add(`variant-${data?.variant ?? 1}`);
  }

  /**
   * Initialize the orgchart.js library.
   */
  init() {
    if (!this.container && !this.data) {
      return console.error(
        "OrgChart -> Container or data not found",
        "Container id: ",
        this.containerId
      );
    }

    this.data = this.extractDataFromContainer(this.container) as OrgChartData;
    this.dataSerialized = JSON.stringify(this.data);

    const createNodeFn = this.createNode.bind(this);

    this.buildChart(createNodeFn);

    if (this.data.responsive === 'true') {
      globalThis.addEventListener("resize", () => {
        console.log('resize', this);
        const _isMobileOrTablet = isTablet();
        if (this.isMobileOrTablet !== _isMobileOrTablet) {
          this.isMobileOrTablet = _isMobileOrTablet;
          this.destroyChart();
          this.buildChart(createNodeFn);
        }
      })
    }
  }

  // addEventListeners() {
  //   globalThis.document.body.addEventListener("click", () => {
  //     this.closeAllBioDialogs();
  //   });
  // }

  buildChart(createNodeFn: (node: HTMLElement, data: OrgChartDataChild) => void) {
    if (this.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const opts: any = {
        chartContainer: `#${this.containerId}`,
        data: this.data,
        nodeContent: "title",
        createNode: createNodeFn,
        toggleSiblingsResp: false,
        parentNodeSymbol: "fa-sitemap",
      };

      if (this.data.depth) {
        opts.depth = this.data.depth;
      }


      if (this.data.verticalDepth) {
        opts.verticalDepth = this.data.verticalDepth;
      }

      /**
       * Vertical depth is set to 2 if responsive is true and the viewport is mobile.
       */
      if (this.data.responsive === 'true') {
        if (this.isMobileOrTablet) {
          opts.verticalDepth = 2;
        } 
      }


      this.orgChartInstance = new OrgChartOverride(opts);
    }
  }

  destroyChart() {
    this.container?.querySelector('.orgchart')?.remove?.();
    this.orgChartInstance = null;
    this.dataByNodeId = {};
    this.data = JSON.parse(this.dataSerialized);
  }

  closeAllBioDialogs() {
    this.container
      .querySelectorAll(this.popperShowSelector())
      .forEach((node) => {
        if (node?.classList?.remove) {
          node.classList.remove(this.popperShowSelector(true));
        }
      });
  }

  popperMainSelector(onlyName = false) {
    return `${onlyName ? "" : "."}${MAIN_CONTAINER}__bio-dialog`;
  }

  popperShowSelector(onlyName = false) {
    return `${onlyName ? "" : "."}${MAIN_CONTAINER}__show-bio`;
  }

  addFancyBoxDialog(node: HTMLElement, data: OrgChartData | OrgChartDataChild) {
    if (data?.bio) {
      node.classList.add(`with-bio`, "fancybox-dialog");

      const fn = ((bio) =>
        function (e: MouseEvent) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let html: any[] = [];
          const _isUrl = isUrl(bio);

          if (_isUrl) {
            html = $.parseHTML(
              `<div style="display: contents"><div class='${MAIN_CONTAINER}__fancybox--content'><iframe src="${bio}"</div></div>`
            );
          } else {
            html = $.parseHTML(
              `<div style="display: contents"><div class='${MAIN_CONTAINER}__fancybox--content has-iframe'>${bio}</div></div>`
            );
          }

          e.stopPropagation();

          // don't open bio dialog if the user clicks on the edge or toggle button to expand the node
          if (
            (e.target as HTMLElement)?.classList?.contains?.("edge") ||
            (e.target as HTMLElement)?.classList?.contains?.("toggleBtn")
          ) {
            return;
          }
          const _isMobile = isMobile();

          // fancybox options
          const opts: FancyboxOptions | undefined =
            {
            // Remove side padding for mobile browsers.
            padding: _isMobile ? [25, 0, 25, 0] : 25,
            closeBtn: true,
            afterLoad: function () {
              const overlay = this?.locked?.[0];

              if (overlay) {
                overlay.classList.add(`${MAIN_CONTAINER}__fancybox--backdrop`);

                const wrap = overlay.querySelector(
                  ".fancybox-wrap"
                ) as HTMLElement;

                const skin = overlay.querySelector(
                  ".fancybox-skin"
                ) as HTMLElement;

                if (isMobile()) {
                  overlay.classList.add('isMobile');
                  wrap.style.left = '0';
                  wrap.style.right = '0';

                  wrap.style.top = '0';
                  wrap.style.bottom = '0';
                  wrap.style.inset = '0';
                }

                  // create dialog header
                  const header = document.createElement("div");
                  header.classList.add("bio-dialog-header");
                  const titleText = document.createElement("span");
                  titleText.innerText = "Biography";
                  header.appendChild(titleText);
                  header.setAttribute("aria-label", "Biography");
                  header.setAttribute("title", "Biography");
                  header.setAttribute("role", "heading");

                  skin.appendChild(header);

                const icon = globalThis.document.createElement("i");
                const closeBtn = globalThis.document.createElement("button");
                icon.classList.add("fa", "fa-times");
                closeBtn.classList.add("close-bio");
                closeBtn.appendChild(icon);
                closeBtn.setAttribute("aria-label", "Close biography dialog");
                closeBtn.setAttribute("title", "Close biography dialog");
                closeBtn.setAttribute("type", "button");

                // close bio dialog event listener
                // icon.addEventListener("click", function (e) {
                closeBtn.addEventListener("click", function (e) {
                  e.stopPropagation();
                  const fancyClose = document.body.querySelector(
                    ".fancybox-close"
                  ) as HTMLElement

                  fancyClose?.click?.();
                });

                skin.appendChild(closeBtn);
              }
            },
          }

          $.fancybox.open(html, 
            opts
          );
        })(data.bio);

      node.addEventListener("click", fn);
    }
  }

  /**
   * Initialize popper.js if there is bio data available
   * @param node Current node instantiated by OrgChart.js
   * @param data Reference data
   */
  addPopperBioDialog(
    node: HTMLElement,
    data: OrgChartData | OrgChartDataChild
  ) {
    if (data.bio) {
      node.classList.add(`with-bio`, "popper-dialog");

      // Example:
      //     `
      //         <div class="bio-dialog bio-dialog-${data.dataRefId} popper--tooltip">
      //             <span class="bio-dialog--text">
      //                 ${data.bio}
      //             </span>
      //             <div class="popper--arrow"></div>
      //         </div>
      //     `
      const bioDialog = globalThis.document.createElement("div");
      bioDialog.classList.add(
        `${this.popperMainSelector(true)}`,
        `bio-dialog-${data.dataRefId}`
      );

      const bioText = globalThis.document.createElement("span");
      bioText.classList.add("bio-dialog--text");
      const parsedHtml = looseParseOnlyElements(data.bio);

      if (parsedHtml?.length) {
        const nodes = Array.from(parsedHtml);

        nodes.forEach((node) => {
          bioText.appendChild(node);
        });
      }

      bioDialog.appendChild(bioText);

      const arrow = globalThis.document.createElement("div");
      arrow.classList.add("popper--arrow");
      arrow.setAttribute("data-popper-arrow", "");
      bioDialog.appendChild(arrow);

      const icon = globalThis.document.createElement("i");
      icon.classList.add("fa", "fa-times", "close-bio");

      const showSelector = this.popperShowSelector();
      const showSelectorName = this.popperShowSelector(true);

      // close bio dialog event listener
      icon.addEventListener("click", function (e) {
        e.stopPropagation();

        this.closest(showSelector)?.classList.remove(showSelectorName);
      });

      bioDialog.appendChild(icon);
      node.appendChild(bioDialog);

      data.popperInstance = createPopper(node, bioDialog, {
        strategy: "fixed",
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [0, 6],
            },
          },
        ],
      });

      const closeAll = this.closeAllBioDialogs.bind(this);

      node.addEventListener("click", function (e) {
        e.stopPropagation();

        // don't open bio dialog if the user clicks on the edge or toggle button to expand the node
        if (
          (e.target as HTMLElement)?.classList?.contains?.("edge") ||
          (e.target as HTMLElement)?.classList?.contains?.("toggleBtn")
        ) {
          return;
        }

        if (!node.classList.contains(showSelectorName)) {
          closeAll();
          data.popperInstance?.update();
          node.classList.toggle(showSelectorName);
        }
      });
    }
  }

  addAriaLabels(node: HTMLElement, data?: OrgChartDataChild) {
    if (data?.name) {
      node?.setAttribute(
        "aria-labelledby",
        `[data-dataRefId="${data.dataRefId}"] .title`
      );
    }

    if (data?.title) {
      node?.setAttribute(
        "aria-describedby",
        `[data-dataRefId="${data.dataRefId}"] .content`
      );
    }
  }

  getDataFromChildNode(node: HTMLElement): OrgChartDataChild | null {
    const nAttrs = nodeAttributes(node);
    let data: Partial<OrgChartDataChild> | null = null;

    CHILD_ATTRS.forEach((attr) => {
      if (nAttrs(attr) ?? false) {
        const val: string | null = nAttrs(attr);
        if (val ?? false) {
          if (data) {
            // avoid type error
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (data as any)[attr as string] = val;
          } else {
            data = { [attr]: val };
          }
        }
      }
    });

    const dataRefId = node.id;

    if (dataRefId && data) {
      (data as Partial<OrgChartDataChild>).dataRefId = dataRefId;

      this.dataByNodeId[dataRefId] = data as OrgChartDataChild;
    }

    return data;
  }

  getDataFromParentNode(node: HTMLElement): OrgChartData | null {
    const nAttrs = nodeAttributes(node);
    let data: Partial<OrgChartData> | null = null;

    PARENT_ATTRS.forEach((attr) => {
      if (nAttrs(attr) ?? false) {
        let val: string | number | null = nAttrs(attr);

        if (attr === "depth" || attr === "verticalDepth") {
          const _val = parseInt(val as string, 10);

          // check if _val is a number and not NaN
          if (typeof _val === "number" && _val === _val) {
            val = _val;
          }
        }

        if (val ?? false) {
          if (data) {
            // avoid type error
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (data as any)[attr as string] = val;
          } else {
            data = { [attr]: val };
          }
        }
      }
    });

    const dataRefId = node.id;

    if (dataRefId && data) {
      (data as Partial<OrgChartData>).dataRefId = dataRefId;

      this.dataByNodeId[dataRefId] = data as OrgChartDataChild;
    }

    if (data) {
      (data as OrgChartData).mainNode = true;
    }

    return data;
  }

  extractDataFromContainer(
    dataNode: HTMLElement,
    isChild = false
  ): OrgChartData | OrgChartDataChild | null {
    try {
      if (isChild) {
        if (dataNode) {
          const data = this.getDataFromChildNode(dataNode);
          if (data) {
            const childList = dataNode.querySelector("ul");
            if (childList) {
              const childNodes = childList.querySelectorAll(
                `#${childList.id}>li`
              );

              if (childNodes.length > 0) {
                data.children = Array.from(childNodes).map((node) => {
                  return this.extractDataFromContainer(
                    node as HTMLElement,
                    true
                  );
                }) as OrgChartDataChild[];
              }
            }

            return data as OrgChartData;
          }
        }
      } else {
        // Check if its a list element or a ul element. If its a ul element, get the first li element.
        // We check for only a single li element because the orgchart.js library doesn't support multiple root nodes.
        const node =
          dataNode?.tagName?.toLowerCase() == "li"
            ? dataNode
            : dataNode?.querySelector("li");

        if (node) {
          const data = this.getDataFromParentNode(node as HTMLElement);
          if (data) {
            const childList = node.querySelector("ul");
            if (childList) {
              const childNodes = childList.querySelectorAll(
                `#${childList.id}>li`
              );

              if (childNodes.length > 0) {
                data.children = Array.from(childNodes).map((node) => {
                  return this.extractDataFromContainer(
                    node as HTMLElement,
                    true
                  );
                }) as OrgChartDataChild[];
              }
            }

            return data as OrgChartData;
          }
        }
      }
    } catch (e) {
      console.error("Can't extract data from container", {
        containerId: this.containerId,
      });
    }

    return null;
  }
}
