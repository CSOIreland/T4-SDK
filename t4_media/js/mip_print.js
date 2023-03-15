function printSelection(node, graphID, mapID) {


    //get number of style tags in documnet
    var count = document.getElementsByTagName('style').length;

    //build string of styles to add to head of print page so tables will look better

    var styles = "<style type=\"text/css\">";

    styles = styles.concat("body {font-family: Verdana, Geneva, Arial, Helvetica, sans-serif;font-size:11px;color: #02395F;} .icons {display: none} .highchartTable{display: none} img{margin-bottom: 15px} .IndicatorText{width: 70%} ");

    for (var i = 0; i < count; i++) //create one big string of styles from orginal page
    {


        styles = styles.concat(document.getElementsByTagName('style')[i].innerHTML);

    }



    styles = styles.concat("</style>")


    var html = "<html><head>" + styles + "</head>";


    var content = node.innerHTML

    var graphHtml;
    var graphSrc = document.getElementById(graphID).href;
    // alert(graphSrc);
    var graphTitle = document.getElementById(graphID).title;

    if (graphSrc == "http://null/") {
        graphHtml = "";

    } else {
        graphHtml = "<div class=\"mapPrint\"><img src=\"" + graphSrc + "\" alt=\"\"><div>" + graphTitle + "</div></div>";
    }

    var mapHtml;

    var mapSrc = document.getElementById(mapID).href;
    //alert('i am here');
    var mapTitle = document.getElementById(mapID).title;

    if (mapSrc == "http://null/") {
        mapHtml = "";

    } else {
        mapHtml = "<div class=\"graphPrint\"><img src=\"" + mapSrc + "\" alt=\"\"><div>" + mapTitle + "</div></div>";
    }



    html = html + "<body onload=\"window.print();\"> <div id=\"container\">";
    // html = html + "<body> <div id=\"container\">";
    html = html + content + graphHtml + mapHtml;
    html = html + "</div></body></html>";
    var pwin = window.open('', 'print_content', 'width=1200,height=600, scrollbars=1');
    pwin.document.open();


    pwin.document.write(html);

    pwin.document.close();

    //setTimeout(function () { pwin.close(); }, 1000);

}