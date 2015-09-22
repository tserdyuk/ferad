import glob from 'glob'
import homedir from 'os-homedir'
import { Seq } from 'immutable'

function defaults({ root, port, app: env }, app, cwd) {
	app = app || {}
	const config = Object.assign({}, env, app)
	const dest = config.dest || (homedir() + '/.ferad/dist')
	const { assets } = config
	return [
		group('default', ['serve', 'watch']),
		defTask('serve', 'serve', {
			port, root: app.serveRoot || dest, livereload: true
		}),
		group('build', ['assets-prod', 'jade-prod', 'sass-prod', 'scripts']),
		defTask('prod', 'env', {
			prop: 'NODE_ENV', value: 'production'
		}, ['clean']),
		defTask('clean', 'clean', {
			dest, cwd
		}),
		group('watch', ['watch-assets', 'watch-jade', 'watch-sass', 'watch-scripts']),
		defTask('watch-assets', 'watch', {
			src: assets, task: 'assets', cwd
		}, ['assets']),
		defTask('watch-jade', 'watch', {
			src: ['**/*.jade', '*.json'], task: 'jade', cwd
		}, ['jade']),
		defTask('watch-sass', 'watch', {
			src: '**/*.{scss,css}', task: 'sass', cwd
		}, ['sass']),
		defTask('assets-prod', 'assets', {
			src: assets, dest, cwd
		}, ['prod']),
		defTask('assets', 'assets', {
			src: assets, dest, cwd
		}),
		defTask('jade-prod', 'jade', {
			src: '[^_]**/[^_]*.jade', plumber: false, dest, cwd
		}, ['prod']),
		defTask('jade', 'jade', {
			src: '[^_]**/[^_]*.jade', plumber: true, dest, cwd
		}),
		defTask('sass-prod', 'sassProd', {
			src: '[^_]**/[^_]*.{scss,css}', dest, cwd
		}, ['prod']),
		defTask('sass', 'sass', {
			src: '[^_]**/[^_]*.{scss,css}', dest, cwd
		})
	].concat(
		scripts('script', '', ['prod'], config, cwd),
		scripts('scriptWatch', 'watch-', [], config, cwd)
	)
}

function scripts(func, prefix, depends, { scripts, paths, dest }, cwd) {
	if (!scripts) {
		scripts = Seq(glob.sync('*.js', { cwd }))
			.toSetSeq().toObject()
	}
	const tasks = Seq(scripts)
		.mapEntries(([main, output]) => [
			prefix + main,
			defTask(prefix + main, func, {
				main, output, paths, dest, cwd
			}, depends)
		])
	return tasks.toArray().concat([
		group(prefix + 'scripts', tasks.keySeq().toArray())
	])
}

function defTask(name, func, options, depends) {
	return task(name, 'ferad-tasks', func, options, depends)
}
function task(name, modul, func, options, depends = []) {
	return { name, modul, func, options, depends }
}
function group(name, depends) {
	return {
		name, modul: 'ferad-configs', func: 'emptyTask',
		options: {}, depends
	}
}
function emptyTask(o, cb) {
	cb()
}

export default {
	defaults, scripts, defTask, task, group, emptyTask
}
