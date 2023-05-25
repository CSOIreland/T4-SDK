var t4Sdk = t4Sdk || {};
t4Sdk.high_chart_fix = {};
t4Sdk.html2image = t4Sdk.html2image || {};
t4Sdk.contextMenu = null;
t4Sdk.high_chart_fix.converted = null;
class ConvertedDivs {
    constructor(originalDiV, convertedImagE) {
        this.originalDiv = originalDiV;
        this.convertedImage = convertedImagE;
        this.lastElement = false;
    }
}
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
    console.log('export2pdf_completed');
    //document.body.appendChild(div);
}

t4Sdk.high_chart_fix.callback = function () {
    t4Sdk.contextMenu = null;
    var ok = false;
    for (var i = 0; i < t4Sdk.high_chart_fix.converted.length; i++) {
        if (t4Sdk.high_chart_fix.converted[i].convertedImage) {
            ok = true;
        }
        else
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

t4Sdk.html2image.fnExportPrintPage = function (cnv, type, icon, callbackFunc) {
    // alert("ver 2")
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


t4Sdk.high_chart_fix.customContextMenu = function (event) {
    event.preventDefault();
    if (t4Sdk.contextMenu == null) {
        t4Sdk.isCustomContextMenuClosed = false;
        t4Sdk.contextMenu = document.createElement('div');
        t4Sdk.contextMenu.style.position = 'absolute';
        t4Sdk.contextMenu.style.top = `${event.clientY}px`;
        t4Sdk.contextMenu.style.left = `${event.clientX}px`;
        t4Sdk.contextMenu.style.backgroundColor = 'white';
        t4Sdk.contextMenu.style.border = '1px solid black';
        t4Sdk.contextMenu.style.padding = '8px';
        t4Sdk.contextMenu.style.zIndex = 1000;
        const menuItem = document.createElement('div');
        menuItem.textContent = 'Print Page';
        menuItem.style.cursor = "pointer";
        menuItem.className = "custom_menu";
        menuItem.addEventListener('click', function () {
            t4Sdk.high_chart_fix.fixSVG();
        });
        t4Sdk.contextMenu.appendChild(menuItem);
        document.addEventListener('click', function removeContextMenu() {
            t4Sdk.contextMenu.remove();
            document.removeEventListener('click', removeContextMenu);
        });
    }
    document.body.appendChild(t4Sdk.contextMenu);
};

t4Sdk.high_chart_fix.populateElements = function (className) {
    var arr = document.body.getElementsByClassName(className);
    for (var i = 0; i < arr.length; i++) {
        t4Sdk.high_chart_fix.converted[t4Sdk.high_chart_fix.converted.length] = new ConvertedDivs(arr[i]);
    }
}
t4Sdk.high_chart_fix.gcs = function (element) {


    let computedStyles = window.getComputedStyle(element);

    for (let i = 0; i < computedStyles.length; i++) {
        let property = computedStyles[i];
        let value = computedStyles.getPropertyValue(property);
        element.style.setProperty(property, value);
    }
    element["0_gcc"] = "hello_world";
    var stg = element.outerHTML;
    console.log(stg);
    // element.setAttribute("0_gcc", true);
}
t4Sdk.high_chart_fix.noSVGs = false;
t4Sdk.high_chart_fix.enumerateElements = function () {
    t4Sdk.high_chart_fix.converted = new Array();
    t4Sdk.high_chart_fix.populateElements("highchartBox");
    t4Sdk.high_chart_fix.populateElements("px-stat-widget-chart");
    t4Sdk.high_chart_fix.populateElements("highchart-pie-wrapper");
}
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

t4Sdk.high_chart_fix.revert2Original = function () {
    if (t4Sdk.high_chart_fix.noSVGs)
        t4Sdk.high_chart_fix.noSVGs = false;
    else {
        for (var i = 0; i < t4Sdk.high_chart_fix.converted.length; i++) {
            var c = t4Sdk.high_chart_fix.converted[i];
            c.convertedImage.parentElement.insertBefore(c.originalDiv, c.convertedImage);
            c.convertedImage.parentElement.removeChild(c.convertedImage);
        }
        t4Sdk.high_chart_fix.truncatedText.parentElement.removeChild(t4Sdk.high_chart_fix.truncatedText);
    }
}


t4Sdk.high_chart_fix.fixSVG4pdf_delay = function () {
    setTimeout(() => {
        t4Sdk.high_chart_fix.fixSVG4pdf();
        console.log('export2pdf_started');
    }, 5000);

};

window.addEventListener('load', t4Sdk.high_chart_fix.fixSVG4pdf_delay);
//const mediaQueryList = window.matchMedia('print');

t4Sdk.high_chart_fix.truncatedText = document.createElement("span");
t4Sdk.high_chart_fix.truncatedText.innerHTML = ""; // "<br>If you have issues with truncated text, please make sure that your browser zoom is equal to 100% or more.";
t4Sdk.high_chart_fix.checkZoomLevel = function () {

    document.body.appendChild(t4Sdk.high_chart_fix.truncatedText);
    /*
        var stg = `[window.visualViewport.scale vs devicePixelRatio]:${window.visualViewport.scale}vs${window.devicePixelRatio}
        Please, check this with zoom:100% and zoom:90%!`;
        alert(stg);
    */
    return true;

}

window.addEventListener('keydown', function (event) {
    if ((event.key === 'P' || event.key === 'p') && event.ctrlKey) {
        event.preventDefault();
        // Call your custom function
        t4Sdk.high_chart_fix.fixSVG();
    }
});

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
//call from .pdf backend
t4Sdk.high_chart_fix.fixSVG4pdf_delay2 = function () {
    setTimeout(() => {
        t4Sdk.high_chart_fix.fixSVG4pdf2();
        console.log('export2pdf_started');
    }, 5000);
};