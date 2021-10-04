$(function () {
    var ACCEPT_COOKIE_POLICY = 'ACCEPT_COOKIE_POLICY';

    $('#acceptCookies').click(function () {
        localStorage.setItem(ACCEPT_COOKIE_POLICY, true);
        $('div.cookie-policy').addClass('no-height');
    });

    var cookiePolicyAccepted = localStorage.getItem(ACCEPT_COOKIE_POLICY);
    if (!cookiePolicyAccepted) {
        $('div.cookie-policy').removeClass('no-height');
    }
});