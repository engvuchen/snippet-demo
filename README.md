# Snippet Demo

快速提取指定本地 snippet 以生成 vscode snippet 插件；

## 依赖

打包能力依赖 `vsce`，需全局安装 `npm i -g vsce`；

## 使用

#### 修改插件名 / 描述

修改打包出插件的部分信息，在 `package.json` 修改 `name` / `displayName` / `description` 等；

[详见文档](https://code.visualstudio.com/api/references/extension-manifest)

### 选定 snippet 并生成文档

1. 修改 `package.json` 中的 `snippetFilter`，选定指定语言的 snippet 或，选择其中的部分 snippet（通过 includes）；

例：选定 `javascript.json` 中的 key 包含 `@util` 的部分

```json
  "snippetFilter": [
    {
      "language": "javascript",
      "includes": [
        "@util"
      ]
    }
  ]
```

以下的 snippet 会被选中：

```json
  "@util camel-case-to-under-score-case": {
    "prefix": "util-to-under",
    "body": ["${CLIPBOARD/([A-Z])/_${1:/downcase}/g}"],
    "description": "将以大驼峰开头的字母替换为下划线形式"
  },
```

2. 运行 `npm run update-snippet`；
3. `snippets` 文件夹下会生成选定 snippet 的 JSON 文件，`docs` 文件夹下会生成选定 snippet 的文档（一个语言对应一个，文档描述来自于 snippet 的 `description`）；

### 将 snippet 打包为插件

1. 运行 `npm run pkg [--major/--minor/--patch]`；根据参数提升版本；
2. 若打包成功，插件出现在根目录；
