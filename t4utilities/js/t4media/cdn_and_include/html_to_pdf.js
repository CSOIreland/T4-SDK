//function to read query string

function getParameterByName(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

$(function() {

    $(".pdfLinks").remove();

    var selectPDF = getParameterByName('selectpdf');
    var type = getParameterByName('type');
    var PDFdomain = document.domain;
    var pageURL = window.location.href;

    var QRname = $('#t4title').attr("content");

    QRname = QRname.replace(/[^A-Za-z0-9\s]/gi, "");


    if (PDFdomain == "www.cso.ie" || PDFdomain == "cso.ie") {

        //$("#qrImage").attr("src", "https://pdf.cso.ie/www/qr/" + $.trim(QRname) + ".png");

    } else if (PDFdomain == "uat.cso.ie") {

        //$("#qrImage").attr("src", "https://pdf.cso.ie/uat/qr/" + $.trim(QRname) + ".png");

    } else {
        $('.downloadPDF').remove();

    }

    if (selectPDF == "true" && type == "summary") {

        $('.BackgroundNotes').remove();
        $('.ERtable table').remove();
        $('.footer').remove();
        $('.header').remove();

    }
    if (selectPDF == "true" && type == "full") {

        $('.footer').remove();
        $('.header').remove();

    }

    if (selectPDF == null) {

        $("#QRcode").remove();

        $("#downloadIconSummary").html('<i class=\"fa fa-spinner fa-spin fa-fw\"></i>');
        $("#downloadIconFull").html('<i class=\"fa fa-spinner fa-spin fa-fw\"></i>');

        //getFullPDF();
        //getSummaryPDF();

        function getFullPDF() {
            $.ajax({
                type: "POST",
                url: "https://pdf.cso.ie/default.aspx/clientRequest",
                data: '{url: "' + pageURL + '", type: "full"}',
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: OnSuccessFull,
                failure: function(response) {

                    $("#pdfLinks").hide();
                }
            });
        }

        function getSummaryPDF() {
            $.ajax({
                type: "POST",
                url: "https://pdf.cso.ie/default.aspx/clientRequest",
                data: '{url: "' + pageURL + '", type: "summary"}',
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: OnSuccessSummary,
                failure: function(response) {

                    $("#pdfLinks").hide();
                }
            });
        }

        function OnSuccessFull(response) {

            if (response.d[2] == 'success') {
                $("#pdfFullLink").attr("href", "https://pdf.cso.ie/" + response.d[3] + "/pdf/" + response.d[0]);
                $("#pdfFullLink").attr("onclick", "");
                $("#pdfFullLink").attr("target", "_blank");
                $("#fullSize").html(response.d[1]);

                $("#downloadIconFull").html('<i class=\"fa fa-download\" aria-hidden=\"true\"></i>');

            } else if (response.d[2] == 'overssizedHTML') {

                $("#downloadIconFull").html('<i style=\"color: red\" class=\"fa fa-exclamation-triangle\" aria-hidden=\"true\"></i>');
                $("#pdfFullLink").attr("onclick", "alert('Unfortunately this release is too large to convert to a PDF file. If you wish to print this release, please use the print option in your browser.'); return false;");

            } else {

                $("#downloadIconFull").html('<i style=\"color: red\" class=\"fa fa-exclamation-triangle\" aria-hidden=\"true\"></i>');
                $("#pdfFullLink").attr("onclick", "alert('Error generating the PDF document. Please reload the page and try again. If the problem continues please contact the CSO.'); return false;");

            }

        }

        function OnSuccessSummary(response) {
            if (response.d[2] == 'success') {

                $("#pdfSummaryLink").attr("href", "https://pdf.cso.ie/" + response.d[3] + "/pdf/" + response.d[0]);
                $("#pdfSummaryLink").attr("onclick", "");
                $("#pdfSummaryLink").attr("target", "_blank");
                $("#summarySize").html(response.d[1]);

                $("#downloadIconSummary").html('<i class=\"fa fa-download\" aria-hidden=\"true\"></i>');

            } else if (response.d[2] == 'overssizedHTML') {

                $("#downloadIconFull").html('<i style=\"color: red\" class=\"fa fa-exclamation-triangle\" aria-hidden=\"true\"></i>');
                $("#pdfFullLink").attr("onclick", "alert('Unfortunately this release is too large to convert to a PDF file. If you wish to print this release, please use the print option in your browser.'); return false;");

            } else {

                $("#downloadIconSummary").html('<i style=\"color: red\" class=\"fa fa-exclamation-triangle\" aria-hidden=\"true\"></i>');
                $("#pdfSummaryLink").attr("onclick", "alert('Error generating the PDF document. Please reload the page and try again. If the problem continues please contact the CSO.'); return false;");

            }

        }

    }

});