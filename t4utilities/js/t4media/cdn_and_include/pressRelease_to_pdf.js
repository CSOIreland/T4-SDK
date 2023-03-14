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
    //remove while HTML to PDF not working
    $('.downloadPDF').remove();

    var selectPDF = getParameterByName('selectpdf');
    var type = getParameterByName('type');
    var PDFdomain = document.domain;
    var pageURL = window.location.href;




    if (PDFdomain == "www.cso.ie" || PDFdomain == "cso.ie") {



    } else if (PDFdomain == "uat.cso.ie") {



    } else {
        $('.downloadPDF').remove();

    }


    if (selectPDF == "true" && type == "full") {

        $('.footer').remove();
        $('.header').remove();

    }

    if (selectPDF == null) {



        $("#downloadIconFull").html('<i class=\"fa fa-spinner fa-spin fa-fw\"></i>');

        //getFullPDF();


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



        function OnSuccessFull(response) {

            if (response.d[2] == 'success') {
                $("#pdfFullLink").attr("href", "https://pdf.cso.ie/" + response.d[3] + "/pdf/" + response.d[0]);
                $("#pdfFullLink").attr("onclick", "");
                $("#pdfFullLink").attr("target", "_blank");
                $("#fullSize").html(response.d[1]);

                $("#downloadIconFull").html('<i class=\"fa fa-download\" aria-hidden=\"true\"></i>');

            } else if (response.d[2] == 'overssizedHTML') {

                $("#downloadIconFull").html('<i style=\"color: red\" class=\"fa fa-exclamation-triangle\" aria-hidden=\"true\"></i>');
                $("#pdfFullLink").attr("onclick", "alert('Unfortunately this page is too large to convert to a PDF file. If you wish to print this page, please use the print option in your browser.'); return false;");

            } else {

                $("#downloadIconFull").html('<i style=\"color: red\" class=\"fa fa-exclamation-triangle\" aria-hidden=\"true\"></i>');
                $("#pdfFullLink").attr("onclick", "alert('Error generating the PDF document. Please reload the page and try again. If the problem continues please contact the CSO.'); return false;");

            }

        }



    }

});