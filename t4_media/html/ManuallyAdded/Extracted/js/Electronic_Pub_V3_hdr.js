//js to set current tab to active on main nav DR

$(document).ready(function () {


    var theme = '<t4 type="navigation" id="70"/>';

    //alert(theme);

    if (theme.length == '0') {
        $("#homeTab").addClass("currentbranch0");
        // alert('I am here');
    }

    else if (theme == 'Statistics' || theme == 'Releases and Publications') {

        $("#statisticsTab").addClass("currentbranch0");

    }

    else if (theme == 'Databases') {

        $("#databasesTab").addClass("currentbranch0");

    }


    else if (theme == 'Surveys and Methodology') {

        $("#methodsTab").addClass("currentbranch0");

    }

    else if (theme == 'About Us') {

        $("#aboutUsTab").addClass("currentbranch0");

    }


    else {
        //do nothing
    }


});

//end main nav JS DR