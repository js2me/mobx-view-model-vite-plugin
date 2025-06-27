// mobx-viewmodel-reload-plugin.ts
import type { Plugin } from 'vite';

import fs from 'node:fs';

export interface MobxViewModelVitePluginOptions {}

export function mobxViewModel(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options?: MobxViewModelVitePluginOptions,
): Plugin {
  let isReloadPending = false;

  return {
    name: 'mobx-viewmodel-reload-plugin',

    handleHotUpdate(ctx) {
      const { file, server } = ctx;

      // Проверяем только TS/TSX файлы
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;

      try {
        const content = fs.readFileSync(file, 'utf8');

        // Проверяем условия:
        // 1. Импорт из 'mobx-view-model'
        // 2. Наследование от ViewModelBase
        const hasMobxImport = /from\s+['"]mobx-view-model['"]/.test(content);
        const hasViewModelBase = /extends\s+ViewModelBase\b/.test(content);

        if (hasMobxImport && hasViewModelBase) {
          if (!isReloadPending) {
            isReloadPending = true;
            setTimeout(() => {
              server.ws.send({ type: 'full-reload' });
              isReloadPending = false;
            }, 50);
          }
          return [];
        }
      } catch (error) {
        console.error(`Error in mobx-viewmodel-reload-plugin: ${error}`);
      }
    },
  };
}
