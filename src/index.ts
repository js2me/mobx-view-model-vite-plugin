/* eslint-disable unicorn/consistent-function-scoping */
/* eslint-disable sonarjs/slow-regex */
/* eslint-disable sonarjs/duplicates-in-character-class */
/* eslint-disable @typescript-eslint/no-use-before-define */
// mobx-viewmodel-reload-plugin.ts
import glob from 'fast-glob';
import type { Plugin } from 'vite';

import fs from 'node:fs';
import path from 'node:path';

// Глобальный кэш для отслеживания иерархии классов
const viewModelHierarchyCache = new Map<string, string[]>();

export interface MobxViewModelVitePluginOptions {
  enabled?: boolean;
}

const pluginName = 'mobx-view-model-vite-plugin';

export function mobxViewModel(
  options?: MobxViewModelVitePluginOptions,
): Plugin {
  let isReloadPending = false;

  // 1. Сканируем проект при инициализации
  const buildClassHierarchy = async (root: string) => {
    const files = await glob(`${root}/**/*.{ts,tsx}`, { absolute: true });

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        analyzeFile(file, content);
      } catch (error) {
        console.error(`Error reading ${file}:`, error);
      }
    }
  };

  // 2. Анализ файла и построение иерархии
  const analyzeFile = (filePath: string, content: string) => {
    const classHierarchy: string[] = [];

    // Определяем все классы в файле
    const classRegex = /class\s+(\w+)\s+extends\s+(\w+)/g;
    let match;

    while ((match = classRegex.exec(content)) !== null) {
      const className = match[1];
      const baseClassName = match[2];
      classHierarchy.push(className);

      // Запоминаем связь класс -> базовый класс
      viewModelHierarchyCache.set(`${filePath}:${className}`, [
        `${filePath}:${baseClassName}`,
        ...getParentClasses(baseClassName, filePath, content),
      ]);
    }

    // Проверяем прямой импорт ViewModelBase
    if (
      /extends\s+ViewModelBase\b/.test(content) &&
      /from\s+['"]mobx-view-model['"]/.test(content)
    ) {
      classHierarchy.forEach((className) => {
        viewModelHierarchyCache.set(`${filePath}:${className}`, []);
      });
    }
  };

  // 3. Рекурсивный поиск родительских классов
  const getParentClasses = (
    baseClassName: string,
    filePath: string,
    content: string,
  ): string[] => {
    const parents: string[] = [];

    // Ищем импорт базового класса
    const importRegex = new RegExp(
      `import\\s+[\\s\\w{},*]+\\s+from\\s+['"]([^'"]+)['"]`,
    );
    const importMatch = importRegex.exec(content);

    if (importMatch) {
      const importPath = importMatch[1];
      const resolvedPath = path.resolve(path.dirname(filePath), importPath);
      const parentFile = `${resolvedPath}.ts` || `${resolvedPath}.tsx`;

      try {
        if (fs.existsSync(parentFile)) {
          const parentContent = fs.readFileSync(parentFile, 'utf8');
          const parentClassMatch = new RegExp(
            `class\\s+${baseClassName}\\s+extends\\s+(\\w+)`,
          ).exec(parentContent);

          if (parentClassMatch) {
            const parentBase = parentClassMatch[1];
            parents.push(`${parentFile}:${parentBase}`);
            return [
              ...parents,
              ...getParentClasses(parentBase, parentFile, parentContent),
            ];
          }
        }
      } catch (error) {
        console.error(`Error resolving parent ${baseClassName}:`, error);
      }
    }

    return parents;
  };

  // 4. Проверка принадлежности к иерархии ViewModel
  const isViewModelClass = (filePath: string, className: string): boolean => {
    const key = `${filePath}:${className}`;

    // Проверяем кэш
    if (viewModelHierarchyCache.has(key)) {
      return true;
    }

    // Проверяем родителей
    const parentKeys = viewModelHierarchyCache.get(key) || [];
    return parentKeys.some((parentKey) =>
      viewModelHierarchyCache.has(parentKey),
    );
  };

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
      await buildClassHierarchy(root);
    },

    // Обработка изменений
    handleHotUpdate(ctx) {
      const { file, server } = ctx;

      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;

      try {
        const content = fs.readFileSync(file, 'utf8');
        let shouldReload = false;

        // Анализируем изменённый файл
        analyzeFile(file, content);

        // Проверяем все классы в файле
        const classRegex = /class\s+(\w+)/g;
        let classMatch;

        while ((classMatch = classRegex.exec(content)) !== null) {
          const className = classMatch[1];

          // Если класс принадлежит к иерархии ViewModel
          if (isViewModelClass(file, className)) {
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
