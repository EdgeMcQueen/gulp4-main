var gulp          = require('gulp'),
    sass          = require('gulp-sass'),
    addsrc        = require('gulp-add-src'),
    smartgrid     = require('smart-grid'),
    browserSync   = require('browser-sync'),
    gcmq          = require('gulp-group-css-media-queries'),
    concat        = require('gulp-concat'),
    uglify        = require('gulp-uglifyjs'),
    cssnano       = require('gulp-cssnano'),
    rename        = require('gulp-rename'),
    del           = require('del'),
    cache         = require('gulp-cache'),
    autoprefixer  = require('gulp-autoprefixer');

// Таск для Sass
gulp.task('sass', async function() {
  return gulp.src('app/scss/**/*.scss')
    .pipe(sass({
        outputStyle: 'expanded',
        errorLogToConsole: true
      })).on('error', sass.logError)
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({stream: true}));
});

// настройки smart-grid
gulp.task('smart-grid', (cb) => {
  smartgrid('app/scss/stylesheets/', {
    outputStyle: 'scss',
    filename: '_smart-grid',
    columns: 12, // number of grid columns
    offset: '1.875rem', // gutter width - 30px
    mobileFirst: false,
    mixinNames: {
        container: 'container'
    },
    container: {
      maxWidth: '1170px',
      fields: '0.9375rem' // side fields - 15px
    },
    breakPoints: {
      xs: {
          width: '20rem' // 320px
      },
      sm: {
          width: '36rem' // 576px
      },
      md: {
          width: '48rem' // 768px
      },
      lg: {
          width: '62rem' // 992px
      },
      xl: {
          width: '75rem' // 1200px
      }
    }
  });
  cb();
});

// минификация css
gulp.task('css-min', function() {
  return gulp.src([
    'app/css/main.css',
    'app/css/libs.css'
    ])
    .pipe(cssnano())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('build/css'));
});

gulp.task('css-lib', function(){
  return gulp.src('node_modules/normalize.css/normalize.css')
    .pipe(addsrc.append('node_modules/aos/dist/aos.css'))
    .pipe(addsrc.append('node_modules/font-awesome/css/font-awesome.css'))
    .pipe(addsrc.append('node_modules/slick-carousel/slick/slick.css'))
    .pipe(addsrc.append('node_modules/slick-carousel/slick/slick-theme.css'))
    .pipe(concat('libs.css'))
    .pipe(gulp.dest('app/css'));
});

// импортируем шрифты себе в проект:
gulp.task('fonts', function(){
  font = [
    'node_modules/font-awesome/fonts/*.{eot,svg,ttf,woff,woff2,otf}'
  ]

  return gulp.src(font)
    .pipe(gulp.dest('app/fonts/'));
});

// для слика
gulp.task('slick-font', function(){
  font = [ 'node_modules/slick-carousel/slick/fonts/*.{eot,svg,ttf,woff}' ];

  return gulp.src(font)
    .pipe(gulp.dest('app/css/fonts'));
});

//таск для синхонизации с браузером
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: 'app'
    },
    notify: false
  });
});

//Таск для всех сприптов
gulp.task('scripts', function() {
  return gulp.src(['node_modules/jquery/dist/jquery.js'])
    .pipe(addsrc.append('node_modules/aos/dist/aos.js'))
    .pipe(addsrc.append('node_modules/slick-carousel/slick/slick.js'))
    .pipe(concat('libs.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/js'));
});


gulp.task('code', function() {
  return gulp.src('app/**/*.html')
  .pipe(browserSync.reload({ stream: true }));
});

// Группируем медиа-запросы
gulp.task('media-queries', function (){
  return gulp.src('app/css/**/*.css')
    .pipe(gcmq())
    .pipe(gulp.dest('build/css'));
});

gulp.task('clean', async function() {
  return del.sync('build');
});

gulp.task('img', function() {
  return gulp.src('app/img/**/*')
    .pipe(gulp.dest('build/img'));
});

gulp.task('prebuild', async function() {

  var buildCss = gulp.src([
    'app/css/**/*.css'
    ])
  .pipe(gcmq())
  .pipe(gulp.dest('build/css'))

  var buildFonts = gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('build/fonts'))

  var buildJs = gulp.src('app/js/**/*')
  .pipe(gulp.dest('build/js'))

  var buildHtml = gulp.src('app/**/*.html')
  .pipe(gulp.dest('build'));

});

gulp.task('clear-cache', function (callback) {
  return cache.clearAll();
})

gulp.task('watch', function() {
  gulp.watch('app/scss/**/*.scss', gulp.parallel('sass'));
  gulp.watch('app/**/*.html', gulp.parallel('code'));
  gulp.watch(['app/js/common.js', 'app/libs/**/*.js'], gulp.parallel('scripts'));
});

gulp.task('default',
     gulp.parallel('clear-cache', 'fonts', 'slick-font', 'sass', 'css-lib', 'smart-grid', 'scripts', 'browser-sync', 'watch'));

gulp.task('build',
     gulp.series('clean', 'clear-cache', 'media-queries', 'css-min', 'prebuild', 'img'));