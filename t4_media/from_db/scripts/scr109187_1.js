 
//js to set current tab to active on main nav dr

    $(document).ready(function () {


        var theme = '<t4 type="navigation" id="70"/>';

        //alert(theme);

        if (theme.length == '0') {
            $("#hometab").addclass("currentbranch0");
            // alert('i am here');
        }

        else if (theme == 'statistics' || theme == 'releases and publications') {

            $("#statisticstab").addclass("currentbranch0");

        }

        else if (theme == 'databases') {

            $("#databasestab").addclass("currentbranch0");

        }


        else if (theme == 'surveys and methodology') {

            $("#methodstab").addclass("currentbranch0");

        }

        else if (theme == 'about us') {

            $("#aboutustab").addclass("currentbranch0");

        }


        else {
            //do nothing
        }
  
  
  
    });

    //end main nav js dr
