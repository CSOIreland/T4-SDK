//call from .pdf backend
t4Sdk.high_chart_fix.fixSVG4pdf_delay2 = function () {
    setTimeout(() => {
        t4Sdk.high_chart_fix.fixSVG4pdf2();
        console.log('export2pdf_started');
    }, T4SDK_HIGHCHARTFIX_ANIMATION_DURATION_MS);
};
//on key down
window.addEventListener('keydown', function (event) {
    if ((event.key === 'P' || event.key === 'p') && event.ctrlKey) {
        event.preventDefault();
        // Call your custom function
        t4Sdk.high_chart_fix.fixSVG();
    }
});
// delay export
t4Sdk.high_chart_fix.fixSVG4pdf_delay = function () {
    setTimeout(() => {
        t4Sdk.high_chart_fix.fixSVG4pdf();
        console.log('export2pdf_started');
    }, T4SDK_HIGHCHARTFIX_ANIMATION_DURATION_MS);
};
// on page load
window.addEventListener('load', t4Sdk.high_chart_fix.fixSVG4pdf_delay);
