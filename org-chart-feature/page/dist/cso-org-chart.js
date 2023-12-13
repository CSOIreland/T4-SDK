
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
const CLASS_PREFIX = "cso-org-chart";
const MAIN_CONTAINER = "cso-org-chart-container";

function looseParseFromString(str) {
    const parser = new DOMParser();
    str = str
        .replace(/ \/>/g, ">")
        .replace(/(<(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr).*?>)/g, "$1</$2>");
    const xdom = parser.parseFromString("<xml>" + str + "</xml>", "text/xml");
    const hdom = parser.parseFromString("", "text/html");
    for (const elem of Array.from(xdom.documentElement.children)) {
        hdom.body.appendChild(elem);
    }
    for (const elem of Array.from(hdom.querySelectorAll("area,base,br,col,command,embed,hr,img,input,keygen,link,meta,param,source,track,wbr"))) {
        elem.outerHTML = "<" + elem.outerHTML.slice(1).split("<")[0];
    }
    return hdom;
}
function getContainers() {
    return globalThis.document.querySelectorAll(`.${MAIN_CONTAINER}`);
}
function looseParseOnlyElements(str) {
    var _a, _b;
    return ((_b = (_a = looseParseFromString(str)) === null || _a === void 0 ? void 0 : _a.body) === null || _b === void 0 ? void 0 : _b.childNodes) || null;
}

function nodeAttributes(node) {
    return (attribute) => {
        return node.getAttribute(`data-${attribute}`);
    };
}

class OrgChart {
  constructor(options) {
    this._name = 'OrgChart';
    Promise.prototype.finally = function (callback) {
      let P = this.constructor;

      return this.then(
        value => P.resolve(callback()).then(() => value),
        reason => P.resolve(callback()).then(() => { throw reason; })
      );
    };

    let that = this,
      defaultOptions = {
        'nodeTitle': 'name',
        'nodeId': 'id',
        'toggleSiblingsResp': false,
        'depth': 999,
        'chartClass': '',
        'exportButton': false,
        'exportFilename': 'OrgChart',
        'parentNodeSymbol': 'fa-users',
        'draggable': false,
        'direction': 't2b',
        'pan': false,
        'zoom': false
      },
      opts = Object.assign(defaultOptions, options),
      data = opts.data,
      chart = document.createElement('div'),
      chartContainer = document.querySelector(opts.chartContainer);

    this.options = opts;
    delete this.options.data;
    this.chart = chart;
    this.chartContainer = chartContainer;
    chart.dataset.options = JSON.stringify(opts);
    chart.setAttribute('class', 'orgchart' + (opts.chartClass !== '' ? ' ' + opts.chartClass : '') +
      (opts.direction !== 't2b' ? ' ' + opts.direction : ''));
    if (typeof data === 'object') { // local json datasource
      this.buildHierarchy(chart, opts.ajaxURL ? data : this._attachRel(data, '00'), 0);
    } else if (typeof data === 'string' && data.startsWith('#')) { // ul datasource
      this.buildHierarchy(chart, this._buildJsonDS(document.querySelector(data).children[0]), 0);
    } else { // ajax datasource
      let spinner = document.createElement('i');

      spinner.setAttribute('class', 'fa fa-circle-o-notch fa-spin spinner');
      chart.appendChild(spinner);
      this._getJSON(data)
      .then(function (resp) {
        that.buildHierarchy(chart, opts.ajaxURL ? resp : that._attachRel(resp, '00'), 0);
      })
      .catch(function (err) {
        console.error('failed to fetch datasource for orgchart', err);
      })
      .finally(function () {
        let spinner = chart.querySelector('.spinner');

        spinner.parentNode.removeChild(spinner);
      });
    }
    chart.addEventListener('click', this._clickChart.bind(this));
    // append the export button to the chart-container
    if (opts.exportButton && !chartContainer.querySelector('.oc-export-btn')) {
      let exportBtn = document.createElement('button'),
        downloadBtn = document.createElement('a');

      exportBtn.setAttribute('class', 'oc-export-btn' + (opts.chartClass !== '' ? ' ' + opts.chartClass : ''));
      exportBtn.innerHTML = 'Export';
      exportBtn.addEventListener('click', this._clickExportButton.bind(this));
      downloadBtn.setAttribute('class', 'oc-download-btn' + (opts.chartClass !== '' ? ' ' + opts.chartClass : ''));
      downloadBtn.setAttribute('download', opts.exportFilename + '.png');
      chartContainer.appendChild(exportBtn);
      chartContainer.appendChild(downloadBtn);
    }

    if (opts.pan) {
      chartContainer.style.overflow = 'hidden';
      chart.addEventListener('mousedown', this._onPanStart.bind(this));
      chart.addEventListener('touchstart', this._onPanStart.bind(this));
      document.body.addEventListener('mouseup', this._onPanEnd.bind(this));
      document.body.addEventListener('touchend', this._onPanEnd.bind(this));
    }

    if (opts.zoom) {
      chartContainer.addEventListener('wheel', this._onWheeling.bind(this));
      chartContainer.addEventListener('touchstart', this._onTouchStart.bind(this));
      document.body.addEventListener('touchmove', this._onTouchMove.bind(this));
      document.body.addEventListener('touchend', this._onTouchEnd.bind(this));
    }

    chartContainer.appendChild(chart);
  }
  get name() {
    return this._name;
  }
  _closest(el, fn) {
    return el && ((fn(el) && el !== this.chart) ? el : this._closest(el.parentNode, fn));
  }
  _siblings(el, expr) {
    return Array.from(el.parentNode.children).filter((child) => {
      if (child !== el) {
        if (expr) {
          return el.matches(expr);
        }
        return true;
      }
      return false;
    });
  }
  _prevAll(el, expr) {
    let sibs = [],
      prevSib = el.previousElementSibling;

    while (prevSib) {
      if (!expr || prevSib.matches(expr)) {
        sibs.push(prevSib);
      }
      prevSib = prevSib.previousElementSibling;
    }
    return sibs;
  }
  _nextAll(el, expr) {
    let sibs = [];
    let nextSib = el.nextElementSibling;

    while (nextSib) {
      if (!expr || nextSib.matches(expr)) {
        sibs.push(nextSib);
      }
      nextSib = nextSib.nextElementSibling;
    }
    return sibs;
  }
  _isVisible(el) {
    return el.offsetParent !== null;
  }
  _addClass(elements, classNames) {
    elements.forEach((el) => {
      if (classNames.indexOf(' ') > 0) {
        classNames.split(' ').forEach((className) => el.classList.add(className));
      } else {
        el.classList.add(classNames);
      }
    });
  }
  _removeClass(elements, classNames) {
    elements.forEach((el) => {
      if (classNames.indexOf(' ') > 0) {
        classNames.split(' ').forEach((className) => el.classList.remove(className));
      } else {
        el.classList.remove(classNames);
      }
    });
  }
  _css(elements, prop, val) {
    elements.forEach((el) => {
      el.style[prop] = val;
    });
  }
  _removeAttr(elements, attr) {
    elements.forEach((el) => {
      el.removeAttribute(attr);
    });
  }
  _one(el, type, listener, self) {
    let one = function (event) {
      try {
        listener.call(self, event);
      } finally {
        el.removeEventListener(type, one);
      }
    };

    el.addEventListener(type, one);
  }
  _getDescElements(ancestors, selector) {
    let results = [];

    ancestors.forEach((el) => results.push(...el.querySelectorAll(selector)));
    return results;
  }
  _getJSON(url) {
    return new Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest();

      function handler() {
        if (this.readyState !== 4) {
          return;
        }
        if (this.status === 200) {
          resolve(JSON.parse(this.response));
        } else {
          reject(new Error(this.statusText));
        }
      }
      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      // xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send();
    });
  }
  _buildJsonDS(li) {
    let subObj = {
      'name': li.firstChild.textContent.trim(),
      'relationship': (li.parentNode.parentNode.nodeName === 'LI' ? '1' : '0') +
        (li.parentNode.children.length > 1 ? 1 : 0) + (li.children.length ? 1 : 0)
    };

    if (li.id) {
      subObj.id = li.id;
    }
    if (li.querySelector('ul')) {
      Array.from(li.querySelector('ul').children).forEach((el) => {
        if (!subObj.children) { subObj.children = []; }
        subObj.children.push(this._buildJsonDS(el));
      });
    }
    return subObj;
  }
  _attachRel(data, flags) {
    data.relationship = flags + (data.children && data.children.length > 0 ? 1 : 0);
    if (data.children) {
      for (let item of data.children) {
        this._attachRel(item, '1' + (data.children.length > 1 ? 1 : 0));
      }
    }
    return data;
  }
  _repaint(node) {
    if (node) {
      node.style.offsetWidth = node.offsetWidth;
    }
  }
  // whether the cursor is hovering over the node
  _isInAction(node) {
    return node.querySelector(':scope > .edge').className.indexOf('fa-') > -1;
  }
  // detect the exist/display state of related node
  _getNodeState(node, relation) {
    let criteria,
      state = { 'exist': false, 'visible': false };

    if (relation === 'parent') {
      criteria = this._closest(node, (el) => el.classList && el.classList.contains('nodes'));
      if (criteria) {
        state.exist = true;
      }
      if (state.exist && this._isVisible(criteria.parentNode.children[0])) {
        state.visible = true;
      }
    } else if (relation === 'children') {
      criteria = this._closest(node, (el) => el.nodeName === 'TR').nextElementSibling;
      if (criteria) {
        state.exist = true;
      }
      if (state.exist && this._isVisible(criteria)) {
        state.visible = true;
      }
    } else if (relation === 'siblings') {
      criteria = this._siblings(this._closest(node, (el) => el.nodeName === 'TABLE').parentNode);
      if (criteria.length) {
        state.exist = true;
      }
      if (state.exist && criteria.some((el) => this._isVisible(el))) {
        state.visible = true;
      }
    }

    return state;
  }
  // find the related nodes
  getRelatedNodes(node, relation) {
    if (relation === 'parent') {
      return this._closest(node, (el) => el.classList.contains('nodes'))
        .parentNode.children[0].querySelector('.node');
    } else if (relation === 'children') {
      return Array.from(this._closest(node, (el) => el.nodeName === 'TABLE').lastChild.children)
        .map((el) => el.querySelector('.node'));
    } else if (relation === 'siblings') {
      return this._siblings(this._closest(node, (el) => el.nodeName === 'TABLE').parentNode)
        .map((el) => el.querySelector('.node'));
    }
    return [];
  }
  _switchHorizontalArrow(node) {
    let opts = this.options,
      leftEdge = node.querySelector('.leftEdge'),
      rightEdge = node.querySelector('.rightEdge'),
      temp = this._closest(node, (el) => el.nodeName === 'TABLE').parentNode;

    if (opts.toggleSiblingsResp && (typeof opts.ajaxURL === 'undefined' ||
      this._closest(node, (el) => el.classList.contains('.nodes')).dataset.siblingsLoaded)) {
      let prevSib = temp.previousElementSibling,
        nextSib = temp.nextElementSibling;

      if (prevSib) {
        if (prevSib.classList.contains('hidden')) {
          leftEdge.classList.add('fa-chevron-left');
          leftEdge.classList.remove('fa-chevron-right');
        } else {
          leftEdge.classList.add('fa-chevron-right');
          leftEdge.classList.remove('fa-chevron-left');
        }
      }
      if (nextSib) {
        if (nextSib.classList.contains('hidden')) {
          rightEdge.classList.add('fa-chevron-right');
          rightEdge.classList.remove('fa-chevron-left');
        } else {
          rightEdge.classList.add('fa-chevron-left');
          rightEdge.classList.remove('fa-chevron-right');
        }
      }
    } else {
      let sibs = this._siblings(temp),
        sibsVisible = sibs.length ? !sibs.some((el) => el.classList.contains('hidden')) : false;

      leftEdge.classList.toggle('fa-chevron-right', sibsVisible);
      leftEdge.classList.toggle('fa-chevron-left', !sibsVisible);
      rightEdge.classList.toggle('fa-chevron-left', sibsVisible);
      rightEdge.classList.toggle('fa-chevron-right', !sibsVisible);
    }
  }
  _hoverNode(event) {
    let node = event.target,
      flag = false,
      topEdge = node.querySelector(':scope > .topEdge'),
      bottomEdge = node.querySelector(':scope > .bottomEdge'),
      leftEdge = node.querySelector(':scope > .leftEdge');

    if (event.type === 'mouseenter') {
      if (topEdge) {
        flag = this._getNodeState(node, 'parent').visible;
        topEdge.classList.toggle('fa-chevron-up', !flag);
        topEdge.classList.toggle('fa-chevron-down', flag);
      }
      if (bottomEdge) {
        flag = this._getNodeState(node, 'children').visible;
        bottomEdge.classList.toggle('fa-chevron-down', !flag);
        bottomEdge.classList.toggle('fa-chevron-up', flag);
      }
      if (leftEdge) {
        this._switchHorizontalArrow(node);
      }
    } else {
      Array.from(node.querySelectorAll(':scope > .edge')).forEach((el) => {
        el.classList.remove('fa-chevron-up', 'fa-chevron-down', 'fa-chevron-right', 'fa-chevron-left');
      });
    }
  }
  // define node click event handler
  _clickNode(event) {
    let clickedNode = event.currentTarget,
      focusedNode = this.chart.querySelector('.focused');

    if (focusedNode) {
      focusedNode.classList.remove('focused');
    }
    clickedNode.classList.add('focused');
  }
  // build the parent node of specific node
  _buildParentNode(currentRoot, nodeData, callback) {
    let that = this,
      table = document.createElement('table');

    nodeData.relationship = nodeData.relationship || '001';
    this._createNode(nodeData, 0)
      .then(function (nodeDiv) {
        let chart = that.chart;

        nodeDiv.classList.remove('slide-up');
        nodeDiv.classList.add('slide-down');
        let parentTr = document.createElement('tr'),
          superiorLine = document.createElement('tr'),
          inferiorLine = document.createElement('tr'),
          childrenTr = document.createElement('tr');

        parentTr.setAttribute('class', 'hidden');
        parentTr.innerHTML = `<td colspan="2"></td>`;
        table.appendChild(parentTr);
        superiorLine.setAttribute('class', 'lines hidden');
        superiorLine.innerHTML = `<td colspan="2"><div class="downLine"></div></td>`;
        table.appendChild(superiorLine);
        inferiorLine.setAttribute('class', 'lines hidden');
        inferiorLine.innerHTML = `<td class="rightLine">&nbsp;</td><td class="leftLine">&nbsp;</td>`;
        table.appendChild(inferiorLine);
        childrenTr.setAttribute('class', 'nodes');
        childrenTr.innerHTML = `<td colspan="2"></td>`;
        table.appendChild(childrenTr);
        table.querySelector('td').appendChild(nodeDiv);
        chart.insertBefore(table, chart.children[0]);
        table.children[3].children[0].appendChild(chart.lastChild);
        callback();
      })
      .catch(function (err) {
        console.error('Failed to create parent node', err);
      });
  }
  _switchVerticalArrow(arrow) {
    arrow.classList.toggle('fa-chevron-up');
    arrow.classList.toggle('fa-chevron-down');
  }
  // show the parent node of the specified node
  showParent(node) {
    // just show only one superior level
    let temp = this._prevAll(this._closest(node, (el) => el.classList.contains('nodes')));

    this._removeClass(temp, 'hidden');
    // just show only one line
    this._addClass(Array(temp[0].children).slice(1, -1), 'hidden');
    // show parent node with animation
    let parent = temp[2].querySelector('.node');

    this._one(parent, 'transitionend', function () {
      parent.classList.remove('slide');
      if (this._isInAction(node)) {
        this._switchVerticalArrow(node.querySelector(':scope > .topEdge'));
      }
    }, this);
    this._repaint(parent);
    parent.classList.add('slide');
    parent.classList.remove('slide-down');
  }
  // show the sibling nodes of the specified node
  showSiblings(node, direction) {
    // firstly, show the sibling td tags
    let siblings = [],
      temp = this._closest(node, (el) => el.nodeName === 'TABLE').parentNode;

    if (direction) {
      siblings = direction === 'left' ? this._prevAll(temp) : this._nextAll(temp);
    } else {
      siblings = this._siblings(temp);
    }
    this._removeClass(siblings, 'hidden');
    // secondly, show the lines
    let upperLevel = this._prevAll(this._closest(node, (el) => el.classList.contains('nodes')));

    temp = Array.from(upperLevel[0].querySelectorAll(':scope > .hidden'));
    if (direction) {
      this._removeClass(temp.slice(0, siblings.length * 2), 'hidden');
    } else {
      this._removeClass(temp, 'hidden');
    }
    // thirdly, do some cleaning stuff
    if (!this._getNodeState(node, 'parent').visible) {
      this._removeClass(upperLevel, 'hidden');
      let parent = upperLevel[2].querySelector('.node');

      this._one(parent, 'transitionend', function (event) {
        event.target.classList.remove('slide');
      }, this);
      this._repaint(parent);
      parent.classList.add('slide');
      parent.classList.remove('slide-down');
    }
    // lastly, show the sibling nodes with animation
    siblings.forEach((sib) => {
      Array.from(sib.querySelectorAll('.node')).forEach((node) => {
        if (this._isVisible(node)) {
          node.classList.add('slide');
          node.classList.remove('slide-left', 'slide-right');
        }
      });
    });
    this._one(siblings[0].querySelector('.slide'), 'transitionend', function () {
      siblings.forEach((sib) => {
        this._removeClass(Array.from(sib.querySelectorAll('.slide')), 'slide');
      });
      if (this._isInAction(node)) {
        this._switchHorizontalArrow(node);
        node.querySelector('.topEdge').classList.remove('fa-chevron-up');
        node.querySelector('.topEdge').classList.add('fa-chevron-down');
      }
    }, this);
  }
  // hide the sibling nodes of the specified node
  hideSiblings(node, direction) {
    let nodeContainer = this._closest(node, (el) => el.nodeName === 'TABLE').parentNode,
      siblings = this._siblings(nodeContainer);

    siblings.forEach((sib) => {
      if (sib.querySelector('.spinner')) {
        this.chart.dataset.inAjax = false;
      }
    });

    if (!direction || (direction && direction === 'left')) {
      let preSibs = this._prevAll(nodeContainer);

      preSibs.forEach((sib) => {
        Array.from(sib.querySelectorAll('.node')).forEach((node) => {
          if (this._isVisible(node)) {
            node.classList.add('slide', 'slide-right');
          }
        });
      });
    }
    if (!direction || (direction && direction !== 'left')) {
      let nextSibs = this._nextAll(nodeContainer);

      nextSibs.forEach((sib) => {
        Array.from(sib.querySelectorAll('.node')).forEach((node) => {
          if (this._isVisible(node)) {
            node.classList.add('slide', 'slide-left');
          }
        });
      });
    }

    let animatedNodes = [];

    this._siblings(nodeContainer).forEach((sib) => {
      Array.prototype.push.apply(animatedNodes, Array.from(sib.querySelectorAll('.slide')));
    });
    let lines = [];

    for (let node of animatedNodes) {
      let temp = this._closest(node, function (el) {
        return el.classList.contains('nodes');
      }).previousElementSibling;

      lines.push(temp);
      lines.push(temp.previousElementSibling);
    }
    lines = [...new Set(lines)];
    lines.forEach(function (line) {
      line.style.visibility = 'hidden';
    });

    this._one(animatedNodes[0], 'transitionend', function (event) {
      lines.forEach(function (line) {
        line.removeAttribute('style');
      });
      let sibs = [];

      if (direction) {
        if (direction === 'left') {
          sibs = this._prevAll(nodeContainer, ':not(.hidden)');
        } else {
          sibs = this._nextAll(nodeContainer, ':not(.hidden)');
        }
      } else {
        sibs = this._siblings(nodeContainer);
      }
      let temp = Array.from(this._closest(nodeContainer, function (el) {
        return el.classList.contains('nodes');
      }).previousElementSibling.querySelectorAll(':scope > :not(.hidden)'));

      let someLines = temp.slice(1, direction ? sibs.length * 2 + 1 : -1);

      this._addClass(someLines, 'hidden');
      this._removeClass(animatedNodes, 'slide');
      sibs.forEach((sib) => {
        Array.from(sib.querySelectorAll('.node')).slice(1).forEach((node) => {
          if (this._isVisible(node)) {
            node.classList.remove('slide-left', 'slide-right');
            node.classList.add('slide-up');
          }
        });
      });
      sibs.forEach((sib) => {
        this._addClass(Array.from(sib.querySelectorAll('.lines')), 'hidden');
        this._addClass(Array.from(sib.querySelectorAll('.nodes')), 'hidden');
        this._addClass(Array.from(sib.querySelectorAll('.verticalNodes')), 'hidden');
      });
      this._addClass(sibs, 'hidden');

      if (this._isInAction(node)) {
        this._switchHorizontalArrow(node);
      }
    }, this);
  }
  // recursively hide the ancestor node and sibling nodes of the specified node
  hideParent(node) {
    let temp = Array.from(this._closest(node, function (el) {
      return el.classList.contains('nodes');
    }).parentNode.children).slice(0, 3);

    if (temp[0].querySelector('.spinner')) {
      this.chart.dataset.inAjax = false;
    }
    // hide the sibling nodes
    if (this._getNodeState(node, 'siblings').visible) {
      this.hideSiblings(node);
    }
    // hide the lines
    let lines = temp.slice(1);

    this._css(lines, 'visibility', 'hidden');
    // hide the superior nodes with transition
    let parent = temp[0].querySelector('.node'),
      grandfatherVisible = this._getNodeState(parent, 'parent').visible;

    if (parent && this._isVisible(parent)) {
      parent.classList.add('slide', 'slide-down');
      this._one(parent, 'transitionend', function () {
        parent.classList.remove('slide');
        this._removeAttr(lines, 'style');
        this._addClass(temp, 'hidden');
      }, this);
    }
    // if the current node has the parent node, hide it recursively
    if (parent && grandfatherVisible) {
      this.hideParent(parent);
    }
  }
  // exposed method
  addParent(currentRoot, data) {
    let that = this;

    this._buildParentNode(currentRoot, data, function () {
      if (!currentRoot.querySelector(':scope > .topEdge')) {
        let topEdge = document.createElement('i');

        topEdge.setAttribute('class', 'edge verticalEdge topEdge fa');
        currentRoot.appendChild(topEdge);
      }
      that.showParent(currentRoot);
    });
  }
  // start up loading status for requesting new nodes
  _startLoading(arrow, node) {
    let opts = this.options,
      chart = this.chart;

    if (typeof chart.dataset.inAjax !== 'undefined' && chart.dataset.inAjax === 'true') {
      return false;
    }

    arrow.classList.add('hidden');
    let spinner = document.createElement('i');

    spinner.setAttribute('class', 'fa fa-circle-o-notch fa-spin spinner');
    node.appendChild(spinner);
    this._addClass(Array.from(node.querySelectorAll(':scope > *:not(.spinner)')), 'hazy');
    chart.dataset.inAjax = true;

    let exportBtn = this.chartContainer.querySelector('.oc-export-btn' +
      (opts.chartClass !== '' ? '.' + opts.chartClass : ''));

    if (exportBtn) {
      exportBtn.disabled = true;
    }
    return true;
  }
  // terminate loading status for requesting new nodes
  _endLoading(arrow, node) {
    let opts = this.options;

    arrow.classList.remove('hidden');
    node.querySelector(':scope > .spinner').remove();
    this._removeClass(Array.from(node.querySelectorAll(':scope > .hazy')), 'hazy');
    this.chart.dataset.inAjax = false;
    let exportBtn = this.chartContainer.querySelector('.oc-export-btn' +
      (opts.chartClass !== '' ? '.' + opts.chartClass : ''));

    if (exportBtn) {
      exportBtn.disabled = false;
    }
  }
  // define click event handler for the top edge
  _clickTopEdge(event) {
    event.stopPropagation();
    let that = this,
      topEdge = event.target,
      node = topEdge.parentNode,
      parentState = this._getNodeState(node, 'parent'),
      opts = this.options;

    if (parentState.exist) {
      let temp = this._closest(node, function (el) {
        return el.classList.contains('nodes');
      });
      let parent = temp.parentNode.firstChild.querySelector('.node');

      if (parent.classList.contains('slide')) { return; }
      // hide the ancestor nodes and sibling nodes of the specified node
      if (parentState.visible) {
        this.hideParent(node);
        this._one(parent, 'transitionend', function () {
          if (this._isInAction(node)) {
            this._switchVerticalArrow(topEdge);
            this._switchHorizontalArrow(node);
          }
        }, this);
      } else { // show the ancestors and siblings
        this.showParent(node);
      }
    } else {
      // load the new parent node of the specified node by ajax request
      let nodeId = topEdge.parentNode.id;

      // start up loading status
      if (this._startLoading(topEdge, node)) {
        // load new nodes
        this._getJSON(typeof opts.ajaxURL.parent === 'function' ?
          opts.ajaxURL.parent(node.dataset.source) : opts.ajaxURL.parent + nodeId)
        .then(function (resp) {
          if (that.chart.dataset.inAjax === 'true') {
            if (Object.keys(resp).length) {
              that.addParent(node, resp);
            }
          }
        })
        .catch(function (err) {
          console.error('Failed to get parent node data.', err);
        })
        .finally(function () {
          that._endLoading(topEdge, node);
        });
      }
    }
  }
  // recursively hide the descendant nodes of the specified node
  hideChildren(node) {
    let that = this,
      temp = this._nextAll(node.parentNode.parentNode),
      lastItem = temp[temp.length - 1],
      lines = [];

    if (lastItem.querySelector('.spinner')) {
      this.chart.dataset.inAjax = false;
    }
    let descendants = Array.from(lastItem.querySelectorAll('.node')).filter((el) => that._isVisible(el)),
      isVerticalDesc = lastItem.classList.contains('verticalNodes');

    if (!isVerticalDesc) {
      descendants.forEach((desc) => {
        Array.prototype.push.apply(lines,
          that._prevAll(that._closest(desc, (el) => el.classList.contains('nodes')), '.lines'));
      });
      lines = [...new Set(lines)];
      this._css(lines, 'visibility', 'hidden');
    }
    this._one(descendants[0], 'transitionend', function (event) {
      this._removeClass(descendants, 'slide');
      if (isVerticalDesc) {
        that._addClass(temp, 'hidden');
      } else {
        lines.forEach((el) => {
          el.removeAttribute('style');
          el.classList.add('hidden');
          el.parentNode.lastChild.classList.add('hidden');
        });
        this._addClass(Array.from(lastItem.querySelectorAll('.verticalNodes')), 'hidden');
      }
      if (this._isInAction(node)) {
        this._switchVerticalArrow(node.querySelector('.bottomEdge'));
      }
    }, this);
    this._addClass(descendants, 'slide slide-up');
  }
  // show the children nodes of the specified node
  showChildren(node) {
    let that = this,
      temp = this._nextAll(node.parentNode.parentNode),
      descendants = [];

    this._removeClass(temp, 'hidden');
    if (temp.some((el) => el.classList.contains('verticalNodes'))) {
      temp.forEach((el) => {
        Array.prototype.push.apply(descendants, Array.from(el.querySelectorAll('.node')).filter((el) => {
          return that._isVisible(el);
        }));
      });
    } else {
      Array.from(temp[2].children).forEach((el) => {
        Array.prototype.push.apply(descendants,
          Array.from(el.querySelector('tr').querySelectorAll('.node')).filter((el) => {
            return that._isVisible(el);
          }));
      });
    }
    // the two following statements are used to enforce browser to repaint
    this._repaint(descendants[0]);
    this._one(descendants[0], 'transitionend', (event) => {
      this._removeClass(descendants, 'slide');
      if (this._isInAction(node)) {
        this._switchVerticalArrow(node.querySelector('.bottomEdge'));
      }
    }, this);
    this._addClass(descendants, 'slide');
    this._removeClass(descendants, 'slide-up');
  }
  // build the child nodes of specific node
  _buildChildNode(appendTo, nodeData, callback) {
    let data = nodeData.children || nodeData.siblings;

    appendTo.querySelector('td').setAttribute('colSpan', data.length * 2);
    this.buildHierarchy(appendTo, { 'children': data }, 0, callback);
  }
  // exposed method
  addChildren(node, data) {
    let that = this,
      opts = this.options,
      count = 0;

    this.chart.dataset.inEdit = 'addChildren';
    this._buildChildNode.call(this, this._closest(node, (el) => el.nodeName === 'TABLE'), data, function () {
      if (++count === data.children.length) {
        if (!node.querySelector('.bottomEdge')) {
          let bottomEdge = document.createElement('i');

          bottomEdge.setAttribute('class', 'edge verticalEdge bottomEdge fa');
          node.appendChild(bottomEdge);
        }
        if (!node.querySelector('.symbol')) {
          let symbol = document.createElement('i');

          symbol.setAttribute('class', 'fa ' + opts.parentNodeSymbol + ' symbol');
          node.querySelector(':scope > .title').appendChild(symbol);
        }
        that.showChildren(node);
        that.chart.dataset.inEdit = '';
      }
    });
  }
  // bind click event handler for the bottom edge
  _clickBottomEdge(event) {
    event.stopPropagation();
    let that = this,
      opts = this.options,
      bottomEdge = event.target,
      node = bottomEdge.parentNode,
      childrenState = this._getNodeState(node, 'children');

    if (childrenState.exist) {
      let temp = this._closest(node, function (el) {
        return el.nodeName === 'TR';
      }).parentNode.lastChild;

      if (Array.from(temp.querySelectorAll('.node')).some((node) => {
        return this._isVisible(node) && node.classList.contains('slide');
      })) { return; }
      // hide the descendant nodes of the specified node
      if (childrenState.visible) {
        this.hideChildren(node);
      } else { // show the descendants
        this.showChildren(node);
      }
    } else { // load the new children nodes of the specified node by ajax request
      let nodeId = bottomEdge.parentNode.id;

      if (this._startLoading(bottomEdge, node)) {
        this._getJSON(typeof opts.ajaxURL.children === 'function' ?
          opts.ajaxURL.children(node.dataset.source) : opts.ajaxURL.children + nodeId)
        .then(function (resp) {
          if (that.chart.dataset.inAjax === 'true') {
            if (resp.children.length) {
              that.addChildren(node, resp);
            }
          }
        })
        .catch(function (err) {
          console.error('Failed to get children nodes data', err);
        })
        .finally(function () {
          that._endLoading(bottomEdge, node);
        });
      }
    }
  }
  // subsequent processing of build sibling nodes
  _complementLine(oneSibling, siblingCount, existingSibligCount) {
    let temp = oneSibling.parentNode.parentNode.children;

    temp[0].children[0].setAttribute('colspan', siblingCount * 2);
    temp[1].children[0].setAttribute('colspan', siblingCount * 2);
    for (let i = 0; i < existingSibligCount; i++) {
      let rightLine = document.createElement('td'),
        leftLine = document.createElement('td');

      rightLine.setAttribute('class', 'rightLine topLine');
      rightLine.innerHTML = '&nbsp;';
      temp[2].insertBefore(rightLine, temp[2].children[1]);
      leftLine.setAttribute('class', 'leftLine topLine');
      leftLine.innerHTML = '&nbsp;';
      temp[2].insertBefore(leftLine, temp[2].children[1]);
    }
  }
  // build the sibling nodes of specific node
  _buildSiblingNode(nodeChart, nodeData, callback) {
    let that = this,
      newSiblingCount = nodeData.siblings ? nodeData.siblings.length : nodeData.children.length,
      existingSibligCount = nodeChart.parentNode.nodeName === 'TD' ? this._closest(nodeChart, (el) => {
        return el.nodeName === 'TR';
      }).children.length : 1,
      siblingCount = existingSibligCount + newSiblingCount,
      insertPostion = (siblingCount > 1) ? Math.floor(siblingCount / 2 - 1) : 0;

    // just build the sibling nodes for the specific node
    if (nodeChart.parentNode.nodeName === 'TD') {
      let temp = this._prevAll(nodeChart.parentNode.parentNode);

      temp[0].remove();
      temp[1].remove();
      let childCount = 0;

      that._buildChildNode.call(that, that._closest(nodeChart.parentNode, (el) => el.nodeName === 'TABLE'),
        nodeData, () => {
          if (++childCount === newSiblingCount) {
            let siblingTds = Array.from(that._closest(nodeChart.parentNode, (el) => el.nodeName === 'TABLE')
              .lastChild.children);

            if (existingSibligCount > 1) {
              let temp = nodeChart.parentNode.parentNode;

              Array.from(temp.children).forEach((el) => {
                siblingTds[0].parentNode.insertBefore(el, siblingTds[0]);
              });
              temp.remove();
              that._complementLine(siblingTds[0], siblingCount, existingSibligCount);
              that._addClass(siblingTds, 'hidden');
              siblingTds.forEach((el) => {
                that._addClass(el.querySelectorAll('.node'), 'slide-left');
              });
            } else {
              let temp = nodeChart.parentNode.parentNode;

              siblingTds[insertPostion].parentNode.insertBefore(nodeChart.parentNode, siblingTds[insertPostion + 1]);
              temp.remove();
              that._complementLine(siblingTds[insertPostion], siblingCount, 1);
              that._addClass(siblingTds, 'hidden');
              that._addClass(that._getDescElements(siblingTds.slice(0, insertPostion + 1), '.node'), 'slide-right');
              that._addClass(that._getDescElements(siblingTds.slice(insertPostion + 1), '.node'), 'slide-left');
            }
            callback();
          }
        });
    } else { // build the sibling nodes and parent node for the specific ndoe
      let nodeCount = 0;

      that.buildHierarchy.call(that, that.chart, nodeData, 0, () => {
        if (++nodeCount === siblingCount) {
          let temp = nodeChart.nextElementSibling.children[3]
            .children[insertPostion],
            td = document.createElement('td');

          td.setAttribute('colspan', 2);
          td.appendChild(nodeChart);
          temp.parentNode.insertBefore(td, temp.nextElementSibling);
          that._complementLine(temp, siblingCount, 1);

          let temp2 = that._closest(nodeChart, (el) => el.classList && el.classList.contains('nodes'))
            .parentNode.children[0];

          temp2.classList.add('hidden');
          that._addClass(Array.from(temp2.querySelectorAll('.node')), 'slide-down');

          let temp3 = this._siblings(nodeChart.parentNode);

          that._addClass(temp3, 'hidden');
          that._addClass(that._getDescElements(temp3.slice(0, insertPostion), '.node'), 'slide-right');
          that._addClass(that._getDescElements(temp3.slice(insertPostion), '.node'), 'slide-left');
          callback();
        }
      });
    }
  }
  addSiblings(node, data) {
    let that = this;

    this.chart.dataset.inEdit = 'addSiblings';
    this._buildSiblingNode.call(this, this._closest(node, (el) => el.nodeName === 'TABLE'), data, () => {
      that._closest(node, (el) => el.classList && el.classList.contains('nodes'))
        .dataset.siblingsLoaded = true;
      if (!node.querySelector('.leftEdge')) {
        let rightEdge = document.createElement('i'),
          leftEdge = document.createElement('i');

        rightEdge.setAttribute('class', 'edge horizontalEdge rightEdge fa');
        node.appendChild(rightEdge);
        leftEdge.setAttribute('class', 'edge horizontalEdge leftEdge fa');
        node.appendChild(leftEdge);
      }
      that.showSiblings(node);
      that.chart.dataset.inEdit = '';
    });
  }
  removeNodes(node) {
    let parent = this._closest(node, el => el.nodeName === 'TABLE').parentNode,
      sibs = this._siblings(parent.parentNode);

    if (parent.nodeName === 'TD') {
      if (this._getNodeState(node, 'siblings').exist) {
        sibs[2].querySelector('.topLine').nextElementSibling.remove();
        sibs[2].querySelector('.topLine').remove();
        sibs[0].children[0].setAttribute('colspan', sibs[2].children.length);
        sibs[1].children[0].setAttribute('colspan', sibs[2].children.length);
        parent.remove();
      } else {
        sibs[0].children[0].removeAttribute('colspan');
        sibs[0].querySelector('.bottomEdge').remove();
        this._siblings(sibs[0]).forEach(el => el.remove());
      }
    } else {
      Array.from(parent.parentNode.children).forEach(el => el.remove());
    }
  }
  // bind click event handler for the left and right edges
  _clickHorizontalEdge(event) {
    event.stopPropagation();
    let that = this,
      opts = this.options,
      hEdge = event.target,
      node = hEdge.parentNode,
      siblingsState = this._getNodeState(node, 'siblings');

    if (siblingsState.exist) {
      let temp = this._closest(node, function (el) {
          return el.nodeName === 'TABLE';
        }).parentNode,
        siblings = this._siblings(temp);

      if (siblings.some((el) => {
        let node = el.querySelector('.node');

        return this._isVisible(node) && node.classList.contains('slide');
      })) { return; }
      if (opts.toggleSiblingsResp) {
        let prevSib = this._closest(node, (el) => el.nodeName === 'TABLE').parentNode.previousElementSibling,
          nextSib = this._closest(node, (el) => el.nodeName === 'TABLE').parentNode.nextElementSibling;

        if (hEdge.classList.contains('leftEdge')) {
          if (prevSib.classList.contains('hidden')) {
            this.showSiblings(node, 'left');
          } else {
            this.hideSiblings(node, 'left');
          }
        } else {
          if (nextSib.classList.contains('hidden')) {
            this.showSiblings(node, 'right');
          } else {
            this.hideSiblings(node, 'right');
          }
        }
      } else {
        if (siblingsState.visible) {
          this.hideSiblings(node);
        } else {
          this.showSiblings(node);
        }
      }
    } else {
      // load the new sibling nodes of the specified node by ajax request
      let nodeId = hEdge.parentNode.id,
        url = (this._getNodeState(node, 'parent').exist) ?
          (typeof opts.ajaxURL.siblings === 'function' ?
            opts.ajaxURL.siblings(JSON.parse(node.dataset.source)) : opts.ajaxURL.siblings + nodeId) :
          (typeof opts.ajaxURL.families === 'function' ?
            opts.ajaxURL.families(JSON.parse(node.dataset.source)) : opts.ajaxURL.families + nodeId);

      if (this._startLoading(hEdge, node)) {
        this._getJSON(url)
        .then(function (resp) {
          if (that.chart.dataset.inAjax === 'true') {
            if (resp.siblings || resp.children) {
              that.addSiblings(node, resp);
            }
          }
        })
        .catch(function (err) {
          console.error('Failed to get sibling nodes data', err);
        })
        .finally(function () {
          that._endLoading(hEdge, node);
        });
      }
    }
  }
  // event handler for toggle buttons in Hybrid(horizontal + vertical) OrgChart
  _clickToggleButton(event) {
    let that = this,
      toggleBtn = event.target,
      descWrapper = toggleBtn.parentNode.nextElementSibling,
      descendants = Array.from(descWrapper.querySelectorAll('.node')),
      children = Array.from(descWrapper.children).map(item => item.querySelector('.node'));

    if (children.some((item) => item.classList.contains('slide'))) { return; }
    toggleBtn.classList.toggle('fa-plus-square');
    toggleBtn.classList.toggle('fa-minus-square');
    if (descendants[0].classList.contains('slide-up')) {
      descWrapper.classList.remove('hidden');
      this._repaint(children[0]);
      this._addClass(children, 'slide');
      this._removeClass(children, 'slide-up');
      this._one(children[0], 'transitionend', () => {
        that._removeClass(children, 'slide');
      });
    } else {
      this._addClass(descendants, 'slide slide-up');
      this._one(descendants[0], 'transitionend', () => {
        that._removeClass(descendants, 'slide');
        descendants.forEach(desc => {
          let ul = that._closest(desc, function (el) {
            return el.nodeName === 'UL';
          });

          ul.classList.add('hidden');
        });
      });

      descendants.forEach(desc => {
        let subTBs = Array.from(desc.querySelectorAll('.toggleBtn'));

        that._removeClass(subTBs, 'fa-minus-square');
        that._addClass(subTBs, 'fa-plus-square');
      });
    }
  }
  _dispatchClickEvent(event) {
    let classList = event.target.classList;

    if (classList.contains('topEdge')) {
      this._clickTopEdge(event);
    } else if (classList.contains('rightEdge') || classList.contains('leftEdge')) {
      this._clickHorizontalEdge(event);
    } else if (classList.contains('bottomEdge')) {
      this._clickBottomEdge(event);
    } else if (classList.contains('toggleBtn')) {
      this._clickToggleButton(event);
    } else {
      this._clickNode(event);
    }
  }
  _onDragStart(event) {
    let nodeDiv = event.target,
      opts = this.options,
      isFirefox = /firefox/.test(window.navigator.userAgent.toLowerCase());

    if (isFirefox) {
      event.dataTransfer.setData('text/html', 'hack for firefox');
    }
    // if users enable zoom or direction options
    if (this.chart.style.transform) {
      let ghostNode, nodeCover;

      if (!document.querySelector('.ghost-node')) {
        ghostNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        ghostNode.classList.add('ghost-node');
        nodeCover = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        ghostNode.appendChild(nodeCover);
        this.chart.appendChild(ghostNode);
      } else {
        ghostNode = this.chart.querySelector(':scope > .ghost-node');
        nodeCover = ghostNode.children[0];
      }
      let transValues = this.chart.style.transform.split(','),
        scale = Math.abs(window.parseFloat((opts.direction === 't2b' || opts.direction === 'b2t') ?
          transValues[0].slice(transValues[0].indexOf('(') + 1) : transValues[1]));

      ghostNode.setAttribute('width', nodeDiv.offsetWidth);
      ghostNode.setAttribute('height', nodeDiv.offsetHeight);
      nodeCover.setAttribute('x', 5 * scale);
      nodeCover.setAttribute('y', 5 * scale);
      nodeCover.setAttribute('width', 120 * scale);
      nodeCover.setAttribute('height', 40 * scale);
      nodeCover.setAttribute('rx', 4 * scale);
      nodeCover.setAttribute('ry', 4 * scale);
      nodeCover.setAttribute('stroke-width', 1 * scale);
      let xOffset = event.offsetX * scale,
        yOffset = event.offsetY * scale;

      if (opts.direction === 'l2r') {
        xOffset = event.offsetY * scale;
        yOffset = event.offsetX * scale;
      } else if (opts.direction === 'r2l') {
        xOffset = nodeDiv.offsetWidth - event.offsetY * scale;
        yOffset = event.offsetX * scale;
      } else if (opts.direction === 'b2t') {
        xOffset = nodeDiv.offsetWidth - event.offsetX * scale;
        yOffset = nodeDiv.offsetHeight - event.offsetY * scale;
      }
      if (isFirefox) { // hack for old version of Firefox(< 48.0)
        let ghostNodeWrapper = document.createElement('img');

        ghostNodeWrapper.src = 'data:image/svg+xml;utf8,' + (new XMLSerializer()).serializeToString(ghostNode);
        event.dataTransfer.setDragImage(ghostNodeWrapper, xOffset, yOffset);
        nodeCover.setAttribute('fill', 'rgb(255, 255, 255)');
        nodeCover.setAttribute('stroke', 'rgb(191, 0, 0)');
      } else {
        event.dataTransfer.setDragImage(ghostNode, xOffset, yOffset);
      }
    }
    let dragged = event.target,
      dragZone = this._closest(dragged, (el) => {
        return el.classList && el.classList.contains('nodes');
      }).parentNode.children[0].querySelector('.node'),
      dragHier = Array.from(this._closest(dragged, (el) => {
        return el.nodeName === 'TABLE';
      }).querySelectorAll('.node'));

    this.dragged = dragged;
    Array.from(this.chart.querySelectorAll('.node')).forEach(function (node) {
      if (!dragHier.includes(node)) {
        if (opts.dropCriteria) {
          if (opts.dropCriteria(dragged, dragZone, node)) {
            node.classList.add('allowedDrop');
          }
        } else {
          node.classList.add('allowedDrop');
        }
      }
    });
  }
  _onDragOver(event) {
    event.preventDefault();
    let dropZone = event.currentTarget;

    if (!dropZone.classList.contains('allowedDrop')) {
      event.dataTransfer.dropEffect = 'none';
    }
  }
  _onDragEnd(event) {
    Array.from(this.chart.querySelectorAll('.allowedDrop')).forEach(function (el) {
      el.classList.remove('allowedDrop');
    });
  }
  _onDrop(event) {
    let dropZone = event.currentTarget,
      chart = this.chart,
      dragged = this.dragged,
      dragZone = this._closest(dragged, function (el) {
        return el.classList && el.classList.contains('nodes');
      }).parentNode.children[0].children[0];

    this._removeClass(Array.from(chart.querySelectorAll('.allowedDrop')), 'allowedDrop');
    // firstly, deal with the hierarchy of drop zone
    if (!dropZone.parentNode.parentNode.nextElementSibling) { // if the drop zone is a leaf node
      let bottomEdge = document.createElement('i');

      bottomEdge.setAttribute('class', 'edge verticalEdge bottomEdge fa');
      dropZone.appendChild(bottomEdge);
      dropZone.parentNode.setAttribute('colspan', 2);
      let table = this._closest(dropZone, function (el) {
          return el.nodeName === 'TABLE';
        }),
        upperTr = document.createElement('tr'),
        lowerTr = document.createElement('tr'),
        nodeTr = document.createElement('tr');

      upperTr.setAttribute('class', 'lines');
      upperTr.innerHTML = `<td colspan="2"><div class="downLine"></div></td>`;
      table.appendChild(upperTr);
      lowerTr.setAttribute('class', 'lines');
      lowerTr.innerHTML = `<td class="rightLine">&nbsp;</td><td class="leftLine">&nbsp;</td>`;
      table.appendChild(lowerTr);
      nodeTr.setAttribute('class', 'nodes');
      table.appendChild(nodeTr);
      Array.from(dragged.querySelectorAll('.horizontalEdge')).forEach((hEdge) => {
        dragged.removeChild(hEdge);
      });
      let draggedTd = this._closest(dragged, (el) => el.nodeName === 'TABLE').parentNode;

      nodeTr.appendChild(draggedTd);
    } else {
      let dropColspan = window.parseInt(dropZone.parentNode.colSpan) + 2;

      dropZone.parentNode.setAttribute('colspan', dropColspan);
      dropZone.parentNode.parentNode.nextElementSibling.children[0].setAttribute('colspan', dropColspan);
      if (!dragged.querySelector('.horizontalEdge')) {
        let rightEdge = document.createElement('i'),
          leftEdge = document.createElement('i');

        rightEdge.setAttribute('class', 'edge horizontalEdge rightEdge fa');
        dragged.appendChild(rightEdge);
        leftEdge.setAttribute('class', 'edge horizontalEdge leftEdge fa');
        dragged.appendChild(leftEdge);
      }
      let temp = dropZone.parentNode.parentNode.nextElementSibling.nextElementSibling,
        leftline = document.createElement('td'),
        rightline = document.createElement('td');

      leftline.setAttribute('class', 'leftLine topLine');
      leftline.innerHTML = `&nbsp;`;
      temp.insertBefore(leftline, temp.children[1]);
      rightline.setAttribute('class', 'rightLine topLine');
      rightline.innerHTML = `&nbsp;`;
      temp.insertBefore(rightline, temp.children[2]);
      temp.nextElementSibling.appendChild(this._closest(dragged, function (el) {
        return el.nodeName === 'TABLE';
      }).parentNode);

      let dropSibs = this._siblings(this._closest(dragged, function (el) {
        return el.nodeName === 'TABLE';
      }).parentNode).map((el) => el.querySelector('.node'));

      if (dropSibs.length === 1) {
        let rightEdge = document.createElement('i'),
          leftEdge = document.createElement('i');

        rightEdge.setAttribute('class', 'edge horizontalEdge rightEdge fa');
        dropSibs[0].appendChild(rightEdge);
        leftEdge.setAttribute('class', 'edge horizontalEdge leftEdge fa');
        dropSibs[0].appendChild(leftEdge);
      }
    }
    // secondly, deal with the hierarchy of dragged node
    let dragColSpan = window.parseInt(dragZone.colSpan);

    if (dragColSpan > 2) {
      dragZone.setAttribute('colspan', dragColSpan - 2);
      dragZone.parentNode.nextElementSibling.children[0].setAttribute('colspan', dragColSpan - 2);
      let temp = dragZone.parentNode.nextElementSibling.nextElementSibling;

      temp.children[1].remove();
      temp.children[1].remove();

      let dragSibs = Array.from(dragZone.parentNode.parentNode.children[3].children).map(function (td) {
        return td.querySelector('.node');
      });

      if (dragSibs.length === 1) {
        dragSibs[0].querySelector('.leftEdge').remove();
        dragSibs[0].querySelector('.rightEdge').remove();
      }
    } else {
      dragZone.removeAttribute('colspan');
      dragZone.querySelector('.node').removeChild(dragZone.querySelector('.bottomEdge'));
      Array.from(dragZone.parentNode.parentNode.children).slice(1).forEach((tr) => tr.remove());
    }
    let customE = new CustomEvent('nodedropped.orgchart', { 'detail': {
      'draggedNode': dragged,
      'dragZone': dragZone.children[0],
      'dropZone': dropZone
    }});

    chart.dispatchEvent(customE);
  }
  // create node
  _createNode(nodeData, level) {
    let that = this,
      opts = this.options;

    return new Promise(function (resolve, reject) {
      if (nodeData.children) {
        for (let child of nodeData.children) {
          child.parentId = nodeData.id;
        }
      }

      // construct the content of node
      let nodeDiv = document.createElement('div');

      delete nodeData.children;
      nodeDiv.dataset.source = JSON.stringify(nodeData);
      if (nodeData[opts.nodeId]) {
        nodeDiv.id = nodeData[opts.nodeId];
      }
      let inEdit = that.chart.dataset.inEdit,
        isHidden;

      if (inEdit) {
        isHidden = inEdit === 'addChildren' ? ' slide-up' : '';
      } else {
        isHidden = level >= opts.depth ? ' slide-up' : '';
      }
      nodeDiv.setAttribute('class', 'node ' + (nodeData.className || '') + isHidden);
      if (opts.draggable) {
        nodeDiv.setAttribute('draggable', true);
      }
      if (nodeData.parentId) {
        nodeDiv.setAttribute('data-parent', nodeData.parentId);
      }
      nodeDiv.innerHTML = `
        <div class="title">${nodeData[opts.nodeTitle]}</div>
        ${opts.nodeContent ? `<div class="content">${nodeData[opts.nodeContent]}</div>` : ''}
      `;
      // append 4 direction arrows or expand/collapse buttons
      let flags = nodeData.relationship || '';

      if (opts.verticalDepth && (level + 2) > opts.verticalDepth) {
        if ((level + 1) >= opts.verticalDepth && Number(flags.substr(2, 1))) {
          let toggleBtn = document.createElement('i'),
            icon = level + 1 >= opts.depth ? 'plus' : 'minus';

          toggleBtn.setAttribute('class', 'toggleBtn fa fa-' + icon + '-square');
          nodeDiv.appendChild(toggleBtn);
        }
      } else {
        if (Number(flags.substr(0, 1))) {
          let topEdge = document.createElement('i');

          topEdge.setAttribute('class', 'edge verticalEdge topEdge fa');
          nodeDiv.appendChild(topEdge);
        }
        if (Number(flags.substr(1, 1))) {
          let rightEdge = document.createElement('i'),
            leftEdge = document.createElement('i');

          rightEdge.setAttribute('class', 'edge horizontalEdge rightEdge fa');
          nodeDiv.appendChild(rightEdge);
          leftEdge.setAttribute('class', 'edge horizontalEdge leftEdge fa');
          nodeDiv.appendChild(leftEdge);
        }
        if (Number(flags.substr(2, 1))) {
          let bottomEdge = document.createElement('i'),
            symbol = document.createElement('i'),
            title = nodeDiv.querySelector(':scope > .title');

          bottomEdge.setAttribute('class', 'edge verticalEdge bottomEdge fa');
          nodeDiv.appendChild(bottomEdge);
          symbol.setAttribute('class', 'fa ' + opts.parentNodeSymbol + ' symbol');
          title.insertBefore(symbol, title.children[0]);
        }
      }

      nodeDiv.addEventListener('mouseenter', that._hoverNode.bind(that));
      nodeDiv.addEventListener('mouseleave', that._hoverNode.bind(that));
      nodeDiv.addEventListener('click', that._dispatchClickEvent.bind(that));
      if (opts.draggable) {
        nodeDiv.addEventListener('dragstart', that._onDragStart.bind(that));
        nodeDiv.addEventListener('dragover', that._onDragOver.bind(that));
        nodeDiv.addEventListener('dragend', that._onDragEnd.bind(that));
        nodeDiv.addEventListener('drop', that._onDrop.bind(that));
      }
      // allow user to append dom modification after finishing node create of orgchart
      if (opts.createNode) {
        opts.createNode(nodeDiv, nodeData);
      }

      resolve(nodeDiv);
    });
  }
  buildHierarchy(appendTo, nodeData, level, callback) {
    // Construct the node
    let that = this,
      opts = this.options,
      nodeWrapper,
      childNodes = nodeData.children,
      isVerticalNode = opts.verticalDepth && (level + 1) >= opts.verticalDepth;

    if (Object.keys(nodeData).length > 1) { // if nodeData has nested structure
      nodeWrapper = isVerticalNode ? appendTo : document.createElement('table');
      if (!isVerticalNode) {
        appendTo.appendChild(nodeWrapper);
      }
      this._createNode(nodeData, level)
      .then(function (nodeDiv) {
        if (isVerticalNode) {
          nodeWrapper.insertBefore(nodeDiv, nodeWrapper.firstChild);
        } else {
          let tr = document.createElement('tr');

          tr.innerHTML = `
            <td ${childNodes ? `colspan="${childNodes.length * 2}"` : ''}>
            </td>
          `;
          tr.children[0].appendChild(nodeDiv);
          nodeWrapper.insertBefore(tr, nodeWrapper.children[0] ? nodeWrapper.children[0] : null);
        }
        if (callback) {
          callback();
        }
      })
      .catch(function (err) {
        console.error('Failed to creat node', err);
      });
    }
    // Construct the inferior nodes and connectiong lines
    if (childNodes) {
      if (Object.keys(nodeData).length === 1) { // if nodeData is just an array
        nodeWrapper = appendTo;
      }
      let isHidden,
        isVerticalLayer = opts.verticalDepth && (level + 2) >= opts.verticalDepth,
        inEdit = that.chart.dataset.inEdit;

      if (inEdit) {
        isHidden = inEdit === 'addSiblings' ? '' : ' hidden';
      } else {
        isHidden = level + 1 >= opts.depth ? ' hidden' : '';
      }

      // draw the line close to parent node
      if (!isVerticalLayer) {
        let tr = document.createElement('tr');

        tr.setAttribute('class', 'lines' + isHidden);
        tr.innerHTML = `
          <td colspan="${ childNodes.length * 2 }">
            <div class="downLine"></div>
          </td>
        `;
        nodeWrapper.appendChild(tr);
      }
      // draw the lines close to children nodes
      let lineLayer = document.createElement('tr');

      lineLayer.setAttribute('class', 'lines' + isHidden);
      lineLayer.innerHTML = `
        <td class="rightLine">&nbsp;</td>
        ${childNodes.slice(1).map(() => `
          <td class="leftLine topLine">&nbsp;</td>
          <td class="rightLine topLine">&nbsp;</td>
          `).join('')}
        <td class="leftLine">&nbsp;</td>
      `;
      let nodeLayer;

      if (isVerticalLayer) {
        nodeLayer = document.createElement('ul');
        if (isHidden) {
          nodeLayer.classList.add(isHidden.trim());
        }
        if (level + 2 === opts.verticalDepth) {
          let tr = document.createElement('tr');

          tr.setAttribute('class', 'verticalNodes' + isHidden);
          tr.innerHTML = `<td></td>`;
          tr.firstChild.appendChild(nodeLayer);
          nodeWrapper.appendChild(tr);
        } else {
          nodeWrapper.appendChild(nodeLayer);
        }
      } else {
        nodeLayer = document.createElement('tr');
        nodeLayer.setAttribute('class', 'nodes' + isHidden);
        nodeWrapper.appendChild(lineLayer);
        nodeWrapper.appendChild(nodeLayer);
      }
      // recurse through children nodes
      childNodes.forEach((child) => {
        let nodeCell;

        if (isVerticalLayer) {
          nodeCell = document.createElement('li');
        } else {
          nodeCell = document.createElement('td');
          nodeCell.setAttribute('colspan', 2);
        }
        nodeLayer.appendChild(nodeCell);
        that.buildHierarchy(nodeCell, child, level + 1, callback);
      });
    }
  }
  _clickChart(event) {
    let closestNode = this._closest(event.target, function (el) {
      return el.classList && el.classList.contains('node');
    });

    if (!closestNode && this.chart.querySelector('.node.focused')) {
      this.chart.querySelector('.node.focused').classList.remove('focused');
    }
  }
  _clickExportButton() {
    let opts = this.options,
      chartContainer = this.chartContainer,
      mask = chartContainer.querySelector(':scope > .mask'),
      sourceChart = chartContainer.querySelector('.orgchart:not(.hidden)'),
      flag = opts.direction === 'l2r' || opts.direction === 'r2l';

    if (!mask) {
      mask = document.createElement('div');
      mask.setAttribute('class', 'mask');
      mask.innerHTML = `<i class="fa fa-circle-o-notch fa-spin spinner"></i>`;
      chartContainer.appendChild(mask);
    } else {
      mask.classList.remove('hidden');
    }
    chartContainer.classList.add('canvasContainer');
    window.html2canvas(sourceChart, {
      'width': flag ? sourceChart.clientHeight : sourceChart.clientWidth,
      'height': flag ? sourceChart.clientWidth : sourceChart.clientHeight,
      'onclone': function (cloneDoc) {
        let canvasContainer = cloneDoc.querySelector('.canvasContainer');

        canvasContainer.style.overflow = 'visible';
        canvasContainer.querySelector('.orgchart:not(.hidden)').transform = '';
      }
    })
    .then((canvas) => {
      let downloadBtn = chartContainer.querySelector('.oc-download-btn');

      chartContainer.querySelector('.mask').classList.add('hidden');
      downloadBtn.setAttribute('href', canvas.toDataURL());
      downloadBtn.click();
    })
    .catch((err) => {
      console.error('Failed to export the curent orgchart!', err);
    })
    .finally(() => {
      chartContainer.classList.remove('canvasContainer');
    });
  }
  _loopChart(chart) {
    let subObj = { 'id': chart.querySelector('.node').id };

    if (chart.children[3]) {
      Array.from(chart.children[3].children).forEach((el) => {
        if (!subObj.children) { subObj.children = []; }
        subObj.children.push(this._loopChart(el.firstChild));
      });
    }
    return subObj;
  }
  getHierarchy() {
    if (!this.chart.querySelector('.node').id) {
      return 'Error: Nodes of orghcart to be exported must have id attribute!';
    }
    return this._loopChart(this.chart.querySelector('table'));
  }
  _onPanStart(event) {
    let chart = event.currentTarget;

    if (this._closest(event.target, (el) => el.classList && el.classList.contains('node')) ||
      (event.touches && event.touches.length > 1)) {
      chart.dataset.panning = false;
      return;
    }
    chart.style.cursor = 'move';
    chart.dataset.panning = true;

    let lastX = 0,
      lastY = 0,
      lastTf = window.getComputedStyle(chart).transform;

    if (lastTf !== 'none') {
      let temp = lastTf.split(',');

      if (!lastTf.includes('3d')) {
        lastX = Number.parseInt(temp[4], 10);
        lastY = Number.parseInt(temp[5], 10);
      } else {
        lastX = Number.parseInt(temp[12], 10);
        lastY = Number.parseInt(temp[13], 10);
      }
    }
    let startX = 0,
      startY = 0;

    if (!event.targetTouches) { // pan on desktop
      startX = event.pageX - lastX;
      startY = event.pageY - lastY;
    } else if (event.targetTouches.length === 1) { // pan on mobile device
      startX = event.targetTouches[0].pageX - lastX;
      startY = event.targetTouches[0].pageY - lastY;
    } else if (event.targetTouches.length > 1) {
      return;
    }
    chart.dataset.panStart = JSON.stringify({ 'startX': startX, 'startY': startY });
    chart.addEventListener('mousemove', this._onPanning.bind(this));
    chart.addEventListener('touchmove', this._onPanning.bind(this));
  }
  _onPanning(event) {
    let chart = event.currentTarget;

    if (chart.dataset.panning === 'false') {
      return;
    }
    let newX = 0,
      newY = 0,
      panStart = JSON.parse(chart.dataset.panStart),
      startX = panStart.startX,
      startY = panStart.startY;

    if (!event.targetTouches) { // pand on desktop
      newX = event.pageX - startX;
      newY = event.pageY - startY;
    } else if (event.targetTouches.length === 1) { // pan on mobile device
      newX = event.targetTouches[0].pageX - startX;
      newY = event.targetTouches[0].pageY - startY;
    } else if (event.targetTouches.length > 1) {
      return;
    }
    let lastTf = window.getComputedStyle(chart).transform;

    if (lastTf === 'none') {
      if (!lastTf.includes('3d')) {
        chart.style.transform = 'matrix(1, 0, 0, 1, ' + newX + ', ' + newY + ')';
      } else {
        chart.style.transform = 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, ' + newX + ', ' + newY + ', 0, 1)';
      }
    } else {
      let matrix = lastTf.split(',');

      if (!lastTf.includes('3d')) {
        matrix[4] = newX;
        matrix[5] = newY + ')';
      } else {
        matrix[12] = newX;
        matrix[13] = newY;
      }
      chart.style.transform = matrix.join(',');
    }
  }
  _onPanEnd(event) {
    let chart = this.chart;

    if (chart.dataset.panning === 'true') {
      chart.dataset.panning = false;
      chart.style.cursor = 'default';
      document.body.removeEventListener('mousemove', this._onPanning);
      document.body.removeEventListener('touchmove', this._onPanning);
    }
  }
  _setChartScale(chart, newScale) {
    let lastTf = window.getComputedStyle(chart).transform;

    if (lastTf === 'none') {
      chart.style.transform = 'scale(' + newScale + ',' + newScale + ')';
    } else {
      let matrix = lastTf.split(',');

      if (!lastTf.includes('3d')) {
        matrix[0] = 'matrix(' + newScale;
        matrix[3] = newScale;
        chart.style.transform = lastTf + ' scale(' + newScale + ',' + newScale + ')';
      } else {
        chart.style.transform = lastTf + ' scale3d(' + newScale + ',' + newScale + ', 1)';
      }
    }
    chart.dataset.scale = newScale;
  }
  _onWheeling(event) {
    event.preventDefault();

    let newScale = event.deltaY > 0 ? 0.8 : 1.2;

    this._setChartScale(this.chart, newScale);
  }
  _getPinchDist(event) {
    return Math.sqrt((event.touches[0].clientX - event.touches[1].clientX) *
      (event.touches[0].clientX - event.touches[1].clientX) +
      (event.touches[0].clientY - event.touches[1].clientY) *
      (event.touches[0].clientY - event.touches[1].clientY));
  }
  _onTouchStart(event) {
    let chart = this.chart;

    if (event.touches && event.touches.length === 2) {
      let dist = this._getPinchDist(event);

      chart.dataset.pinching = true;
      chart.dataset.pinchDistStart = dist;
    }
  }
  _onTouchMove(event) {
    let chart = this.chart;

    if (chart.dataset.pinching) {
      let dist = this._getPinchDist(event);

      chart.dataset.pinchDistEnd = dist;
    }
  }
  _onTouchEnd(event) {
    let chart = this.chart;

    if (chart.dataset.pinching) {
      chart.dataset.pinching = false;
      let diff = chart.dataset.pinchDistEnd - chart.dataset.pinchDistStart;

      if (diff > 0) {
        this._setChartScale(chart, 1);
      } else if (diff < 0) {
        this._setChartScale(chart, -1);
      }
    }
  }
}

class OrgChartOverride extends OrgChart {
    constructor(...opts) {
        super(...opts);
    }
    _createNode(nodeData, level) {
        const promise = super._createNode(nodeData, level);
        return promise;
    }
    _buildJsonDS(li) {
        const built = super._buildJsonDS(li);
        return built;
    }
    showChildren(node) {
        const that = this, temp = this._nextAll(node.parentNode.parentNode), descendants = [];
        this._removeClass(temp, "hidden");
        if (temp.some((el) => el.classList.contains("verticalNodes"))) {
            Array.from(temp).forEach((el) => {
                var _a, _b;
                (_b = (_a = el.querySelector('ul.hidden')) === null || _a === void 0 ? void 0 : _a.classList) === null || _b === void 0 ? void 0 : _b.remove('hidden');
            });
            temp.forEach((el) => {
                Array.prototype.push.apply(descendants, Array.from(el.querySelectorAll(".node")).filter((el) => {
                    return that._isVisible(el);
                }));
            });
        }
        else {
            Array.from(temp[2].children).forEach((el) => {
                Array.prototype.push.apply(descendants, Array.from(el.querySelector("tr").querySelectorAll(".node")).filter((el) => {
                    return that._isVisible(el);
                }));
            });
        }
        this._repaint(descendants[0]);
        this._one(descendants[0], "transitionend", () => {
            this._removeClass(descendants, "slide");
            if (this._isInAction(node)) {
                this._switchVerticalArrow(node.querySelector(".bottomEdge"));
            }
        }, this);
        this._addClass(descendants, "slide");
        this._removeClass(descendants, "slide-up");
    }
}

var top = 'top';
var bottom = 'bottom';
var right = 'right';
var left = 'left';
var auto = 'auto';
var basePlacements = [top, bottom, right, left];
var start = 'start';
var end = 'end';
var clippingParents = 'clippingParents';
var viewport = 'viewport';
var popper = 'popper';
var reference = 'reference';
var variationPlacements = /*#__PURE__*/basePlacements.reduce(function (acc, placement) {
  return acc.concat([placement + "-" + start, placement + "-" + end]);
}, []);
var placements = /*#__PURE__*/[].concat(basePlacements, [auto]).reduce(function (acc, placement) {
  return acc.concat([placement, placement + "-" + start, placement + "-" + end]);
}, []); // modifiers that need to read the DOM

var beforeRead = 'beforeRead';
var read = 'read';
var afterRead = 'afterRead'; // pure-logic modifiers

var beforeMain = 'beforeMain';
var main = 'main';
var afterMain = 'afterMain'; // modifier with the purpose to write to the DOM (or write into a framework state)

var beforeWrite = 'beforeWrite';
var write = 'write';
var afterWrite = 'afterWrite';
var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];

function getNodeName(element) {
  return element ? (element.nodeName || '').toLowerCase() : null;
}

function getWindow(node) {
  if (node == null) {
    return window;
  }

  if (node.toString() !== '[object Window]') {
    var ownerDocument = node.ownerDocument;
    return ownerDocument ? ownerDocument.defaultView || window : window;
  }

  return node;
}

function isElement(node) {
  var OwnElement = getWindow(node).Element;
  return node instanceof OwnElement || node instanceof Element;
}

function isHTMLElement(node) {
  var OwnElement = getWindow(node).HTMLElement;
  return node instanceof OwnElement || node instanceof HTMLElement;
}

function isShadowRoot(node) {
  // IE 11 has no ShadowRoot
  if (typeof ShadowRoot === 'undefined') {
    return false;
  }

  var OwnElement = getWindow(node).ShadowRoot;
  return node instanceof OwnElement || node instanceof ShadowRoot;
}

// and applies them to the HTMLElements such as popper and arrow

function applyStyles(_ref) {
  var state = _ref.state;
  Object.keys(state.elements).forEach(function (name) {
    var style = state.styles[name] || {};
    var attributes = state.attributes[name] || {};
    var element = state.elements[name]; // arrow is optional + virtual elements

    if (!isHTMLElement(element) || !getNodeName(element)) {
      return;
    } // Flow doesn't support to extend this property, but it's the most
    // effective way to apply styles to an HTMLElement
    // $FlowFixMe[cannot-write]


    Object.assign(element.style, style);
    Object.keys(attributes).forEach(function (name) {
      var value = attributes[name];

      if (value === false) {
        element.removeAttribute(name);
      } else {
        element.setAttribute(name, value === true ? '' : value);
      }
    });
  });
}

function effect$2(_ref2) {
  var state = _ref2.state;
  var initialStyles = {
    popper: {
      position: state.options.strategy,
      left: '0',
      top: '0',
      margin: '0'
    },
    arrow: {
      position: 'absolute'
    },
    reference: {}
  };
  Object.assign(state.elements.popper.style, initialStyles.popper);
  state.styles = initialStyles;

  if (state.elements.arrow) {
    Object.assign(state.elements.arrow.style, initialStyles.arrow);
  }

  return function () {
    Object.keys(state.elements).forEach(function (name) {
      var element = state.elements[name];
      var attributes = state.attributes[name] || {};
      var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]); // Set all values to an empty string to unset them

      var style = styleProperties.reduce(function (style, property) {
        style[property] = '';
        return style;
      }, {}); // arrow is optional + virtual elements

      if (!isHTMLElement(element) || !getNodeName(element)) {
        return;
      }

      Object.assign(element.style, style);
      Object.keys(attributes).forEach(function (attribute) {
        element.removeAttribute(attribute);
      });
    });
  };
} // eslint-disable-next-line import/no-unused-modules


var applyStyles$1 = {
  name: 'applyStyles',
  enabled: true,
  phase: 'write',
  fn: applyStyles,
  effect: effect$2,
  requires: ['computeStyles']
};

function getBasePlacement(placement) {
  return placement.split('-')[0];
}

var max = Math.max;
var min = Math.min;
var round = Math.round;

function getUAString() {
  var uaData = navigator.userAgentData;

  if (uaData != null && uaData.brands && Array.isArray(uaData.brands)) {
    return uaData.brands.map(function (item) {
      return item.brand + "/" + item.version;
    }).join(' ');
  }

  return navigator.userAgent;
}

function isLayoutViewport() {
  return !/^((?!chrome|android).)*safari/i.test(getUAString());
}

function getBoundingClientRect(element, includeScale, isFixedStrategy) {
  if (includeScale === void 0) {
    includeScale = false;
  }

  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }

  var clientRect = element.getBoundingClientRect();
  var scaleX = 1;
  var scaleY = 1;

  if (includeScale && isHTMLElement(element)) {
    scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
    scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
  }

  var _ref = isElement(element) ? getWindow(element) : window,
      visualViewport = _ref.visualViewport;

  var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
  var x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
  var y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
  var width = clientRect.width / scaleX;
  var height = clientRect.height / scaleY;
  return {
    width: width,
    height: height,
    top: y,
    right: x + width,
    bottom: y + height,
    left: x,
    x: x,
    y: y
  };
}

// means it doesn't take into account transforms.

function getLayoutRect(element) {
  var clientRect = getBoundingClientRect(element); // Use the clientRect sizes if it's not been transformed.
  // Fixes https://github.com/popperjs/popper-core/issues/1223

  var width = element.offsetWidth;
  var height = element.offsetHeight;

  if (Math.abs(clientRect.width - width) <= 1) {
    width = clientRect.width;
  }

  if (Math.abs(clientRect.height - height) <= 1) {
    height = clientRect.height;
  }

  return {
    x: element.offsetLeft,
    y: element.offsetTop,
    width: width,
    height: height
  };
}

function contains(parent, child) {
  var rootNode = child.getRootNode && child.getRootNode(); // First, attempt with faster native method

  if (parent.contains(child)) {
    return true;
  } // then fallback to custom implementation with Shadow DOM support
  else if (rootNode && isShadowRoot(rootNode)) {
      var next = child;

      do {
        if (next && parent.isSameNode(next)) {
          return true;
        } // $FlowFixMe[prop-missing]: need a better way to handle this...


        next = next.parentNode || next.host;
      } while (next);
    } // Give up, the result is false


  return false;
}

function getComputedStyle(element) {
  return getWindow(element).getComputedStyle(element);
}

function isTableElement(element) {
  return ['table', 'td', 'th'].indexOf(getNodeName(element)) >= 0;
}

function getDocumentElement(element) {
  // $FlowFixMe[incompatible-return]: assume body is always available
  return ((isElement(element) ? element.ownerDocument : // $FlowFixMe[prop-missing]
  element.document) || window.document).documentElement;
}

function getParentNode(element) {
  if (getNodeName(element) === 'html') {
    return element;
  }

  return (// this is a quicker (but less type safe) way to save quite some bytes from the bundle
    // $FlowFixMe[incompatible-return]
    // $FlowFixMe[prop-missing]
    element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
    element.parentNode || ( // DOM Element detected
    isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
    // $FlowFixMe[incompatible-call]: HTMLElement is a Node
    getDocumentElement(element) // fallback

  );
}

function getTrueOffsetParent(element) {
  if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
  getComputedStyle(element).position === 'fixed') {
    return null;
  }

  return element.offsetParent;
} // `.offsetParent` reports `null` for fixed elements, while absolute elements
// return the containing block


function getContainingBlock(element) {
  var isFirefox = /firefox/i.test(getUAString());
  var isIE = /Trident/i.test(getUAString());

  if (isIE && isHTMLElement(element)) {
    // In IE 9, 10 and 11 fixed elements containing block is always established by the viewport
    var elementCss = getComputedStyle(element);

    if (elementCss.position === 'fixed') {
      return null;
    }
  }

  var currentNode = getParentNode(element);

  if (isShadowRoot(currentNode)) {
    currentNode = currentNode.host;
  }

  while (isHTMLElement(currentNode) && ['html', 'body'].indexOf(getNodeName(currentNode)) < 0) {
    var css = getComputedStyle(currentNode); // This is non-exhaustive but covers the most common CSS properties that
    // create a containing block.
    // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block

    if (css.transform !== 'none' || css.perspective !== 'none' || css.contain === 'paint' || ['transform', 'perspective'].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === 'filter' || isFirefox && css.filter && css.filter !== 'none') {
      return currentNode;
    } else {
      currentNode = currentNode.parentNode;
    }
  }

  return null;
} // Gets the closest ancestor positioned element. Handles some edge cases,
// such as table ancestors and cross browser bugs.


function getOffsetParent(element) {
  var window = getWindow(element);
  var offsetParent = getTrueOffsetParent(element);

  while (offsetParent && isTableElement(offsetParent) && getComputedStyle(offsetParent).position === 'static') {
    offsetParent = getTrueOffsetParent(offsetParent);
  }

  if (offsetParent && (getNodeName(offsetParent) === 'html' || getNodeName(offsetParent) === 'body' && getComputedStyle(offsetParent).position === 'static')) {
    return window;
  }

  return offsetParent || getContainingBlock(element) || window;
}

function getMainAxisFromPlacement(placement) {
  return ['top', 'bottom'].indexOf(placement) >= 0 ? 'x' : 'y';
}

function within(min$1, value, max$1) {
  return max(min$1, min(value, max$1));
}
function withinMaxClamp(min, value, max) {
  var v = within(min, value, max);
  return v > max ? max : v;
}

function getFreshSideObject() {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
}

function mergePaddingObject(paddingObject) {
  return Object.assign({}, getFreshSideObject(), paddingObject);
}

function expandToHashMap(value, keys) {
  return keys.reduce(function (hashMap, key) {
    hashMap[key] = value;
    return hashMap;
  }, {});
}

var toPaddingObject = function toPaddingObject(padding, state) {
  padding = typeof padding === 'function' ? padding(Object.assign({}, state.rects, {
    placement: state.placement
  })) : padding;
  return mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
};

function arrow(_ref) {
  var _state$modifiersData$;

  var state = _ref.state,
      name = _ref.name,
      options = _ref.options;
  var arrowElement = state.elements.arrow;
  var popperOffsets = state.modifiersData.popperOffsets;
  var basePlacement = getBasePlacement(state.placement);
  var axis = getMainAxisFromPlacement(basePlacement);
  var isVertical = [left, right].indexOf(basePlacement) >= 0;
  var len = isVertical ? 'height' : 'width';

  if (!arrowElement || !popperOffsets) {
    return;
  }

  var paddingObject = toPaddingObject(options.padding, state);
  var arrowRect = getLayoutRect(arrowElement);
  var minProp = axis === 'y' ? top : left;
  var maxProp = axis === 'y' ? bottom : right;
  var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets[axis] - state.rects.popper[len];
  var startDiff = popperOffsets[axis] - state.rects.reference[axis];
  var arrowOffsetParent = getOffsetParent(arrowElement);
  var clientSize = arrowOffsetParent ? axis === 'y' ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
  var centerToReference = endDiff / 2 - startDiff / 2; // Make sure the arrow doesn't overflow the popper if the center point is
  // outside of the popper bounds

  var min = paddingObject[minProp];
  var max = clientSize - arrowRect[len] - paddingObject[maxProp];
  var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
  var offset = within(min, center, max); // Prevents breaking syntax highlighting...

  var axisProp = axis;
  state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset, _state$modifiersData$.centerOffset = offset - center, _state$modifiersData$);
}

function effect$1(_ref2) {
  var state = _ref2.state,
      options = _ref2.options;
  var _options$element = options.element,
      arrowElement = _options$element === void 0 ? '[data-popper-arrow]' : _options$element;

  if (arrowElement == null) {
    return;
  } // CSS selector


  if (typeof arrowElement === 'string') {
    arrowElement = state.elements.popper.querySelector(arrowElement);

    if (!arrowElement) {
      return;
    }
  }

  if (!contains(state.elements.popper, arrowElement)) {
    return;
  }

  state.elements.arrow = arrowElement;
} // eslint-disable-next-line import/no-unused-modules


var arrow$1 = {
  name: 'arrow',
  enabled: true,
  phase: 'main',
  fn: arrow,
  effect: effect$1,
  requires: ['popperOffsets'],
  requiresIfExists: ['preventOverflow']
};

function getVariation(placement) {
  return placement.split('-')[1];
}

var unsetSides = {
  top: 'auto',
  right: 'auto',
  bottom: 'auto',
  left: 'auto'
}; // Round the offsets to the nearest suitable subpixel based on the DPR.
// Zooming can change the DPR, but it seems to report a value that will
// cleanly divide the values into the appropriate subpixels.

function roundOffsetsByDPR(_ref, win) {
  var x = _ref.x,
      y = _ref.y;
  var dpr = win.devicePixelRatio || 1;
  return {
    x: round(x * dpr) / dpr || 0,
    y: round(y * dpr) / dpr || 0
  };
}

function mapToStyles(_ref2) {
  var _Object$assign2;

  var popper = _ref2.popper,
      popperRect = _ref2.popperRect,
      placement = _ref2.placement,
      variation = _ref2.variation,
      offsets = _ref2.offsets,
      position = _ref2.position,
      gpuAcceleration = _ref2.gpuAcceleration,
      adaptive = _ref2.adaptive,
      roundOffsets = _ref2.roundOffsets,
      isFixed = _ref2.isFixed;
  var _offsets$x = offsets.x,
      x = _offsets$x === void 0 ? 0 : _offsets$x,
      _offsets$y = offsets.y,
      y = _offsets$y === void 0 ? 0 : _offsets$y;

  var _ref3 = typeof roundOffsets === 'function' ? roundOffsets({
    x: x,
    y: y
  }) : {
    x: x,
    y: y
  };

  x = _ref3.x;
  y = _ref3.y;
  var hasX = offsets.hasOwnProperty('x');
  var hasY = offsets.hasOwnProperty('y');
  var sideX = left;
  var sideY = top;
  var win = window;

  if (adaptive) {
    var offsetParent = getOffsetParent(popper);
    var heightProp = 'clientHeight';
    var widthProp = 'clientWidth';

    if (offsetParent === getWindow(popper)) {
      offsetParent = getDocumentElement(popper);

      if (getComputedStyle(offsetParent).position !== 'static' && position === 'absolute') {
        heightProp = 'scrollHeight';
        widthProp = 'scrollWidth';
      }
    } // $FlowFixMe[incompatible-cast]: force type refinement, we compare offsetParent with window above, but Flow doesn't detect it


    offsetParent = offsetParent;

    if (placement === top || (placement === left || placement === right) && variation === end) {
      sideY = bottom;
      var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : // $FlowFixMe[prop-missing]
      offsetParent[heightProp];
      y -= offsetY - popperRect.height;
      y *= gpuAcceleration ? 1 : -1;
    }

    if (placement === left || (placement === top || placement === bottom) && variation === end) {
      sideX = right;
      var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : // $FlowFixMe[prop-missing]
      offsetParent[widthProp];
      x -= offsetX - popperRect.width;
      x *= gpuAcceleration ? 1 : -1;
    }
  }

  var commonStyles = Object.assign({
    position: position
  }, adaptive && unsetSides);

  var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
    x: x,
    y: y
  }, getWindow(popper)) : {
    x: x,
    y: y
  };

  x = _ref4.x;
  y = _ref4.y;

  if (gpuAcceleration) {
    var _Object$assign;

    return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? '0' : '', _Object$assign[sideX] = hasX ? '0' : '', _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
  }

  return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : '', _Object$assign2[sideX] = hasX ? x + "px" : '', _Object$assign2.transform = '', _Object$assign2));
}

function computeStyles(_ref5) {
  var state = _ref5.state,
      options = _ref5.options;
  var _options$gpuAccelerat = options.gpuAcceleration,
      gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat,
      _options$adaptive = options.adaptive,
      adaptive = _options$adaptive === void 0 ? true : _options$adaptive,
      _options$roundOffsets = options.roundOffsets,
      roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
  var commonStyles = {
    placement: getBasePlacement(state.placement),
    variation: getVariation(state.placement),
    popper: state.elements.popper,
    popperRect: state.rects.popper,
    gpuAcceleration: gpuAcceleration,
    isFixed: state.options.strategy === 'fixed'
  };

  if (state.modifiersData.popperOffsets != null) {
    state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.popperOffsets,
      position: state.options.strategy,
      adaptive: adaptive,
      roundOffsets: roundOffsets
    })));
  }

  if (state.modifiersData.arrow != null) {
    state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.arrow,
      position: 'absolute',
      adaptive: false,
      roundOffsets: roundOffsets
    })));
  }

  state.attributes.popper = Object.assign({}, state.attributes.popper, {
    'data-popper-placement': state.placement
  });
} // eslint-disable-next-line import/no-unused-modules


var computeStyles$1 = {
  name: 'computeStyles',
  enabled: true,
  phase: 'beforeWrite',
  fn: computeStyles,
  data: {}
};

var passive = {
  passive: true
};

function effect(_ref) {
  var state = _ref.state,
      instance = _ref.instance,
      options = _ref.options;
  var _options$scroll = options.scroll,
      scroll = _options$scroll === void 0 ? true : _options$scroll,
      _options$resize = options.resize,
      resize = _options$resize === void 0 ? true : _options$resize;
  var window = getWindow(state.elements.popper);
  var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);

  if (scroll) {
    scrollParents.forEach(function (scrollParent) {
      scrollParent.addEventListener('scroll', instance.update, passive);
    });
  }

  if (resize) {
    window.addEventListener('resize', instance.update, passive);
  }

  return function () {
    if (scroll) {
      scrollParents.forEach(function (scrollParent) {
        scrollParent.removeEventListener('scroll', instance.update, passive);
      });
    }

    if (resize) {
      window.removeEventListener('resize', instance.update, passive);
    }
  };
} // eslint-disable-next-line import/no-unused-modules


var eventListeners = {
  name: 'eventListeners',
  enabled: true,
  phase: 'write',
  fn: function fn() {},
  effect: effect,
  data: {}
};

var hash$1 = {
  left: 'right',
  right: 'left',
  bottom: 'top',
  top: 'bottom'
};
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, function (matched) {
    return hash$1[matched];
  });
}

var hash = {
  start: 'end',
  end: 'start'
};
function getOppositeVariationPlacement(placement) {
  return placement.replace(/start|end/g, function (matched) {
    return hash[matched];
  });
}

function getWindowScroll(node) {
  var win = getWindow(node);
  var scrollLeft = win.pageXOffset;
  var scrollTop = win.pageYOffset;
  return {
    scrollLeft: scrollLeft,
    scrollTop: scrollTop
  };
}

function getWindowScrollBarX(element) {
  // If <html> has a CSS width greater than the viewport, then this will be
  // incorrect for RTL.
  // Popper 1 is broken in this case and never had a bug report so let's assume
  // it's not an issue. I don't think anyone ever specifies width on <html>
  // anyway.
  // Browsers where the left scrollbar doesn't cause an issue report `0` for
  // this (e.g. Edge 2019, IE11, Safari)
  return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
}

function getViewportRect(element, strategy) {
  var win = getWindow(element);
  var html = getDocumentElement(element);
  var visualViewport = win.visualViewport;
  var width = html.clientWidth;
  var height = html.clientHeight;
  var x = 0;
  var y = 0;

  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    var layoutViewport = isLayoutViewport();

    if (layoutViewport || !layoutViewport && strategy === 'fixed') {
      x = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }

  return {
    width: width,
    height: height,
    x: x + getWindowScrollBarX(element),
    y: y
  };
}

// of the `<html>` and `<body>` rect bounds if horizontally scrollable

function getDocumentRect(element) {
  var _element$ownerDocumen;

  var html = getDocumentElement(element);
  var winScroll = getWindowScroll(element);
  var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
  var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
  var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
  var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
  var y = -winScroll.scrollTop;

  if (getComputedStyle(body || html).direction === 'rtl') {
    x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
  }

  return {
    width: width,
    height: height,
    x: x,
    y: y
  };
}

function isScrollParent(element) {
  // Firefox wants us to check `-x` and `-y` variations as well
  var _getComputedStyle = getComputedStyle(element),
      overflow = _getComputedStyle.overflow,
      overflowX = _getComputedStyle.overflowX,
      overflowY = _getComputedStyle.overflowY;

  return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
}

function getScrollParent(node) {
  if (['html', 'body', '#document'].indexOf(getNodeName(node)) >= 0) {
    // $FlowFixMe[incompatible-return]: assume body is always available
    return node.ownerDocument.body;
  }

  if (isHTMLElement(node) && isScrollParent(node)) {
    return node;
  }

  return getScrollParent(getParentNode(node));
}

/*
given a DOM element, return the list of all scroll parents, up the list of ancesors
until we get to the top window object. This list is what we attach scroll listeners
to, because if any of these parent elements scroll, we'll need to re-calculate the
reference element's position.
*/

function listScrollParents(element, list) {
  var _element$ownerDocumen;

  if (list === void 0) {
    list = [];
  }

  var scrollParent = getScrollParent(element);
  var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
  var win = getWindow(scrollParent);
  var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
  var updatedList = list.concat(target);
  return isBody ? updatedList : // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
  updatedList.concat(listScrollParents(getParentNode(target)));
}

function rectToClientRect(rect) {
  return Object.assign({}, rect, {
    left: rect.x,
    top: rect.y,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height
  });
}

function getInnerBoundingClientRect(element, strategy) {
  var rect = getBoundingClientRect(element, false, strategy === 'fixed');
  rect.top = rect.top + element.clientTop;
  rect.left = rect.left + element.clientLeft;
  rect.bottom = rect.top + element.clientHeight;
  rect.right = rect.left + element.clientWidth;
  rect.width = element.clientWidth;
  rect.height = element.clientHeight;
  rect.x = rect.left;
  rect.y = rect.top;
  return rect;
}

function getClientRectFromMixedType(element, clippingParent, strategy) {
  return clippingParent === viewport ? rectToClientRect(getViewportRect(element, strategy)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
} // A "clipping parent" is an overflowable container with the characteristic of
// clipping (or hiding) overflowing elements with a position different from
// `initial`


function getClippingParents(element) {
  var clippingParents = listScrollParents(getParentNode(element));
  var canEscapeClipping = ['absolute', 'fixed'].indexOf(getComputedStyle(element).position) >= 0;
  var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;

  if (!isElement(clipperElement)) {
    return [];
  } // $FlowFixMe[incompatible-return]: https://github.com/facebook/flow/issues/1414


  return clippingParents.filter(function (clippingParent) {
    return isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== 'body';
  });
} // Gets the maximum area that the element is visible in due to any number of
// clipping parents


function getClippingRect(element, boundary, rootBoundary, strategy) {
  var mainClippingParents = boundary === 'clippingParents' ? getClippingParents(element) : [].concat(boundary);
  var clippingParents = [].concat(mainClippingParents, [rootBoundary]);
  var firstClippingParent = clippingParents[0];
  var clippingRect = clippingParents.reduce(function (accRect, clippingParent) {
    var rect = getClientRectFromMixedType(element, clippingParent, strategy);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromMixedType(element, firstClippingParent, strategy));
  clippingRect.width = clippingRect.right - clippingRect.left;
  clippingRect.height = clippingRect.bottom - clippingRect.top;
  clippingRect.x = clippingRect.left;
  clippingRect.y = clippingRect.top;
  return clippingRect;
}

function computeOffsets(_ref) {
  var reference = _ref.reference,
      element = _ref.element,
      placement = _ref.placement;
  var basePlacement = placement ? getBasePlacement(placement) : null;
  var variation = placement ? getVariation(placement) : null;
  var commonX = reference.x + reference.width / 2 - element.width / 2;
  var commonY = reference.y + reference.height / 2 - element.height / 2;
  var offsets;

  switch (basePlacement) {
    case top:
      offsets = {
        x: commonX,
        y: reference.y - element.height
      };
      break;

    case bottom:
      offsets = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;

    case right:
      offsets = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;

    case left:
      offsets = {
        x: reference.x - element.width,
        y: commonY
      };
      break;

    default:
      offsets = {
        x: reference.x,
        y: reference.y
      };
  }

  var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;

  if (mainAxis != null) {
    var len = mainAxis === 'y' ? 'height' : 'width';

    switch (variation) {
      case start:
        offsets[mainAxis] = offsets[mainAxis] - (reference[len] / 2 - element[len] / 2);
        break;

      case end:
        offsets[mainAxis] = offsets[mainAxis] + (reference[len] / 2 - element[len] / 2);
        break;
    }
  }

  return offsets;
}

function detectOverflow(state, options) {
  if (options === void 0) {
    options = {};
  }

  var _options = options,
      _options$placement = _options.placement,
      placement = _options$placement === void 0 ? state.placement : _options$placement,
      _options$strategy = _options.strategy,
      strategy = _options$strategy === void 0 ? state.strategy : _options$strategy,
      _options$boundary = _options.boundary,
      boundary = _options$boundary === void 0 ? clippingParents : _options$boundary,
      _options$rootBoundary = _options.rootBoundary,
      rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary,
      _options$elementConte = _options.elementContext,
      elementContext = _options$elementConte === void 0 ? popper : _options$elementConte,
      _options$altBoundary = _options.altBoundary,
      altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary,
      _options$padding = _options.padding,
      padding = _options$padding === void 0 ? 0 : _options$padding;
  var paddingObject = mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
  var altContext = elementContext === popper ? reference : popper;
  var popperRect = state.rects.popper;
  var element = state.elements[altBoundary ? altContext : elementContext];
  var clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary, strategy);
  var referenceClientRect = getBoundingClientRect(state.elements.reference);
  var popperOffsets = computeOffsets({
    reference: referenceClientRect,
    element: popperRect,
    strategy: 'absolute',
    placement: placement
  });
  var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets));
  var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect; // positive = overflowing the clipping rect
  // 0 or negative = within the clipping rect

  var overflowOffsets = {
    top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
    bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
    left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
    right: elementClientRect.right - clippingClientRect.right + paddingObject.right
  };
  var offsetData = state.modifiersData.offset; // Offsets can be applied only to the popper element

  if (elementContext === popper && offsetData) {
    var offset = offsetData[placement];
    Object.keys(overflowOffsets).forEach(function (key) {
      var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
      var axis = [top, bottom].indexOf(key) >= 0 ? 'y' : 'x';
      overflowOffsets[key] += offset[axis] * multiply;
    });
  }

  return overflowOffsets;
}

function computeAutoPlacement(state, options) {
  if (options === void 0) {
    options = {};
  }

  var _options = options,
      placement = _options.placement,
      boundary = _options.boundary,
      rootBoundary = _options.rootBoundary,
      padding = _options.padding,
      flipVariations = _options.flipVariations,
      _options$allowedAutoP = _options.allowedAutoPlacements,
      allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
  var variation = getVariation(placement);
  var placements$1 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function (placement) {
    return getVariation(placement) === variation;
  }) : basePlacements;
  var allowedPlacements = placements$1.filter(function (placement) {
    return allowedAutoPlacements.indexOf(placement) >= 0;
  });

  if (allowedPlacements.length === 0) {
    allowedPlacements = placements$1;
  } // $FlowFixMe[incompatible-type]: Flow seems to have problems with two array unions...


  var overflows = allowedPlacements.reduce(function (acc, placement) {
    acc[placement] = detectOverflow(state, {
      placement: placement,
      boundary: boundary,
      rootBoundary: rootBoundary,
      padding: padding
    })[getBasePlacement(placement)];
    return acc;
  }, {});
  return Object.keys(overflows).sort(function (a, b) {
    return overflows[a] - overflows[b];
  });
}

function getExpandedFallbackPlacements(placement) {
  if (getBasePlacement(placement) === auto) {
    return [];
  }

  var oppositePlacement = getOppositePlacement(placement);
  return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
}

function flip(_ref) {
  var state = _ref.state,
      options = _ref.options,
      name = _ref.name;

  if (state.modifiersData[name]._skip) {
    return;
  }

  var _options$mainAxis = options.mainAxis,
      checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
      _options$altAxis = options.altAxis,
      checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis,
      specifiedFallbackPlacements = options.fallbackPlacements,
      padding = options.padding,
      boundary = options.boundary,
      rootBoundary = options.rootBoundary,
      altBoundary = options.altBoundary,
      _options$flipVariatio = options.flipVariations,
      flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio,
      allowedAutoPlacements = options.allowedAutoPlacements;
  var preferredPlacement = state.options.placement;
  var basePlacement = getBasePlacement(preferredPlacement);
  var isBasePlacement = basePlacement === preferredPlacement;
  var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
  var placements = [preferredPlacement].concat(fallbackPlacements).reduce(function (acc, placement) {
    return acc.concat(getBasePlacement(placement) === auto ? computeAutoPlacement(state, {
      placement: placement,
      boundary: boundary,
      rootBoundary: rootBoundary,
      padding: padding,
      flipVariations: flipVariations,
      allowedAutoPlacements: allowedAutoPlacements
    }) : placement);
  }, []);
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var checksMap = new Map();
  var makeFallbackChecks = true;
  var firstFittingPlacement = placements[0];

  for (var i = 0; i < placements.length; i++) {
    var placement = placements[i];

    var _basePlacement = getBasePlacement(placement);

    var isStartVariation = getVariation(placement) === start;
    var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
    var len = isVertical ? 'width' : 'height';
    var overflow = detectOverflow(state, {
      placement: placement,
      boundary: boundary,
      rootBoundary: rootBoundary,
      altBoundary: altBoundary,
      padding: padding
    });
    var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;

    if (referenceRect[len] > popperRect[len]) {
      mainVariationSide = getOppositePlacement(mainVariationSide);
    }

    var altVariationSide = getOppositePlacement(mainVariationSide);
    var checks = [];

    if (checkMainAxis) {
      checks.push(overflow[_basePlacement] <= 0);
    }

    if (checkAltAxis) {
      checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
    }

    if (checks.every(function (check) {
      return check;
    })) {
      firstFittingPlacement = placement;
      makeFallbackChecks = false;
      break;
    }

    checksMap.set(placement, checks);
  }

  if (makeFallbackChecks) {
    // `2` may be desired in some cases – research later
    var numberOfChecks = flipVariations ? 3 : 1;

    var _loop = function _loop(_i) {
      var fittingPlacement = placements.find(function (placement) {
        var checks = checksMap.get(placement);

        if (checks) {
          return checks.slice(0, _i).every(function (check) {
            return check;
          });
        }
      });

      if (fittingPlacement) {
        firstFittingPlacement = fittingPlacement;
        return "break";
      }
    };

    for (var _i = numberOfChecks; _i > 0; _i--) {
      var _ret = _loop(_i);

      if (_ret === "break") break;
    }
  }

  if (state.placement !== firstFittingPlacement) {
    state.modifiersData[name]._skip = true;
    state.placement = firstFittingPlacement;
    state.reset = true;
  }
} // eslint-disable-next-line import/no-unused-modules


var flip$1 = {
  name: 'flip',
  enabled: true,
  phase: 'main',
  fn: flip,
  requiresIfExists: ['offset'],
  data: {
    _skip: false
  }
};

function getSideOffsets(overflow, rect, preventedOffsets) {
  if (preventedOffsets === void 0) {
    preventedOffsets = {
      x: 0,
      y: 0
    };
  }

  return {
    top: overflow.top - rect.height - preventedOffsets.y,
    right: overflow.right - rect.width + preventedOffsets.x,
    bottom: overflow.bottom - rect.height + preventedOffsets.y,
    left: overflow.left - rect.width - preventedOffsets.x
  };
}

function isAnySideFullyClipped(overflow) {
  return [top, right, bottom, left].some(function (side) {
    return overflow[side] >= 0;
  });
}

function hide(_ref) {
  var state = _ref.state,
      name = _ref.name;
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var preventedOffsets = state.modifiersData.preventOverflow;
  var referenceOverflow = detectOverflow(state, {
    elementContext: 'reference'
  });
  var popperAltOverflow = detectOverflow(state, {
    altBoundary: true
  });
  var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
  var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
  var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
  var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
  state.modifiersData[name] = {
    referenceClippingOffsets: referenceClippingOffsets,
    popperEscapeOffsets: popperEscapeOffsets,
    isReferenceHidden: isReferenceHidden,
    hasPopperEscaped: hasPopperEscaped
  };
  state.attributes.popper = Object.assign({}, state.attributes.popper, {
    'data-popper-reference-hidden': isReferenceHidden,
    'data-popper-escaped': hasPopperEscaped
  });
} // eslint-disable-next-line import/no-unused-modules


var hide$1 = {
  name: 'hide',
  enabled: true,
  phase: 'main',
  requiresIfExists: ['preventOverflow'],
  fn: hide
};

function distanceAndSkiddingToXY(placement, rects, offset) {
  var basePlacement = getBasePlacement(placement);
  var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;

  var _ref = typeof offset === 'function' ? offset(Object.assign({}, rects, {
    placement: placement
  })) : offset,
      skidding = _ref[0],
      distance = _ref[1];

  skidding = skidding || 0;
  distance = (distance || 0) * invertDistance;
  return [left, right].indexOf(basePlacement) >= 0 ? {
    x: distance,
    y: skidding
  } : {
    x: skidding,
    y: distance
  };
}

function offset(_ref2) {
  var state = _ref2.state,
      options = _ref2.options,
      name = _ref2.name;
  var _options$offset = options.offset,
      offset = _options$offset === void 0 ? [0, 0] : _options$offset;
  var data = placements.reduce(function (acc, placement) {
    acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset);
    return acc;
  }, {});
  var _data$state$placement = data[state.placement],
      x = _data$state$placement.x,
      y = _data$state$placement.y;

  if (state.modifiersData.popperOffsets != null) {
    state.modifiersData.popperOffsets.x += x;
    state.modifiersData.popperOffsets.y += y;
  }

  state.modifiersData[name] = data;
} // eslint-disable-next-line import/no-unused-modules


var offset$1 = {
  name: 'offset',
  enabled: true,
  phase: 'main',
  requires: ['popperOffsets'],
  fn: offset
};

function popperOffsets(_ref) {
  var state = _ref.state,
      name = _ref.name;
  // Offsets are the actual position the popper needs to have to be
  // properly positioned near its reference element
  // This is the most basic placement, and will be adjusted by
  // the modifiers in the next step
  state.modifiersData[name] = computeOffsets({
    reference: state.rects.reference,
    element: state.rects.popper,
    strategy: 'absolute',
    placement: state.placement
  });
} // eslint-disable-next-line import/no-unused-modules


var popperOffsets$1 = {
  name: 'popperOffsets',
  enabled: true,
  phase: 'read',
  fn: popperOffsets,
  data: {}
};

function getAltAxis(axis) {
  return axis === 'x' ? 'y' : 'x';
}

function preventOverflow(_ref) {
  var state = _ref.state,
      options = _ref.options,
      name = _ref.name;
  var _options$mainAxis = options.mainAxis,
      checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
      _options$altAxis = options.altAxis,
      checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis,
      boundary = options.boundary,
      rootBoundary = options.rootBoundary,
      altBoundary = options.altBoundary,
      padding = options.padding,
      _options$tether = options.tether,
      tether = _options$tether === void 0 ? true : _options$tether,
      _options$tetherOffset = options.tetherOffset,
      tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
  var overflow = detectOverflow(state, {
    boundary: boundary,
    rootBoundary: rootBoundary,
    padding: padding,
    altBoundary: altBoundary
  });
  var basePlacement = getBasePlacement(state.placement);
  var variation = getVariation(state.placement);
  var isBasePlacement = !variation;
  var mainAxis = getMainAxisFromPlacement(basePlacement);
  var altAxis = getAltAxis(mainAxis);
  var popperOffsets = state.modifiersData.popperOffsets;
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var tetherOffsetValue = typeof tetherOffset === 'function' ? tetherOffset(Object.assign({}, state.rects, {
    placement: state.placement
  })) : tetherOffset;
  var normalizedTetherOffsetValue = typeof tetherOffsetValue === 'number' ? {
    mainAxis: tetherOffsetValue,
    altAxis: tetherOffsetValue
  } : Object.assign({
    mainAxis: 0,
    altAxis: 0
  }, tetherOffsetValue);
  var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
  var data = {
    x: 0,
    y: 0
  };

  if (!popperOffsets) {
    return;
  }

  if (checkMainAxis) {
    var _offsetModifierState$;

    var mainSide = mainAxis === 'y' ? top : left;
    var altSide = mainAxis === 'y' ? bottom : right;
    var len = mainAxis === 'y' ? 'height' : 'width';
    var offset = popperOffsets[mainAxis];
    var min$1 = offset + overflow[mainSide];
    var max$1 = offset - overflow[altSide];
    var additive = tether ? -popperRect[len] / 2 : 0;
    var minLen = variation === start ? referenceRect[len] : popperRect[len];
    var maxLen = variation === start ? -popperRect[len] : -referenceRect[len]; // We need to include the arrow in the calculation so the arrow doesn't go
    // outside the reference bounds

    var arrowElement = state.elements.arrow;
    var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
      width: 0,
      height: 0
    };
    var arrowPaddingObject = state.modifiersData['arrow#persistent'] ? state.modifiersData['arrow#persistent'].padding : getFreshSideObject();
    var arrowPaddingMin = arrowPaddingObject[mainSide];
    var arrowPaddingMax = arrowPaddingObject[altSide]; // If the reference length is smaller than the arrow length, we don't want
    // to include its full size in the calculation. If the reference is small
    // and near the edge of a boundary, the popper can overflow even if the
    // reference is not overflowing as well (e.g. virtual elements with no
    // width or height)

    var arrowLen = within(0, referenceRect[len], arrowRect[len]);
    var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
    var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
    var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
    var clientOffset = arrowOffsetParent ? mainAxis === 'y' ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
    var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
    var tetherMin = offset + minOffset - offsetModifierValue - clientOffset;
    var tetherMax = offset + maxOffset - offsetModifierValue;
    var preventedOffset = within(tether ? min(min$1, tetherMin) : min$1, offset, tether ? max(max$1, tetherMax) : max$1);
    popperOffsets[mainAxis] = preventedOffset;
    data[mainAxis] = preventedOffset - offset;
  }

  if (checkAltAxis) {
    var _offsetModifierState$2;

    var _mainSide = mainAxis === 'x' ? top : left;

    var _altSide = mainAxis === 'x' ? bottom : right;

    var _offset = popperOffsets[altAxis];

    var _len = altAxis === 'y' ? 'height' : 'width';

    var _min = _offset + overflow[_mainSide];

    var _max = _offset - overflow[_altSide];

    var isOriginSide = [top, left].indexOf(basePlacement) !== -1;

    var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;

    var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;

    var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;

    var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);

    popperOffsets[altAxis] = _preventedOffset;
    data[altAxis] = _preventedOffset - _offset;
  }

  state.modifiersData[name] = data;
} // eslint-disable-next-line import/no-unused-modules


var preventOverflow$1 = {
  name: 'preventOverflow',
  enabled: true,
  phase: 'main',
  fn: preventOverflow,
  requiresIfExists: ['offset']
};

function getHTMLElementScroll(element) {
  return {
    scrollLeft: element.scrollLeft,
    scrollTop: element.scrollTop
  };
}

function getNodeScroll(node) {
  if (node === getWindow(node) || !isHTMLElement(node)) {
    return getWindowScroll(node);
  } else {
    return getHTMLElementScroll(node);
  }
}

function isElementScaled(element) {
  var rect = element.getBoundingClientRect();
  var scaleX = round(rect.width) / element.offsetWidth || 1;
  var scaleY = round(rect.height) / element.offsetHeight || 1;
  return scaleX !== 1 || scaleY !== 1;
} // Returns the composite rect of an element relative to its offsetParent.
// Composite means it takes into account transforms as well as layout.


function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
  if (isFixed === void 0) {
    isFixed = false;
  }

  var isOffsetParentAnElement = isHTMLElement(offsetParent);
  var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
  var documentElement = getDocumentElement(offsetParent);
  var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
  var scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  var offsets = {
    x: 0,
    y: 0
  };

  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== 'body' || // https://github.com/popperjs/popper-core/issues/1078
    isScrollParent(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }

    if (isHTMLElement(offsetParent)) {
      offsets = getBoundingClientRect(offsetParent, true);
      offsets.x += offsetParent.clientLeft;
      offsets.y += offsetParent.clientTop;
    } else if (documentElement) {
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }

  return {
    x: rect.left + scroll.scrollLeft - offsets.x,
    y: rect.top + scroll.scrollTop - offsets.y,
    width: rect.width,
    height: rect.height
  };
}

function order(modifiers) {
  var map = new Map();
  var visited = new Set();
  var result = [];
  modifiers.forEach(function (modifier) {
    map.set(modifier.name, modifier);
  }); // On visiting object, check for its dependencies and visit them recursively

  function sort(modifier) {
    visited.add(modifier.name);
    var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
    requires.forEach(function (dep) {
      if (!visited.has(dep)) {
        var depModifier = map.get(dep);

        if (depModifier) {
          sort(depModifier);
        }
      }
    });
    result.push(modifier);
  }

  modifiers.forEach(function (modifier) {
    if (!visited.has(modifier.name)) {
      // check for visited object
      sort(modifier);
    }
  });
  return result;
}

function orderModifiers(modifiers) {
  // order based on dependencies
  var orderedModifiers = order(modifiers); // order based on phase

  return modifierPhases.reduce(function (acc, phase) {
    return acc.concat(orderedModifiers.filter(function (modifier) {
      return modifier.phase === phase;
    }));
  }, []);
}

function debounce(fn) {
  var pending;
  return function () {
    if (!pending) {
      pending = new Promise(function (resolve) {
        Promise.resolve().then(function () {
          pending = undefined;
          resolve(fn());
        });
      });
    }

    return pending;
  };
}

function mergeByName(modifiers) {
  var merged = modifiers.reduce(function (merged, current) {
    var existing = merged[current.name];
    merged[current.name] = existing ? Object.assign({}, existing, current, {
      options: Object.assign({}, existing.options, current.options),
      data: Object.assign({}, existing.data, current.data)
    }) : current;
    return merged;
  }, {}); // IE11 does not support Object.values

  return Object.keys(merged).map(function (key) {
    return merged[key];
  });
}

var DEFAULT_OPTIONS = {
  placement: 'bottom',
  modifiers: [],
  strategy: 'absolute'
};

function areValidElements() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return !args.some(function (element) {
    return !(element && typeof element.getBoundingClientRect === 'function');
  });
}

function popperGenerator(generatorOptions) {
  if (generatorOptions === void 0) {
    generatorOptions = {};
  }

  var _generatorOptions = generatorOptions,
      _generatorOptions$def = _generatorOptions.defaultModifiers,
      defaultModifiers = _generatorOptions$def === void 0 ? [] : _generatorOptions$def,
      _generatorOptions$def2 = _generatorOptions.defaultOptions,
      defaultOptions = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
  return function createPopper(reference, popper, options) {
    if (options === void 0) {
      options = defaultOptions;
    }

    var state = {
      placement: 'bottom',
      orderedModifiers: [],
      options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
      modifiersData: {},
      elements: {
        reference: reference,
        popper: popper
      },
      attributes: {},
      styles: {}
    };
    var effectCleanupFns = [];
    var isDestroyed = false;
    var instance = {
      state: state,
      setOptions: function setOptions(setOptionsAction) {
        var options = typeof setOptionsAction === 'function' ? setOptionsAction(state.options) : setOptionsAction;
        cleanupModifierEffects();
        state.options = Object.assign({}, defaultOptions, state.options, options);
        state.scrollParents = {
          reference: isElement(reference) ? listScrollParents(reference) : reference.contextElement ? listScrollParents(reference.contextElement) : [],
          popper: listScrollParents(popper)
        }; // Orders the modifiers based on their dependencies and `phase`
        // properties

        var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers, state.options.modifiers))); // Strip out disabled modifiers

        state.orderedModifiers = orderedModifiers.filter(function (m) {
          return m.enabled;
        });
        runModifierEffects();
        return instance.update();
      },
      // Sync update – it will always be executed, even if not necessary. This
      // is useful for low frequency updates where sync behavior simplifies the
      // logic.
      // For high frequency updates (e.g. `resize` and `scroll` events), always
      // prefer the async Popper#update method
      forceUpdate: function forceUpdate() {
        if (isDestroyed) {
          return;
        }

        var _state$elements = state.elements,
            reference = _state$elements.reference,
            popper = _state$elements.popper; // Don't proceed if `reference` or `popper` are not valid elements
        // anymore

        if (!areValidElements(reference, popper)) {
          return;
        } // Store the reference and popper rects to be read by modifiers


        state.rects = {
          reference: getCompositeRect(reference, getOffsetParent(popper), state.options.strategy === 'fixed'),
          popper: getLayoutRect(popper)
        }; // Modifiers have the ability to reset the current update cycle. The
        // most common use case for this is the `flip` modifier changing the
        // placement, which then needs to re-run all the modifiers, because the
        // logic was previously ran for the previous placement and is therefore
        // stale/incorrect

        state.reset = false;
        state.placement = state.options.placement; // On each update cycle, the `modifiersData` property for each modifier
        // is filled with the initial data specified by the modifier. This means
        // it doesn't persist and is fresh on each update.
        // To ensure persistent data, use `${name}#persistent`

        state.orderedModifiers.forEach(function (modifier) {
          return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
        });

        for (var index = 0; index < state.orderedModifiers.length; index++) {
          if (state.reset === true) {
            state.reset = false;
            index = -1;
            continue;
          }

          var _state$orderedModifie = state.orderedModifiers[index],
              fn = _state$orderedModifie.fn,
              _state$orderedModifie2 = _state$orderedModifie.options,
              _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2,
              name = _state$orderedModifie.name;

          if (typeof fn === 'function') {
            state = fn({
              state: state,
              options: _options,
              name: name,
              instance: instance
            }) || state;
          }
        }
      },
      // Async and optimistically optimized update – it will not be executed if
      // not necessary (debounced to run at most once-per-tick)
      update: debounce(function () {
        return new Promise(function (resolve) {
          instance.forceUpdate();
          resolve(state);
        });
      }),
      destroy: function destroy() {
        cleanupModifierEffects();
        isDestroyed = true;
      }
    };

    if (!areValidElements(reference, popper)) {
      return instance;
    }

    instance.setOptions(options).then(function (state) {
      if (!isDestroyed && options.onFirstUpdate) {
        options.onFirstUpdate(state);
      }
    }); // Modifiers have the ability to execute arbitrary code before the first
    // update cycle runs. They will be executed in the same order as the update
    // cycle. This is useful when a modifier adds some persistent data that
    // other modifiers need to use, but the modifier is run after the dependent
    // one.

    function runModifierEffects() {
      state.orderedModifiers.forEach(function (_ref) {
        var name = _ref.name,
            _ref$options = _ref.options,
            options = _ref$options === void 0 ? {} : _ref$options,
            effect = _ref.effect;

        if (typeof effect === 'function') {
          var cleanupFn = effect({
            state: state,
            name: name,
            instance: instance,
            options: options
          });

          var noopFn = function noopFn() {};

          effectCleanupFns.push(cleanupFn || noopFn);
        }
      });
    }

    function cleanupModifierEffects() {
      effectCleanupFns.forEach(function (fn) {
        return fn();
      });
      effectCleanupFns = [];
    }

    return instance;
  };
}

var defaultModifiers = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1, offset$1, flip$1, preventOverflow$1, arrow$1, hide$1];
var createPopper = /*#__PURE__*/popperGenerator({
  defaultModifiers: defaultModifiers
}); // eslint-disable-next-line import/no-unused-modules

const isUrl = (path) => {
    if (typeof path !== 'string' && !path) {
        return false;
    }
    const pattern = /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?/;
    return pattern.test(path);
};
const isMobile = () => {
    return window.innerWidth <= 450;
};
const isTablet = () => {
    return window.innerWidth <= 768;
};

const CHILD_ATTRS = [
    "name",
    "title",
    "imageSrc",
    "bio",
    "variant",
    "acting",
    "department"
];
const PARENT_ATTRS = [
    ...CHILD_ATTRS,
    "responsive",
    "direction",
    "verticalDepth",
    "depth",
    "popperDialog",
];
class OrgChartContainer {
    constructor(node) {
        var _a;
        this.nodeIdNum = 0;
        this.dataByNodeId = {};
        this.isMobileOrTablet = isTablet();
        this.containerId = `${MAIN_CONTAINER}__${OrgChartContainer.idNum++}`;
        node.id = this.containerId;
        if (!node) {
            console.error("OrgChart -> Can't initialize orgchart. Container not found.", "Container id: ", this.containerId);
            return;
        }
        (_a = node.querySelectorAll("li, ul")) === null || _a === void 0 ? void 0 : _a.forEach((node) => {
            node.id = this.generateNodeId();
        });
        this.container = node;
        this.init();
    }
    generateNodeId() {
        return `${this.containerId}__node__${this.nodeIdNum++}`;
    }
    createNode(node, data) {
        var _a;
        console.log("Create node", node, data);
        if (data === null || data === void 0 ? void 0 : data.imageSrc) {
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
        if (data === null || data === void 0 ? void 0 : data.dataRefId) {
            const mainData = this.dataByNodeId[data.dataRefId];
            node.setAttribute("data-dataRefId", data.dataRefId);
            this.addFancyBoxDialog(node, mainData);
            this.addAriaLabels(node, mainData);
        }
        if ((data === null || data === void 0 ? void 0 : data.acting) === "true") {
            const content = node.querySelector(".content");
            if (content && content.innerText) {
                content.innerText = `Acting ${content.innerText}`;
            }
        }
        if (data === null || data === void 0 ? void 0 : data.department) {
            const content = node.querySelector(".content");
            if (content) {
                const department = globalThis.document.createElement("div");
                department.classList.add("department");
                department.innerText = data.department;
                node.appendChild(department);
                node.classList.add("with-department");
            }
        }
        node.classList.add(`variant-${(_a = data === null || data === void 0 ? void 0 : data.variant) !== null && _a !== void 0 ? _a : 1}`);
    }
    init() {
        if (!this.container && !this.data) {
            return console.error("OrgChart -> Container or data not found", "Container id: ", this.containerId);
        }
        this.data = this.extractDataFromContainer(this.container);
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
            });
        }
    }
    buildChart(createNodeFn) {
        if (this.data) {
            const opts = {
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
            if (this.data.responsive === 'true') {
                if (this.isMobileOrTablet) {
                    opts.verticalDepth = 2;
                }
            }
            this.orgChartInstance = new OrgChartOverride(opts);
        }
    }
    destroyChart() {
        var _a, _b, _c;
        (_c = (_b = (_a = this.container) === null || _a === void 0 ? void 0 : _a.querySelector('.orgchart')) === null || _b === void 0 ? void 0 : _b.remove) === null || _c === void 0 ? void 0 : _c.call(_b);
        this.orgChartInstance = null;
        this.dataByNodeId = {};
        this.data = JSON.parse(this.dataSerialized);
    }
    closeAllBioDialogs() {
        this.container
            .querySelectorAll(this.popperShowSelector())
            .forEach((node) => {
            var _a;
            if ((_a = node === null || node === void 0 ? void 0 : node.classList) === null || _a === void 0 ? void 0 : _a.remove) {
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
    addFancyBoxDialog(node, data) {
        if (data === null || data === void 0 ? void 0 : data.bio) {
            node.classList.add(`with-bio`, "fancybox-dialog");
            const fn = ((bio) => function (e) {
                var _a, _b, _c, _d, _e, _f;
                let html = [];
                const _isUrl = isUrl(bio);
                if (_isUrl) {
                    html = $.parseHTML(`<div style="display: contents"><div class='${MAIN_CONTAINER}__fancybox--content'><iframe src="${bio}"</div></div>`);
                }
                else {
                    html = $.parseHTML(`<div style="display: contents"><div class='${MAIN_CONTAINER}__fancybox--content has-iframe'>${bio}</div></div>`);
                }
                e.stopPropagation();
                if (((_c = (_b = (_a = e.target) === null || _a === void 0 ? void 0 : _a.classList) === null || _b === void 0 ? void 0 : _b.contains) === null || _c === void 0 ? void 0 : _c.call(_b, "edge")) ||
                    ((_f = (_e = (_d = e.target) === null || _d === void 0 ? void 0 : _d.classList) === null || _e === void 0 ? void 0 : _e.contains) === null || _f === void 0 ? void 0 : _f.call(_e, "toggleBtn"))) {
                    return;
                }
                const _isMobile = isMobile();
                const opts = {
                    padding: _isMobile ? [25, 0, 25, 0] : 25,
                    closeBtn: true,
                    afterLoad: function () {
                        var _a;
                        const overlay = (_a = this === null || this === void 0 ? void 0 : this.locked) === null || _a === void 0 ? void 0 : _a[0];
                        if (overlay) {
                            overlay.classList.add(`${MAIN_CONTAINER}__fancybox--backdrop`);
                            const wrap = overlay.querySelector(".fancybox-wrap");
                            const skin = overlay.querySelector(".fancybox-skin");
                            if (isMobile()) {
                                overlay.classList.add('isMobile');
                                wrap.style.left = '0';
                                wrap.style.right = '0';
                                wrap.style.top = '0';
                                wrap.style.bottom = '0';
                                wrap.style.inset = '0';
                            }
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
                            closeBtn.addEventListener("click", function (e) {
                                var _a;
                                e.stopPropagation();
                                const fancyClose = document.body.querySelector(".fancybox-close");
                                (_a = fancyClose === null || fancyClose === void 0 ? void 0 : fancyClose.click) === null || _a === void 0 ? void 0 : _a.call(fancyClose);
                            });
                            skin.appendChild(closeBtn);
                        }
                    },
                };
                $.fancybox.open(html, opts);
            })(data.bio);
            node.addEventListener("click", fn);
        }
    }
    addPopperBioDialog(node, data) {
        if (data.bio) {
            node.classList.add(`with-bio`, "popper-dialog");
            const bioDialog = globalThis.document.createElement("div");
            bioDialog.classList.add(`${this.popperMainSelector(true)}`, `bio-dialog-${data.dataRefId}`);
            const bioText = globalThis.document.createElement("span");
            bioText.classList.add("bio-dialog--text");
            const parsedHtml = looseParseOnlyElements(data.bio);
            if (parsedHtml === null || parsedHtml === void 0 ? void 0 : parsedHtml.length) {
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
            icon.addEventListener("click", function (e) {
                var _a;
                e.stopPropagation();
                (_a = this.closest(showSelector)) === null || _a === void 0 ? void 0 : _a.classList.remove(showSelectorName);
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
                var _a, _b, _c, _d, _e, _f, _g;
                e.stopPropagation();
                if (((_c = (_b = (_a = e.target) === null || _a === void 0 ? void 0 : _a.classList) === null || _b === void 0 ? void 0 : _b.contains) === null || _c === void 0 ? void 0 : _c.call(_b, "edge")) ||
                    ((_f = (_e = (_d = e.target) === null || _d === void 0 ? void 0 : _d.classList) === null || _e === void 0 ? void 0 : _e.contains) === null || _f === void 0 ? void 0 : _f.call(_e, "toggleBtn"))) {
                    return;
                }
                if (!node.classList.contains(showSelectorName)) {
                    closeAll();
                    (_g = data.popperInstance) === null || _g === void 0 ? void 0 : _g.update();
                    node.classList.toggle(showSelectorName);
                }
            });
        }
    }
    addAriaLabels(node, data) {
        if (data === null || data === void 0 ? void 0 : data.name) {
            node === null || node === void 0 ? void 0 : node.setAttribute("aria-labelledby", `[data-dataRefId="${data.dataRefId}"] .title`);
        }
        if (data === null || data === void 0 ? void 0 : data.title) {
            node === null || node === void 0 ? void 0 : node.setAttribute("aria-describedby", `[data-dataRefId="${data.dataRefId}"] .content`);
        }
    }
    getDataFromChildNode(node) {
        const nAttrs = nodeAttributes(node);
        let data = null;
        CHILD_ATTRS.forEach((attr) => {
            var _a;
            if ((_a = nAttrs(attr)) !== null && _a !== void 0 ? _a : false) {
                const val = nAttrs(attr);
                if (val !== null && val !== void 0 ? val : false) {
                    if (data) {
                        data[attr] = val;
                    }
                    else {
                        data = { [attr]: val };
                    }
                }
            }
        });
        const dataRefId = node.id;
        if (dataRefId && data) {
            data.dataRefId = dataRefId;
            this.dataByNodeId[dataRefId] = data;
        }
        return data;
    }
    getDataFromParentNode(node) {
        const nAttrs = nodeAttributes(node);
        let data = null;
        PARENT_ATTRS.forEach((attr) => {
            var _a;
            if ((_a = nAttrs(attr)) !== null && _a !== void 0 ? _a : false) {
                let val = nAttrs(attr);
                if (attr === "depth" || attr === "verticalDepth") {
                    const _val = parseInt(val, 10);
                    if (typeof _val === "number" && _val === _val) {
                        val = _val;
                    }
                }
                if (val !== null && val !== void 0 ? val : false) {
                    if (data) {
                        data[attr] = val;
                    }
                    else {
                        data = { [attr]: val };
                    }
                }
            }
        });
        const dataRefId = node.id;
        if (dataRefId && data) {
            data.dataRefId = dataRefId;
            this.dataByNodeId[dataRefId] = data;
        }
        if (data) {
            data.mainNode = true;
        }
        return data;
    }
    extractDataFromContainer(dataNode, isChild = false) {
        var _a;
        try {
            if (isChild) {
                if (dataNode) {
                    const data = this.getDataFromChildNode(dataNode);
                    if (data) {
                        const childList = dataNode.querySelector("ul");
                        if (childList) {
                            const childNodes = childList.querySelectorAll(`#${childList.id}>li`);
                            if (childNodes.length > 0) {
                                data.children = Array.from(childNodes).map((node) => {
                                    return this.extractDataFromContainer(node, true);
                                });
                            }
                        }
                        return data;
                    }
                }
            }
            else {
                const node = ((_a = dataNode === null || dataNode === void 0 ? void 0 : dataNode.tagName) === null || _a === void 0 ? void 0 : _a.toLowerCase()) == "li"
                    ? dataNode
                    : dataNode === null || dataNode === void 0 ? void 0 : dataNode.querySelector("li");
                if (node) {
                    const data = this.getDataFromParentNode(node);
                    if (data) {
                        const childList = node.querySelector("ul");
                        if (childList) {
                            const childNodes = childList.querySelectorAll(`#${childList.id}>li`);
                            if (childNodes.length > 0) {
                                data.children = Array.from(childNodes).map((node) => {
                                    return this.extractDataFromContainer(node, true);
                                });
                            }
                        }
                        return data;
                    }
                }
            }
        }
        catch (e) {
            console.error("Can't extract data from container", {
                containerId: this.containerId,
            });
        }
        return null;
    }
}
OrgChartContainer.idNum = 1;

class CSOOrgChart {
    constructor() {
        this.chartInstances = [];
        this.init();
    }
    init() {
        try {
            this.containers = getContainers();
            this.buildCharts();
        }
        catch (e) {
            console.error("Can't build template. Err: ", e);
            return;
        }
    }
    buildCharts() {
        if (!this.containers || this.containers.length === 0) {
            console.error("OrgChart -> No containers found");
            return;
        }
        this.containers.forEach((el) => {
            this.chartInstances.push(new OrgChartContainer(el));
        });
    }
}

new CSOOrgChart();
//# sourceMappingURL=cso-org-chart.js.map
