const gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  cleanCss = require('gulp-clean-css'),
  chmod = require('gulp-chmod'),
  clean = require('gulp-clean'),
  replace = require('gulp-replace')

gulp.task('assets:css', () => {
  return gulp.src('src/password.css')
    .pipe(cleanCss())
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(chmod(0o664))
    .pipe(gulp.dest('./dist'))
})

gulp.task('assets:img', () => {
  return gulp.src('src/passwordstrength.jpg')
    .pipe(chmod(0o664))
    .pipe(gulp.dest('./dist'))
})

gulp.task('assets:js', () => {
  return gulp.src('src/password.js')
    .pipe(uglify({
      output: {
        comments: 'some'
      },
    }))
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(chmod(0o664))
    .pipe(gulp.dest('./dist'))
})

gulp.task('clean', () => {
  return gulp.src('dist/*', { read: false })
    .pipe(clean())
})

function assets() {
  return gulp.src('src/index.html')
    .pipe(replace('./password', './password.min'))
    .pipe(chmod(0o664))
    .pipe(gulp.dest('./dist'))
}

gulp.task('assets', gulp.series('assets:css', 'assets:js', 'assets:img', assets))

gulp.task('default', gulp.series('assets'))
