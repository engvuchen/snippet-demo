let path = require('path');
let {
  SNIPPET_FOLDER_PATHS,
  SNIPPET_FILTERS,
  asyncAccess,
  asyncReadFile,
  asyncWriteFile,
  asyncMkdir,
  asyncReadDir,
  asyncExec,
} = require('../util');
let { write2md } = require('../docs/docs');
const CUR_PLATFORM_SNIPPET_PATH = SNIPPET_FOLDER_PATHS[process.platform];

function main() {
  Promise.all(
    SNIPPET_FILTERS.map(async ({ language, includes: includeList }) => {
      let snippetPath = `${CUR_PLATFORM_SNIPPET_PATH}/${language}.json`;
      let readResult = await asyncReadFile(snippetPath, {
        encoding: 'utf-8',
      });
      if (readResult) {
        try {
          readResult = JSON.parse(readResult);
        } catch {
          console.error(`${snippetPath} 内容不是 JSON`);
          return;
        }
        let writeJSON = readResult;
        if (includeList && includeList.length) {
          Object.keys(readResult).forEach(key => {
            if (includeList.find(includeKey => key.includes(includeKey))) {
              writeJSON[key] = readResult[key];
            }
          });
        }
        let data = JSON.stringify(writeJSON, undefined, 2);
        await asyncWriteFile(`./snippets/${language}.json`, data);
        // await asyncMkdir(path.resolve(__dirname, '../../docs'));
        await write2md(data, language);
      }
    })
  );
}

module.exports = {
  main,
};
