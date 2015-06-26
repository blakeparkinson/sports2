// Include gulp
var gulp = require('gulp'); 

// Include Our Plugins
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var mocha = require('gulp-mocha');
var minifyCss = require('gulp-minify-css');
var runSeq = require('run-sequence');
var del = require('del');


gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del(['build'], cb);
});

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
var scripts = function() {
    return gulp.src('public/javascripts/src/*.js')
        .pipe(concat('all.js'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/min'));
};
gulp.task('scripts', ['clean'], scripts);
gulp.task('scripts-watch', scripts);

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('js/*.js', ['scripts-watch']);
    gulp.watch('scss/*.scss', ['minify-css']);
});

gulp.task('exit', function() {
    process.exit(0);
});

gulp.task('test', function () {
  return gulp.src('test/test.js')
    // gulp-mocha needs filepaths so you can't have any plugins before it 
    .pipe(mocha({reporter: 'spec'})
    .on("error", handleError));
});

function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}

// Default Task
gulp.task('default', ['lint', 'minify-css', 'scripts', 'watch', 'test']);
gulp.task("heroku:production", function(){
     runSeq('clean','minify-css', 'scripts', 'watch', 'test', 'exit');
});
