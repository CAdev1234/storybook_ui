$(function () {
    $('a.read-more').click(function (e) {
        $(this).removeClass('active');
        $(this).parent().find('a.read-less').addClass('active')
        $(this).parent().find('span.read-more-content').addClass('active')
        e.preventDefault(); 
    });

    $('a.read-less').click(function (e) {
        $(this).removeClass('active');
        $(this).parent().find('a.read-more').addClass('active')
        $(this).parent().find('span.read-more-content').removeClass('active')
        e.preventDefault();
    });

});