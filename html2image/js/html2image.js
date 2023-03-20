//version 1.1, date, 20/03/2023
//#region Add Namespace
t4Sdk.html2image = t4Sdk.html2image || {};
//#endregion Add Namespace

//#region Variables
t4Sdk.html2image.file_index = 0;
t4Sdk.html2image.active_mode = true;
t4Sdk.html2image.loadEventAttached = t4Sdk.html2image.loadEventAttached || null;
//#endregion Variables

//Executes export to image on user click

var lastTgt;
t4Sdk.html2image.download = function(e) {
    var exp = t4Sdk.element2export;
    e.target.parentElement.parentElement.children[1];
    // exp = t4Sdk.html2image.i_div_el.export_div;
    lastTgt = exp;
    t4Sdk.html2image.fnExport(exp, e.target.innerHTML);
}

t4Sdk.html2image.fnExport = function(tgt, type) {
    var holder; // = document.createElement("div");
    // holder.style.backgroundColor = "white";
    if (tgt && t4Sdk.html2image.active_mode) {
        t4Sdk.html2image.active_mode = false;
        t4Sdk.html2image.i_meta_mode.className = "fa fa-solid fa-spinner fa-pulse";
        holder = tgt;
        var opt = { "bgcolor": "white" };
        switch (type) {
            case t4Sdk.html2image.png:
                domtoimage.toPng(holder, opt)
                    .then(function(dataUrl) {
                        const link = document.createElement('a');
                        link.href = dataUrl;
                        t4Sdk.html2image.file_index += 1;
                        link.download = 'img000_' + t4Sdk.html2image.file_index + ".png"
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        t4Sdk.html2image.i_meta_mode.className = "fa fa-solid fa-download";
                        t4Sdk.html2image.active_mode = true;
                    })
                    .catch(function(error) {
                        console.error('oops, something went wrong!', error);
                    });
                break;
            case t4Sdk.html2image.svg:
                domtoimage.toSvg(holder, opt)
                    .then(function(dataUrl) {
                        const link = document.createElement('a');
                        link.href = dataUrl;
                        t4Sdk.html2image.file_index += 1;
                        link.download = 'img000_' + t4Sdk.html2image.file_index + ".svg"
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        t4Sdk.html2image.i_meta_mode.className = "fa fa-solid fa-download";
                        t4Sdk.html2image.active_mode = true;
                    })
                    .catch(function(error) {
                        console.error('oops, something went wrong!', error);
                    });
                break;
            case t4Sdk.html2image.jpg:

                domtoimage.toJpeg(holder, opt)
                    .then(function(dataUrl) {
                        const link = document.createElement('a');
                        link.href = dataUrl;
                        t4Sdk.html2image.file_index += 1;
                        link.download = 'img000_' + t4Sdk.html2image.file_index + ".jpg"
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        t4Sdk.html2image.i_meta_mode.className = "fa fa-solid fa-download";
                        t4Sdk.html2image.active_mode = true;
                    })
                    .catch(function(error) {
                        console.error('oops, something went wrong!', error);
                    });
                break;
        }
        t4Sdk.html2image.contextMenuVisible = false;
        t4Sdk.html2image.contextMenuList.style.display = "none";
    } else if (t4Sdk.html2image.active_mode)
        alert("No Element with class:dashboard-snapshot to export as Image!");
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
t4Sdk.html2image.dataURItoBlob = function(dataURI) {
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

t4Sdk.html2image.addListItem = function(div, item_text) {
    var span = document.createElement("div");
    span.innerHTML = item_text;
    span.className = "custom_dd";
    span.addEventListener("click", t4Sdk.html2image.download);
    div.appendChild(span);
}

t4Sdk.html2image.getOffset = function(el) {
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
t4Sdk.html2image.showContextMenu = function(e) {
    var x = e.clientX;
    var y = e.clientY;
    if (t4Sdk.html2image.contextMenuVisible)
        t4Sdk.html2image.contextMenuList.style.display = "none";
    else {
        t4Sdk.lst.style.position = "absolute";
        t4Sdk.lst.style.left = t4Sdk.list_left;
        t4Sdk.lst.style.top = t4Sdk.list_top;
        t4Sdk.html2image.contextMenuList.style.display = "block";
    }


    t4Sdk.html2image.contextMenuVisible = !t4Sdk.html2image.contextMenuVisible;
}
t4Sdk.html2image.jpg = "Download JPG";
t4Sdk.html2image.png = "Download PNG";
t4Sdk.html2image.svg = "Download SVG";
t4Sdk.html2image.fnContextMenu = function() {

    var listContainer = document.createElement("div");
    var list = document.createElement("div");
    list.style.position = "absolute";
    t4Sdk.html2image.contextMenuList = list;
    list.className = "custom_list";
    //list.style.top = "44px";
    list.style.width = "130px";
    // list.style.left = "100px";
    list.style.background = "white";

    t4Sdk.html2image.addListItem(list, t4Sdk.html2image.jpg);
    t4Sdk.html2image.addListItem(list, t4Sdk.html2image.png);
    t4Sdk.html2image.addListItem(list, t4Sdk.html2image.svg);


    var rect = t4Sdk.html2image.i_meta_mode.getBoundingClientRect();
    // var lft = (rect.left - 168) + "px";

    // t4Sdk.html2image.contextMenuList.style.left = lft;
    listContainer.appendChild(list);
    // b.appendChild(list);
    //

    t4Sdk.html2image.i_div_el.export_div = t4Sdk.html2image.i_div_el.children[0].parentElement.children[1];
    return listContainer;
    //  t4Sdk.html2image.i_div_el.insertBefore(list, a);
    //t4Sdk.html2image.i_div_el.insertBefore(list, t4Sdk.html2image.i_div_el.children[0]);
}

t4Sdk.html2image.enumSaveAsImage = function(e) {
    var children = document.getElementsByClassName("html2image_container");
    // alert(children.length)

    for (var i = 0; i < children.length; i++) {
        var el = children[i];
        t4Sdk.element2export = el;
        var parent = el.parentElement;
        t4Sdk.html2image.i_div = document.createElement("div");
        t4Sdk.html2image.i_div.style.width = "100%";
        t4Sdk.html2image.i_div.style.height = "32px";
        //t4Sdk.html2image.i_div.style.margin = "6px";
        t4Sdk.html2image.i_div.style.position = "relative";
        t4Sdk.html2image.i_meta_mode = document.createElement("i");
        var i_meta_mode = t4Sdk.html2image.i_meta_mode;
        i_meta_mode.className = "fa fa-solid fa-download";
        i_meta_mode.style.position = "absolute";
        i_meta_mode.style.backgroundColor = "#e6edf2";
        i_meta_mode.style.fontSize = "140%";
        //i_meta_mode.style.opacity = "0.8";
        i_meta_mode.style.borderRadius = "3px 3px 0 0";
        i_meta_mode.style.padding = "5px 8px";
        i_meta_mode.style.right = "0";
        i_meta_mode.style.top = "0";
        i_meta_mode.style.cursor = "pointer";
        //i_meta_mode.style.float = "right";
        i_meta_mode["data-toggle"] = "tooltip";
        i_meta_mode["title"] = "Download image";
        //  var tmpr = el;
        //  parent.removeChild(el);
        // parent.appendChild(t4Sdk.html2image.i_div);
        //  var d = document.createElement("div");
        //d.innerHTML = "ec115";
        //  parent.appendChild(d);
        // parent.appendChild(el);
        // debugger;

        t4Sdk.html2image.i_div.appendChild(i_meta_mode);
        t4Sdk.html2image.i_div_el = el;
        var lst = t4Sdk.html2image.fnContextMenu();
        t4Sdk.html2image.contextMenuList.style.display = "none";
        t4Sdk.html2image.i_div.addEventListener("click", t4Sdk.html2image.showContextMenu);

        //  lst.appendChild(t4Sdk.html2image.i_div)
        // parent.insertBefore(lst, el);
        document.body.appendChild(lst);

        // parent.appendChild(t4Sdk.html2image.i_div)
        parent.insertBefore(t4Sdk.html2image.i_div, el);

        var rct = t4Sdk.html2image.i_div.getBoundingClientRect();
        var lsty = rct.y + rct.height;
        var lstx = rct.x + rct.width - 142;
        t4Sdk.list_left = lstx + "px";
        t4Sdk.list_top = lsty + "px";
        t4Sdk.lst = lst;
        /*
        t4Sdk.html2image.i_div.appendChild(i_meta_mode);
        t4Sdk.html2image.i_div_el = el;
        el.insertBefore(t4Sdk.html2image.i_div, el.children[0]);
        t4Sdk.html2image.fnContextMenu();
        t4Sdk.html2image.contextMenuList.style.display = "none";
        t4Sdk.html2image.i_div.addEventListener("click", t4Sdk.html2image.showContextMenu);
        */
        //  $('[data-toggle="tooltip"]').tooltip();
    }
};

//Make sure that there is only one listener attached from T4
if (t4Sdk.html2image.loadEventAttached == null) {
    t4Sdk.html2image.loadEventAttached = true;
    window.addEventListener("load", t4Sdk.html2image.enumSaveAsImage);
}