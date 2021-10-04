$(function () {
    $('.menu-icon-container button.menu-icon').click(function () {
        $(this).parent('.menu-icon-container').toggleClass('open');
        $('.main-header .header-item.menus').toggleClass('open');
    });    
    $('.menus .menu-item-title').click(function () {
        $('.menus .menu-item-title').removeClass('active');
        $('.menus .menu-item-content').removeClass('active');
        $('.menus .menu-item-title').removeClass('selected');
        $('.menus .menu-item-content').removeClass('selected');
        $(this).addClass('active');
        $(this).addClass('selected');
        $($(this).data('target')).addClass('active');
        $($(this).data('target')).addClass('selected');
    });  

    $('body').on('click', function (event) {
        if ($('.menu-item-content.active.selected').length === 0) {
            return;
        }
        if ($(event.target).parents('.menu-item-contents').length == 0 && $(event.target).parents('.menu-item-headers').length === 0) {
            var targetItem = $('.menu-item-title.active.selected').data('target');
            $('.menu-item-title.active.selected').removeClass('active').removeClass('selected');
            $(targetItem).removeClass('active').removeClass('selected');
        }
    });
});