$(function () {
    modalPopupObj.registerEvents(); 
});
var modalPopupObj = {
    showTnCModalGeneral: function () {
        $('.component-modal-general .modal-general').removeClass('d-none');
        $('body').addClass('modal-open');
    },
    submitTnCGeneral: function () {
        var url = window.location.origin + $(".accept-tnc").data("ssourl");
        $(".component-modal-general .modal-general .content-container input.agree").prop("checked", false);
        modalPopupObj.openTab(url);
    },
    resetTnCGeneral: function () {
        //reset checkboxes
        $('.component-modal-general .modal-general').each(function () {
            $(this).prop("checked", false);
        });
        //reset enabled button to diabled
        $('.component-modal-general .modal-general button.accept-tnc').attr('disabled', true);
    },
    registerEvents: function () {

        $('.cta .app-get-started').click(function (e) {
            e.preventDefault();
            modalPopupObj.showTnCModalGeneral();
        });        

        $('.component-modal-general .modal-general input.agree').click(function (e) {
            var allChecked = true;
            $('.component-modal-general .modal-general input.agree').each(function () {
                allChecked &= $(this).is(":checked");
            });

            if (allChecked) {
                $('.component-modal-general .modal-general button.accept-tnc').removeAttr('disabled');
            } else {
                $('.component-modal-general .modal-general button.accept-tnc').attr('disabled', true);
            }
        });

        $('.component-modal-general .modal-general .btn-close').click(function (e) {
            //hide modal dialog
            $('.component-modal-general .modal-general').addClass('d-none');
            $('body').removeClass('modal-open');
            modalPopupObj.resetTnCGeneral();
        });

        $('.component-modal-general .modal-general .cancel-tnc').click(function (e) {
            //hide modal dialog
            $('.component-modal-general .modal-general').addClass('d-none');
            modalPopupObj.resetTnCGeneral();
        });

        $('.component-modal-general .modal-general .accept-tnc').click(function (e) {      
            $('body').removeClass('modal-open');
            $('.component-modal-general .modal-general').addClass('d-none');
            modalPopupObj.resetTnCGeneral();
            if ($('.component-modal-general .hdnUserPref').val() === "True") {
                modalPopupObj.submitTnCWithPreferenceCheck();
            }
            else{
                modalPopupObj.submitTnCGeneral();
            }            
        });

        $('.component-modal-general .modal-general input.agree').click(function (e) {
            var allChecked = true;
            $('.component-modal-general .modal-general input.agree').each(function () {
                allChecked &= $(this).is(":checked");
            });

            if (allChecked) {
                $('.component-modal-general .modal-general .accept-tnc').removeAttr('disabled');
            } else {
                $('.component-modal-general .modal-general .accept-tnc').attr('disabled', true);
            }
        });        
    },
    submitTnCWithPreferenceCheck: function () {
        $.ajax({
            url: "/api/sitecore/SSO/CheckedTnCWpp",
            async:false,
            success: function (result) {
                modalPopupObj.submitTnCGeneral();
            }
        });
    },
    openTab: function (url) {
        // Create link in memory
        var a = window.document.createElement("a");
        a.target = '_blank';
        a.href = url;

        // Dispatch fake click
        var e = window.document.createEvent("MouseEvents");
        e.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
    }
};