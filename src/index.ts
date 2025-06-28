/* eslint-disable unicorn/consistent-function-scoping */
/* eslint-disable sonarjs/slow-regex */
/* eslint-disable sonarjs/duplicates-in-character-class */
/* eslint-disable @typescript-eslint/no-use-before-define */
// mobx-viewmodel-reload-plugin.ts
import glob from 'fast-glob';
import type { Plugin } from 'vite';

import fs from 'node:fs';

import { ViewModelHierarchy } from './view-model-hierarchy';

export interface MobxViewModelVitePluginOptions {
  enabled?: boolean;
}

const pluginName = 'mobx-view-model-vite-plugin';

export function mobxViewModel(
  options?: MobxViewModelVitePluginOptions,
): Plugin {
  let isReloadPending = false;

  const vmHierarchy = new ViewModelHierarchy();

  if (!options?.enabled) {
    return {
      name: pluginName,
    };
  }

  return {
    name: pluginName,

    // Инициализация при старте сервера
    async buildStart() {
      const root = process.cwd();
      const sourceFiles = await glob(`${root}/**/*.{ts,tsx}`, {
        absolute: true,
      });
      vmHierarchy.build(sourceFiles);
    },

    // Обработка изменений
    handleHotUpdate(ctx) {
      const { file, server } = ctx;

      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;

      try {
        const content = fs.readFileSync(file, 'utf8');
        let shouldReload = false;

        // Анализируем изменённый файл
        vmHierarchy.analyzeFile(file, content);

        // Проверяем все классы в файле
        const classRegex = /class\s+(\w+)/g;
        let classMatch;

        while ((classMatch = classRegex.exec(content)) !== null) {
          const className = classMatch[1];

          // Если класс принадлежит к иерархии ViewModel
          if (vmHierarchy.isRelated(file, className)) {
            shouldReload = true;
            break;
          }
        }

        // Инициируем перезагрузку
        if (shouldReload && !isReloadPending) {
          isReloadPending = true;
          setTimeout(() => {
            server.ws.send({ type: 'full-reload' });
            isReloadPending = false;
          }, 50);
          return [];
        }
      } catch (error) {
        console.error(`Error in viewmodel plugin:`, error);
      }
    },
  };
}
