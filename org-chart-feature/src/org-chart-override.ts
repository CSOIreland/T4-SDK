/* eslint-disable @typescript-eslint/no-explicit-any */
import OrgChart from "orgchart.js";

/**
 * Override 'OrgChart' with custom logic.
 */
export class OrgChartOverride extends OrgChart {
  constructor(...opts: any) {
    super(...opts);
  }

  _createNode(nodeData: any, level: any) {
    const promise = super._createNode(nodeData, level);

    return promise;
  }

  _buildJsonDS(li: any) {
    const built = super._buildJsonDS(li);
    return built;
  }

  /**
   * @warn Native implementation breaks if we have a vertical hierarchy that needs to expand. This is a workaround.
   */
  // show the children nodes of the specified node
  showChildren(node: any) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this,
      temp = this._nextAll(node.parentNode.parentNode),
      descendants: any[] = [];

    this._removeClass(temp, "hidden");
    if (temp.some((el: any) => el.classList.contains("verticalNodes"))) {
        // This is the modified part of the code.
        /** MODDED START */
        Array.from(temp).forEach((el: any) => {
            el.querySelector('ul.hidden')?.classList?.remove('hidden');
        });
        /** MODDED END */

      temp.forEach((el: any) => {
        Array.prototype.push.apply(
          descendants,
          Array.from(el.querySelectorAll(".node")).filter((el) => {
            return that._isVisible(el);
          })
        );
      });
    } else {
      Array.from(temp[2].children).forEach((el: any) => {
        Array.prototype.push.apply(
          descendants,
          Array.from(el.querySelector("tr").querySelectorAll(".node")).filter(
            (el) => {
              return that._isVisible(el);
            }
          )
        );
      });
    }
    // the two following statements are used to enforce browser to repaint
    this._repaint(descendants[0]);
    this._one(
      descendants[0],
      "transitionend",
      () => {
        this._removeClass(descendants, "slide");
        if (this._isInAction(node)) {
          this._switchVerticalArrow(node.querySelector(".bottomEdge"));
        }
      },
      this
    );
    this._addClass(descendants, "slide");
    this._removeClass(descendants, "slide-up");
  }
}
