$(function () {
    $('.tooltip-icon').tooltip(
        {
            placement: 'auto',
            html: true,
            template: '<div class="tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>',
            title: function () {
                return getTooltipContent($(this));
            }
        }
    );

    function getTooltipContent($target) {
        var contentId = $target.data('tooltip-content');
        return $(contentId).clone().removeClass('d-none').html();
    }               
});