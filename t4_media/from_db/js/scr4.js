
$(function () {

   var publicationtitle = t4Sdk.publicationTitle;// escape('<t4 type="navigation" id="778"/>');
   var chaptertitle = t4Sdk.chartTitle;//escape('<t4 type="title"/>');

   if (publicationtitle == chaptertitle) {

      $("#chaptertitle").hide();
   }

});

