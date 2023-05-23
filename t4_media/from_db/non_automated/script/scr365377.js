//set text on the first option which is blank and disable it
$(document).ready(function () {
    $("#realaese-archive-side-navigation select").find("option:first-child").text("Select Year").attr('disabled', 'disabled')
});  