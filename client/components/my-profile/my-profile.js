$(function () {
    // #change family info - start

    function clearMyProfileSpouseInfo() {
        $('.family-info-form #spouseFirstName').val('');
        $('.family-info-form #spouseLastName').val('');
        $('.family-info-form .spouse.sub-content').addClass('d-none');
    }

    function clearMyProfileAddChildForm() {
        $('.family-info-form #childFirstName').val('');
        $('.family-info-form #childLastName').val('');
        $('.family-info-form #newChildDobMonth').val('');
        $('.family-info-form #newChildDobDay').val('');
        $('.family-info-form #newChildDobYear').val('');
    }

    function clearMyProfileAddedChildren() {
        $('.family-info-form .added-child:not(#addedChildTemplate) .childid').data('isDeleted', true);
        $('.family-info-form .children').addClass('d-none');
    }

    function clearFamilyInfoForm() {
        clearMyProfileSpouseInfo();
        clearMyProfileAddChildForm();
        clearMyProfileAddedChildren();
    }

    $(document).on('click', '.family-info-form input[name="spouse"]', function () {
        var $spouse = $('.family-info-form .spouse-row div.spouse');
        if ($(this).val() === 'yes') {
            //allow to validate
            $('.input-field', $spouse).attr('disabled', false);
            $spouse.removeClass('d-none');
        } else {
            $spouse.addClass('d-none');
            //remove validation
            $('.input-field', $spouse).attr('disabled', true);
        }
    });

    $(document).on('click', '.family-info-form input[name="children"]', function () {
        var $children = $('.family-info-form .children');
        var required = true;

        if ($(this).val() === 'yes') {
            $children.removeClass('d-none');
        } else {
            $children.addClass('d-none');
            required = false;
        }
        $('.input-field:not(#childLastName)', $children).attr('required', required);
    });

    $(document).on('click', '.family-info-form button.add-action', function () {
        var $form = $('.family-info-form');

        sharedClearError($form);
        sharedHideSuccess($('.family-info-container'));

        var $childFirstName = $('.family-info-form #childFirstName');
        var $childLastName = $('.family-info-form #childLastName');
        var $dobMonth = $('.family-info-form #newChildDobMonth');
        var $dobDay = $('.family-info-form #newChildDobDay');
        var $dobYear = $('.family-info-form #newChildDobYear');

        var isValid = true;

        var checkItems = [$childFirstName.get(0), $childLastName.get(0), $dobMonth.get(0), $dobDay.get(0), $dobYear.get(0)];
        for (var i = 0; i < checkItems.length; ++i) {
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
        addChild(firstName, lastName, dobMonth, dobDay, dobYear);
    });

    function getMyProfileFormData($form, token) {
        var data = {};

        var csrfToken = $form.find('input[name="__RequestVerificationToken"]').val();
        data.requestVerificationToken = csrfToken;

        var hasSpouse = $form.find('input[name="spouse"]:checked').val() === 'yes';
        data.spouse = hasSpouse;
        data.spouseRelatedIndividualId = $form.find('#spouseRelatedIndividualId').val() || '';
        
        if (hasSpouse) {
            data.spouseFirstName = $form.find('#spouseFirstName').val() || '';
            data.spouseLastName = $form.find('#spouseLastName').val() || '';
        }
        else {
            data.spouseFirstName = '';
            data.spouseLastName = '';
        }

        var isgrandparent = $('#grandparent', $form).prop('checked');
        data.grandparent = isgrandparent;

        var children = [];

        var hasChildren = $form.find('input[name="children"]:checked').val() === 'yes';

        $form.find('.added-child:not(#addedChildTemplate)').each(function (index) {
            var $this = $(this);
            var lastName = $this.find('.name-row').data('lastname') || '';
            var firstName = $this.find('.name-row').data('firstname') || '';
            var year = $this.find('.dob-row').data('year') || '';
            var month = $this.find('.dob-row').data('month') || '';
            var day = $this.find('.dob-row').data('day') || '';
            var childRelatedIndividualId = $this.data("childid") || '';
            var isdeleted = $this.data('isdeleted') || false;

            var child = {
                firstName: firstName,
                lastName: lastName,
                year: year,
                month: month,
                day: day,
                childRelatedIndividualId: childRelatedIndividualId,
                isDeleted: isdeleted,
            };

            //in case children are removed, and no id is present, ignore the child
            if (!hasChildren && !childRelatedIndividualId) {
                return;
            }

            if (!hasChildren) {
                child.isDeleted = true;
            }

            children.push(child);
        });
       
        data.children = children;
        if (token) {
            data.retoken= token;
        }
        return JSON.stringify(data);
    }

    function validateSpouse($form) {
        var $spouse = $('input[name="spouse"]:checked', $form);
        var isValid = true;

        if ($spouse.val() === 'yes') {

            var $spouseFirstName = $('.family-info-form #spouseFirstName');
            var $spouseLastName = $('.family-info-form #spouseLastName');

            var checkItems = [$spouseFirstName.get(0), $spouseLastName.get(0)];
            for (var i = 0; i < checkItems.length; ++i) {
                if (!checkItems[i].checkValidity()) {
                    checkItems[i].reportValidity();
                    isValid = false;
                    break;
                }
            }
        }       

        return isValid;
    }

    /*
    function validateMyProfileAge($form) {
        var day = $form.find('#newChildDobDay').val();
        var month = $form.find('#newChildDobMonth').val();
        var year = $form.find('#newChildDobYear').val();
        var age = 18;
        var mydate = new Date();
        mydate.setFullYear(year, month - 1, day);
        var currdate = new Date();
        currdate.setFullYear(currdate.getFullYear() - age);
        if ((currdate - mydate) >= 0) {
            return false;
        }
        return true;
    }
    */

    function updateChildrenId($form, data) {

        //remove deleted children
        var removedChildren = $form.find('.added-child[data-isdeleted]');
        $.each(removedChildren, function (index, child) {
            $(child).remove();
        });

        if (data && data.addedChildren && data.addedChildren.length > 0) {
            var newlyAddedChildren = $form.find('.added-child:not(#addedChildTemplate,[data-childid])');
            if (newlyAddedChildren.length <= data.addedChildren.length) {
                $.each(data.addedChildren, function (index, value) {
                    var addedChild = newlyAddedChildren.get(index);
                    addedChild.dataset.childid=value;
                });
            }
        }

    }

    function validateAllActiveChildren($form) {
        var hasChildren = $form.find('input[name="children"]:checked').val() === 'yes';

        var isValid = true;

        if (hasChildren) {
            $form.find('.added-child:not(#addedChildTemplate,[data-isdeleted])').each(function (index) {
                var $this = $(this);
                var lastName = $this.find('.name-row').data('lastname') || '';
                var firstName = $this.find('.name-row').data('firstname') || '';
                var year = $this.find('.dob-row').data('year') || '';
                var month = $this.find('.dob-row').data('month') || '';
                var day = $this.find('.dob-row').data('day') || '';

                if (!(lastName && firstName && year && month && day)) {
                    isValid = false;
                    return false;
                }

                if (year < 1900 || year > 2050) {
                    isValid = false;
                    return false;
                }

                if (day < 1 || day > 31) {
                    isValid = false;
                    return false;
                }

                if (month < 1 || month > 12) {
                    isValid = false;
                    return false;
                }

            });
        }

        return isValid;
    }

    function updateSpouseId($form, data) {
        if (data) {
            var spouseId = $form.find('#spouseRelatedIndividualId');
            spouseId.val(data.spouseRelatedIndividualId);//add or remove spouseid
        }
    }

    function submitMyProfileFamilyInfo($form, data, submitBtn) {

        submitBtn.attr('disabled', 'disabled');
        $.ajax({
            type: $form.attr('method'),
            url: $form.attr('action'),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: data,
            success: function (result) {
                console.log("update_family_form:success", result);

                if (!result.errorCode) {
                    updateChildrenId($form, result.data);
                    updateSpouseId($form, result.data);                    
                    sharedShowSuccess($('.family-info-container'));

                    return;
                }

                sharedShowError($form, result.errorMessage);
            },
            error: function (result) {
                //error messages
                console.log("update_family_form:error", result);
                if (result.status === 200 && result.data) {
                    updateChildrenId($form, result.data);
                    updateSpouseId($form, result.data);
                    sharedShowSuccess($('.family-info-container'));
                    return;
                }
                sharedShowError($form, result.errorMessage);
            },
            complete: function (status) {
                submitBtn.removeClass('active');
                submitBtn.removeAttr('disabled');
            }
        });
    }

    $(document).on('submit', 'form.family-info-form', function (e) {
        e.preventDefault();
        var $form = $(e.target);
        try {
           
            sharedClearError($form);
            sharedHideSuccess($('.family-info-container'));

            //validate all input but new child stuff
            if (!validateSpouse($form)) {
                return;
            }

            if (!validateAllActiveChildren($form)) {

                sharedShowError($form, $form.data('invalid-child'));
                return;
            }

            var submitBtn = $form.find('button[type=submit]');
            submitBtn.addClass('active');
            submitBtn.attr('disabled', 'disabled');

            var recaptchaSiteKey = $("#recaptcha-settings").data("sitekey");

            grecaptcha.ready(function () {
                grecaptcha.execute(recaptchaSiteKey, { action: 'submit' }).then(function (token) {

                    console.log('submit', data);
                    var data = getMyProfileFormData($form, token);

                    submitMyProfileFamilyInfo($form, data, submitBtn);
                });
            });

        }
        catch (err) {
            console.log("catch-error", err);
            sharedShowError($form);
            return true;
        }

        return false;
    });
   
    $(document).on('reset', 'form.family-info-form', function (e) {
        clearFamilyInfoForm();
    });

    function addChild(firstName, lastName, dobMonth, dobDay, dobYear) {
        var dobString = moment(dobYear + '-' + dobMonth + '-' + dobDay, 'YYYY-MM-DD').format('MMMM DD, YYYY');
        var clone = $('.family-info-form #addedChildTemplate').clone();
        clone.removeAttr('id');
        clone.removeClass('d-none');
        clone.find('.name-row span.value').text(firstName + ' ' + lastName);
        clone.find('.dob-row span.value').text(dobString);
        clone.find('.name-row').data('lastname', lastName);
        clone.find('.name-row').data('firstname', firstName);
        clone.find('.dob-row').data('year', dobYear);
        clone.find('.dob-row').data('month', dobMonth);
        clone.find('.dob-row').data('day', dobDay);

        clone.find('.nth').text($('.added-child:not(.d-none)').length + 1);       
        clone.insertBefore($('.family-info-form .new-child'));
        clearMyProfileAddChildForm();
    }

    $(document).on('click', '.family-info-form button.remove-action', function (e) {
        e.preventDefault();
        var $this = $(this);
       
        var $child = $this.closest('.added-child');

        var childRelatedIndividualId = $child.data("childid") || '';

        if (childRelatedIndividualId) {
            //mark the child deleted but do not actual delete, just hide
            $child.attr('data-isdeleted', true);
            $child.addClass('d-none');
        }
        else {//a temp child can be removed altogheter
            $child.remove();
        }

        //adjust the text beside each remaining child
        $('.family-info-form .added-child:not(.d-none)').each(function (index) {
            $(this).find('.nth').text(index + 1);
        });            
    });

    $(document).on('click', '.family-info-form #children', function (e) {
        var $this = $(this);
        var thisValue = $this.val();

        if (thisValue === 'no') {
            //remove deleted children
            var allChildren = $('.family-info-form .added-child:not(#addedChildTemplate)');
            $.each(allChildren, function (index, child) {
                var $child = $(child);
                var childRelatedIndividualId = $child.data("childid") || '';

                if (childRelatedIndividualId) {
                    //mark the child deleted but do not actual delete, just hide
                    $child.attr('data-isdeleted', true);
                    $child.addClass('d-none');
                }
                else {//a temp child can be removed altogheter
                    $child.remove();
                }
            });
        }

    });

    // #change family info - end
    //shared - start

    // #change email preferences - start

    $(".email-pref-form .email-pref-checkbox:not(.unsubscribeall)").click(function () {
        var checkedNoUnsubscribe = $(".email-pref-form .email-pref-checkbox:checked:not(.unsubscribeall):not([data-excluded-from-unsubscribe])");
        $('.email-pref-form .email-pref-checkbox.unsubscribeall').prop('checked', checkedNoUnsubscribe.length == 0); 
    });

    $(".email-pref-form .email-pref-checkbox.unsubscribeall").click(function () {
        if ($(this).prop('checked')) {
            $('.email-pref-form .email-pref-checkbox:not([data-excluded-from-unsubscribe])').not(this).prop('checked', false);
        }
        else {
            $(this).prop('checked', true);
        }        
    });
   
    $(document).on('submit', 'form.email-pref-form', function (e) {
        var $form = $(e.target);

        sharedClearError($('#email_pref'));
        sharedHideSuccess($('#email_pref'));

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
                        console.log("email-pref-form:success", result);

                        if (!result.errorCode) {
                            sharedShowSuccess($('#email_pref'));
                            return;
                        }

                        sharedShowError($('#email_pref'), result.errorMessage);
                    },
                    error: function (result) {
                        //error messages
                        console.log("email-pref-form:error", result);
                        if (result.status === 200 && result.responseText) {
                            sharedShowSuccess($('#email_pref'));
                            return;
                        }
                        sharedShowError($('#email_pref'), result.errorMessage);
                    },
                    complete: function (status) {
                        submitBtn.removeClass('active');
                    }
                });
            });
        });

        return false;
    });

    // #change email preferences - end

    //#change password - start

    $('.login-info-container #change_passwd').click(function () {
        $('.login-info-container #change_passwd_form').addClass('active');
        $('.login-info-container .info-instr').addClass('active');
        $('.login-info-container #change_contact').removeClass('active');
        sharedHideSuccess($('.login-info-container'));
    });

    $('#change_passwd_form .action.cancel button').click(function () {
        var $form = $('.login-info-container #change_passwd_form');
        hideChangePasswordForm($form);
        sharedClearError($form);
        sharedHideSuccess($('.login-info-container'));
    });

    function hideChangePasswordForm($root) {
        $root.removeClass('active');
        $('#newPassword', $root).val('');
        $('#confirmPassword', $root).val('');
        $('.login-info-container .info-instr').removeClass('active');
    }

    function arePasswordsEqual($form) {
        var newPwd = $('#newPassword', $form).val();
        var confirmPwd = $('#confirmPassword', $form).val();
        return newPwd === confirmPwd;
    }

    $(document).on('submit', '#change_passwd_form', function (e) {
        e.preventDefault();

        var $form = $(e.target);

        sharedClearError($form);

        //validate all inputs
        if (!arePasswordsEqual($form)) {

            sharedShowError($form, $form.data('pwd-no-match-error'));            
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
                        console.log("change_passwd_form:success", result);

                        if (!result.errorCode) {
                            sharedShowSuccess($('.login-info-container'));
                            hideChangePasswordForm($form);
                            return;
                        }

                        sharedShowError($form, result.errorMessage);
                    },
                    error: function (result) {
                        //error messages
                        console.log("change_passwd_form:error", result);
                        if (result.status === 200 && result.responseText) {
                            sharedShowSuccess($('.login-info-container'));
                            hideChangePasswordForm($form);
                            return;
                        }
                        sharedShowError($form, result.errorMessage);
                    },
                    complete: function (status) {
                        submitBtn.removeClass('active');
                    }
                });
            });
        });

        return false;
    });

    //#change password - end

    //#change contact info - start

    $('.contact-preferences-container #change_contact').click(function () {
        $('.contact-preferences-container #change_contact_form').addClass('active');
        $('.contact-preferences-container .info-instr').addClass('active');
        $(this).removeClass('active');
        sharedHideSuccess($('.contact-preferences-container'));
    });

    $('#change_contact_form .action.cancel button').click(function () {
        var $form = $('.contact-preferences-container #change_contact_form');
        hideChangeContactForm($form);
        sharedClearError($form);
        sharedHideSuccess($('.contact-preferences-container'));
    });

    function hideChangeContactForm($root) {
        $root.removeClass('active');
        $('#email', $root).val('');
        $('input[name="language"]', $root).prop('checked', false);
        $('.contact-preferences-container .info-instr').removeClass('active');
        $('.contact-preferences-container #change_contact').addClass('active');
    }

    function resetEmail(email) {
        $('.contact-preferences-container .current-email').text(email);
    }

    $(document).on('submit', '#change_contact_form', function (e) {
        var $form = $(e.target);

        sharedClearError($form);

        var submitBtn = $form.find('button[type=submit]');
        submitBtn.addClass('active');

        var email = $('#email', $form).val();

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
                        console.log("change_contact_form:success", result);

                        if (!result.errorCode) {
                            hideChangeContactForm($form);
                            resetEmail(email);
                            sharedShowSuccess($('.contact-preferences-container'));
                            return;
                        }

                        sharedShowError($form, result.errorMessage);
                    },
                    error: function (result) {
                        //error messages
                        console.log("change_contact_form:error", result);
                        if (result.status === 200 && result.responseText) {
                            hideChangeContactForm($form);
                            resetEmail(email);
                            sharedShowSuccess($('.contact-preferences-container'));
                            return;
                        }
                        sharedShowError($form, result.errorMessage);
                    },
                    complete: function (status) {
                        submitBtn.removeClass('active');
                    }
                });
            });
        });

        return false;
    });

    //#change contact info - end

    //shared - start

    function sharedShowError($root, message) {
        var $errorWrapper = $(".error-wrapper", $root);
        if (message) {
            $('.error-message', $errorWrapper).text(message);
        }

        $errorWrapper.removeClass('no-error');
    }

    function sharedClearError($root) {
        var $errorWrapper = $(".error-wrapper", $root);
        $errorWrapper.addClass('no-error');
    }

    function sharedHideSuccess($root) {
        $('.success-message', $root).addClass('d-none');
    }

    function sharedShowSuccess($root) {
        $('.success-message', $root).removeClass('d-none');
    }

    $('.modal-cancel-membership.modal-general .btn-close').click(function (e) {
        //hide modal dialog
        $('.modal-cancel-membership.modal-general').addClass('d-none');
    });

    $('.modal-general .btn-close, .profile-cancel-modal').click(function (e) {
        //hide modal dialog
        $('.modal-general').addClass('d-none');
    });


    //shared - end

    function initMyProfile() {
    }

    initMyProfile();

    //ForestersGo - start

    function showDeleteForestersGoWarning() {
        $('.modal-delete-account.modal-general').removeClass('d-none');
    }

    function showReactivateForestersGoWarning() {
        $('.modal-reactivate-account.modal-general').removeClass('d-none');
    }

    //delete foresters go
    $('#forester-go-delete-button').click(function (e) {
        e.preventDefault();
        showDeleteForestersGoWarning();
    });

    //reactivate foresters go
    $('#forester-go-reactivate-button').click(function (e) {
        e.preventDefault();
        showReactivateForestersGoWarning();
    });


    $(document).on('submit', 'form.foresters-go-delete-form', function (e) {
        e.preventDefault();
        console.log('delete-form');
        var $form = $(e.target);
        try {
            sharedClearError($form);
            var submitBtn = $form.find('button[type=submit]');
            submitBtn.addClass('active');
            var recaptchaSiteKey = $("#recaptcha-settings").data("sitekey");

            grecaptcha.ready(function () {
                grecaptcha.execute(recaptchaSiteKey, { action: 'submit' }).then(function (token) {
                    var data = $form.serialize();                    
                    if (token) {
                        data += '&retoken=' + token;
                    }
                    $('foresters-go-delete-form .foresters-go-restore-text').removeClass('d-none').hide();
                    $('foresters-go-reactivate-form .foresters-go-delete-text').removeClass('d-none').show();
                    submitMyProfileForestersGo($form, data, submitBtn);
                });
            });

        }
        catch (err) {
            console.log("catch-error", err);
            sharedShowError($form);
            return true;
        }

        return false;
    });

    $(document).on('submit', 'form.foresters-go-reactivate-form', function (e) {
        e.preventDefault();
        console.log('reactivate-form');
        
        var $form = $(e.target);
        try {
            sharedClearError($form);
            var submitBtn = $form.find('button[type=submit]');
            submitBtn.addClass('active');
            var recaptchaSiteKey = $("#recaptcha-settings").data("sitekey");

            grecaptcha.ready(function () {
                grecaptcha.execute(recaptchaSiteKey, { action: 'submit' }).then(function (token) {
                    var data = $form.serialize();
                    if (token) {
                        data += '&retoken=' + token;
                    }
                    $('foresters-go-delete-form .foresters-go-restore-text').removeClass('d-none').show();
                    $('foresters-go-reactivate-form .foresters-go-delete-text').removeClass('d-none').hide();
                    submitMyProfileForestersGo($form, data, submitBtn);
                });
            });

        }
        catch (err) {
            console.log("catch-error", err);
            sharedShowError($form);
            return true;
        }

        return false;

    });


    function submitMyProfileForestersGo($form, data, submitBtn) {
        
        $.ajax({            
            type: $form.attr('method'),
            url: $form.attr('action'),
            dataType: "json",
            data: data,
            success: function (result) {
                console.log("update_foresters_go_form:success", result);
                
                $('.modal-general').addClass('d-none');
                if (!result.errorCode) {
                    sharedShowSuccess($('#foresters_go'));
                    $('.foresters-go-delete-form').toggleClass('active');
                    $('.foresters-go-reactivate-form').toggle('active');
                    return;
                }
                sharedShowError($form, result.errorMessage);
            },
            error: function (result) {
                //error messages                
                console.log("update_foresters_go_form:error", result);
                $('.modal-general').addClass('d-none');
                if (result.status === 200 && result.responseText) {
                    sharedShowSuccess($('#foresters_go'));
                    $('.foresters-go-delete-form').toggleClass('active');
                    $('.foresters-go-reactivate-form').toggle('active');
                    return;
                }

                sharedShowError($form, result.errorMessage);
            },
            complete: function (status) {
                submitBtn.removeClass('active');
            }
        });
    }


//ForestersGo - end

//MembershipAccess - start
    function showCancelMembershipWarning() {
        $('.modal-cancel-membership.modal-general').removeClass('d-none');
    }

    //delete foresters go
    $('#membership-access-delete-button').click(function (e) {
        e.preventDefault();
        
        showCancelMembershipWarning();
    });


    $(document).on('submit', 'form.membership-access-delete-form', function (e) {
        e.preventDefault();
        
        console.log('delete-form');
        var $form = $(e.target);
        try {
            sharedClearError($form);
            var submitBtn = $form.find('button[type=submit]');
            submitBtn.addClass('active');
            var recaptchaSiteKey = $("#recaptcha-settings").data("sitekey");

            grecaptcha.ready(function () {
                grecaptcha.execute(recaptchaSiteKey, { action: 'submit' }).then(function (token) {

                    var data = $form.serialize();
                    if (token) {
                        data += '&retoken=' + token;
                    }                     
                    submitMyProfileMembershipAcces($form, data, submitBtn);
                });
            });

        }
        catch (err) {
            console.log("catch-error", err);
            sharedShowError($form);
            return true;
        }

        return false;
    });
    function submitMyProfileMembershipAcces($form, data, submitBtn) {
        $.ajax({
            type: $form.attr('method'),
            url: $form.attr('action'),
            dataType: "json",            
            data: data,
            success: function (result) {
                console.log("update_foresters_go_form:success", result);
                
                $('.modal-general').addClass('d-none');
                if (!result.errorCode) {
                    var returnUrl = $form.data("returnurl");
                    if (returnUrl) {
                        window.location.replace(returnUrl);
                    }
                    
                    return;
                }
                sharedShowError($form, result.errorMessage);
            },
            error: function (result) {
                //error messages
                console.log("update_foresters_go_form:error", result);
                $('.modal-general').addClass('d-none');

                sharedShowError($form, result.errorMessage);
            },
            complete: function (status) {
                submitBtn.removeClass('active');
            }
        });
    }

//MembershipAccess -END
});