$(function () {
    $('.country-select').click(function () {
        $(this).toggleClass('open');
    });

    $('.country-select .country-option').each(function (index) {
        $(this).click(function () {
            if (!$(this).hasClass('selected')) {
                $(this).parent().find('.selected').removeClass('selected');
                $(this).addClass('selected');
                var selectedImage = $(this).find('img').attr('src');
                $(this).closest('.country-select').find('.country-select__trigger .flag img').attr('src', selectedImage);
                $(this).closest('.country-select').find('.country-select__trigger .flag img').attr('src', selectedImage);
                console.log('selected locale is ', $(this).data('value'));
            }
        });
    });
});