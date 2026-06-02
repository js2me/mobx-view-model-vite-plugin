# mobx-view-model-vite-plugin

## 1.3.1

### Patch Changes

- [`f5f6119`](https://github.com/js2me/mobx-view-model-vite-plugin/commit/f5f6119fd7e361b1c884060b6b9459ba407094e5) Thanks [@js2me](https://github.com/js2me)! - Fix devtools resolution by using Vite's own resolver instead of fragile CJS path string replacement.

## 1.3.0

### Minor Changes

- [`ac7505b`](https://github.com/js2me/mobx-view-model-vite-plugin/commit/ac7505b347d3d34eb1af4c16951e4ac2c2c5ed10) Thanks [@js2me](https://github.com/js2me)! - Add `observerSources` option (default: `['mobx-react-lite', 'mobx-react']`) to detect `observer()` calls from configurable package sources.

  Auto-detect ViewModel classes that extend `ViewModelBase` through intermediate classes across files — even without a direct `mobx-view-model` import.

  Add `debug` option to log detections, HMR injections, and HMR updates.

### Patch Changes

- [`aa018d0`](https://github.com/js2me/mobx-view-model-vite-plugin/commit/aa018d0e7d6d0cabfa0cbc7d8749ea9b32b9a7bb) Thanks [@js2me](https://github.com/js2me)! - Fix devtools import resolving to CJS instead of ESM entry point, which caused `does not provide an export named 'ViewModelDevtools'` error in the browser.

## 1.2.1

### Patch Changes

- [`96c7b0e`](https://github.com/js2me/mobx-view-model-vite-plugin/commit/96c7b0e796bc8fa00f99fffbdd9b0a14efe3543a) Thanks [@js2me](https://github.com/js2me)! - chore update devtools to 60 version

## 1.2.0

### Minor Changes

- [`5a3a4c8`](https://github.com/js2me/mobx-view-model-vite-plugin/commit/5a3a4c8201d886b2aec4830fcab06a7ceeafdea7) Thanks [@js2me](https://github.com/js2me)! - Initial release with smart HMR, auto displayName, and devtools integration.
