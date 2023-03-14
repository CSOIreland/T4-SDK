function toggle(div, showSpan, hideSpan) {
    var ele = document.getElementById(div);
    var show = document.getElementById(showSpan);
    var hide = document.getElementById(hideSpan);

    if (ele.style.display == "block") {
        ele.style.display = "none";
        show.style.display = "block";
        hide.style.display = "none";



    } else {
        ele.style.display = "block";
        show.style.display = "none";
        hide.style.display = "block";

    }
}