$(function () {

       function showCertDetailsFormError($form, title, errorMessage) {

            var $errorWrapper = $(".error-wrapper", $form);
            if (errorMessage) {
                $('.error-message', $errorWrapper).text(errorMessage);
            }

           var $titlerWrapper = $(".error-title-wrapper", $form);
           if ($titlerWrapper) {
               $('.error-title', $titlerWrapper).text(title);
           }


            $errorWrapper.removeClass('no-error');
        }

        $('form.cert-details-form').submit(function (e) {
            var $form = $(e.target);
            var submitBtn = $form.find('button[type=submit]');
            var securityNum = $('.input-field', $form).val();
            console.log('submit cert details form', securityNum);
            //TODO ajax call
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

                            console.log("cert-details-form:success", result);
                            if (!result.isSuccess || (result.isSuccess && !result.redirectUrl)) {

                                showCertDetailsFormError($form, result.title, result.message); 

                                return;
                            }

                            window.location.href = result.redirectUrl;

                        },
                        error: function (result) {
                            //error messages
                            console.log("cert-details-form:error", result);

                            showCertDetailsFormError($form, result.title, result.message);
                       
                            return;
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
