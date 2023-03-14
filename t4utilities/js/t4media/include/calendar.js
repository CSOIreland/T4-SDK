function getForm() {
    if (window.navigator.appName.toLowerCase().indexOf("microsoft") > -1)
        return document.event;
    else
        return document.forms["event"];
} // getForm

function submit() {
    getForm().submit();
    return false;
}

function setAndSubmit(id, value) {
    document.getElementById(id).value = value;
    submit();
    return false;
}

function onClickAllCategories() {
    var allCategs = document.getElementById("allcategories");
    if (allCategs.checked) {
        var categs = document.getElementsByName("categories");
        for (var i = 0; i < categs.length; i++)
            categs[i].checked = false;
    } // if 
} // onChangeAllCategories

function onChangeCategories() {
    var allCategs = document.getElementById("allcategories");
    var categs = document.getElementsByName("categories");
    var amount = categs.length;
    var amountChecked = 0;
    allCategs.checked = false;
    for (var i = 0; i < categs.length; i++) {
        if (categs[i].checked) {
            amountChecked++;
        } // if element is "checked"
    } // for all categories
    if (amountChecked == amount) {
        // uncheck all categories and check "all categories" instead
        for (var i = 0; i < categs.length; i++)
            categs[i].checked = false;
        allCategs.checked = true;
    } // if all categies are checked
} // allCategories