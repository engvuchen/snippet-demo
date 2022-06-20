/**
 * NPM版本：Major / Minor / Patch
 * 每次打包插件，应自增版本号。
 * 调用： npm run pkg --major/--minor/--patch。vsce 需已安装
 */

const path = require('path');
let { exec } = require('child_process');
let { getPkg, asyncWriteFile } = require('../util');

function main() {
  let tabWidth = 4;
  let content = getPkg();
  let indexRecord = [];
  let names = ['major', 'minor', 'patch'];
  names.forEach(name => {
    indexRecord.push(process.env[`npm_config_${name}`]);
  });
  // ## 修改版号
  let version = '';
  let findIndex = indexRecord.findIndex(curStr => curStr === 'true');
  if (findIndex > -1) {
    let versionArr = content.version.split('.');
    let patchNum = Number.parseInt(versionArr[findIndex], 10);
    versionArr[findIndex] = patchNum + 1;

    content.version = versionArr.join('.');
    asyncWriteFile(path.resolve(__dirname, '../../package.json'), JSON.stringify(content, undefined, tabWidth));
    version = content.version;
  } else {
    console.log('没有传入参数。版本号未修改');
  }
  // ## 自动提交版号修改信息
  if (version) {
    exec('git add .', (err, stdout, stderr) => {
      if (err) {
        console.error(`exec error: ${err}`);
        return;
      }
      if (stdout) console.log(`${stdout}`);
      if (stderr) console.error(`stderr: ${stderr}`);
    });
    exec(`git commit -m "U ${version}"`, (err, stdout, stderr) => {
      if (err) {
        console.error(`exec error: ${err}`);
        return;
      }
      if (stdout) console.log(`${stdout}`);
      if (stderr) console.error(`stderr: ${stderr}`);
    });
  }
  // ## 打包插件
  exec('vsce package', (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }
    if (stdout) {
      console.log(`${stdout}`);
      console.log('打包成功。请在根目录查看');
    }
    if (stderr) console.error(`stderr: ${stderr}`);
  });
}

module.exports = {
  main,
};
