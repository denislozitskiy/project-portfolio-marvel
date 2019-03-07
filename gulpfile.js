"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var minify_js = require('gulp-minify');
var server = require("browser-sync").create();
var run = require("run-sequence");
var del = require("del");

/*================================ HTML ==========================*/
gulp.task("html", function () {
  return gulp.src("*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build"));
});

/*================================ CSS ========================== */ 
gulp.task("style", function () {
  gulp.src("sass/style.sass")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

/*================================ JAVASCRIPT ==========================*/
gulp.task("javascript", function () {
  return gulp.src(["js/*.js", "js/*.mjs"])
    .pipe(minify_js())
    .pipe(gulp.dest("build/js"));
});

/*================================ LIBRARIES ==========================*/
gulp.task("libs", function () {
  return gulp.src("libs/*")
    .pipe(gulp.dest("build/libs"));
});

/*========================= IMG COMPRESSION ======================*/
gulp.task("images", function () {
  return gulp.src("img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({
        optimizationLevel: 5
      }),
      imagemin.jpegtran({
        progressive: true
      }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("/build/img"));
});

/*================================ SVG ==========================*/
gulp.task("sprite", function () {
  return gulp.src("img/*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

/*================================ SERVE ==========================*/
gulp.task("serve", function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("*.html", ["html"]);
  gulp.watch("sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("js/*.{js,mjs}", ["javascript"]);
  gulp.watch("*.html").on("change", server.reload);
  gulp.watch("sass/*.{scss,sass}").on("change", server.reload);
  gulp.watch("js/*.{js,mjs}").on("change", server.reload);
});

gulp.task("copy", function () {
  return gulp.src([
    "fonts/**/*.{woff,woff2}",
    "img/**",
    "js/**"
    ], {
      base: "."
    })
    .pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
  return del("build");
});

/*================================ BUILD ==========================*/
gulp.task("build", function (done) {
  run(
    "clean",
    "copy",
    "style",
    "images",
    "sprite",
    "html",
    "libs",
    "javascript",
    done
  );
});
