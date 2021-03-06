var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var browserify = require('browserify');
var aliasify = require('aliasify');
var watchify = require('watchify');
var runSequence = require('run-sequence');
var gulpif = require('gulp-if');
var parseArgs = require('minimist');
var extend = require('extend');
var dateFormat = require('dateformat');
var chalk = require('chalk');
var notify = require('gulp-notify');
var livereload = require('gulp-livereload');
var eslint = require('gulp-eslint');
var distPath = 'public/';
var gulpLoadPlugins = require('gulp-load-plugins');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var assign = require('lodash').assign;
var glob = require('glob');
var path = require('path');
var jade = require('gulp-jade');
var connect = require('gulp-connect');
const $ = gulpLoadPlugins();

var styleConsole = {
    info: chalk.white.bgBlue,
    error: chalk.white.bgRed,
    warn: chalk.red.bgYellow
};

var config = extend(
    {
        env: process.env.NODE_ENV
    },
    parseArgs(process.argv.slice(2))
);

var onError = function(err) {
    notify({ title: 'Gulp Task Error', message: 'Check the console.' }).write(err);
    console.log(styleConsole.error(err.toString()));
    this.emit('end');
};

var createBundle = (options, attachedWithBundle) => {
    // let env = process.env.NODE_ENV;
    // let isWatchify = process.env.IS_WATCHIFY;
    // console.log('NODE_ENV : ' + config.env);

    const opts = assign({}, watchify.args, {
        entries: options.entries,
        extensions: options.extensions,
        debug: config.env === 'development' ? true : false
    });

    var b = browserify(opts);

    b.transform('babelify', {
        presets: ['es2015', 'react'],
        plugins: ['transform-class-properties']
    });

    if (config.env === 'production') {
        let aliasifyConfig = {
            replacements: {
                '(\\w+)/MockProvider': function(alias, regexMatch, regexObject) {
                    console.log(alias);
                    console.log(regexMatch);
                    return './src/components/core/ReplaceMockProvider.jsx'; // default behavior - won't replace
                }
            }
        };

        b.transform(aliasify, aliasifyConfig);
    }

    if (typeof attachedWithBundle == 'function') {
        attachedWithBundle(b);
    }

    const rebundle = () =>
        b
            .bundle()
            .on('error', $.util.log.bind($.util, 'Browserify Error'))
            .pipe(source(options.output))
            .pipe(buffer())
            .pipe(
                rename(function(path) {
                    path.extname = '.bundle.js';
                })
            )
            .pipe(
                $.sourcemaps.init({
                    loadMaps: config.env === 'development' ? true : false
                })
            )
            .pipe(gulpif(config.env === 'development', $.sourcemaps.write('../js/maps')))
            // .pipe($.sourcemaps.init({ loadMaps: true }))
            // .pipe($.sourcemaps.write('../js/maps'))
            .pipe(gulpif(config.env === 'production', $.uglify()))
            .pipe(
                gulpif(
                    config.env === 'production',
                    $.header('/* publish time ${Date}*/', {
                        Date: dateFormat(new Date(), 'dddd, mmmm dS, yyyy, h:MM:ss TT')
                    })
                )
            )
            .pipe(gulp.dest(options.destination))
            .pipe(livereload());

    if (config.env === 'development') {
        b = watchify(b);
        b.on('update', rebundle);
        b.on('log', $.util.log);
    }

    return rebundle();
};

gulp.task('js:components', function() {
    glob('./src/*.jsx', function(err, files) {
        if (err) done(err);

        files.forEach(function(entry) {
            var outputName = path.basename(entry);

            createBundle(
                {
                    entries: [entry],
                    output: outputName,
                    extensions: ['.jsx'],
                    destination: './public/js'
                },
                function(b) {
                    b.external('react');
                    b.external('react-dom');
                    b.external('reflux');
                    b.external('jquery');
                    b.external('mockjs');
                }
            );
        });
    });
});

gulp.task('js:common', function() {
    createBundle(
        {
            output: 'common.js',
            extensions: ['.jsx'],
            destination: './public/js'
        },
        function(b) {
            b.require('react');
            b.require('react-dom');
            b.require('reflux');
            b.require('jquery');
            b.require('mockjs');
            b.require('lodash');
        }
    );
});

gulp.task('js:bundle', ['js:common', 'js:components'], function() {});

//css
gulp.task('css:sass', function() {
    gulp
        .src(['src/scss/**/*.scss', '!src/scss/**/_*.scss'])
        .pipe(plumber({ errorHandle: onError }))
        .pipe(sass({ errLogToConsole: true, includePaths: ['src/scss/**/**'] }))
        .pipe(
            autoprefixer({
                browsers: ['last 4 versions', 'Firefox >= 27', 'Blackberry >= 7', 'IE 8', 'IE 9'],
                cascade: false
            })
        )
        .pipe(gulp.dest(distPath + 'css/'))
        .pipe(livereload());
});

//eslint
gulp.task('js:lint', () => {
    //config 檔在 .eslintrc
    return gulp
        .src(['src/**/*.js', 'src/**/*.jsx'])
        .pipe(eslint())
        .pipe(eslint.format('codeframe'));
});
gulp.task('lint-watch', () => {
    // Lint only files that change after this watch starts
    const lintAndPrint = eslint();
    // format results with each file, since this stream won't end.
    lintAndPrint.pipe(eslint.formatEach());

    return gulp.watch(['src/**/*.js', 'src/**/*.jsx'], event => {
        if (event.type !== 'deleted') {
            gulp.src(event.path).pipe(lintAndPrint, { end: false });
        }
    });
});

//view
gulp.task('jade', function() {
    gulp
        .src(['views/*.jade', '!views/_*.jade'])
        .pipe(plumber())
        .pipe(
            jade({
                pretty: true
            })
        )
        .pipe(gulp.dest('public/'));
});

gulp.task('html', function() {
    gulp.src('public/*.html').pipe(connect.reload());
});

//livereload task
gulp.task('watch', function() {
    // livereload.listen();
    gulp.watch(['src/scss/**/*.scss', '!src/scss/**/_*.scss'], ['css:sass']);
    gulp.watch(['views/*.jade'], ['jade']);
    gulp.watch(['public/*.html'], ['html']);
});

gulp.task('set-dev-node-env', function() {
    return (process.env.NODE_ENV = config.env = 'development');
});

gulp.task('set-prod-node-env', function() {
    return (process.env.NODE_ENV = config.env = 'production');
});

//server
gulp.task('connectDist', function() {
    connect.server({
        root: 'public',
        port: 3001,
        livereload: true
    });
});
gulp.task('open', function() {
    gulp.src(__filename).pipe(
        open({
            uri: 'http://localhost:3001',
            app: 'chrome'
        })
    );
});

gulp.task('clean', function() {
    return gulp.src(['public/css', 'public/js','public/*.html'], { read: false }).pipe($.clean());
});

gulp.task(
    'build',
    ['jade','js:lint', 'js:bundle', 'css:sass', 'connectDist', 'watch', 'lint-watch'],
    function() {}
);

gulp.task('develop', ['set-dev-node-env', 'clean'], function() {
    return runSequence('build');
});

gulp.task('deploy', ['set-prod-node-env', 'clean'], function() {
    return runSequence('build');
});
