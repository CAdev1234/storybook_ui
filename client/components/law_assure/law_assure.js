$(function () {
    function showTnCModal() {
        $('.tnc.modal-general').removeClass('d-none');
        $('body').addClass('modal-open');
    }

    $('.cta .law-assure-get-started').click(function (e) {
        showTnCModal();
    });
    
    $('.tnc.modal-general input.agree').click(function (e) {
        var allChecked = true;
        $('.tnc.modal-general input.agree').each(function () {
            allChecked &= $(this).is(":checked");
        });

        if (allChecked) {
            $('.tnc.modal-general button.agree-tnc').removeAttr('disabled');
        } else {
            $('.tnc.modal-general button.agree-tnc').attr('disabled', true);
        }
    }); 

    function resetTnC() {
        //reset checkboxes
        $('.tnc.modal-general input.agree').each(function () {
            $(this).prop("checked", false);
        });
        //reset enabled button to diabled
        $('.tnc.modal-general button.agree-tnc').attr('disabled', true);
    }

    $('.tnc.modal-general .btn-close').click(function (e) {
        //hide modal dialog
        $('.tnc.modal-general').addClass('d-none');
        $('body').removeClass('modal-open');
        resetTnC();
    });

    $('.tnc.modal-general .agree-tnc').click(function (e) {
        $('.tnc.modal-general').addClass('d-none');
        resetTnC();
    });

    $('.agree-tnc').click(function (e) {
        submitTnC();
    });

    $('.tnc input.agree').click(function (e) {
        var allChecked = true;
        $('.tnc input.agree').each(function () {
            allChecked &= $(this).is(":checked");
        });

        if (allChecked) {
            $('.agree-tnc').removeAttr('disabled');
        } else {
            $('.agree-tnc').attr('disabled', true);
        }
    });

    function submitTnC() {
        $.ajax({
            url: "/api/sitecore/SSO/CheckedTnC",
            success: function (result) {
                var url = $(".agree-tnc").data("ssourl");
                location.replace(url);
            }
        });
    }


});