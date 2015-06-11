// Include gulp
var gulp = require('gulp'); 

// Include Our Plugins
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var minifyCss = require('gulp-minify-css');


//uuu Lint Task
gulp.task('lint', function() {
    return gulp.src('js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Compile Our CSS
gulp.task('minify-css', function() {
  return gulp.src('public/stylesheets/*.css')
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(gulp.dest('public/min'));
});


// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src('public/javascripts/src/*.js')
        .pipe(concat('all.js'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/min'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('js/*.js', ['lint', 'scripts']);
    gulp.watch('scss/*.scss', ['minify-css']);
});

// Default Task
gulp.task('default', ['lint', 'minify-css', 'scripts', 'watch']);
gulp.task("heroku:production", function(){
     ['minify-css', 'scripts', 'watch']
});


