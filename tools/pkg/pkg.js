/**
 * NPM版本：Major / Minor / Patch
 * 每次打包插件，应自增版本号。
 * 调用： npm run pkg --major/--minor/--patch。vsce 需已安装
 */

const path = require('path');
let { getPkg, asyncWriteFile, asyncChildProcessExec, readFileList, asyncReadFile } = require('../util');

async function main() {
  const tabWidth = 2;
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
    await asyncChildProcessExec('git add package.json');
    let versionLog = `git commit -m "U ${version}"`;
    await asyncChildProcessExec(versionLog);
    console.log(versionLog);
  }
  // ## 合并文档到 my-snippet-demo/readme.md
  await summaryDocs();

  // ## 打包插件
  process.chdir('./my-snippet-demo');
  await asyncChildProcessExec('vsce package');
  console.log('✨打包成功');
}
async function summaryDocs() {
  let filePathList = await readFileList(path.resolve(__dirname, '../../my-snippet-demo/docs'));
  const mdPathList = filePathList.filter(filePath => {
    return filePath.endsWith('.md');
  });
  let reg = /.+[\\/](.+)/;
  const mdList = await Promise.all(
    mdPathList.map(async curr => {
      let [, fileName] = reg.exec(curr);
      return `## ${fileName}\n${await asyncReadFile(curr)}`;
    })
  );
  const summary = mdList.reduce((accu, curr) => {
    return `${accu}\n\n${curr}`;
  }, `# my-snippet-demo`);
  await asyncWriteFile(path.resolve(__dirname, '../../my-snippet-demo/README.md'), summary);
}

module.exports = {
  main,
};
