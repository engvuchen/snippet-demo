const fs = require('fs');
const SNIPPET_FOLDER_PATHS = {
  win32: `${process.env.APPDATA}\\Code\\User\\snippets`,
  darwin: `${process.env.HOME}/Library/Application Support/Code/User/snippets`,
  linux: `${process.env.HOME}/.config/Code/User/snippets`,
};
const SNIPPET_FILTERS = [
  {
    language: 'javascript',
    includes: ['@util'],
  },
  {
    language: 'vue',
    includes: [],
  },
  {
    language: 'proto3',
    includes: [],
  },
];

function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      // 最后一个参数往往是 错误处理回调函数
      args.push((err, ...result) => {
        if (err) {
          console.error('promisify', `${fn.name}`, err);
          reject();
          return;
        }
        resolve(...result);
      });

      fn.apply(null, args);
    });
  };
}
const asyncAccess = promisify(fs.access);
const asyncReadFile = promisify(fs.readFile);
const asyncWriteFile = promisify(fs.writeFile);
const asyncMkdir = promisify(fs.mkdir);
const asyncReadDir = promisify(fs.readdir);

module.exports = {
  SNIPPET_FOLDER_PATHS,
  SNIPPET_FILTERS,
  asyncAccess,
  asyncReadFile,
  asyncWriteFile,
  asyncMkdir,
  asyncReadDir,
};
