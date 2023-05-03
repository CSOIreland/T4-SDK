var t4Sdk = t4Sdk || {};
var testInt = {};
testInt.obj = true;
t4Sdk.megaNav = {};//fixed
t4Sdk.megaNav.openedMenu = null;
t4Sdk.megaNav.closeButton = document.createElement("button");
t4Sdk.megaNav.closeMegaMenu = function () {
    t4Sdk.megaNav.openedMenu["panel"].style.display = "none";
}
t4Sdk.megaNav.addCloseButton = function (panel) {
    t4Sdk.megaNav.closeButton.innerHTML = "close";
    t4Sdk.megaNav.closeButton.style.float = "right";
    t4Sdk.megaNav.closeButton.style.backgroundColor = "#006F74";
    t4Sdk.megaNav.closeButton.style.border = "none";
    t4Sdk.megaNav.closeButton.style.cursor = "pointer";
    t4Sdk.megaNav.closeButton.addEventListener("click", t4Sdk.megaNav.closeMegaMenu);
}
t4Sdk.megaNav.openMegaMenu = function () {
    if (t4Sdk.megaNav.openedMenu)
        t4Sdk.megaNav.openedMenu["panel"].style.display = "none";
    t4Sdk.megaNav.openedMenu = this;
    t4Sdk.megaNav.moveCloseButton();
}
t4Sdk.megaNav.moveCloseButton = function () {
    t4Sdk.megaNav.openedMenu["panel"].style.display = "block";
    t4Sdk.megaNav.openedMenu["panel"].appendChild(t4Sdk.megaNav.closeButton);
}
t4Sdk.megaNav.setMegaMenu = function () {
    var containers = document.querySelectorAll(".t4-sdk-nav-item");
    t4Sdk.megaNav.addCloseButton();
    if (containers.length > 0) {
        for (var i = 0; i < containers.length; i++) {
            var container = containers[i];
            var link = container.getElementsByClassName("t4-sdk-nav-link")[0];
            link["holder"] = container;
            if (i == 0) t4Sdk.megaNav.openedMenu = link;
            var panel = container.getElementsByClassName("t4-sdk-megamenu")[0];
            panel.style.paddingBottom = "2px";
            link["panel"] = panel;
            link.addEventListener("click", t4Sdk.megaNav.openMegaMenu);
        }
        t4Sdk.megaNav.moveCloseButton();
    }
}
t4Sdk.megaNav.load = function () {
    const dropDown = document.querySelectorAll(".t4-sdk-dropdown");

    if (dropDown.length > 0)
        t4Sdk.megaNav.setMegaMenu();

}
window.addEventListener("load", t4Sdk.megaNav.load);