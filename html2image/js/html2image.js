//version 1.3, date, 21/03/2023

//#region Add Namespace
t4Sdk.html2image = t4Sdk.html2image || {};
//#endregion Add Namespace

//#region Variables
t4Sdk.html2image.file_index = 0;
t4Sdk.html2image.active_mode = true;
t4Sdk.html2image.loadEventAttached = t4Sdk.html2image.loadEventAttached || null;
t4Sdk.html2image.openedList = null;
//#endregion Variables

//Executes export to image on user click

var lastTgt;
t4Sdk.html2image.div2export_className = null;

t4Sdk.html2image.download = function (e) {
    var list = e.target.parentElement;
    if (list.div2export) {
        e.target.parentElement.icon.className = "fa fa-solid fa-spinner fa-pulse";
        t4Sdk.html2image.active_mode = false;
        //  t4Sdk.html2image.clonedElement = list.div2export.cloneNode(true);
        /*
                t4Sdk.html2image.clonedElementParent = list.div2export.parentElement;
                list.div2export.style.margin = "0";
                list.div2export.style.padding = "0";
       
        t4Sdk.html2image.clonedElement.style.margin = "0";
        t4Sdk.html2image.clonedElement.style.padding = "0";
         */
        t4Sdk.html2image.div2export_className = list.div2export.className;
        console.log("margin" + list.div2export.className)
        list.div2export.style.margin = "0";
        list.div2export.style.padding = "0";

        t4Sdk.html2image.fnExport(list.div2export, e.target.innerHTML, e.target.parentElement.icon);
        // window.addEventListener("load", t4Sdk.html2image.loadedDiv);
        // setTimeout(t4Sdk.html2image.loadedDiv, 3000, e);
        /*
                setTimeout((e) => {
                    t4Sdk.html2image.fnExport(list.div2export, e.target.innerHTML, e.target.parentElement.icon);
                }, 500);
                */

    } else if (t4Sdk.html2image.active_mode)
        alert("No Element with class:dashboard-snapshot to export as Image!");
}


t4Sdk.html2image.fnExport = function (tgt, type, icon) {
    // var tgt = t4Sdk.html2image.clonedElement;
    var opt = { "bgcolor": "white" };
    switch (type) {
        case t4Sdk.html2image.png:
            domtoimage.toPng(tgt, opt)
                .then(function (dataUrl) {
                    const link = document.createElement('a');
                    link.href = dataUrl;
                    t4Sdk.html2image.file_index += 1;
                    link.download = 'img000_' + t4Sdk.html2image.file_index + ".png"
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    icon.className = "fa fa-solid fa-download";
                    t4Sdk.html2image.active_mode = true;
                    tgt.className = t4Sdk.html2image.div2export_className;
                    /*
                                        t4Sdk.html2image.clonedElementParent.removeChild(tgt);
                                        t4Sdk.html2image.clonedElementParent.appendChild(t4Sdk.html2image.clonedElement);
                    */
                    //   document.body.removeChild(tgt)
                })
                .catch(function (error) {
                    console.error('oops, something went wrong!', error);
                });
            break;
        case t4Sdk.html2image.svg:
            domtoimage.toSvg(tgt, opt)
                .then(function (dataUrl) {
                    const link = document.createElement('a');
                    link.href = dataUrl;
                    t4Sdk.html2image.file_index += 1;
                    link.download = 'img000_' + t4Sdk.html2image.file_index + ".svg"
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    icon.className = "fa fa-solid fa-download";
                    t4Sdk.html2image.active_mode = true;
                    tgt.className = t4Sdk.html2image.div2export_className;
                    //document.body.removeChild(tgt)
                })
                .catch(function (error) {
                    console.error('oops, something went wrong!', error);
                });
            break;
        case t4Sdk.html2image.jpg:

            domtoimage.toJpeg(tgt, opt)
                .then(function (dataUrl) {
                    const link = document.createElement('a');
                    link.href = dataUrl;
                    t4Sdk.html2image.file_index += 1;
                    link.download = 'img000_' + t4Sdk.html2image.file_index + ".jpg"
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    icon.className = "fa fa-solid fa-download";
                    t4Sdk.html2image.active_mode = true;
                    tgt.className = t4Sdk.html2image.div2export_className;
                    // document.body.removeChild(tgt)
                })
                .catch(function (error) {
                    console.error('oops, something went wrong!', error);
                });
            break;
    }
};
//Converts Base64 to Blob- much slower
t4Sdk.html2image.b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
    const byteCharacters = window.atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
}
//Converts Base64 to Blob- much faster
t4Sdk.html2image.dataURItoBlob = function (dataURI) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
        int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'application/pdf' });
    return blob;
}
//Enumerates elements marked for export as images

t4Sdk.html2image.addListItem = function (div, item_text) {
    var span = document.createElement("div");
    span.innerHTML = item_text;
    span.className = "custom_dd";
    span.addEventListener("click", t4Sdk.html2image.download);
    div.appendChild(span);
}

t4Sdk.html2image.getOffset = function (el) {
    var _x = 0;
    var _y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}

t4Sdk.html2image.contextMenuVisible = false;
t4Sdk.html2image.showContextMenu = function (e) {
    var tgt = e.target.parentElement;
    var lst = tgt.exportList;
    if (t4Sdk.html2image.openedList && lst != t4Sdk.html2image.openedList) {
        t4Sdk.html2image.openedList.style.display = "none";
    }
    t4Sdk.html2image.openedList = lst;
    if (lst.style.display == "none")
        lst.style.display = "block";
    else
        lst.style.display = "none";
}
t4Sdk.html2image.jpg = "Download JPG";
t4Sdk.html2image.png = "Download PNG";
t4Sdk.html2image.svg = "Download SVG";
var cnt = 0;
t4Sdk.html2image.fnContextMenu = function (iDiv, el, icon) {
    var list = document.createElement("div");
    list.div2export = el;
    list.icon = icon;
    list.style.position = "absolute";
    list.className = "custom_list";
    list.style.width = "130px";
    list.style.background = "white";
    list.style.display = "none";
    t4Sdk.html2image.addListItem(list, t4Sdk.html2image.jpg);
    cnt++;
    t4Sdk.html2image.addListItem(list, t4Sdk.html2image.png);
    t4Sdk.html2image.addListItem(list, t4Sdk.html2image.svg);
    var rct = iDiv.getBoundingClientRect();
    var lsty = 16 + rct.y + rct.height + window.scrollY;
    var lstx = rct.x + rct.width - 132;
    list.style.left = lstx + "px";
    list.style.top = lsty + "px";
    iDiv.exportList = list;
    iDiv.addEventListener("click", t4Sdk.html2image.showContextMenu);;
    document.body.appendChild(list);
}

t4Sdk.html2image.enumSaveAsImage = function (e) {
    var children = document.getElementsByClassName("html2image_container");
    //alert(56746)

    for (var i = 0; i < children.length; i++) {
        var el = children[i];
        t4Sdk.html2image.i_div = document.createElement("div");
        var el_rct;
        var ex_el;
        if (el.children.length >= 1)
            ex_el = el.children[0];
        else
            ex_el = el;
        el_rct = ex_el.getBoundingClientRect();
        t4Sdk.html2image.i_div.style.height = "16px";
        t4Sdk.html2image.i_div.style.position = "absolute";

        t4Sdk.html2image.i_div.style.top = (2 + el_rct.top + window.scrollY) + "px";
        t4Sdk.html2image.i_div.style.left = (el_rct.left + el_rct.width - 34) + "px";
        t4Sdk.html2image.i_div.style.width = "32px";
        document.body.appendChild(t4Sdk.html2image.i_div);

        t4Sdk.html2image.i_meta_mode = document.createElement("i");
        var i_meta_mode = t4Sdk.html2image.i_meta_mode;
        i_meta_mode.className = "fa fa-solid fa-download";
        i_meta_mode.style.position = "absolute";
        i_meta_mode.style.backgroundColor = "#e6edf2";
        i_meta_mode.style.fontSize = "140%";
        i_meta_mode.style.borderRadius = "3px 3px 0 0";
        i_meta_mode.style.padding = "5px 8px";
        i_meta_mode.style.right = "0";
        i_meta_mode.style.top = "0";
        i_meta_mode.style.cursor = "pointer";
        i_meta_mode["data-toggle"] = "tooltip";
        i_meta_mode["title"] = "Download image";
        t4Sdk.html2image.i_div.appendChild(i_meta_mode);
        t4Sdk.html2image.fnContextMenu(t4Sdk.html2image.i_div, ex_el, t4Sdk.html2image.i_meta_mode);
    }
};

//Make sure that there is only one listener attached from T4
if (t4Sdk.html2image.loadEventAttached == null) {
    t4Sdk.html2image.loadEventAttached = true;
    window.addEventListener("load", t4Sdk.html2image.enumSaveAsImage);
}
