const IMG_REGEXP = /\.(jpe?g|png)$/;

const PLUGIN_NAME = "tinyimg-compression-plugin";

const TINYIMG_URL = [
    "tinyjpg.com",
    "tinypng.com"
];

const fs = require('fs')
const path = require('path')
const Https = require('https')
const Url = require('url')
const Chalk = require('chalk')
const Figures = require('figures')

function ByteSize(byte = 0) {
	if (byte === 0) return "0 B";
	const unit = 1024;
	const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	const i = Math.floor(Math.log(byte) / Math.log(unit));
	return (byte / Math.pow(unit, i)).toPrecision(3) + " " + sizes[i];
}

function RandomNum(min = 0, max = 10) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function RoundNum(num = 0, dec = 2, per = false) {
	return per
		? Math.round(num * 10 ** dec * 100) / 10 ** dec + "%"
		: Math.round(num * 10 ** dec) / 10 ** dec;
}

function RandomHeader() {
    const ip = new Array(4).fill(0).map(() => parseInt(Math.random() * 255)).join(".");
    const index = RandomNum(0, 1);
    return {
        headers: {
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Postman-Token": Date.now(),
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
            "X-Forwarded-For": ip
        },
        hostname: TINYIMG_URL[index],
        method: "POST",
        path: "/web/shrink",
        rejectUnauthorized: false
    };
}

async function compressImg(file, filename,outputPath) {
  try {
    const obj = await uploadImg(file)
    const data = await downloadImg(obj.output.url)
    const oldSize = Chalk.redBright(ByteSize(obj.input.size))
    const newSize = Chalk.greenBright(ByteSize(obj.output.size))
    const ratio = Chalk.blueBright(RoundNum(1 - obj.output.ratio, 2, true))
    const msg = `${Figures.tick} Compress [${Chalk.yellowBright(
      filename
    )}] completed: Old Size ${oldSize}, New Size ${newSize}, Optimization Ratio ${ratio}`
    fs.writeFileSync(path.join(outputPath,filename), data, 'binary')
    return Promise.resolve(msg)
  } catch (err) {
    const msg = `${Figures.cross} Compress [${Chalk.yellowBright( filename )}] failed: ${Chalk.redBright(err)}`
    return Promise.resolve(msg)
  }
}

function downloadImg(url) {
  const opts = new Url.URL(url)
  return new Promise((resolve, reject) => {
    const req = Https.request(opts, (res) => {
      let file = ''
      res.setEncoding('binary')
      res.on('data', (chunk) => (file += chunk))
      res.on('end', () => resolve(file))
    })
    req.on('error', (e) => reject(e))
    req.end()
  })
}

function uploadImg(file) {
  const opts = RandomHeader()
  return new Promise((resolve, reject) => {
    const req = Https.request(opts, (res) =>
      res.on('data', (data) => {
        const obj = JSON.parse(data.toString())
        obj.error ? reject(obj.message) : resolve(obj)
      })
    )
    req.write(file, 'binary')
    req.on('error', (e) => reject(e))
    req.end()
  })
}

module.exports = {
    RandomHeader,
    RoundNum,
    ByteSize,
    uploadImg,
    downloadImg,
    compressImg,
    IMG_REGEXP,
    PLUGIN_NAME,
    TINYIMG_URL
};