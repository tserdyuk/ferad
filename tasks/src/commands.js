import gulp from 'gulp'
import del from 'del'
import _ from './common'

export default {
	clean({ dest }, cb) {
		del(dest, { force: true }, cb)
	},
	serve(o) {
		_.connect.server(o)
	},
	watch({ src, task, cwd }, cb, gulp) {
		_.watch(src, { cwd }, () =>
			gulp.start(task)
		)
		cb()
	}
}
