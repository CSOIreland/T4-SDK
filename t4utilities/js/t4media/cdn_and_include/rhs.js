//if both see also links are blank tha hide the whole div

$(document).ready(function() {
    if ($('#externalLink').is(':empty') && $('#internalLink').is(':empty') && $('#pressReleaselLink').is(':empty')) {

        // $("#SeeAlso").hide();
    } else {
        // $("#SeeAlso").show();
    }


    $(".optional").each(function() {

        if ($(this).attr('href') == "") {

            $(this).remove();
        }
    });

    $(".optional").each(function() {

        if ($(this).is(':empty')) {

            $(this).remove();
        }
    });








});

//if internal link is blank than hide that span so it doesn't cause white space
$(document).ready(function() {
    if ($('#internalLink').is(':empty')) {

        $("#internalLink").hide();
    } else {
        $("#internalLink").show();
    }
});


//if external link is blank than hide that span so it doesn't cause white space


$(document).ready(function() {
    if ($('#externalLink').is(':empty')) {

        $("#externalLink").hide();
    } else {
        $("#externalLink").show();
    }
});

//if press release link is blank than hide that span so it doesn't cause white space


$(document).ready(function() {
    if ($('#pressReleaselLink').is(':empty')) {

        $("#pressReleaselLink").hide();
    } else {
        $("#pressReleaselLink").show();
    }
});


//if all statbank links are bland than hide entire div

$(document).ready(function() {
    if ($('#statbankLink1').is(':empty') && $('#statbankLink2').is(':empty') && $('#statbankLink3').is(':empty') && $('#statbankLink4').is(':empty') && $('#statbankLink5').is(':empty') && $('#statbankLink6').is(':empty')) {

        $("#statbankLinks").hide();
    } else {
        $("#statbankLinks").show();
    }
});

//check each statbank link. If one is empty than hide its span so it doesn't cause white space
$(document).ready(function() {
    if ($('#statbankLink1').is(':empty')) {

        $("#statbankLink1").hide();
    } else {
        $("#statbankLink1").show();
    }
});





$(document).ready(function() {
    if ($('#statbankLink2').is(':empty')) {

        $("#statbankLink2").hide();
    } else {
        $("#statbankLink2").show();
    }
});





$(document).ready(function() {
    if ($('#statbankLink3').is(':empty')) {

        $("#statbankLink3").hide();
    } else {
        $("#statbankLink3").show();
    }
});





$(document).ready(function() {
    if ($('#statbankLink4').is(':empty')) {

        $("#statbankLink4").hide();
    } else {
        $("#statbankLink4").show();
    }
});





$(document).ready(function() {
    if ($('#statbankLink5').is(':empty')) {

        $("#statbankLink5").hide();
    } else {
        $("#statbankLink5").show();
    }
});





$(document).ready(function() {
    if ($('#statbankLink6').is(':empty')) {

        $("#statbankLink6").hide();
    } else {
        $("#statbankLink6").show();
    }
});



//if both international comparison links are blank tha hide the whole div


$(document).ready(function() {
    if ($('#Internationalcomparison1').is(':empty') && $('#Internationalcomparison2').is(':empty')) {

        $("#noLink").show();
    } else {
        $("#noLink").hide();
    }
});

//if international comparison link 1 is blank than hide its span so it doesn't cause white space


$(document).ready(function() {
    if ($('#Internationalcomparison1').is(':empty')) {

        $("#Internationalcomparison1").hide();
    } else {
        $("#Internationalcomparison1").show();
    }
});


//if international comparison link 1 is blank than hide its span so it doesn't cause white space


$(document).ready(function() {
    if ($('#Internationalcomparison1').is(':empty')) {

        $("#Internationalcomparison1").hide();
    } else {
        $("#Internationalcomparison1").show();
    }
});


//if international comparison link 2 is blank than hide its span so it doesn't cause white space


$(document).ready(function() {
    if ($('#Internationalcomparison2').is(':empty')) {

        $("#Internationalcomparison2").hide();
    } else {
        $("#Internationalcomparison2").show();
    }
});









$(document).ready(function() {
    if ($('#statbankLink1').is(':empty')) {

        $("#statbankLink1").hide();
    } else {
        $("#statbankLink1").show();
    }
});





$(document).ready(function() {
    if ($('#statbankLink2').is(':empty')) {

        $("#statbankLink2").hide();
    } else {
        $("#statbankLink2").show();
    }
});





$(document).ready(function() {
    if ($('#statbankLink3').is(':empty')) {

        $("#statbankLink3").hide();
    } else {
        $("#statbankLink3").show();
    }
});





$(document).ready(function() {
    if ($('#statbankLink4').is(':empty')) {

        $("#statbankLink4").hide();
    } else {
        $("#statbankLink4").show();
    }
});





$(document).ready(function() {
    if ($('#statbankLink5').is(':empty')) {

        $("#statbankLink5").hide();
    } else {
        $("#statbankLink5").show();
    }
});





$(document).ready(function() {
    if ($('#statbankLink6').is(':empty')) {

        $("#statbankLink6").hide();
    } else {
        $("#statbankLink6").show();
    }
});



$(document).ready(function() {
    var value = $('#MethodologyLink').attr('href');

    if (value.length == 0) {


        $("#MethodologySpan").hide();

    }

});


$(document).ready(function() {
    var value = $('#PreviousReleasesLink').attr('href');


    if (value.length == 0) {


        $("#PreviousReleasesSpan").hide();

    }

});