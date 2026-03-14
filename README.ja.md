# vanilla-image-zoom
<div align="center">
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT" />
  </a>
  <img src="https://img.shields.io/badge/JavaScript-Vanilla-blue?style=flat-square" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Dependencies-none-brightgreen?style=flat-square" alt="No dependencies" />
</div>
クリックされた画像をスムーズに拡大表示するプラグイン

## Overview（概要）
このプロジェクトは、[fat/zoom.js](https://github.com/fat/zoom.js) をベースに、Vanilla JavaScriptで再構成したものです。
`data-action="zoom"` を指定した `img` をクリックするとスムーズに拡大表示されます。

## Features（特徴）
- 外部ライブラリに依存しないVanilla JavaScript
- `data-action="zoom"` 指定の `img` に対するズーム動作
- クリックで拡大、ESC/スクロール/タッチ移動/外側クリックでクローズ

## Getting Started（使い方）
1. HTMLにCDNのCSSとJSを読み込みます。
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/shinyan1806/vanilla-image-zoom@main/css/vanilla-image-zoom.css">
<script src="https://cdn.jsdelivr.net/gh/shinyan1806/vanilla-image-zoom@main/js/vanilla-image-zoom.js"></script>
```
2. ズームさせたい画像に `data-action="zoom"` を付与します。
```html
<img src="img/sample.jpg" data-action="zoom" alt="sample image">
```

## Contributing（コントリビュート）
バグの報告、機能追加の提案は大歓迎です。

## License（ライセンス）
MIT Licenseのもとで公開されています。  
**[LICENSE](LICENSE)**

## Attribution（クレジット）
本プロジェクトは [fat/zoom.js](https://github.com/fat/zoom.js)（MIT License）をベースに改変したものです。
- Original work: [fat/zoom.js](https://github.com/fat/zoom.js)
- Original author: @fat
- Original license: MIT
