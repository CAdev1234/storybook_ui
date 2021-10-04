$(function () {

    function showCreatePwdError($root, message) {
        var $errorWrapper = $(".error-wrapper", $root);
        if (message) {
            $('.error-message', $errorWrapper).html(message);
        }
        $errorWrapper.removeClass('no-error');
    }

    function showCreatePasswordModalSuccess() {
        $('.modal-success.d-none').toggleClass('d-none');
    }

    function clearCreatePwdError($root) {
        var $errorWrapper = $(".error-wrapper", $root);
        $errorWrapper.addClass('no-error');
    }

    function validateCreatePasswords($form) {
        var newPwd = $('#newPassword', $form).val();
        var confirmPwd = $('#confirmPassword', $form).val();

        return newPwd === confirmPwd;
    }

    $(document).on('submit', 'form.create-password-form', function (e) {

        e.preventDefault();

        var $form = $(e.target);

        clearCreatePwdError($form);

        //validate all inputs
        if (!validateCreatePasswords($form)) {
            showCreatePwdError($form, $form.data('pwd-no-match-error'));
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
                            $(".change-password-modal-success").html(result.view);
                            return;
                        }                        

                        showCreatePwdError($form, result.errorMessage);
                    },
                    error: function (result) {
                        //error messages
                        console.log("error", result);
                        if (result.status === 200 && result.responseText) {
                            $("main.create-password").html(result.responseText);
                            return;
                        }
                        showCreatePwdError($form, result.errorMessage);
                    },
                    complete: function (status) {
                        submitBtn.removeClass('active');
                    }
                });
            });
        });

        return false;
        
    });

    $('.modal-success button.btn-close').click(function () {
        $(this).parents('.modal-success').addClass('d-none');
    });    
});