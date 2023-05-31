//#region Add Namespace
var t4Sdk = t4Sdk || {};
t4Sdk.high_chart_fix = {};
t4Sdk.html2image = t4Sdk.html2image || {};
//#endregion Add Namespace


//#region Init
t4Sdk.contextMenu = null;
t4Sdk.high_chart_fix.converted = null;
t4Sdk.high_chart_fix.noSVGs = false;
t4Sdk.high_chart_fix.truncatedText = document.createElement("span");
t4Sdk.high_chart_fix.truncatedText.innerHTML = T4SDK_HIGHCHARTFIX_TRUNCATED_WARNING;
console.log("ver 30-5-2023");
//#endregion Init


//calback after html -> image conversion for .pdf convert service
t4Sdk.high_chart_fix.callback4pdf = function () {
    t4Sdk.contextMenu = null;
    for (var i = 0; i < t4Sdk.high_chart_fix.converted.length; i++) {
        var c = t4Sdk.high_chart_fix.converted[i];
        c.originalDiv.parentElement.insertBefore(c.convertedImage, c.originalDiv);
        c.originalDiv.parentElement.removeChild(c.originalDiv);
    }
    var div = document.createElement("div");
    div.setAttribute("id", "export2pdf_completed");
    div.style.display = "none";
    t4Sdk.high_chart_fix.body.appendChild(div);
}
//calback after html -> image conversion
t4Sdk.high_chart_fix.callback = function () {
    t4Sdk.contextMenu = null;
    var ok = true;
    for (var i = 0; i < t4Sdk.high_chart_fix.converted.length; i++) {
        if (t4Sdk.high_chart_fix.converted[i].convertedImage == undefined)
            ok = false;
    }
    if (ok) {
        for (var i = 0; i < t4Sdk.high_chart_fix.converted.length; i++) {
            var c = t4Sdk.high_chart_fix.converted[i];
            c.originalDiv.parentElement.insertBefore(c.convertedImage, c.originalDiv);
            c.originalDiv.parentElement.removeChild(c.originalDiv);
        }
        window.print();
        t4Sdk.high_chart_fix.revert2Original();
    }
}
//html -> image conversion 
t4Sdk.html2image.fnExportPrintPage = function (cnv, type, icon, callbackFunc) {
    var opt = { "bgcolor": "white" };
    var tgt = cnv.originalDiv;
    switch (type) {
        case t4Sdk.html2image.png:
            domtoimage.toPng(tgt, opt)
                .then(function (dataUrl) {
                })
                .catch(function (error) {
                    console.error('oops, something went wrong!', error);
                });
            break;
        case t4Sdk.html2image.svg:

            domtoimage.toSvg(tgt, opt)
                .then(function (dataUrl) {
                    cnv.convertedImage = document.createElement('img');
                    //var img = cnv.img;
                    cnv.convertedImage.src = dataUrl;
                    const div = document.createElement('div');
                    div.style.margin = 0;
                    div.style.padding = 0;
                    cnv.convertedImage.style.maxWidth = '100%';
                    cnv.convertedImage.style.maxHeight = '100%';
                    // div.appendChild(img);
                    cnv.convertedImage.onload = function () {
                        callbackFunc();
                    }
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
                    tgt.style.margin = null;
                    tgt.style.padding = null;
                })
                .catch(function (error) {
                    console.error('oops, something went wrong!', error);
                });
            break;
    }
};
//convert elements with certain class name 
t4Sdk.high_chart_fix.populateElements = function (className) {
    var arr = document.body.getElementsByClassName(className);
    for (var i = 0; i < arr.length; i++) {
        t4Sdk.high_chart_fix.converted[t4Sdk.high_chart_fix.converted.length] = new ConvertedDivs(arr[i]);
    }
}
//store in Array elements  to convert
t4Sdk.high_chart_fix.enumerateElements = function () {
    t4Sdk.high_chart_fix.converted = new Array();
    t4Sdk.high_chart_fix.populateElements("highchartBox");
    t4Sdk.high_chart_fix.populateElements("px-stat-widget-chart");
    t4Sdk.high_chart_fix.populateElements("px-stat-widget-map");
    t4Sdk.high_chart_fix.populateElements("highchart-pie-wrapper");
    t4Sdk.high_chart_fix.populateElements("highchart-map-wrapper");
}
//fix elements 4 print by converting it to SVG
t4Sdk.high_chart_fix.fixSVG = function () {
    t4Sdk.high_chart_fix.enumerateElements();
    if (t4Sdk.high_chart_fix.converted.length == 0) {
        t4Sdk.high_chart_fix.noSVGs = true;
        window.print();
        return;
    }
    t4Sdk.high_chart_fix.converted[t4Sdk.high_chart_fix.converted.length - 1].lastElement = true;
    var icn = document.createElement("span");
    if (t4Sdk.high_chart_fix.checkZoomLevel()) {
        for (var i = 0; i < t4Sdk.high_chart_fix.converted.length; i++) {
            t4Sdk.html2image.fnExportPrintPage(t4Sdk.high_chart_fix.converted[i], t4Sdk.html2image.svg, icn, t4Sdk.high_chart_fix.callback);
        }
    }
}
//fix elements 4 print by converting it to SVG 4 pdf service
t4Sdk.high_chart_fix.fixSVG4pdf = function () {
    if (window.location.href.split('?')[1] == "export2pdf") {
        t4Sdk.high_chart_fix.body = document.body;
        t4Sdk.high_chart_fix.enumerateElements();
        if (t4Sdk.high_chart_fix.converted.length == 0) {
            t4Sdk.high_chart_fix.noSVGs = true;
            //window.print();
            return;
        }
        t4Sdk.high_chart_fix.converted[t4Sdk.high_chart_fix.converted.length - 1].lastElement = true;
        var icn = document.createElement("span");
        if (t4Sdk.high_chart_fix.checkZoomLevel()) {
            for (var i = 0; i < t4Sdk.high_chart_fix.converted.length; i++) {
                t4Sdk.html2image.fnExportPrintPage(t4Sdk.high_chart_fix.converted[i], t4Sdk.html2image.svg, icn, t4Sdk.high_chart_fix.callback4pdf);
            }
        }
    }
}
//return document in original state
t4Sdk.high_chart_fix.revert2Original = function () {
    if (t4Sdk.high_chart_fix.noSVGs)
        t4Sdk.high_chart_fix.noSVGs = false;
    else {
        for (var i = 0; i < t4Sdk.high_chart_fix.converted.length; i++) {
            var c = t4Sdk.high_chart_fix.converted[i];
            c.convertedImage.parentElement.insertBefore(c.originalDiv, c.convertedImage);
            c.convertedImage.parentElement.removeChild(c.convertedImage);
            c.convertedImage.onload = null;
        }
        t4Sdk.high_chart_fix.truncatedText.parentElement.removeChild(t4Sdk.high_chart_fix.truncatedText);
    }
};
//check zoom level, if is not 100% labels on charts will be cutted.
t4Sdk.high_chart_fix.checkZoomLevel = function () {
    document.body.appendChild(t4Sdk.high_chart_fix.truncatedText);
    return true;
}
//fix elements 4 print by converting it  
t4Sdk.high_chart_fix.fixSVG4pdf2 = function () {
    t4Sdk.high_chart_fix.body = document.body;
    t4Sdk.high_chart_fix.enumerateElements();
    if (t4Sdk.high_chart_fix.converted.length == 0) {
        t4Sdk.high_chart_fix.noSVGs = true;
        return;
    }
    t4Sdk.high_chart_fix.converted[t4Sdk.high_chart_fix.converted.length - 1].lastElement = true;
    var icn = document.createElement("span");
    if (t4Sdk.high_chart_fix.checkZoomLevel()) {
        for (var i = 0; i < t4Sdk.high_chart_fix.converted.length; i++) {
            t4Sdk.html2image.fnExportPrintPage(t4Sdk.high_chart_fix.converted[i], t4Sdk.html2image.svg, icn, t4Sdk.high_chart_fix.callback4pdf);
        }
    }
}
