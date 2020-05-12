const gulp = require("gulp"),
    sass = require("gulp-sass"),
    concat = require("gulp-concat"),
    autoprefixer = require("gulp-autoprefixer"),
    cleanCSS = require("gulp-clean-css"),
    uglify = require("gulp-uglify"),
    htmlmin = require("gulp-htmlmin"),
    gcmq = require("gulp-group-css-media-queries"),
    sourcemaps = require("gulp-sourcemaps"),
    babel = require("gulp-babel"),
    imagemin = require("gulp-imagemin"),
    webp = require("gulp-webp"),
    webpHTML = require("gulp-webp-html"),
    webpCSS = require("gulp-webpcss"),
    fileInclude = require("gulp-file-include"),
    ttf2woff = require("gulp-ttf2woff"),
    ttf2woff2 = require("gulp-ttf2woff2"),
    fs = require("fs"),
    del = require("del"),
    browserSync = require("browser-sync").create();

// src
const dist = "./dist/",
    src = "./src/",
    path = {
        dist: {
            html: dist,
            css: dist + "css/",
            js: dist + "js/",
            vendor: dist + "vendor/",
            img: dist + "img/",
            fonts: dist + "fonts/",
        },
        src: {
            html: src + "*.html",
            scss: src + "scss/main.scss",
            js: src + "js/main.js",
            vendorCSS: src + "vendor/**/*.css",
            vendorJS: src + "vendor/**/*.js",
            img: src + "img/**/*",
            fonts: src + "fonts/**/*",
        },
        del: {
            all: dist,
            html: dist + "*.{html,map}",
            css: dist + "css/",
            js: dist + "js/",
            vendorCSS: dist + "vendor/**/*.css",
            vendorJS: dist + "vendor/**/*.js",
            img: dist + "img/",
            fonts: dist + "fonts/",
        },

        watch: {
            html: src + "*.html",
            scss: src + "scss/**/*.scss",
            js: src + "js/**/*.js",
            modulesHTML: src + "modules/**/*.html",
            modulesSCSS: src + "modules/**/*.scss",
            modulesJS: src + "modules/**/*.js",
            vendorCSS: src + "vendor/**/*.css",
            vendorJS: src + "vendor/**/*.js",
            img: src + "img/**/*",
            fonts: src + "fonts/**/*",
        },
    };

// tasks
gulp.task("html", () => {
    return gulp
        .src(path.src.html)
        .pipe(sourcemaps.init())
        .pipe(
            fileInclude({
                prefix: "~",
                basepath: "@file",
            })
        )
        .pipe(webpHTML())
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(path.dist.html));
});

gulp.task("css", () => {
    return gulp
        .src(path.src.scss, { allowEmpty: true })
        .pipe(sourcemaps.init())
        .pipe(sass().on("error", sass.logError))
        .pipe(concat("main.css"))
        .pipe(gcmq())
        .pipe(webpCSS())
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 5 versions"],
                cascade: true,
            })
        )
        .pipe(cleanCSS({ level: 2 }))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(path.dist.css))
        .pipe(browserSync.stream());
});

gulp.task("js", () => {
    return gulp
        .src(path.src.js, { allowEmpty: true })
        .pipe(sourcemaps.init())
        .pipe(
            fileInclude({
                prefix: "~",
                basepath: "@file",
            })
        )
        .pipe(concat("main.js"))
        .pipe(
            babel({
                presets: ["@babel/env"],
            })
        )
        .pipe(uglify({ toplevel: true }))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(path.dist.js))
        .pipe(browserSync.stream());
});

gulp.task("vendorCSS", () => {
    return gulp
        .src(path.src.vendorCSS, { allowEmpty: true })
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 5 versions"],
                cascade: false,
            })
        )
        .pipe(cleanCSS({ level: 2 }))
        .pipe(gulp.dest(path.dist.vendor))
        .pipe(browserSync.stream());
});

gulp.task("vendorJS", () => {
    return gulp
        .src(path.src.vendorJS, { allowEmpty: true })
        .pipe(
            babel({
                presets: ["@babel/env"],
            })
        )
        .pipe(uglify({ toplevel: true }))
        .pipe(gulp.dest(path.dist.vendor))
        .pipe(browserSync.stream());
});

gulp.task("img", () => {
    return (
        gulp
        .src(path.src.img, { allowEmpty: true })
        .pipe(
            webp({
                quality: 75,
            })
        )
        .pipe(gulp.dest(path.dist.img))
        .pipe(browserSync.stream()),
        gulp
        .src(path.src.img, { allowEmpty: true })

        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{ removeViewBox: false }],
                interplaced: true,
                optimizationLevel: 3, // 0 to 7
            })
        )
        .pipe(gulp.dest(path.dist.img))
        .pipe(browserSync.stream())
    );
});

gulp.task("fonts", () => {
    return (
        gulp
        .src(path.src.fonts, { allowEmpty: true })
        .pipe(ttf2woff())
        .pipe(gulp.dest(path.dist.fonts))
        .pipe(browserSync.stream()),
        gulp
        .src(path.src.fonts, { allowEmpty: true })
        .pipe(ttf2woff2())
        .pipe(gulp.dest(path.dist.fonts))
        .pipe(browserSync.stream())
    );
});

//fonts generating
function fontsRender(cb) {
    let file_content = fs.readFileSync(src + "scss/helpers/fonts.scss");
    if (file_content == "" || file_content == " ") {
        fs.writeFile(src + "scss/helpers/fonts.scss", "", cb);
        return fs.readdir(dist + "fonts", function(err, items) {
            if (items) {
                let c_fontname;
                for (let i = 0; i < items.length; i++) {
                    let fontname = items[i].split(".");
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(
                            src + "scss/helpers/fonts.scss",
                            '@include font("' +
                            fontname +
                            '", "' +
                            fontname +
                            '", "400", "normal");\r\n',
                            cb
                        );
                    }
                    c_fontname = fontname;
                }
            }
        });
    }
    cb();
}

//del tasks
gulp.task("del", () => {
    return del([path.del.all]);
});
gulp.task("delHTML", () => {
    return del([path.del.html]);
});
gulp.task("delCSS", () => {
    return del([path.del.css]);
});
gulp.task("delJS", () => {
    return del([path.del.js]);
});
gulp.task("delvendorCSS", () => {
    return del([path.del.vendorCSS]);
});
gulp.task("delvendorJS", () => {
    return del([path.del.vendorJS]);
});
gulp.task("delimg", () => {
    return del([path.del.img]);
});
gulp.task("delfonts", () => {
    return del([path.del.fonts]);
});

// watch task
gulp.task("watch", () => {
    browserSync.init({
        server: {
            directory: true,
            baseDir: dist,
        },
        startPath: "./index.html",
        port: 3000,
        notify: false,
    });

    gulp.watch(
        [path.watch.html, path.watch.modulesHTML],
        gulp.series("delHTML", "html")
    );
    gulp.watch(
        [path.watch.scss, path.watch.modulesSCSS],
        gulp.series("delCSS", "css")
    );
    gulp.watch([path.watch.js, path.watch.modulesJS], gulp.series("delJS", "js"));
    gulp.watch(path.watch.img, gulp.series("delimg", "img"));
    gulp.watch(path.watch.fonts, gulp.series("delfonts", "fonts"));
    gulp.watch(path.watch.vendorCSS, gulp.series("delvendorCSS", "vendorCSS"));
    gulp.watch(path.watch.vendorJS, gulp.series("delvendorJS", "vendorJS"));
    gulp
        .watch([path.watch.html, path.watch.modulesHTML])
        .on("change", browserSync.reload);
});

// build tasks
gulp.task(
    "build",
    gulp.series(
        "del",
        gulp.parallel("html", "fonts", "vendorCSS", "css", "vendorJS", "js", "img"),
        fontsRender
    )
);
gulp.task("dev", gulp.series("build", "watch"));