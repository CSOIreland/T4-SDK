//functionality to change css on pareticular pages based on page title
//var title = document.getElementsByTagName("title")[0].innerHTML;
$(document).ready(function() {
    //Build your CSS.
    var new_tag_css = {
            "margin": "left 5px"

        }
        //Apply your CSS 
    $(".moduleBody").css(new_tag_css);
});


//end kh 



$(function() {


    //back to top



    // create the back to top button
    $('body').prepend('<a href="#" class="back-to-top">Back to Top</a>');

    var amountScrolled = 300;

    $(window).scroll(function() {
        if ($(window).scrollTop() > amountScrolled) {
            $('a.back-to-top').fadeIn('slow');
        } else {
            $('a.back-to-top').fadeOut('slow');
        }
    });

    $('a.back-to-top, a.simple-back-to-top').click(function() {
        $('html, body').animate({
            scrollTop: 0
        }, 700);
        return false;
    });

    //end back to top






    //quick stats carousel

    $('.carousel').flexslider({
        animation: "slide",
        animationLoop: true,
        slideshow: false,
        itemWidth: 210,
        itemMargin: 5,
        minItems: 5,
        maxItems: 5,
        controlNav: false,
        directionNav: true,
        touch: false
    });

    $('.flexsliderSC').flexslider({
        animation: "slide",
        animationLoop: true,
        slideshow: false,
        itemWidth: 310,
        itemMargin: 5,
        minItems: 4,
        maxItems: 4,
        controlNav: false,
        directionNav: false,
        touch: false
    });



    //featured itelsm slider
    $('.imageSlider').flexslider({
        animationLoop: true,
        controlNav: false,
        directionNav: true
    });

    /*shows/hides main nav on smaller devices*/
    $(".toggleMainNav").click(function() {
        $(".mainNav").toggleClass("open");
    });

    /*shows/hides more quick stats on smaller devices*/
    $(".toggleQuickStats").click(function() {
        $(".quickStats").toggleClass("all");
        if ($(".quickStats").hasClass("all")) {
            $(this).html('Show less <i class="fa fa-angle-up"></i>');
        } else {
            $(this).html('Show more like this <i class="fa fa-angle-down"></i>');
        }

    });

    $(".toggleQuickStatsGa").click(function() {
        $(".quickStats").toggleClass("all");
        if ($(".quickStats").hasClass("all")) {
            $(this).html('Taispeáin níos lú <i class="fa fa-angle-up"></i>');
        } else {
            $(this).html('Taispeáin a thuilleadh <i class="fa fa-angle-down"></i>');
        }

    });

    /*shows/hides more quick stats on smaller devices*/
    $(".togglelogos").click(function() {
        $(".logos").toggleClass("all");
        if ($(".logos").hasClass("all")) {
            $(this).html('Show less <i class="fa fa-angle-up"></i>');
        } else {
            $(this).html('Show more like this <i class="fa fa-angle-down"></i>');
        }

    });

});


//Tooltips - http://osvaldas.info/elegant-css-and-jquery-tooltip-responsive-mobile-friendly
$(function() {

    var targets = $('[rel~=tooltip]'),
        target = false,
        tooltip = false,
        title = false;

    targets.bind('mouseenter', function() {
        target = $(this);
        tip = target.attr('title');
        tooltip = $('<div id="tooltip"></div>');

        if (!tip || tip == '')
            return false;

        target.removeAttr('title');
        tooltip.css('opacity', 0)
            .html(tip)
            .appendTo('body');

        var init_tooltip = function() {
            if ($(window).width() < tooltip.outerWidth() * 1.5)
                tooltip.css('max-width', $(window).width() / 2);
            else
                tooltip.css('max-width', 340);

            var pos_left = target.offset().left + (target.outerWidth() / 2) - (tooltip.outerWidth() / 2),
                pos_top = target.offset().top - tooltip.outerHeight() - 20;

            if (pos_left < 0) {
                pos_left = target.offset().left + target.outerWidth() / 2 - 20;
                tooltip.addClass('left');
            } else
                tooltip.removeClass('left');

            if (pos_left + tooltip.outerWidth() > $(window).width()) {
                pos_left = target.offset().left - tooltip.outerWidth() + target.outerWidth() / 2 + 20;
                tooltip.addClass('right');
            } else
                tooltip.removeClass('right');

            if (pos_top < 0) {
                var pos_top = target.offset().top + target.outerHeight();
                tooltip.addClass('top');
            } else
                tooltip.removeClass('top');

            tooltip.css({ left: pos_left, top: pos_top })
                .animate({ top: '+=10', opacity: 1 }, 50);
        };

        init_tooltip();
        $(window).resize(init_tooltip);

        var remove_tooltip = function() {
            tooltip.animate({ top: '-=10', opacity: 0 }, 50, function() {
                $(this).remove();
            });

            target.attr('title', tip);
        };

        target.bind('mouseleave', remove_tooltip);
        tooltip.bind('click', remove_tooltip);
    });
});


//accordion
$(document).ready(function() {

    var allPanels = $('.accordion > div').hide();

    $('.accordion > h3 > a').click(function() {
        $this = $(this);
        $target = $this.parent().next().slideToggle();
        $target.toggleClass('open');
        $this.parent().toggleClass('open');
        return false;
    });

    $("ul.mainNavList li").each(function(i, obj) {
        if ($(obj).find('div.ddBox').length != 0) {
            $(obj).find("a:first").click(function() {
                if ($(obj).hasClass('open')) {
                    $(obj).removeClass('open');
                    $(obj).addClass('closed');
                    $('div.container.content').css('padding-top', 0);
                } else {
                    $(obj).removeClass('closed');
                    $(obj).addClass('open');
                    $('div.container.content').css('padding-top', $(obj).find('div.ddBox').height() + 80);
                }
            });
            $(obj).find("span:first").click(function() {
                if ($(obj).hasClass('open')) {
                    $(obj).removeClass('open');
                    $(obj).addClass('closed');
                    $('div.container.content').css('padding-top', 0);
                } else {
                    $(obj).removeClass('closed');
                    $(obj).addClass('open');
                    $('div.container.content').css('padding-top', $(obj).find('div.ddBox').height() + 80);
                }
            });
            $(obj).find('a.close').each(function(j, obj2) {
                $(obj2).click(function() {
                    $(obj).removeClass('open');
                    $(obj).addClass('closed');
                    $('div.container.content').css('padding-top', 0);
                });
            })

        }
    });

    $("div.module").each(function(i, obj) {
        if ($(obj).find('div.moduleHeader h2 a').length != 0) {
            $(obj).find("div.moduleHeader h2 a:first").click(function() {
                if ($(obj).hasClass('open')) {
                    $(obj).removeClass('open');
                    $(obj).addClass('closed');
                } else {
                    $(obj).removeClass('closed');
                    $(obj).addClass('open');
                }
                return false;
            });
        }
    });

    $(".fancySurvey").fancybox({
        padding: 0,
        scrolling: 'visible'
    });


    //cookies consent


    function hideCookieInfo() {
        jQuery("#cookie-info").hide();
        createCookie('cookieok', '1', 365);
    }

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

    function createCookie(name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        } else var expires = "";
        document.cookie = name + "=" + value + expires + ";path=/";
    }

    jQuery(document).ready(function() {
        if (!readCookie('cookieok')) {
            jQuery('#cookie-info').show();
        }
    });



    jQuery(document).ready(function() {
        var isPrint = window.location.pathname.indexOf("/print/") > -1;
        //alert(isPrint);
        if (isPrint = 'true') {
            //  jQuery('#cookie-info').hide();
        }
    });

});