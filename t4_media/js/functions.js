
function chartType(div) {

    var retval = 'x';
    var id = '#' + div + ' table thead td';

    var seriesType = [];

    $(id).each(function() {

        seriesType.push($(this).attr('class'));


    });

    var a = seriesType.indexOf('bar');
    var b = seriesType.indexOf('column');


    if (a >= '0' || b >= '0') {
        retval = 'none';
    } else {
        retval = 'x';
    }

    return retval;

}