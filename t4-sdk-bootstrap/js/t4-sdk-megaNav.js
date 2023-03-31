var t4Sdk = t4Sdk || {};
t4Sdk.megaNav = {};
t4Sdk.megaNav.openedMenu = null;
t4Sdk.megaNav.mainNav = null;
t4Sdk.megaNav.displayNavs = function () {
    t4Sdk.megaNav.mainNav.style.display = "block";
}
t4Sdk.megaNav.setMegaMenu = function (dd) {
    // megaMenu.style.display = "block";

    // nav-link dropdown-toggle

    //var arr_toggle = document.querySelectorAll(".dropdown-toggle");
    var arr_toggle = document.querySelectorAll(".t4-sdk-nav-link");
    var arr_megamenus = document.querySelectorAll(".t4-sdk-megamenu");
    var toggle_iccon = document.getElementsByClassName("t4-sdk-navbar-toggler-icon");
    if (toggle_iccon) {
        t4Sdk.megaNav.mainNav = document.getElementsByClassName("t4-sdk-navbar-collapse")[0];
        toggle_iccon[0].addEventListener("click", t4Sdk.megaNav.displayNavs);
    }
    if (arr_toggle.length > 0) {
        for (var i = 0; i < arr_toggle.length; i++) {
            var toggle = arr_toggle[i];
            var megaMenu = arr_megamenus[i];
            toggle["mega_menu"] = megaMenu;
            toggle.addEventListener("click", t4Sdk.megaNav.openMegaMenu);
            var btn = document.createElement("button");
            btn.megaMenu = toggle["mega_menu"];
            btn.innerHTML = "close";
            btn.style.float = "right";
            // megaMenu.marginBottom = "0px";
            megaMenu.style.paddingBottom = "0px";
            btn.style.backgroundColor = "#006F74";
            btn.style.border = "none";
            btn.addEventListener("click", t4Sdk.megaNav.closeMegaMenu);
            megaMenu.addEventListener("click", t4Sdk.openMegaMenu);
            megaMenu.appendChild(btn)
        }
    }
}
t4Sdk.megaNav.closeMegaMenu = function () {
    var btn = this;
    btn.megaMenu.style.display = "none";
}

t4Sdk.megaNav.openMegaMenu = function () {
    var toggle = this;
    if (t4Sdk.megaNav.openedMenu)
        t4Sdk.megaNav.openedMenu["mega_menu"].style.display = "none";
    t4Sdk.megaNav.openedMenu = toggle;
    toggle["mega_menu"].style.display = "block";
    // megaMenu
}

//document.addEventListener("DOMContentLoaded", 
/*
function () {

    //	return;
    /////// Prevent closing from click inside dropdown
    document.querySelectorAll('.dropdown-menu').forEach(function (element) {
        element.addEventListener('click', function (e) {
            console.log("clicked")
            e.stopPropagation();
        });
    })
});
*/

t4Sdk.megaNav.load = function () {
    // const megamenus = document.querySelectorAll(".megamenu");
    const dropDown = document.querySelectorAll(".t4-sdk-dropdown");

    if (dropDown.length > 0)
        t4Sdk.megaNav.setMegaMenu(dropDown[0]);

}

window.addEventListener("load", t4Sdk.megaNav.load);