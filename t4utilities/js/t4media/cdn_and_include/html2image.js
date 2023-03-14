var html2image = html2image || {};
html2image.on = false;
html2image.T4body = null;
html2image.loaded = false;
html2image.customContextMenu = null;
html2image.file_index = 0;
html2image.customMenu = true;
html2image.changeModeIndex = 3;
html2image.showMetadata = 4;
html2image.ui_container = null;
html2image.filter_container = null;
html2image.tb = null;
html2image.t = null;
html2image.downloadSelectionUL = null;
html2image.downloadSelectionParentDIV = null;
html2image.selectAll = false;
html2image.hrefs = [];
html2image.sdocialDIV = null;
html2image.downloadPDF = null;

var export2pdf = export2pdf || {}; //this isi here 2
html2image.go2meta_data_page = function(e) {
    var url = "https://dev-incubator.cso.ie/PWSS/spajica/html2image/poc.html"
    window.open(url, 'DB Search').focus();
}
html2image.LocalNetworkMode = function() {
    html2image.socialDIV = document.getElementById('headerSocial');
    if (html2image.socialDIV) {
        html2image.T4body = document.getElementsByTagName('body')[0];
        var li_meta_mode = document.createElement("li");
        var i_meta_mode = document.createElement("i");

        i_meta_mode.style.cursor = "pointer";
        i_meta_mode["data-toggle"] = "tooltip";
        i_meta_mode["title"] = "Internal T4 Maintenance tool";
        // i_meta_mode.tooltip();

        // i_div.appendChild(i_meta_mode);
        // el.insertBefore(i_div, el.children[0]);
        //i_meta_mode.addEventListener("click", html2image.fnExport);





        var meta_ul = html2image.socialDIV.children[1].children[0];

        i_meta_mode.className = "fa fa-solid fa-bars fa-2x";
        li_meta_mode.appendChild(i_meta_mode);
        li_meta_mode.style.color = "#006F74";
        li_meta_mode.style.cursor = "pointer";
        li_meta_mode.addEventListener("click", html2image.go2meta_data_page);
        meta_ul.appendChild(li_meta_mode);
        $('[data-toggle="tooltip"]').tooltip();
    }

};

html2image.click = function() {
    alert("save asimage")
}
html2image.enumSaveAsImage = function() {
        var children = document.getElementsByClassName("html2pdf_container");
        for (var i = 0; i < children.length; i++) {
            var el = children[i];
            el.classList.remove("fa-2x")
            var i_div = document.createElement("div");
            i_div.style.width = "max-content";
            i_div.style.margin = "6px";
            var i_meta_mode = document.createElement("i");
            i_meta_mode.className = "fa fa-solid fa-download fa-2x";
            i_meta_mode.style.position = "absolute";
            //  i_meta_mode.style.backgroundColor = "white";
            i_meta_mode.style.right = "6px";
            i_meta_mode.style.top = "6px";

            //  i_meta_mode.style.right = "15px";
            //  i_meta_mode.style.top = "6px";

            i_meta_mode.style.cursor = "pointer";
            i_meta_mode["data-toggle"] = "tooltip";
            i_meta_mode["title"] = "download image";
            // i_meta_mode.tooltip();

            i_div.appendChild(i_meta_mode);
            el.insertBefore(i_div, el.children[0]);
            i_meta_mode.addEventListener("click", html2image.fnExport);
            $('[data-toggle="tooltip"]').tooltip();
        }
    }
    //function urlExists(url, callback) {
html2image.LocalNetworkFlag = function() {
        try {
            var url = "https://dev-incubator.cso.ie/PWSS/server/api.jsonrpc";
            var sameOriginURL = url; // proxyUrl + url;
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    // alert(xhr.status + ">>" + xhr.readyState)
                    if (xhr.status > 400)
                        html2image.LocalNetworkMode();
                    // alert(xhr.status + "==" + xhr.statusText)
                    // alert(xhr.status < 400);
                }
            };
            xhr.open('HEAD', sameOriginURL);
            xhr.send();

        } catch (ex) {
            console.log("exada>>" + ex.message)
        }
    }
    /*
    urlExists(someUrl, function(exists) {
        console.log('"%s" exists?', someUrl, exists);
    });
    */
html2image.disableHrefs = function(e) {

    var ch = html2image.downloadSelectionUL;
    if (ch) {
        ch.classList.add("moduleBody");
        // ch.style.backgroundColor = "white";
        ch.style.listStyleType = "none";
        ch.style.lineHeight = "180%";
        for (var i = 0; i < ch.children.length; i++) {
            var cbox = ch.children[i];
            cbox.children[1].style.display = "none";
            var sp = document.createElement("span");
            sp.style.margin = "8px";
            sp.innerHTML = cbox.children[1].innerHTML;
            cbox.appendChild(sp);
        }
        html2image.downloadSelectionUL.children[html2image.downloadSelectionUL.children.length - 1].style.display = "none";
        html2image.downloadSelectionParentDIV = html2image.downloadSelectionUL.parentElement;

        html2image.btnReverse = document.createElement("a");
        html2image.btnReverse.style.display = "block";
        html2image.btnReverse.setAttribute("href", "");
        html2image.downloadPDF = document.createElement("button");
        html2image.btnReverse.innerHTML = "Select all";
        html2image.downloadPDF.className = "btn";
        html2image.downloadPDF.style.border = "none";
        html2image.downloadPDF.innerHTML = "Download PDF";
        html2image.downloadPDF.style.cursor = "pointer";
        ch.parentElement.appendChild(html2image.btnReverse);

        html2image.btnReverse.style.marginLeft = "40px";
        html2image.downloadPDF.style.marginLeft = "40px";
        html2image.downloadPDF.style.marginBottom = "10px";
        html2image.downloadSelectionParentDIV.appendChild(html2image.downloadPDF);

        html2image.btnReverse.addEventListener("click", html2image.fnT4Reverse);
        html2image.downloadPDF.addEventListener("click", html2image.fnT4Download);

    }

    //   html2image.fnExportPDF(inp);
    //JSON.stringify(inp)
    // alert();
}

html2image.fnT4Reverse = function(e) {
    if (html2image.selectAll)
        html2image.btnReverse.innerHTML = "Select all";
    else
        html2image.btnReverse.innerHTML = "Unselect all";
    html2image.selectAll = !html2image.selectAll;
    var ch = html2image.downloadSelectionUL;
    for (var i = 0; i < ch.children.length; i++) {
        var cbox = ch.children[i].children[0];
        cbox.checked = html2image.selectAll; //!cbox.checked;
    }

}
html2image.processing = false;
html2image.fnT4Download = function(e) {
    if (html2image.processing) {
        alert("processing mode!")
    } else {
        html2image.downloadPDF.style.disabled = true;
        html2image.processing = true;
        var inp = [];
        var ch = html2image.downloadSelectionUL; //html2image.downloadPDF.classList.add("btn_disabled");
        html2image.downloadPDF.style.backgroundColor = "#45C1C0"; // "#384350";
        html2image.downloadPDF.disabled = true;
        html2image.downloadPDF.innerHTML = "Processing...";
        html2image.downloadPDF.style.cursor = "wait";
        for (var i = 0; i < ch.children.length; i++) {
            if (ch.children[i].children[0].checked) {
                var cbox = ch.children[i];
                inp[inp.length] = cbox.children[1].href + "/";
            }
        }
        html2image.fnExportPDF(inp);
    } // alert(JSON.stringify(inp));
}

html2image.enterMedaDataMode = function(e) {


}
html2image.inUse = false;
html2image.img = null;

html2image.enterMetaDataMode = function(e) {




}

html2image.loadPage2 = function(e) {



    //  alert(html2image.socialDIV)

    html2image.downloadSelectionUL = document.getElementById('download-selection-list-4-pdf');
    html2image.disableHrefs();

    html2image.enumSaveAsImage();

    // html2image.btnReverse.innerHTML = "Select all";

    // html2pdf_container



    html2image.LocalNetworkFlag();

}
export2pdf.load = function() {
    console.log("export2pdf--02 02 2023--test-")
}


export2pdf.hitFilter = function(e) {
    var inp = [];
    for (var i = 0; i < html2image.filter_container.children.length - 1; i++) {
        var cl = html2image.filter_container.children[i];
        var cln = cl.cname;
        var o = {};
        o[cln] = html2image.filter_container.children[i].children[1].value;
        inp[inp.length] = o;
    }
    var params = { "script_index": 1, "input_object": JSON.stringify(inp) }
    var inpt = { "jsonrpc": "2.0", "method": "T4_MetaData.T4MD.Read", params, "id": 918969569 };
    html2image.customMenu = !html2image.customMenu;
    var url = "https://dev-incubator.cso.ie/PWSS/server/api.jsonrpc"
    html2image.callApiDB(inpt, html2image.fnShowMetadata_callback, url);

    // return JSON.stringify(inp);
    /*
    alert(JSON.stringify(inp));;
    html2image.tb.innerHTML = "";
    html2image.tb = html2image.t.createTBody();
    alert("bl")
    html2image.addRows(ob);
    */


}

html2image.fnShowMetadata = function(e) {

    var params = { "script_index": 1, "input_object": '[]' }
    var inpt = { "jsonrpc": "2.0", "method": "T4_MetaData.T4MD.Read", params, "id": 918969569 };
    html2image.customMenu = !html2image.customMenu;
    var url = "https://dev-incubator.cso.ie/PWSS/server/api.jsonrpc"
    html2image.callApiDB(inpt, html2image.fnShowMetadata_callback, url);
}

html2image.addRows = function(obj) {
    try {
        var cols = obj.metadata.columns;
        for (var i = 0; i < obj.data.length; i++) {
            var tr = html2image.tb.insertRow("TR");
            for (var ii = 0; ii < cols.length; ii++) {
                var td = tr.insertCell();
                td.innerHTML = obj.data[i][cols[ii].cname];
            }
        }
    } catch (ex) {
        html2image.mex(ex);
    }
}
var ob
html2image.createUI = function(obj) {
    try {
        ob = obj
        if (obj.metadata) {
            var cols = obj.metadata.columns;
            var filters = obj.metadata.filters;
            if (filters) {
                html2image.filter_container = document.createElement("div");
                html2image.filter_container.className = "d-inline-flex p-2 bd-highlight";
                var fltr = document.createElement("button");
                fltr.className = "btn  p-2 bd-highlight bg-secondary";
                fltr.innerHTML = "Filter";
                fltr.addEventListener("mousedown", export2pdf.hitFilter);
                for (var key in filters) {
                    var col = cols[filters[key]];
                    var d = document.createElement("div");
                    d.className = "d-inline-flex p-2 bd-highlight";
                    var s = document.createElement("span");
                    var i = document.createElement("input"); //  i.addEventListener("keydown", export2pdf.hitFilter);
                    d["cname"] = col["cname"];
                    s.innerHTML = col["label"];
                    d.appendChild(s);
                    d.appendChild(i);
                    html2image.filter_container.appendChild(d);
                }
                html2image.filter_container.appendChild(fltr);
                html2image.ui_container.appendChild(html2image.filter_container);
            }
            if (cols) {
                html2image.t = document.createElement("table");
                var th = html2image.t.createTHead();
                html2image.t.className = "table"
                html2image.tb = html2image.t.createTBody();
                var thr = th.insertRow("TR");
                for (var ii = 0; ii < cols.length; ii++) {
                    var td = thr.insertCell();
                    td.innerHTML = cols[ii].label;
                }
                html2image.addRows(obj);
                html2image.ui_container.appendChild(html2image.t);
            }
        }
    } catch (ex) {
        html2image.mex(ex);
    }
}

html2image.callApiDB = function(input, callback, server = "https://dev-incubator.cso.ie/PWSS/server/API.JSONRPC") {
    // function callApiRead(input, callback, server = "http://localhost:61370/API.JSONRPC?data=") {
    var xObj = new XMLHttpRequest();
    xObj.overrideMimeType("application/json");
    //  var input = server;
    /*
    if (server == "http://localhost:61370/API.JSONRPC") {
        window.location = sel_environment.value + "?data=" + ta_params.value;

        // https: //pdf.cso.ie/api.jsonrpc?data="{"jsonrpc":"2.0","method":"PDFapi.Data.Convert_API.Create","params":{"urls":["https://www.cso.ie/en/releasesandpublications/ep/p-pii/productivityinireland2020/chapter1overviewofproductivitygrowthin2020/"],"chromeCommandLineOptions":["headless","disable-gpu","run-all-compositor-stages-before-draw"],"printOptions":{"paperWidth":8.3,"paperHeight":11.7,"scale":1,"pageRanges":""},"returnType":"base64String"},"id":123}"
        return;
    }
    */
    xObj.open('POST', server, true);
    xObj.setRequestHeader("Access-Control-Allow-Origin", "*");
    xObj.setRequestHeader("Accept", "application/json, text/javascript, */ *; q = 0.01 ");
    xObj.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    xObj.setRequestHeader("Access-Control-Allow-Origin", "*");
    xObj.onreadystatechange = function() {
        if (xObj.readyState === 4 && xObj.status === 200) {
            callback(xObj.responseText);
        }
    };
    xObj.send(
        JSON.stringify(input));
}
html2image.mex = function(ex) {
    alert(ex.message)
}
html2image.fnShowMetadata_callback = function(e) {
    try {
        var obj = JSON.parse(e);
        html2image.createUI(obj.result);
    } catch (ex) {
        alert(ex.message)
    }
}

html2image.redirect2dev = function() {
    window.location = "https://dev-incubator.cso.ie/PWSS/spajica/html2image/poc.html";
}

html2image.callApiReadCallback = function(res) {
    // alert(res);

    window.open("data:application/pdf;base64," + Base64.encode(res));

    const downloadLink = document.createElement("a");
    downloadLink.innerHTML = "download pdf";
    const fileName = "abc.pdf";
    downloadLink.href = res;
    downloadLink.download = fileName;
    downloadLink.click();

    //html2image.customContextMenu.appendChild(downloadLink);


    alert("OK")
}

html2image.dataURItoBlob = function(dataURI) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
        int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'application/pdf' });
    return blob;
}
html2image.callApiRead = function(input, callback = html2image.callApiReadCallback, server = "https://pdf.cso.ie/api.jsonrpc") {
    // function callApiRead(input, callback, server = "http://localhost:61370/API.JSONRPC?data=") {
    var xObj = new XMLHttpRequest();
    xObj.overrideMimeType("application/json");
    xObj.open('POST', server, true);
    //xObj.setRequestHeader("Access-Control-Allow-Origin", "https://dev-incubator.cso.ie");
    // xObj.setRequestHeader("Content-Type", "application/json");

    // xObj.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    // xObj.responseType = 'blob';

    xObj.onreadystatechange = function() {
        if (xObj.readyState === 4 && xObj.status === 200) {
            html2image.downloadPDF.style.backgroundColor = "#006168";
            // html2image.downloadPDF.style.backgroundColor = "#006168";//#006168
            html2image.downloadPDF.disabled = false;
            html2image.downloadPDF.style.cursor = "pointer";

            //.classList.remove("btn_disabled");
            html2image.processing = false;
            // html2image.downloadPDF.style.disabled = false;
            html2image.downloadPDF.innerHTML = "Download PDF";

            const downloadLink = window.document.createElement('a');
            var res = JSON.parse(this.response)
            if (res["error"]) {
                alert(this.response);
                return
            }
            var data = res["result"];



            // data should be your response data in base64 format

            const blob = html2image.dataURItoBlob(data.substring(28, data.length - 28));
            const url = URL.createObjectURL(blob);

            // to open the PDF in a new window
            window.open(url, '_blank');



            /*
            const contentTypeHeader = xObj.getResponseHeader("Content-Type");
            downloadLink.href = window.URL.createObjectURL(new Blob([pdf], { type: contentTypeHeader }));
            downloadLink.download = "fileName2.pdf";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            */
            //alert("OK")
            //callback(xObj.responseText);
        }
    };
    xObj.send(
        JSON.stringify(input));
}
html2image.callApiRead_Verk = function(input, callback = html2image.callApiReadCallback, server = "https://pdf.cso.ie/api.jsonrpc") {
    // function callApiRead(input, callback, server = "http://localhost:61370/API.JSONRPC?data=") {
    var xObj = new XMLHttpRequest();
    xObj.overrideMimeType("application/json");
    xObj.open('POST', server, true);
    //xObj.setRequestHeader("Access-Control-Allow-Origin", "https://dev-incubator.cso.ie");
    xObj.setRequestHeader("Content-Type", "application/json");

    xObj.onreadystatechange = function() {
        if (xObj.readyState === 4 && xObj.status === 200) {
            callback(xObj.responseText);
        }
    };
    xObj.send(
        JSON.stringify(input));
}
html2image.fnExportPDF = function(inp) {
    var toSend = {
        //  "urls": ["https://test-t4.cso.ie/terminalfour/preview/10/en/46550"],
        "urls": inp,
        // "urls": ["https://www.cso.ie/en/releasesandpublications/ep/p-pii/productivityinireland2020/chapter1overviewofproductivitygrowthin2020/"],



        "chromeCommandLineOptions": [
            "headless",
            "disable-gpu",
            "run-all-compositor-stages-before-draw"
        ],
        "printOptions": {
            "paperWidth": 8.3,
            "paperHeight": 11.7,
            "scale": 1.0,
            "pageRanges": ""
        },
        "returnType": "base64String"
    };
    var url = "https://pdf.cso.ie/api.jsonrpc";

    if (false) // if (true) //
        api.ajax.jsonrpc.request(
        url,
        "PDFapi.Data.Convert_API.Create", toSend,
        "html2image.res", toSend,
        "html2image.err", null, {
            asyc: true
        });

    else {
        var inp2 = { "jsonrpc": "2.0", "method": "PDFapi.Data.Convert_API.Create", "params": toSend };
        html2image.callApiRead(inp2, html2image.callApiReadCallback, url);
    }

}

html2image.fnExportPDF_old = function(e) {
    var inp = {
        "urls": ["https://test-t4.cso.ie/terminalfour/preview/10/en/46550"],

        "chromeCommandLineOptions": [
            "headless",
            "disable-gpu",
            "run-all-compositor-stages-before-draw"
        ],
        "printOptions": {
            "paperWidth": 8.3,
            "paperHeight": 11.7,
            "scale": 1.0,
            "pageRanges": ""
        },
        "returnType": "base64String"
    };
    html2image.callApiRead(inp)

}

html2image.fnExitEMode = function(e) {
    html2image.customMenu = !html2image.customMenu;
    if (html2image.customMenu) {
        html2image.customContextMenu.children[0].children[html2image.changeModeIndex].innerHTML = '<button class="btn btn-tertiary" style="width: 220px;">Exit Custom Menu Mode</button>';
    } else {
        html2image.customContextMenu.children[0].children[html2image.changeModeIndex].innerHTML = '<button class="btn btn-tertiary" style="width: 220px;">Enable Custom Mode</button>'; //"";
    }
    // html2image.customContextMenu.remove();
}



html2image.findParentClassRec = function(inputEl) {
        try {
            var localParentElement = inputEl.parentElement;
            var doReturn = false;
            if (localParentElement) {
                console.log(inputEl.parentElement.className);
                for (var i = 0; i < localParentElement.classList.length; i++) {
                    if (inputEl.parentElement.classList[i] == "dashboard-snapshot") {
                        //if (inputEl.parentElement.classList[i] == "container") {
                        doReturn = true;
                        break;
                    }
                }
                if (doReturn)
                    return localParentElement;
                else
                    return html2image.findParentClassRec(localParentElement);
            }
        } catch (ex) {
            alert(ex.message);
        }
    }
    /*
    html2image.mouse_down = function(e) {
        if (e.button == 2) {
            e.preventDefault();
        }
    }
    */
html2image.mouse_up = function(e) {
    if (e.button == 2 && html2image.customMenu) {
        e.preventDefault();
        var tgt_wrk = e.target;
        html2image.tgt = html2image.findParentClassRec(tgt_wrk);
        html2image.T4body.appendChild(html2image.customContextMenu);
    }
}

html2image.b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
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
html2image.fnExport = function(e) {
    //html2image.customContextMenu.remove();
    var tgt = e.target.parentElement.parentElement.children[1]; // html2image.tgt;
    if (tgt)
        domtoimage.toPng(tgt)
        .then(function(dataUrl) {
            var img = new Image();
            img.addEventListener('load', function() {
                //return
                var img2 = new Image();
                const contentType = 'image/png';
                const b64Data = 'data:image/png;base64,' + window.btoa(img.src);

                //'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
                var b64 = img.src.substring(22, img.src.length - 22)
                const blob = html2image.b64toBlob(b64, contentType);
                const blobUrl = URL.createObjectURL(blob);
                var url = blobUrl;
                /*

                              
                                */
                img2.src = url;
                console.log(url);
                //  var d = document.querySelector(".p");
                //  d.textContent += url;

                const link = document.createElement('a')
                link.href = url; // imageURL;
                html2image.file_index += 1;
                link.download = 'img000' + html2image.file_index + ".png"
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)

            });
            img.src = dataUrl;
            // var win = window.open("", "Title", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=780,height=200,top=" + (screen.height - 400) + ",left=" + (screen.width - 840));
            // if (win) win.document.body.appendChild(img);
            //  html2image.customContextMenu.imageContainter.appendChild(img);


            /*
                        const imageURL = URL.createObjectURL(img)

                        const link = document.createElement('a')
                        link.href = imageURL;
                        html2image.file_index += 1;
                        link.download = 'img000' + html2image.file_index + ".png"
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
            */
            //  downloadImage(img);
            // html2image.customContextMenu.imageContainter.style.display = "block"
        })
        .catch(function(error) {
            console.error('oops, something went wrong!', error);
        });

    else
        alert("No Element with class:dashboard-snapshot to export as Image!");
}
html2image.fnClose = function(e) {
    html2image.customContextMenu.imageContainter.innerHTML = "";
    html2image.customContextMenu.imageContainter.style.display = "none";
    html2image.customContextMenu.remove();
}


html2image.err = function(e) {
    alert(JSON.stringify(e));

}
html2image.res = function(e) {
    alert("res" + JSON.stringify(e));
}
html2image.imageouseDown = function(e) {
    html2image.customContextMenu.remove();
}
async function downloadImage(imageSrc) {
    const image = await fetch(imageSrc)
    const imageBlog = await image.blob()
    const imageURL = URL.createObjectURL(imageBlog)

    const link = document.createElement('a')
    link.href = imageURL;
    html2image.file_index += 1;
    link.download = 'img00' + html2image.file_index + ".jpg"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
html2image.createCustomContextMenu = function(e) {
    try {
        html2image.customContextMenu = document.createElement("div");
        html2image.customContextMenu.style.position = "absolute";
        html2image.customContextMenu.style.top = "600px";
        // html2image.customContextMenu.style.backgroundColor = "white";
        html2image.customContextMenu.style.left = "300px";
        // html2image.imageContainter
        var imc = '<div style="border:solid;display:none;width:800px;height:100%;background-color:white"></div><div><div>';
        var e2pdf = '<button class="btn btn-tertiary" style="width: 220px;">ExportToPDF2</button>';
        var shMetaData = '<button class="btn btn-tertiary" style="width: 220px;">ShowMetaData</button>';
        var html = '<div class="containter position-absolute bg-secondary" style="border:solid;background-color:#45C1C0;width: 220px;padding:15px"><span style="background-color:orange;cursor:pointer">Exit</span><button class="btn btn-tertiary" style="width: 220px;">ExportToImage</button>' +
            e2pdf + shMetaData + '<button class="btn btn-tertiary" style="width: 220px;">Display MetaData</button><span style="background-color:orange;cursor:pointer">Enable Normal Mode</span>' +
            imc + '</div>';
        html2image.customContextMenu.innerHTML = html;
        html2image.customContextMenu.children[0].children[0].addEventListener("click", html2image.fnClose);
        html2image.customContextMenu.children[0].children[1].addEventListener("click", html2image.fnExport);
        html2image.customContextMenu.children[0].children[2].addEventListener("click", html2image.fnExportPDF);
        html2image.customContextMenu.children[0].children[3].addEventListener("click", html2image.fnStyle);
        html2image.customContextMenu.children[0].children[html2image.changeModeIndex].addEventListener("click", html2image.fnExitEMode);
        html2image.customContextMenu.children[0].children[html2image.showMetadata].addEventListener("click", html2image.redirect2dev);
        html2image.customContextMenu.imageContainter = html2image.customContextMenu.children[0].children[html2image.customContextMenu.children[0].children.length - 1];
        // html2image.ui_container = html2image.customContextMenu.children[0].children[html2image.customContextMenu.children[0].children.length - 1];
    } catch (ex) {
        alert(ex.message);
    }

}
html2image.loadPage = function(e) {
    html2image.T4body = document.getElementsByTagName('body')[0];


    html2image.ui_container = document.createElement("div");
    html2image.T4body.appendChild(html2image.ui_container); //todo test
    return
    if (e.keyCode == 119) {
        html2image.createCustomContextMenu();
        return
        //  var node = document.getElementById("a115");

        html2image.on = !html2image.on;
        if (html2image.on) document.style.cursor = "pointer";
        alert(html2image.on)
        return

    } else {
        alert(e.keyCode)
    }
};


window.addEventListener("load", html2image.loadPage2);