$(function () {

    function showhideCapsLock(e) {
        if (e.originalEvent.getModifierState("CapsLock")) {
            $('span#password').addClass('show');
        } else {
            $('span#password').removeClass('show');
        }
    }

    function showRegisterError($root, message) {
        var $errorWrapper = $(".error-wrapper", $root);
        if (message) {
            $('.error-message', $errorWrapper).html(message);
        }

        $errorWrapper.removeClass('no-error');
    }

    function showModalSuccess() {
        $('.modal-success.d-none').toggleClass('d-none');
    }

    function clearRegisterError($root) {
        var $errorWrapper = $(".error-wrapper", $root);
        $errorWrapper.addClass('no-error');
    }
    $('main.register').on('change', '#acceptTnC, #acceptConsent', function () {
        $(this).closest('.check-container').removeClass('invalid');
    });

    function getFormData($form) {
        var data = {};

        var csrfToken = $form.find('input[name="__RequestVerificationToken"]').val();
        data.requestVerificationToken = csrfToken;

        var userRegistrationDatasource = $form.find('input[name="userRegistrationDatasource"]').val();
        data.userRegistrationDatasource = userRegistrationDatasource;

        var hasSpouse = $form.find('input[name="spouse"]:checked').val() === 'yes';
        data.spouse = hasSpouse;
        if (hasSpouse) {
            data.spouseFirstName = $form.find('#spouseFirstName').val() || '';
            data.spouseLastName = $form.find('#spouseLastName').val() || '';
        }
        var isgrandparent = $form.find('input[name="grandparent"]:checked').val() === 'yes';
        data.grandparent = isgrandparent;

        var children = [];
        $form.find('.added-child:not(.d-none)').each(function (index) {
            var lastName = $(this).find('.name-row').data('lastName') || '';
            var firstName = $(this).find('.name-row').data('firstName') || '';
            var year = $(this).find('.dob-row').data('year') || '';
            var month = $(this).find('.dob-row').data('month') || '';
            var day = $(this).find('.dob-row').data('day') || '';
            children.push({ firstName: firstName, lastName: lastName, year: year, month: month, day: day });
        });
        data.children = children;
        return data;
    }

    function fetchFormData($form, step) {
        switch (step) {
            case "step-1":
            case "step-2":
            case "step-2-employee":
            case "step-3-employee-complete-registration":
                return $form.serialize();
            case "step-3":
                var fd = getFormData($form);
                return JSON.stringify(fd);
            default:
                return "";
        }
    }

    function fetchContentType(step) {
        switch (step) {
            case "step-3":
                return "application/json; charset=utf-8";
            default:
                return "application/x-www-form-urlencoded; charset=UTF-8";
        }
    }

    function fetchStepFromClass($parent) {
        if ($parent.hasClass('step-1')) {
            return "step-1";
        } else if ($parent.hasClass('step-2')) {
            return "step-2";
        } else if ($parent.hasClass('step-2-employee')) {
            return "step-2-employee";
        } else if ($parent.hasClass('step-3')) {
            return "step-3";
        } else if ($parent.hasClass('step-3-employee-complete-registration')) {
            return "step-3-employee-complete-registration";
        }

        return "";
    }

    function fetchCountryFromAttributes($parent) {
        var UKCountryCode = $parent.attr("data-countrycode-uk");
        var countrySelected = $parent.attr("data-selectedcountry");
        if (UKCountryCode !== null && countrySelected !== null &&
            typeof UKCountryCode !== 'undefined' && typeof countrySelected !== 'undefined') {
            if (UKCountryCode === countrySelected) {
                return true;
            }
            else {
                return false;
            }               
        }
        else {
            return false;
        }
    }

    function validateAge($form) {
        var day = $form.find('#day').val();
        var month = $form.find('#month').val();
        var $yearEl = $form.find('#year');
        var year = $yearEl.val();
        var mydate = Date.UTC(year, month - 1, day);
        var minDate = Date.parse($yearEl.data("min-dob"));

        return mydate <= minDate;
    }

    function validatePasswordsEqual($form) {
        var newPwd = $('#password', $form).val();
        var confirmPwd = $('#confirmPassword', $form).val();
        return newPwd === confirmPwd;
    }

    function submitRegisterUserWithRecaptcha($form, step, data, UKsuccess, submitBtn) {

        var recaptchaSiteKey = $("#recaptcha-settings").data("sitekey");

        grecaptcha.ready(function () {
            grecaptcha.execute(recaptchaSiteKey, { action: 'submit' }).then(function (token) {
                if (token) {
                    data += '&retoken=' + token;
                }

                submitRegisterUser($form, step, data, UKsuccess, submitBtn);
            });
        });
    }

    function submitRegisterUser($form, step, data, UKsuccess, submitBtn) {
        submitBtn.addClass('active');
        submitBtn.attr('disabled', 'disabled');

        $.ajax({
            type: $form.attr('method'),
            url: $form.attr('action'),
            dataType: "json",
            contentType: fetchContentType(step),
            data: data,
            success: function (result) {
                console.log("success", result);

                if (!result.errorCode) {
                    var dataIsEmployeeRegistration = $form.data("isemployeeregistration");
                    var isemployeeRegistration = (dataIsEmployeeRegistration === true || dataIsEmployeeRegistration === 'true');
                    if (step === 'step-3' || step === 'step-3-employee-complete-registration' || (step === 'step-2' && UKsuccess) || (step === 'step-2' && isemployeeRegistration)) {
                        //show modal instead
                        showModalSuccess();
                        return;

                    } else if (result.view) {
                        $("main.register").html(result.view);
                        return;
                    }
                }

                showRegisterError($form, result.errorMessage);
            },
            error: function (result) {
                //error messages
                console.log("error", result);
                if (result.status === 200 && result.responseText) {
                    $("main.register").html(result.responseText);
                    return;
                }

                showRegisterError($form, result.errorMessage);

            },
            complete: function (status) {
                submitBtn.removeClass('active');
                submitBtn.removeAttr('disabled');
            }
        });
    }

    $('main.register').on('submit', 'form.register-form', function (e) {
        e.preventDefault();
        var $form = $(e.target);
        try {

            var $parent = $form.parent();
            clearRegisterError($form);

            var submitBtn = $form.find('button[type=submit]');

            var step = fetchStepFromClass($parent);
            var data = fetchFormData($form, step);
            var UKsuccess = fetchCountryFromAttributes($parent);
            console.log('submit', step, data);

            switch (step) {
                case "step-1":
                    {
                        if (!validateAge($form)) {
                            showRegisterError($form, $form.find('#year').data("min-dob-message"));
                        } else {
                            
                            submitRegisterUserWithRecaptcha($form, step, data, UKsuccess, submitBtn);
                        }
                       
                        break;
                    }
                case "step-2":
                    {
                        if (!validatePasswordsEqual($form)) {
                            showRegisterError($form, $form.data('pwd-no-match-error'));
                            return;
                        }

                        var tnc = $form.find('#acceptTnC');
                        if (!tnc.is(':checked')) {
                            tnc.closest('.check-container').addClass('invalid');
                        } else {

                            submitRegisterUser($form, step, data, UKsuccess, submitBtn);
                            
                        }

                        break;
                    }
                case "step-2-employee":
                    {
                        var ac = $form.find('#acceptConsent');
                        if (!ac.is(':checked')) {
                            ac.closest('.check-container').addClass('invalid');
                        } else {
                            submitRegisterUserWithRecaptcha($form, step, data, UKsuccess, submitBtn);
                        }

                        break;
                    }
                case "step-3":
                    {
                        submitRegisterUser($form, step, data, UKsuccess, submitBtn);
                        break;
                    }
                case "step-3-employee-complete-registration":
                    {
                        var ac = $form.find('#acceptTermsAndConditions');
                        if (!ac.is(':checked')) {
                            ac.closest('.check-container').addClass('invalid');
                        } else {
                            submitRegisterUserWithRecaptcha($form, step, data, UKsuccess, submitBtn);
                        }

                        break;
                    }
                default:
                    {
                        showRegisterError($form);
                        break;
                    }

            }           
        }
        catch (err) {

            console.log("catch-error", err);
            showRegisterError($form);
            return true;
        }

        return false;
    });

    $('main.register').on('click', '.cancel-userregistration', function (e) {
        var $link = $(e.target);
        var $form = $link.closest('form');
        var $antiForgeryToken = $('input[name="__RequestVerificationToken"]', $form);
        var href = $link.prop('href');
        var action = $link.data('cancel-action');

        $.ajax({
            type: 'post',
            url: action,
            dataType: "json",
            data: $antiForgeryToken.serialize(),
            complete: function (status) {
                window.document.location.href = href;
            }
        });

        return false;
    });

    function clearAddChildForm() {
        $('.step-3 #childFirstName').val('');
        $('.step-3 #childLastName').val('');
        $('.step-3 #newChildDobMonth').val('');
        $('.step-3 #newChildDobDay').val('');
        $('.step-3 #newChildDobYear').val('');
    }

    $('main.register').on('click', 'input[name="spouse"]', function () {
        var $spouse = $('.step-3 .spouse-row div.spouse');
        if ($(this).val() === 'yes') {
            $spouse.removeClass('d-none');
        } else {
            $spouse.addClass('d-none');
        }
    });

    $('main.register').on('keyup blur change', 'form[novalidate] .input-field', function () {
        var elm = $(this);
        var form = elm.closest('form');
        var errorElm = elm.siblings('span.error');
        errorElm.removeClass('active');
        elm.removeClass('invalid');

        var noError = validateFamilyElm(elm);
        if (!noError) {
            elm.addClass('invalid');
            form.addClass('invalid');
            errorElm.addClass('active');
        }

        var hasChild = $('input[name="children"]', form).val() === 'yes';
        if (hasChild) {
            validateChildForm(form);
        }
    });

    function validateChildForm(form) {
        //find all input fields
        var noError = true;
        var inputs = form.find('.new-child .input-field');
        var addNewBtn = form.find('.new-child button.add-action');
        inputs.each(function () {
            noError &= validateFamilyElm($(this));
        });
        if (noError) {
            addNewBtn.removeAttr('disabled');
        } else {
            addNewBtn.attr('disabled', 'disabled');
        }

        return noError;
    }

    function validateFamilyElm(elm) {
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


    $('main.register').on('click', 'input[name="children"]', function () {
        var $children = $('.step-3 .children');
        if ($(this).val() === 'yes') {
            $children.removeClass('d-none');

        } else {
            $children.addClass('d-none');
        }
    });

    $('main.register').on('click','.step-3 button.add-action', function () {
        var $childFirstName = $('.step-3 #childFirstName');
        var $childLastName = $('.step-3 #childLastName');
        var $dobMonth = $('.step-3 #newChildDobMonth');
        var $dobDay = $('.step-3 #newChildDobDay');
        var $dobYear = $('.step-3 #newChildDobYear');

        var isValid = true;

        var checkItems = [$childFirstName.get(0), $childLastName.get(0), $dobMonth.get(0), $dobDay.get(0), $dobYear.get(0)];
        for (var i = 0; i < checkItems.length; ++i){
            if (!checkItems[i].checkValidity()) {
                checkItems[i].reportValidity();
                isValid = false;
                break;
            }
        }

        if (!isValid) {
            return;
        }

        var firstName = $childFirstName.val();
        var lastName = $childLastName.val();
        var dobMonth = $dobMonth.val();
        var dobDay = $dobDay.val();
        var dobYear = $dobYear.val();
        var dobString = moment(dobYear + '-' + dobMonth + '-' + dobDay, 'YYYY-MM-DD').format('MMMM DD, YYYY');
        var clone = $('.step-3 #addedChildTemplate').clone();
        clone.removeAttr('id');
        clone.removeClass('d-none');
        clone.find('.name-row span.value').text(firstName + ' ' + lastName);
        clone.find('.dob-row span.value').text(dobString);
        clone.find('.name-row').data('lastName', lastName);
        clone.find('.name-row').data('firstName', firstName);
        clone.find('.dob-row').data('year', dobYear);
        clone.find('.dob-row').data('month', dobMonth);
        clone.find('.dob-row').data('day', dobDay);

        clone.find('.nth').text($('.added-child:not(.d-none)').length + 1);
        clone.find('button.remove-action').click(function () {
            $(this).closest('.added-child').remove();
            $('.step-3 .added-child:not(.d-none)').each(function (index) {
                $(this).find('.nth').text(index + 1);
            });
        });
        clone.insertBefore($('.step-3 .new-child'));
        clearAddChildForm();
    });

    $('.register .step-1 select.select-country').change(function () {
        if ($(this).val() === $(this).attr("data-countrycode-uk")) {
            $('.register .step-1 .item-row.email').removeClass('d-none');
            $('.wrapper.indicator-uk').removeClass('d-none');
            $('.wrapper.indicator-non-uk').addClass('d-none');
            $('.register .step-1 #email').prop('required', true);
        } else {
            $('.register .step-1 .item-row.email').addClass('d-none');
            $('.wrapper.indicator-non-uk').removeClass('d-none');
            $('.wrapper.indicator-uk').addClass('d-none');
            $('.register .step-1 #email').removeAttr('required');
        }
    });

    $('.modal-success button.btn-close').click(function () {
        $(this).parents('.modal-success').addClass('d-none');
    });    

    $("#registrationpassword").keyup(function (e) {
        showhideCapsLock(e);
    });

    $("#confirmpassword").keyup(function (e) {
        if (e.originalEvent.getModifierState("CapsLock")) {
            $('.register .item-row .item-wrapper .label-1 span.caps-lock-message').addClass('show');
        } else {
            $('.register .item-row .item-wrapper .label-1 span.caps-lock-message').removeClass('show');
        }
    });

    $("#registrationpassword").blur(function () {
        $('span#password').removeClass('show');
    });

    $("#confirmpassword").blur(function () {
        $('.register .item-row .item-wrapper .label-1 span.caps-lock-message').removeClass('show');
    });
});