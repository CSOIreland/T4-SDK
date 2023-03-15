/*
 * Central Statistics Office
 *  - scripts.js
 *  
 */


// Create user cookie 
function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    } else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}

// Read user cookie
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Erase user cookie. Remove set font style.
function eraseCookie(name) { createCookie(name, "", -1); }

function removeFontStyles() { switchFontStyles("");
    eraseCookie("altStylesheet"); }

// Switch font style and remember across pages
function switchFontStyles(styleTitle) {
    $('link[rel="alternate stylesheet"]').each(function(i) {
        this.disabled = true;
        if (this.getAttribute('title') == styleTitle) {
            this.disabled = false;
            eraseCookie("altStylesheet");
            createCookie("altStylesheet", styleTitle, 356);
        }
    });
}

// Fix so content column is full length
function fixLongColumn() {
    var rightColHeight = $("div.columnRight").outerHeight();
    if (rightColHeight > $("div.contentBlock").outerHeight()) {
        $("div.contentBlock").css({ 'min-height': rightColHeight });
        if ($.browser.msie && $.browser.version == 6.0) { $("div.contentBlock").css({ 'height': rightColHeight }); }
    }
}

// Fix homepage long column
function fixLongColumn() {
    var rightColHeight = $("div.columnRight").outerHeight();
    if (rightColHeight > $("div.contentBlock").outerHeight()) {
        $("div.contentBlock").css({ 'min-height': rightColHeight });
        if ($.browser.msie && $.browser.version == 6.0) { $("div.contentBlock").css({ 'height': rightColHeight }); }
    }
}

function fixNewsDBDcolumn() {
    var dbnewsCol = $(".news-databasedirect").outerHeight();
    if (dbnewsCol > $(".news-corner").outerHeight()) {
        $(".news-corner").css({ 'min-height': dbnewsCol });
        if ($.browser.msie && $.browser.version == 6.0) { $(".news-corner").css({ 'height': dbnewsCol }); }
    }
}


// jQuery
$(document).ready(function() {

    if (readCookie("altStylesheet") != (null) || ("")) {
        switchFontStyles(readCookie("altStylesheet"));
    }
    fixLongColumn();

    if ($("news-databasedirect").length > -1) {
        fixNewsDBDcolumn();
    }


});