//#region Add Namespace
var t4Sdk = t4Sdk || {};
t4Sdk.html2pdf = t4Sdk.html2pdf || {};
//#endregion Add Namespace

//#region Init
t4Sdk.html2pdf.downloadSelectionUL = null;
t4Sdk.html2pdf.processing = false;
//#endregion Init


//disabling checkboxes to not open links from hrefs
t4Sdk.html2pdf.disableHrefs = function (e) {
    var ch = document.getElementById(T4SDK_HTML2PDF_MAIN_DIV_ID);
    t4Sdk.html2pdf.downloadSelectionUL = ch;
    if (ch) {
        ch.classList.add("moduleBody");
        for (var i = 0; i < ch.children.length; i++) {
            var cbox = ch.children[i];
            cbox.children[1].style.display = "none";
            var sp = document.createElement("span");
            sp.style.margin = "8px";
            sp.innerHTML = cbox.children[1].innerHTML;
            cbox.appendChild(sp);
        }
        ch.children[ch.children.length - 1].style.display = "none";
        t4Sdk.html2pdf.downloadSelectionParentDIV = ch.parentElement;
        t4Sdk.html2pdf.btnReverse = document.createElement("a");
        t4Sdk.html2pdf.btnReverse.style.display = "block";
        t4Sdk.html2pdf.btnReverse.setAttribute("href", "");
        t4Sdk.html2pdf.downloadPDF = document.createElement("button");
        t4Sdk.html2pdf.btnReverse.innerHTML = "Select all";
        t4Sdk.html2pdf.downloadPDF.className = "btn";
        t4Sdk.html2pdf.downloadPDF.style.border = "none";
        t4Sdk.html2pdf.downloadPDF.innerHTML = "Download PDF";
        t4Sdk.html2pdf.downloadPDF.style.cursor = "pointer";
        ch.parentElement.appendChild(t4Sdk.html2pdf.btnReverse);
        t4Sdk.html2pdf.btnReverse.style.marginLeft = "10px";
        t4Sdk.html2pdf.downloadSelectionParentDIV.appendChild(t4Sdk.html2pdf.downloadPDF);
        t4Sdk.html2pdf.btnReverse.addEventListener("click", t4Sdk.html2pdf.fnT4Reverse);
        t4Sdk.html2pdf.downloadPDF.addEventListener("click", t4Sdk.html2pdf.fnT4Download);
    }
}
//generic function uri2blob
t4Sdk.html2pdf.dataURItoBlob = function (dataURI) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
        int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'application/pdf' });
    return blob;
}
//generic function to call a any API
t4Sdk.html2pdf.callApiRead = function (input, callback = t4Sdk.html2pdf.callApiReadCallback, server = T4SDK_HTML2PDF_PDF_PDF_SERVICE_URL) {
    var xObj = new XMLHttpRequest();
    xObj.overrideMimeType("application/json");
    xObj.open('POST', server, true);
    xObj.onreadystatechange = function () {
        if (xObj.readyState === 4 && xObj.status === 200) {
            t4Sdk.html2pdf.downloadPDF.style.backgroundColor = "#006168";
            t4Sdk.html2pdf.downloadPDF.disabled = false;
            t4Sdk.html2pdf.downloadPDF.style.cursor = "pointer";
            t4Sdk.html2pdf.processing = false;
            t4Sdk.html2pdf.downloadPDF.innerHTML = "Download PDF";
            const downloadLink = window.document.createElement('a');
            var res = JSON.parse(this.response)
            if (res["error"]) {
                alert(this.response);
                return
            }
            var data = res["result"];
            const blob = t4Sdk.html2pdf.dataURItoBlob(data.substring(28, data.length - 28));
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        }
    };
    xObj.send(
        JSON.stringify(input));
}
//call   PDF converting service
t4Sdk.html2pdf.fnExportPDF = function (inp) {
    var toSend = {
        "urls": inp,
        "chromeCommandLineOptions": [
            "headless",
            "disable-gpu",
            "run-all-compositor-stages-before-draw"
        ],
        "printOptions": {
            "paperWidth": 8.3,
            "paperHeight": 11.7,
            "scale": 1.0,
            "pageRanges": "",
            "footerTemplate": "<span class=pageNumber></span> / <span class=totalPages></span>"
        },
        "htmlIdForMasterHeader": "pageHeader",
        "returnType": "base64String"
    };
    var url = "https://pdf.cso.ie/api.jsonrpc";
    var inp2 = { "jsonrpc": "2.0", "method": T4SDK_HTML2PDF_PDF_SERVICE_METHOD_NAME, "params": toSend };
    t4Sdk.html2pdf.callApiRead(inp2, t4Sdk.html2pdf.callApiReadCallback, url);
}
//select or unselect all checkboxes
t4Sdk.html2pdf.fnT4Reverse = function (e) {
    e.preventDefault();
    if (t4Sdk.html2pdf.selectAll)
        t4Sdk.html2pdf.btnReverse.innerHTML = "Select all";
    else
        t4Sdk.html2pdf.btnReverse.innerHTML = "Unselect all";
    t4Sdk.html2pdf.selectAll = !t4Sdk.html2pdf.selectAll;
    var ch = t4Sdk.html2pdf.downloadSelectionUL;
    for (var i = 0; i < ch.children.length; i++) {
        var cbox = ch.children[i].children[0];
        cbox.checked = t4Sdk.html2pdf.selectAll;
    }

}
//execute convert operation and download PDF document
t4Sdk.html2pdf.fnT4Download = function (e) {
    if (t4Sdk.html2pdf.processing) {
        alert("processing mode!")
    } else {
        t4Sdk.html2pdf.downloadPDF.style.disabled = true;
        t4Sdk.html2pdf.processing = true;
        var inp = [];
        var ch = t4Sdk.html2pdf.downloadSelectionUL;
        t4Sdk.html2pdf.downloadPDF.style.backgroundColor = "#45C1C0";
        t4Sdk.html2pdf.downloadPDF.disabled = true;
        t4Sdk.html2pdf.downloadPDF.innerHTML = "Processing...";
        t4Sdk.html2pdf.downloadPDF.style.cursor = "wait";
        for (var i = 0; i < ch.children.length; i++) {
            if (ch.children[i].children[0].checked) {
                var cbox = ch.children[i];
                inp[inp.length] = cbox.children[1].href + "?export2pdf";
            }
        }
        t4Sdk.html2pdf.fnExportPDF(inp);
    }
}
