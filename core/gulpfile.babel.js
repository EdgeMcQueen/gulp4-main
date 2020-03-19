"use strict";

// основные таски
import webpack from "webpack";
import webpackStream from "webpack-stream";
import gulp from "gulp";
import gulpif from "gulp-if";
import yargs from "yargs";
import browsersync from "browser-sync";
// таски для работы со скриптами
import cleanJs from "gulp-terser";
// таски для работы со стилями
import autoprefixer from "gulp-autoprefixer";
import sass from "gulp-sass";
import cleanCss from "gulp-clean-css";
import gcmq from "gulp-group-css-media-queries";
// таски для работы с изображениями
import imagemin from "gulp-imagemin";
import imageminPngquant from "imagemin-pngquant";
import imageminZopfli from "imagemin-zopfli";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminGiflossy from "imagemin-giflossy";
import imageminWebp from "imagemin-webp";
// проверка кода и валидаторы
import htmlhint from "gulp-htmlhint";
import htmlhintConfig from "htmlhint-htmlacademy";
import htmlValidator from "gulp-w3c-html-validator";
import eslint from "gulp-eslint";
import gulpStylelint from "gulp-stylelint";
// дополнительные таски
import del from "del";
import rename from "gulp-rename";

// настройки webpack'а
const webpackConfig = require("./webpack.config.js"),
	argv = yargs.argv,
	production = !!argv.production,
	smartgrid = require("smart-grid"),

  paths = {
  markups: {
    src: [
      "./app/index.html"
    ],
    dist: "./../",
    watch: "./app/**/*.html"
  },
  styles: {
    src: "./app/scss/main.scss",
    dist: "./../css",
    watch: [
      "./app/scss/**/*.scss"
    ]
  },
  scripts: {
    src: "./app/js/index.js",
    dist: "./../js/",
    watch: [
      "./app/js/**/*.js"
    ]
  },
  images: {
    src: [
      "./app/img/**/*.{jpg,jpeg,png,gif,svg}",
      "!./app/img/svg/*.svg",
      "!./app/img/favicon.{jpg,jpeg,png,gif}"
    ],
    dist: "./../img/",
    watch: "./app/img/**/*.{jpg,jpeg,png,gif,svg}"
  },
  webp: {
    src: "./app/img/**/*_webp.{jpg,jpeg,png}",
    dist: "./../img/",
    watch: "./app/img/**/*_webp.{jpg,jpeg,png}"
  },
  fonts: {
    src: "./app/fonts/**/*.{ttf,otf,woff,woff2}",
    dist: "./../fonts/",
    watch: "./app/fonts/**/*.{ttf,otf,woff,woff2}"
  },
  favicons: {
    src: "./app/img/favicon.{jpg,jpeg,png,gif}",
    dist: "./../img/favicons/",
  },
};

webpackConfig.mode = production ? "production" : "development";
webpackConfig.devtool = production ? false : "cheap-eval-source-map";

export const server = () => {
browsersync.init({
  server: "./../",
  notify: false
});

  gulp.watch(paths.markups.watch, markups);
  gulp.watch(paths.styles.watch, sass);
  gulp.watch(paths.scripts.watch, scripts);
  gulp.watch(paths.images.watch, images);
  gulp.watch(paths.webp.watch, webpimages);
};

export const clean = () => gulp.src([
  "./../*.html",
  "./../css",
  "./../fonts",
  "./../img",
  "./../js"
],
 {read: false})
	.pipe(del());

export const serverConfig = () => gulp.src(paths.server_config.src)
.pipe(gulp.dest(paths.server_config.dist));

export const smartGrid = cb => {
	smartgrid("./app/scss/libs", {
		outputStyle: "scss",
		filename: "_smart-grid",
		columns: 12, // number of grid columns
		offset: "30px", // gutter width
		mobileFirst: true,
		mixinNames: {
			container: "container"
		},
		container: {
			fields: "15px" // side fields
		},
		breakPoints: {
			xs: {
				width: "320px"
			},
			sm: {
				width: "576px"
			},
			md: {
				width: "768px"
			},
			lg: {
				width: "992px"
			},
			xl: {
				width: "1200px"
			}
		}
	});
	cb();
};

export const sass = () => gulp.src(paths.styles.src)
	.pipe(gulpif(!production, sourcemaps.init()))
	.pipe(plumber())
	.pipe(sass())
	.pipe(gcmq())
	.pipe(gulpif(production, autoprefixer({
		browsers: ["last 12 versions", "> 1%", "ie 8", "ie 7"]
	})))
	.pipe(gulpif(production, mincss({
		compatibility: "ie8", level: {
			1: {
				specialComments: 0,
				removeEmpty: true,
				removeWhitespace: true
			},
			2: {
				mergeMedia: true,
				removeEmpty: true,
				removeDuplicateFontRules: true,
				removeDuplicateMediaBlocks: true,
				removeDuplicateRules: true,
				removeUnusedAtRules: false
			}
		}
	})))
	.pipe(gulpif(production, rename({
		suffix: ".min"
	})))
	.pipe(plumber.stop())
	.pipe(gulpif(!production, sourcemaps.write("./maps/")))
	.pipe(gulp.dest(paths.styles.dist))
	.pipe(browsersync.stream());

export const dev = gulp.series(clean, smartGrid
gulp.parallel(sass),
gulp.parallel(server));

export const build = gulp.series();

export default development;
