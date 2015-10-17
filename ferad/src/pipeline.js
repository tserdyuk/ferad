import _ from 'lodash'

export default function pipeline(command, config) {
	const sequence = command
		.split(' ').join('').split('->')
	config = Object.assign({ ':default': {} }, config)
	return {
		sequence,
		tasks: sequence.map(task => {
			const [func, ...buckets] = task.split(':')
			buckets.unshift(':default')
			const options = Object.assign.apply(null,
				_.flattenDeep(getBuckets(buckets.join(':')))
			)
			return { name: task, func, options }
		})
	}
	function getBuckets(names) {
		return names.split(':').slice(1).map(name => {
			const bucket = config[':' + name]
			return _.isString(bucket) ? getBuckets(bucket) : bucket
		})
	}
}
