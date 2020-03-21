"use strict";

// основные таски
import webpack from "webpack";
import webpackStream from "webpack-stream";
import gulp from "gulp";
import gulpif from "gulp-if";
import yargs from "yargs";
import browsersync from "browser-sync";
import plumber from "gulp-plumber";
// таски для работы со скриптами
import cleanJs from "gulp-terser";
// таски для работы со стилями
import autoprefixer from "gulp-autoprefixer";
import sass from "gulp-sass";
import cleancss from "gulp-clean-css";
import gcmq from "gulp-group-css-media-queries";
import sourcemaps from "gulp-sourcemaps";
// таски для работы с изображениями
import imagemin from "gulp-imagemin";
import imageminPngquant from "imagemin-pngquant";
import imageminZopfli from "imagemin-zopfli";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminGiflossy from "imagemin-giflossy";
import imageminWebp from "imagemin-webp";
import webp from "gulp-webp";
import favicons from "gulp-favicons";
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
		devdist: "./app/",
		builddist: "./../",
    watch: "./app/**/*.html"
  },
  styles: {
    src: "./app/scss/main.scss",
		devdist: "./app/css",
		builddist: "./../css",
    watch: [
      "./app/scss/**/*.scss"
    ]
  },
  scripts: {
    src: "./app/js/index.js",
		devdist: "./app/js",
		builddist: "./../js",
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
		devdist: "./app/img",
		builddist: "./../img",
    watch: "./app/img/**/*.{jpg,jpeg,png,gif,svg}"
  },
  webp: {
    src: "./app/img/**/*_webp.{jpg,jpeg,png}",
		devdist: "./app/img",
		builddist: "./../img",
    watch: "./app/img/**/*_webp.{jpg,jpeg,png}"
  },
  fonts: {
    src: "./app/fonts/**/*.{ttf,otf,woff,woff2}",
		devdist: "./app/fonts",
		builddist: "./../fonts",
    watch: "./app/fonts/**/*.{ttf,otf,woff,woff2}"
  },
  favicons: {
    src: "./app/img/favicon.{jpg,jpeg,png,gif}",
		devdist: "./app/img/favicons",
		builddist: "./../img/favicons",
  },
};

webpackConfig.mode = production ? "production" : "development";
webpackConfig.devtool = production ? false : "cheap-eval-source-map";

export const devserver = () => {
browsersync.init({
  server: "./app/",
  notify: false
});

// export const buildserver = () => {
// browsersync.init({
//   server: "./../",
//   notify: false
// });

  gulp.watch(paths.markups.watch, markups);
  gulp.watch(paths.styles.watch, styles);
  gulp.watch(paths.scripts.watch, scripts);
  gulp.watch(paths.images.watch, images);
  gulp.watch(paths.webp.watch, webpimages);
};

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

// таск html
export const markups = () => gulp.src(paths.markups.src)
	.pipe(gulp.dest(paths.markups.devdist))
	.pipe(browsersync.stream());

// таск стилей
export const styles = () => gulp.src(paths.styles.src)
	.pipe(gulpif(!production, sourcemaps.init()))
	.pipe(plumber())
	.pipe(sass())
	.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
	.pipe(gcmq())
	.pipe(plumber.stop())
	.pipe(gulp.dest(paths.styles.devdist))
	.pipe(browsersync.stream());

// таск минификации и создания карты
	export const stylesmin = () => gulp.src(paths.styles.src)
		.pipe(gulpif(!production, sourcemaps.init()))
		.pipe(plumber())
		.pipe(sass())
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
		.pipe(gcmq())
			.pipe(cleancss(
				{
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
			}
		))
			.pipe(rename({
				suffix: ".min"
			}))
		.pipe(gulpif(!production, sourcemaps.write("./maps/")))
		.pipe(plumber.stop())
		.pipe(gulp.dest(paths.styles.devdist))
		.pipe(browsersync.stream());

// таск скриптов
  export const scripts = () => gulp.src(paths.scripts.src)
  	.pipe(webpackStream(webpackConfig), webpack)
  	// .pipe(gulpif(production, rename({
  	// 	suffix: ".min"
  	// })))
  	.pipe(gulp.dest(paths.scripts.devdist))
	.pipe(browsersync.stream());

// таск изображений
  export const images = () => gulp.src(paths.images.src)
  	.pipe(gulpif(production, imagemin([
  		imageminGiflossy({
  			optimizationLevel: 3,
  			optimize: 3,
  			lossy: 2
  		}),
  		imageminPngquant({
  			speed: 5,
  			quality: "30-50"
  		}),
  		imageminZopfli({
  			more: true
  		}),
  		imageminMozjpeg({
  			progressive: true,
  			quality: 70
  		}),
  		imagemin.svgo({
  			plugins: [
  				{ removeViewBox: false },
  				{ removeUnusedNS: false },
  				{ removeUselessStrokeAndFill: false },
  				{ cleanupIDs: false },
  				{ removeComments: true },
  				{ removeEmptyAttrs: true },
  				{ removeEmptyText: true },
  				{ collapseGroups: true }
  			]
  		})
  	])))
  	.pipe(gulp.dest(paths.images.devdist))
	.pipe(browsersync.stream());

// таск webp изображений
  export const webpimages = () => gulp.src(paths.webp.src)
  	.pipe(webp(gulpif(production, imageminWebp({
  		lossless: true,
  		quality: 90,
  		alphaQuality: 90
  	}))))
  	.pipe(gulp.dest(paths.webp.devdist));

//таск шрифтов
  export const fonts = () => gulp.src(paths.fonts.src)
  	.pipe(gulp.dest(paths.fonts.builddist));

// таск фавиконок
  export const favicon = () => gulp.src(paths.favicons.src)
  	.pipe(favicons({
  		icons: {
  			appleIcon: true,
  			favicons: true,
  			online: false,
  			appleStartup: false,
  			android: false,
  			firefox: false,
  			yandex: false,
  			windows: false,
  			coast: false
  		}
  	}))
  	.pipe(gulp.dest(paths.favicons.devdist))

//---------------------------------------------//
// продакшн сборка
	// обработка html
	// export const buildhtml = () => gulp.src(paths.markups.src)
	// 	.pipe(gulp.dest('./../'))
	// // таск для потсобработки стилей
	// export const buildcss = () => gulp.src('./app/css/main.css')
	// 	.pipe(cleancss(
	// 		{
	// 		compatibility: "ie8", level: {
	// 			1: {
	// 				specialComments: 0,
	// 				removeEmpty: true,
	// 				removeWhitespace: true
	// 			},
	// 			2: {
	// 				mergeMedia: true,
	// 				removeEmpty: true,
	// 				removeDuplicateFontRules: true,
	// 				removeDuplicateMediaBlocks: true,
	// 				removeDuplicateRules: true,
	// 				removeUnusedAtRules: false
	// 			}
	// 		}
	// 	}
	// ))
	// 	.pipe(rename({
	// 		suffix: ".min"
	// 	}))
	// 	.pipe(gulpif(!production, sourcemaps.write("./maps/")))
	// .pipe(gulp.dest('./../css'))
//---------------------------------------------//

export const dev = gulp.series(smartGrid,
gulp.parallel(markups, styles, stylesmin, scripts, images, webpimages, fonts, favicon),
gulp.parallel(devserver));

// export const build = gulp.series(buildhtml, buildcss);

export default dev;
