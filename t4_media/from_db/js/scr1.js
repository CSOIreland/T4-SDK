
//js to set current tab to active on main nav dr

$(document).ready(function () {


    //  var t4Sdk.theme = '<t4 type="navigation" id="70"/>';

    //alert(t4Sdk.theme);

    if (t4Sdk.theme.length == '0') {
        $("#hometab").addclass("currentbranch0");
        // alert('i am here');
    }

    else if (t4Sdk.theme == 'statistics' || t4Sdk.theme == 'releases and publications') {

        $("#statisticstab").addclass("currentbranch0");

    }

    else if (t4Sdk.theme == 'databases') {

        $("#databasestab").addclass("currentbranch0");

    }


    else if (t4Sdk.theme == 'surveys and methodology') {

        $("#methodstab").addclass("currentbranch0");

    }

    else if (t4Sdk.theme == 'about us') {

        $("#aboutustab").addclass("currentbranch0");

    }


    else {
        //do nothing
    }


});

    //end main nav js dr
