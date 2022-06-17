/**
 * 读取 snippet 下的 JSON 文件，生成文档
 * note: 获取了字符串真实长度，若中英混排，两个空格还是比一个汉字宽。竖直线还是难以统一
 */

let path = require('path');
let { SNIPPET_FILTERS, asyncReadFile, asyncWriteFile, asyncMkdir } = require('../util');

function main() {
  SNIPPET_FILTERS.forEach(async ({ language }) => {
    console.log('language', language);

    let data = await asyncReadFile(`../snippets/${language}.json`);
    if (!data) return;
    try {
      data = JSON.parse(data);
    } catch {
      return;
    }

    write2md(data, language);
  });
}
async function write2md(data = {}, language) {
  let table = [];
  // ## 构造表头/分割线
  let [prefixMaxByteLength, descMaxByteLength] = ['prefix', 'description'].map(curKey =>
    getStrByteLength(
      Object.values(data)
        .map(curItem => curItem[curKey])
        .sort((a, b) => getStrByteLength(a) - getStrByteLength(b))
        .pop()
    )
  );
  let th = getLineContent([
    { content: 'Prefix', content_max_length: prefixMaxByteLength },
    { content: 'Description', content_max_length: descMaxByteLength },
  ]);
  let splitLine = getLineContent([
    {
      content: ':',
      content_max_length: prefixMaxByteLength,
      placeholder_type: '-',
    },
    {
      content: ':',
      content_max_length: descMaxByteLength,
      placeholder_type: '-',
    },
  ]);
  table.push(th, splitLine);
  // ## 构造表格主体
  Object.keys(data).forEach(key => {
    let curItem = data[key];
    let desc = curItem.description;
    if (key === desc) desc = '';
    table.push(
      getLineContent([
        { content: curItem.prefix, content_max_length: prefixMaxByteLength },
        { content: desc, content_max_length: descMaxByteLength },
      ])
    );
  });
  await asyncMkdir(`../../docs`);
  await asyncWriteFile(path.resolve(__dirname, `../../docs/${language}.md`), table.join('\n'));
}

// rd.eachFileFilterSync(path.resolve(__dirname, './snippets'), /\.json$/, (filePath, s) => {
//   let data = JSON.parse(fs.readFileSync(filePath));
//   let [prefixMaxByteLength, descMaxByteLength] = ['prefix', 'description'].map(curKey =>
//     getStrByteLength(
//       Object.values(data)
//         .map(curItem => curItem[curKey])
//         .sort((a, b) => getStrByteLength(a) - getStrByteLength(b))
//         .pop()
//     )
//   );
//   let table = [];
//   // ## 构造表头/分割线
//   let th = getLineContent([
//     { content: 'Prefix', content_max_length: prefixMaxByteLength },
//     { content: 'Description', content_max_length: descMaxByteLength },
//   ]);
//   let splitLine = getLineContent([
//     {
//       content: ':',
//       content_max_length: prefixMaxByteLength,
//       placeholder_type: '-',
//     },
//     {
//       content: ':',
//       content_max_length: descMaxByteLength,
//       placeholder_type: '-',
//     },
//   ]);
//   table.push(th, splitLine);

//   // ## 构造表格主体
//   Object.keys(data).forEach(key => {
//     let curItem = data[key];

//     let desc = curItem.description;
//     if (key === desc) desc = '';

//     table.push(
//       getLineContent([
//         { content: curItem.prefix, content_max_length: prefixMaxByteLength },
//         { content: desc, content_max_length: descMaxByteLength },
//       ])
//     );
//   });

//   fs.writeFileSync(
//     path.resolve(__dirname, `../docs/${path.basename(filePath).split('.').shift()}.md`),
//     table.join('\n')
//   );
// });
console.log('生成文档成功。请在 ./docs 文件夹查看');

function getLineContent(confArr = []) {
  let lines = [];
  confArr.forEach(curItem => {
    let { content, content_max_length: contentMaxLength, placeholder_type: type } = curItem;

    let placeholder = getPlaceholderSpace({
      num: contentMaxLength - getStrByteLength(content),
      type,
    });
    lines.push(` ${content}${placeholder} `);
  });

  return `|${lines.join('|')}|`;
}
function getPlaceholderSpace(conf = { num: -1, type: ' ' }) {
  let { type } = conf;
  let { num } = conf;
  if (!type) type = ' ';
  if (num > -1) {
    return new Array(num).fill(type).join('');
  } else {
    return '';
  }
}
function getStrByteLength(target = '') {
  let len = 0;
  for (let i = 0; i < target.length; i++) {
    // 中文的字节长度为2
    if (target.charCodeAt(i) > 127 || target.charCodeAt(i) === 94) {
      len += 2;
    } else {
      len += 1;
    }
  }
  return len;
}

module.exports = { main, write2md };
