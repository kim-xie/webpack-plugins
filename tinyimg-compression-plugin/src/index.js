const Ora = require("ora")
const {validate} = require('schema-utils')
const { PLUGIN_NAME, IMG_REGEXP,compressImg } = require('./utils')
const Schema = require('./schema.json')

class TinyimgCompressionPlugin {
	constructor(opts) {
		this.opts = opts
	}
	apply(compiler) {
		const { enabled, logged } = this.opts
    validate(Schema, this.opts, { name: PLUGIN_NAME })
		enabled &&
			compiler.hooks.emit.tap(PLUGIN_NAME, (compilation) => {
        const imgs = Object.keys(compilation.assets).filter((filename) =>IMG_REGEXP.test(filename))
        if (!imgs.length) return Promise.resolve()
				const promises = imgs.map((filename) =>{
          const file = compilation.assets[filename].source()
          return compressImg(file, filename, compilation.outputOptions.path)
        })
				const spinner = Ora('images is compressing......').start()
				return Promise.all(promises).then((res) => {
					spinner.stop()
					logged && res.forEach((log) => console.log(log))
				})
			})
	}
}

module.exports = TinyimgCompressionPlugin
