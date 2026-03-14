# vanilla-image-zoom
<div align="center">
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT" />
  </a>
  <img src="https://img.shields.io/badge/JavaScript-Vanilla-blue?style=flat-square" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Dependencies-none-brightgreen?style=flat-square" alt="No dependencies" />
</div>
A plugin to smoothly zoom images on click

[日本語READMEはこちら](README.ja.md)

## Overview
This project is a vanilla JavaScript adaptation based on [fat/zoom.js](https://github.com/fat/zoom.js).
Images with `data-action="zoom"` smoothly zoom in when clicked.

## Features
- No external library dependencies (vanilla JavaScript)
- Zoom behavior for `img` elements with `data-action="zoom"`
- Close on ESC, scroll, touch move, or outside click

## Getting Started
1. Load the CSS and JS from CDN in your HTML.
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/shinyan1806/vanilla-image-zoom@main/css/vanilla-image-zoom.css">
<script src="https://cdn.jsdelivr.net/gh/shinyan1806/vanilla-image-zoom@main/js/vanilla-image-zoom.js"></script>
```
2. Add `data-action="zoom"` to images you want to zoom.
```html
<img src="img/sample.jpg" data-action="zoom" alt="sample image">
```

## Contributing
Bug reports and feature suggestions are welcome.

## License
Released under the MIT License.  
**[LICENSE](LICENSE)**

## Attribution
This project is a modified derivative based on [fat/zoom.js](https://github.com/fat/zoom.js) (MIT License).
- Original work: [fat/zoom.js](https://github.com/fat/zoom.js)
- Original author: @fat
- Original license: MIT
