/// <binding BeforeBuild='default' />

const gulp = require('gulp'),
    args = require('yargs').argv,
    useref = require('gulp-useref'),
    sass = require('gulp-sass'),
    $ = require('gulp-load-plugins')({ lazy: true }),
    del = require('del'),
    browserSync = require('browser-sync'),
    connect = require('gulp-connect'),
    print = $.print.default;
const eslint = require('gulp-eslint');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const fs = require('fs');
const hash = require('gulp-hash-filename');
const { v4: uuidv4 } = require('uuid');
//const uuid = uuidv4().replace(/\-/, '');

const config = require('./gulp.config')();
const port = process.env.port || 7203;

const arg = (argList => {

    let arg = {}, a, opt, thisOpt, curOpt;
    for (a = 0; a < argList.length; a++) {

        thisOpt = argList[a].trim();
        opt = thisOpt.replace(/^\-+/, '');

        if (opt === thisOpt) {

            // argument value
            if (curOpt) arg[curOpt] = opt;
            curOpt = null;

        }
        else {

            // argument name
            curOpt = opt;
            arg[curOpt] = true;

        }

    }

    return arg;

})(process.argv);

var uuid = Math.round(Math.random() * 10000);
if (arg !== null) {
    uuid = arg.buildNumber;
}

function errorLogger(err) {
    log('start logging error');
    log(err);
    log('finish logging error');
    this.emit('end');
}

function log(msg) {
    if (typeof msg === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}

async function cleanClient() {
    var client = config.buildClient + '**/*.*';
    await del(client, { force: true });
}

async function cleanLocal() {
    var local = config.build + '**/*.*';
    await del(local, { force: true });
}

async function cleanIIS() {
    var iis = config.iis + '**/*.*';
    await del(iis, { force: true });
}

function styles() {
    log('sass compilation has started');
    return gulp.src(config.styles)
        .pipe(sass.sync().on('error', sass.logError))
        .pipe($.if(args.verbose, print()))
        .pipe($.plumber())
        .pipe(sass(
            { bundleExec: false, tmpPath: './temp', outputStyle: 'expanded' }
        ))
        .pipe($.autoprefixer())
        .pipe(rename('membership.debug.css'))
        .pipe(gulp.dest(config.buildClient + 'css'))
        .pipe($.csso())
        .pipe(rename('membership.min.css'))
        .pipe(gulp.dest(config.build + 'css'));
}

function stylesDeploy() {
    log('sass compilation has started');
    return gulp.src(config.styles)
        .pipe(sass.sync().on('error', sass.logError))
        .pipe($.if(args.verbose, print()))
        .pipe($.plumber())
        .pipe(sass(
            { bundleExec: false, tmpPath: './temp', outputStyle: 'expanded' }
        ))
        .pipe($.autoprefixer())
        .pipe($.csso())
        .pipe(rename('membership.min.' + uuid + '.css'))
        .pipe(gulp.dest(config.build + 'css'));
}

function vet() {
    log('vetting code started, ' + config);
    return gulp.src(config.js)
        .pipe($.if(args.verbose, print()))
        .pipe($.jscs({ fix: true }))
        .pipe($.jscs.reporter())
        .pipe($.jscs.reporter('fail'))
        .pipe(eslint({
            rules: {
                'camelcase': 1,
                'comma-dangle': 2,
                'quotes': 0
            },
            globals: [
                'jQuery',
                '$'
            ],
            envs: [
                'browser'
            ]
        }))
        .pipe(eslint.formatEach('compact', process.stderr));
}

function buildCustomJs() {
    return gulp.src(config.js)
        .pipe(concat('membership.min.js'))
        .pipe(gulp.dest(config.buildClient + 'js'))
        .pipe(gulp.dest(config.build + 'js'));
}

function buildCustomJsDeploy() {
    return gulp.src(config.js)
        .pipe(concat('membership.min.js'))
        .pipe(rename('membership.min.' + uuid + '.js'))
        .pipe(uglify())
        .pipe(gulp.dest(config.build + 'js'));
}

function builLibJs() {
    return gulp.src(config.libJs)
        .pipe(concat('lib.min.js'))
        .pipe(gulp.dest(config.build + 'js'))
        .pipe(gulp.dest(config.buildClient + 'js'));
}

function builLibJsDeploy() {
    return gulp.src(config.libJs)
        .pipe(concat('lib.min.js'))
        .pipe(rename('lib.min.' + uuid + '.js'))
        .pipe(gulp.dest(config.build + 'js'));
}

function buildClient(contentView, authenticated) {
    log('build local client ' + contentView + ' started');

    return  gulp.src(config.index)
        .pipe($.replace('<!--CONTENT:SRC:HTML-->', function (s) {
            return fs.readFileSync('./client/components/' + contentView + '/' + contentView + '.html', 'utf8').trim();
        }))
        .pipe($.replace('<!--HEADER:SRC:HTML-->', function (s) {
            if (authenticated) {
                return fs.readFileSync('./client/components/header/authenticated-header.html', 'utf8').trim();
            }
            return fs.readFileSync('./client/components/header/non-auth-header.html', 'utf8').trim();
        }))
        .pipe($.replace('<!--FOOTER:SRC:HTML-->', function (s) {
            return fs.readFileSync('./client/components/footer/footer.html', 'utf8').trim();
        }))
        .pipe($.replace('<!--COOKIE:SRC:HTML-->', function (s) {
            return fs.readFileSync('./client/components/cookie-policy/cookie-policy.html', 'utf8').trim();
        }))
        .pipe(rename(contentView + '.html'))
        .pipe($.replace('%HASHCODE%', uuid))
        .pipe(gulp.dest(config.buildClient));
};

async function buildClients() {
    await buildClient('login');
    await buildClient('register');
    await buildClient('employee-register');
    await buildClient('forget_password');
    await buildClient('forget_password_confirmation');
    await buildClient('customer_care');
    await buildClient('law_assure');
    await buildClient('everyday-money');
    await buildClient('scholarships');
    await buildClient('medical_member');
    await buildClient('roche');
    await buildClient('all-benefits');
    await buildClient('forgot-cert');
    await buildClient('forgot-cert-email-sent');
    await buildClient('leadership-development');
    await buildClient('leadership-nomination');
    await buildClient('leadership-landing');
    await buildClient('leadership-become-leader');
    await buildClient('my-profile');
    await buildClient('my-profile-uk');
    await buildClient('my-branch');
    await buildClient('home-page');
    await buildClient('employee-access');
    await buildClient('create-password');
    await buildClient('employee-profile');
    await buildClient('activities-landing');
    await buildClient('cert-details');
}

async function buildAuthenticatedClients() {
    await buildClient('login', true);
    await buildClient('register', true);
    await buildClient('employee-register', true);
    await buildClient('forget_password', true);
    await buildClient('forget_password_confirmation', true);
    await buildClient('customer_care', true);
    await buildClient('law_assure', true);
    await buildClient('everyday-money', true);
    await buildClient('scholarships', true);
    await buildClient('medical_member', true);
    await buildClient('roche', true);
    await buildClient('all-benefits', true);
    await buildClient('forgot-cert', true);
    await buildClient('forgot-cert-email-sent', true);
    await buildClient('leadership-development', true);
    await buildClient('leadership-landing', true);
    await buildClient('leadership-nomination', true);
    await buildClient('leadership-become-leader', true);
    await buildClient('my-profile', true);
    await buildClient('my-profile-uk', true);
    await buildClient('my-branch', true);
    await buildClient('home-page', true);
    await buildClient('employee-access', true);
    await buildClient('create-password', true);
    await buildClient('employee-profile', true);
    await buildClient('activities-landing', true);
    await buildClient('cert-details', true);
}

function buildDeploy() {
    log('build Main.cshtml started');

    return gulp.src(config.main + config.mainFile)
        .pipe($.replace(/membership.(mi.*).css/, 'membership.min.' + uuid + '.css'))
        .pipe($.replace(/membership.(mi.*).js/, 'membership.min.' + uuid + '.js'))
        .pipe($.replace(/lib.(mi.*).js/, 'lib.min.' + uuid + '.js'))
        .pipe(gulp.dest(config.main));
};

function fonts () {
    return gulp.src([config.client + 'fonts/*.*'])
        .pipe(gulp.dest(config.buildClient + 'fonts/'))
        .pipe(gulp.dest(config.build + 'fonts/'));
}

function assets () {
    return gulp.src([config.client + 'assets/img/*.*'])
        .pipe(gulp.dest(config.buildClient + 'content/membership/assets/'))
        .pipe(gulp.dest(config.build + 'assets/'));
}

function deployIIS() {
    return gulp.src(config.build + '**/*.*')
        .pipe(gulp.dest(config.iis));
}

gulp.task('styles', async function () {
   return styles();
});


gulp.task('vet', vet);
gulp.task('cleanup', async function () {
    await cleanClient();
    await cleanLocal();
});

gulp.task('fonts', fonts);
gulp.task('assets', assets);
gulp.task('scripts', gulp.series(builLibJs, buildCustomJs));
gulp.task('build-non-auth-pages', gulp.series(cleanClient, fonts, assets, styles, builLibJs, buildCustomJs, buildClients));
gulp.task('build-authenticated-pages', gulp.series(cleanClient, fonts, assets, styles, builLibJs, buildCustomJs, buildAuthenticatedClients));
gulp.task('build-local', gulp.series(cleanLocal, fonts, assets, styles, builLibJs, buildCustomJs));
gulp.task('build-iis', gulp.series(cleanIIS, deployIIS));
gulp.task('defaults', gulp.series(cleanClient, cleanLocal, fonts, assets, stylesDeploy, builLibJsDeploy, buildCustomJsDeploy, buildDeploy));