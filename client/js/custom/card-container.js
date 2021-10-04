$(function () {
    function initializeCardItems() {
        if ($('.card-container .card-items').hasClass('d-none')) {
            if ($('.card-container .card-item').length <= 3) {
                //if less than 3 items, hide show-more and show-less buttons
                $('.card-container .action').addClass('d-none');
            } else {
                //if more than 3 items, hide items after 3rd one
                $('.card-container .card-item').each(function (index, elm) {
                    if (index > 2) {
                        $(elm).addClass('d-none');
                    }
                });
                $('.card-container .action').removeClass('d-none');
            }

            $('.card-container .card-items').removeClass('d-none');
        }
    }

    $('.card-container .action button').click(function () {
        $(this).siblings().toggleClass('selected');
        $(this).toggleClass('selected');
        if ($(this).hasClass('show-less')) {
            $('.card-container .card-item').each(function (index, elm) {
                if (index > 2) {
                    $(elm).addClass('d-none');
                }
            });
        }
        if ($(this).hasClass('show-more')) {
            $('.card-container .card-item').each(function (index, elm) {
                $(elm).removeClass('d-none');
            });
        }
    });

    initializeCardItems();
});