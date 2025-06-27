# mobx-view-model-vite-plugin  

[![NPM version][npm-image]][npm-url] [![test status][github-test-actions-image]][github-actions-url] [![build status][github-build-actions-image]][github-actions-url] [![npm download][download-image]][download-url] [![bundle size][bundlephobia-image]][bundlephobia-url]


[npm-image]: http://img.shields.io/npm/v/mobx-view-model-vite-plugin.svg
[npm-url]: http://npmjs.org/package/mobx-view-model-vite-plugin
[github-test-actions-image]: https://github.com/js2me/mobx-view-model-vite-plugin/workflows/Test/badge.svg
[github-build-actions-image]: https://github.com/js2me/mobx-view-model-vite-plugin/workflows/Build/badge.svg
[github-actions-url]: https://github.com/js2me/mobx-view-model-vite-plugin/actions
[download-image]: https://img.shields.io/npm/dm/mobx-view-model-vite-plugin.svg
[download-url]: https://npmjs.org/package/mobx-view-model-vite-plugin
[bundlephobia-url]: https://bundlephobia.com/result?p=mobx-view-model-vite-plugin
[bundlephobia-image]: https://badgen.net/bundlephobia/minzip/mobx-view-model-vite-plugin


better HMR for vite for [`mobx-view-model`](https://js2me.github.io/mobx-view-model/)

## Usage

```ts
import { mobxViewModel } from "mobx-view-model-vite-plugin";


// in your vite config
...
plugins: [
  mobxViewModel()
]
...
```
