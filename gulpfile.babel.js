import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import browserify from 'browserify';
import watchify from 'watchify';
import babelify from 'babelify';
import {assign} from 'lodash';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import runSequence from 'run-sequence';

const $ = gulpLoadPlugins({lasy: false});
const dev = process.argv.indexOf('--production') === -1;
const browserSync = require('browser-sync').create();

gulp.task('clean', del.bind(null, ['dist']));

gulp.task('jade', () => {
	gulp.src('src/*.jade')
		.pipe($.jade({
			pretty: dev
		}))
		.pipe(gulp.dest('dist/'));
});

gulp.task('jade:watch', ['jade'], browserSync.reload);

gulp.task('css', () => {
	return gulp.src('src/main.css')
	.pipe($.if(dev, $.sourcemaps.init()))
	.pipe($.postcss([
		require('postcss-import')({
			glob: true
		}),
		require('postcss-nested'),
		require('postcss-media-minmax')(),
		require('rucksack-css'),
		require('postcss-assets')({
			// loadPaths: ['']
			basePath: 'dist/',
			relativeTo: 'src/'
		}),
		require('autoprefixer'),
		require('postcss-browser-reporter'),
		require('postcss-reporter')()
	]))
	.pipe($.if(dev, $.sourcemaps.write('./')))
	.pipe($.if(!dev, $.postcss([
		require('cssnano')
	])))
	.pipe(gulp.dest('dist/'))
	.pipe(browserSync.reload({stream: true}));
});

const customOpts = {
	entries: ['src/main.js'],
	debug: dev
};
const opts = assign({}, watchify.args, customOpts);
const b = dev ? watchify(browserify(opts)) : browserify(opts);
b.transform(babelify);

function bundle() {
	return b.bundle()
		.on('error', err => {
			$.util.log(err.message);
			browserSync.notify('Browserify Error!');
		})
		.pipe(source('main.js'))
		.pipe(buffer())
		.pipe($.sourcemaps.init({loadMaps: true}))
			.pipe($.if(!dev, $.uglify()))
		.pipe($.sourcemaps.write('./'))
		.pipe(gulp.dest('./dist'))
		.pipe(browserSync.stream({once: true}));
}

gulp.task('js', bundle);
b.on('update', bundle);
b.on('log', $.util.log);

gulp.task('lint', () => {
	return gulp.src(['src/**/*.js'])
		.pipe($.eslint())
		.pipe($.eslint.format())
		.pipe($.eslint.failOnError());
});

gulp.task('serve', ['build'], () => {
	browserSync.init({
		notify: true,
		port: 9000,
		server: {
			baseDir: ['dist'],
			routes: {
				'/node_modules': 'node_modules'
			}
		},

	});

	// gulp.watch([
		// 'dist/main.js',
	// ]).on('change', reload);

	gulp.watch('src/**/*.css', ['css']);
	gulp.watch('src/**/*.jade', ['jade:watch']);
});

gulp.task('build', callback => {
	runSequence(
		['clean', 'lint'],
		['jade', 'css', 'js'],
		callback
	);
});
