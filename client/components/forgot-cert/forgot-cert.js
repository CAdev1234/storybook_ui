$(function () {
    function showForgetCertError($root, message) {
        var $errorWrapper = $(".error-wrapper", $root);
        if (message) {
            $('.error-message', $errorWrapper).text(message);
        }

        $errorWrapper.removeClass('no-error');
    }

    function clearForgetCertError($root) {
        var $errorWrapper = $(".error-wrapper", $root);
        $errorWrapper.addClass('no-error');
    }

    $(document).on('submit', 'form.forgot-cert-form, form.forgot-cert-email-sent', function (e) {
        var $form = $(e.target);

        clearForgetCertError($form);

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

                        if (!result.errorCode) {

                            if (result.view) {
                                $(".forgot-cert").html(result.view);
                            }

                            return;
                        }

                        showForgetCertError($form, result.errorMessage);
                    },
                    error: function (result) {
                        //error messages
                        console.log("error", result);
                        showForgetCertError($form, result.errorMessage);
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