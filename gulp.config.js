module.exports = function () {
    var config = {
        client: './client/',
        server: './server/',
        index: './client/index.html',
        main: '../../../Foundation/Membership/MVC/Foresters.Foundation.Membership.MVC/Areas/Membership/Views/Shared/',
        mainFile: 'Main.cshtml',
        js: [
            './client/js/custom/activities-widget.js',       
            './client/js/custom/card-container.js',       
            './client/js/custom/tooltip.js',       
            './client/components/**/*.js', 
            './client/js/custom/main.js',       
        ],
        libJs: [
            './client/js/lib/jquery.min.js',
            './client/js/lib/jquery-ui.min.js',
            './client/js/lib/popper.min.js',
            './client/js/lib/bootstrap.min.js',
            './client/js/lib/outline.js',
            './client/js/lib/moment-with-locales.js',
            './client/js/lib/attrchange.js',
        ],
        styles: [
            './client/styles/main.scss'
        ],
        css: './temp/styles.css',
        nodeServer: './server/app.js',
        temp: './temp/',
        build: '../Foresters.Membership.Website/content/membership/',
        buildClient: './client/build/membership/',
        iis: '/inetpub/wwwroot/dev.cm/Content/membership/',
    };

    config.getWiredepDefaultOptions = function () {
        var options = {
            
        };

        return options;
    };
    return config;
};