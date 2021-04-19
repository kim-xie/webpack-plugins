const chalk = require('chalk')
const slog = require('single-line-log')
const {validate} = require('schema-utils')
const Schema = require('./schema.json')
const PLUGIN_NAME = 'module-build-analyze-plugin'

class ModuleBuildAnalyzePlugin {
  constructor(options) {
    this.options = options
    this.data = {}
  }
  apply(compiler) {
    const { spendTime=1 } = this.options
    validate(Schema, this.options, { name: PLUGIN_NAME })
    // 监听文件变动
    compiler.hooks.watchRun.tap(PLUGIN_NAME, (watching) => {
      const changeFiles = watching.watchFileSystem.watcher.mtimes
      for (let file in changeFiles) {
        console.log(chalk.green('wathcing file：' + file, changeFiles[file]))
      }
    })

    // 开始编译
    compiler.hooks.compile.tap(PLUGIN_NAME, () => {
      const lineSlog = slog.stdout
      let text = 'begin compiling......'
      console.log(chalk.green(text))
      /* 记录开始时间 */
      this.starTime = new Date().getTime()
      // this.timer = setInterval(() => {
      //   text += '.'
      //   lineSlog(chalk.green(text))
      // }, 100)
    })

    // 编译过程
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.buildModule.tap(PLUGIN_NAME,(module)=>{
        const curTime = new Date().getTime();
        const name = this.getModuleName(module);
        this.data.name = curTime
      })
      compilation.hooks.rebuildModule.tap(PLUGIN_NAME,(module)=>{
        console.log('compilation rebuildModule', module)
      })
      compilation.hooks.failedModule.tap(PLUGIN_NAME,(module,error)=>{
        console.log('compilation failedModule', module,error)
      })
      compilation.hooks.succeedModule.tap(PLUGIN_NAME,(module)=>{
        const name = this.getModuleName(module);
        const loaders = this.getLoaderNames(module.loaders);
        const curTime = new Date().getTime();
        const startTime = this.data.name
        const spendTimes = (curTime - startTime)/1000
        if(name && spendTimes > spendTime){
          const appDirectory = process.cwd()
          const newModule = module.resource.replace(appDirectory+'\\','')
          console.log(`build module ${chalk.green(newModule)} with loaders [${chalk.green(loaders)}] consumed: ${chalk.yellow(spendTimes)}s`)
        }
      })
      // compilation.hooks.dependencyReference.tap(PLUGIN_NAME,(dependencyReference, dependency, module)=>{
      //   console.log('compilation dependencyReference', dependencyReference, dependency, module)
      // })
      // compilation.hooks.finishModules.tap(PLUGIN_NAME,(modules)=>{
      //   console.log('compilation finishModules', modules)
      // })
      // compilation.hooks.afterChunks.tap(PLUGIN_NAME,(chunks)=>{
      //   console.log('compilation afterChunks', chunks)
      // })
      // compilation.hooks.optimizeChunks.tap(PLUGIN_NAME,(chunks,chunkGroups)=>{
      //   console.log('compilation optimizeChunks', chunks,chunkGroups)
      // })
      // compilation.hooks.afterOptimizeChunks.tap(PLUGIN_NAME,(chunks,chunkGroups)=>{
      //   console.log('compilation afterOptimizeChunks', chunks,chunkGroups)
      // })
    })
    
    // 编译结束
    compiler.hooks.done.tap(PLUGIN_NAME, () => {
      this.timer && clearInterval(this.timer)
      const endTime = new Date().getTime()
      const time = (endTime - this.starTime) / 1000
      console.log(chalk.green('compiled successfully spend：' + chalk.red(time) + 's'))
    })
  }

  getModuleName(module) {
    return module.userRequest;
  } 

  getLoaderNames(loaders){
    return loaders && loaders.length
    ? loaders
        .map((l) => l.loader || l)
        .map((l) =>
          l
            .replace(/\\/g, "/")
            .replace(
              /^.*\/node_modules\/(@[a-z0-9][\w-.]+\/[a-z0-9][\w-.]*|[^\/]+).*$/,
              (_, m) => m
            )
        )
        .filter((l) => !l.includes(PLUGIN_NAME))
    : ["modules with no loaders"];
  }
  

}

module.exports = ModuleBuildAnalyzePlugin