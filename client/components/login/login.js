$(function () {
    var REMEMBER_ME_KEY = 'MEMBERSHIP_REMEMBER_LOGIN';

    function showhideCapsLock(e) {
        if (e.originalEvent.getModifierState("CapsLock")) {
            $('span#password').addClass('show');
        } else {
            $('span#password').removeClass('show');
        }
    }

    $("#loginpassword").keyup(function (e) {
        showhideCapsLock(e);
    });

    $("#loginpassword").blur(function () {
        $('span#password').removeClass('show');
    });

    //remember me 
    $('#remember').change(function () {
        if (this.checked) {
            var userName = $('#uname').val();
            if (userName) {
                localStorage.setItem(REMEMBER_ME_KEY, userName);
            }
        } else {
            localStorage.removeItem(REMEMBER_ME_KEY);
        }
    });

    function clearError($divRoot) {
        var $divError = $('.login-form .error-wrapper:not(.no-error)', $divRoot);
        $divError.addClass('no-error');

        $(".item-row span.error", $divRoot).removeClass("d-block");
    }

    function showLoginError($divRoot, isNoCuntryError, message) {

        var $divError = null;
        var $errorMessage = null;

        if (isNoCuntryError) {
            $divError = $('.modal-error.no-error', $divRoot);
            $errorMessage = $('.instr.content', $divError);
        }
        else {
            $divError = $('.login-form .error-wrapper.no-error', $divRoot);
            $errorMessage = $('.error-message', $divError);
        }
       
        if (message) {
            $errorMessage.text(message);
        }

        $divError.removeClass('no-error');
    }

    function validateInput($form, doNotShowErrorMessages) {
        var $username = $('#username', $form);
        var $password = $('#password', $form);

        var isValid = true;

        var checkItems = [$username, $password];
        for (var i = 0; i < checkItems.length; ++i) {
            if (!checkItems[i].get(0).checkValidity()) {
                if (!doNotShowErrorMessages) {
                    var $error = checkItems[i].next("span.error");
                    if ($error) {
                        $error.addClass("d-block");
                    }
                }
                isValid &= false;
            }
        }

        return isValid;
    }

    $('form.login-form').on('submit', function (e) {

        e.preventDefault();

        var $form = $(e.target);
        var $root = $form.closest('.login');
        clearError($root);

        if (!validateInput($form)) {
            return;
        }

        var recaptchaSiteKey = $("#recaptcha-settings").data("sitekey");

        var submitBtn = $form.find('button[type=submit]');
        submitBtn.addClass('active');
        submitBtn.attr('disabled', 'disabled');

        grecaptcha.ready(function () {
            grecaptcha.execute(recaptchaSiteKey, { action: 'submit' }).then(function (token) {

                var data = $form.serialize();

                if (token) {
                    data += '&retoken=' + token;
                }

                var qs = window.location.search;
                if (qs !== null && qs.length > 0)
                {
                    if (qs.indexOf("?") > -1) {
                        qs = qs.substring(1);
                    }
                    data += '&' + qs;
                }

                $.ajax({
                    type: $form.attr('method'),
                    url: $form.attr('action'),
                    dataType: "json",
                    data: data,
                    success: function (result) {

                        if (!result.isSuccess || (result.isSuccess && !result.redirectUrl)) {
                            showLoginError($root, result.isNoCountryError, result.message);
                            return;
                        }

                        window.location.href = result.redirectUrl;
                    },
                    error: function (result) {
                        showLoginError($root, false, result.message);
                    },
                    complete: function (status) {
                        submitBtn.removeClass('active');
                        submitBtn.removeAttr('disabled');
                    }
                });
            });
        });

        return false;
    });

    $('#uname').focusout(function () {
        if ($('#remember').prop('checked')) {
            var userName = $(this).val();
            if (userName) {
                localStorage.setItem(REMEMBER_ME_KEY, userName);
            }
        }
    });

    //add no-error class to remove the error modal, remove the class will show the error modal
    //$('.modal-error').removeClass('no-error');
    $('.modal-error .btn-close').click(function () {
        $('.modal-error').addClass('no-error');
    });

    var savedUserName = localStorage.getItem(REMEMBER_ME_KEY);
    if (savedUserName) {
        $('#uname').val(savedUserName);
    }

});

