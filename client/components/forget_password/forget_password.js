$(function () {

    function showForgetError($root, message) {
        var $errorWrapper = $(".error-wrapper", $root);
        if (message) {
            $('.error-message', $errorWrapper).text(message);
        }

        $errorWrapper.removeClass('no-error');
    }

    function clearForgetError($root) {
        var $errorWrapper = $(".error-wrapper", $root);
        $errorWrapper.addClass('no-error');
    }

    function validateForgetPasswordsEqual($form) {
        var newPwd = $('#password', $form).val();
        var confirmPwd = $('#confirmPassword', $form).val();
        return newPwd === confirmPwd;
    }

    // request to change the password (email sent)
    $(document).on('submit', 'form.forget-username-password-form, form.forget-username-password-confirmation-form', function (e) {
        e.preventDefault();

        var $form = $(e.target);

        clearForgetError($form);

        if ($form.hasClass('forget-password-form') && !validateForgetPasswordsEqual($form)) {
            showForgetError($form, $form.data('pwd-no-match-error'));
            return;
        }

        var submitBtn = $form.find('button[type=submit]');
        submitBtn.addClass('active');

        var recaptchaSiteKey = $("#recaptcha-settings").data("sitekey");

        grecaptcha.ready(function () {
            grecaptcha.execute(recaptchaSiteKey, { action: 'submit' }).then(function (token) {
                var data = $form.serialize();

                if (token) {
                    data += '&retoken=' + token;
                }

                $.ajax({
                    type: $form.attr('method'),
                    url: $form.attr('action'),
                    dataType: "json",
                    data: data,
                    success: function (result) {
                        console.log("success", result);

                        if (!result.errorCode && result.view) {
                            $("main.forget-password").html(result.view);
                            return;
                        }

                        showForgetError($form, result.errorMessage);
                    },
                    error: function (result) {
                        //error messages
                        console.log("error", result);
                        if (result.status === 200 && result.responseText) {
                            $("main.forget-password").html(result.responseText);
                            return;
                        }
                        showForgetError($form, result.errorMessage);
                    },
                    complete: function (status) {
                        submitBtn.removeClass('active');
                    }
                });
            });
        });

        return false;
    });

});
