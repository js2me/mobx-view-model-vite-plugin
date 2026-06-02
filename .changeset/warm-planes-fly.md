---
'mobx-view-model-vite-plugin': minor
---

Add `observerSources` option (default: `['mobx-react-lite', 'mobx-react']`) to detect `observer()` calls from configurable package sources.

Auto-detect ViewModel classes that extend `ViewModelBase` through intermediate classes across files — even without a direct `mobx-view-model` import.

Add `debug` option to log detections, HMR injections, and HMR updates.
