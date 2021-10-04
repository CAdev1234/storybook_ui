$(function () {
    $('.composite-container .height-ref').each(function () {
        if ($(window).width() < 768) {
            // do not adjust height on mobile devices
            return;
        }

        var height = $(this).height();
        var parent = $(this).closest('.composite-container');
        var targetElm = $('.height-target', parent);
        targetElm.css('height', height + 'px');
    });
});