$(function () {

    document.msCapsLockWarningOff = true;
    
    $('main').on('keyup blur change', 'form:not([novalidate]) .input-field', function () {
        var elm = $(this);
        var form = elm.closest('form');
        var submitBtn = $('button[type="submit"]', form);
        var errorElm = elm.siblings('span.error');
        //console.log('check', value);
        //clear all previous errors first
        errorElm.removeClass('active');
        elm.removeClass('invalid');
        form.removeClass('invalid');
        elm.removeClass(function (index, className) {
            return (className.match(/(^|\s)error-\S+/g) || []).join(' ');
        });

        var noError = validateElm(elm);
        if (!noError) {
            elm.addClass('invalid');
            form.addClass('invalid');
            errorElm.addClass('active');
        }

        //validate submit button 
        var noFormError = validateForm(form);

        if (noFormError) {
            submitBtn.removeAttr('disabled');
        } else {
            submitBtn.attr('disabled', 'disabled');
        }
    });

    function validateForm(form) {
        //find all input fields
        var noError = true;
        var inputs = form.find('.input-field');
        inputs.each(function () {
            noError &= validateElm($(this));
        });
        return noError;
    }

    function validateElm(elm) {
        var value = elm.val();
        var hasError = false;

        //validate input-field
        if (elm.prop('required')) {
            if (!value) {
                hasError = true;
            }

            if ((elm.prop('type') === 'checkbox') && !elm.is(':checked')) {
                hasError = true;
            }
        }

        if (elm.prop('pattern')) {
            //check email against regex
            var patternTxt = elm.prop('pattern');
            var pattern = new RegExp(patternTxt);
            var result = pattern.test(value);
            var isRequired = elm.prop('required');

            if ((isRequired && !result) || (value && !result)) {
                hasError = true;
            }            
        }

        if (elm.prop('type') === 'number') {
            //check email against regex
            var min = parseInt(elm.prop('min'));
            var max = parseInt(elm.prop('max'));
            var val = parseInt(value);
            if (val > max || val < min) {
                hasError = true;
            }
        }

        return !hasError;
    }

    //show and hide password
    $(document).on('click', '.toggle-pwd', function () {
        var input = $(this).prev();
        if (input.attr('type') == 'password') {
            input.attr('type', 'text');
            $(this).find('#hide').removeClass('hide').addClass('show');
            $(this).find('#show').removeClass('show').addClass('hide');
        } else {
            input.attr('type', 'password');
            $(this).find('#show').removeClass('hide').addClass('show');
            $(this).find('#hide').removeClass('show').addClass('hide');
        }
    });


    $('.compliance-link button.link').click(function () {
        $(this).parent().siblings('.compliance-body').toggleClass('active');
        $(this).toggleClass('active');
        $(this).siblings().toggleClass('active');
    });

    function setupModalDialog() {
        //make modal dialog resizable
        $('.modal-general .content-container').attrchange({
            callback: function (e) {
                var windowWidth = $(window).width();
                var curHeight = $(this).height();
                if (windowWidth < 577) {
                    $('.scrollable-content', (this)).height(curHeight - 236);
                } else if (windowWidth < 769) {
                    $('.scrollable-content', (this)).height(curHeight - 260);
                } else {
                    $('.scrollable-content', (this)).height(curHeight - 276);
                }
            }
        }).resizable();

        $('.modal-general .content-container').draggable().draggable({ handle: '.title' });
    }

    setupModalDialog();
});