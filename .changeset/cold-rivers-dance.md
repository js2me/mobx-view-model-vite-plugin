---
'mobx-view-model-vite-plugin': patch
---

Fix devtools import resolving to CJS instead of ESM entry point, which caused `does not provide an export named 'ViewModelDevtools'` error in the browser.
