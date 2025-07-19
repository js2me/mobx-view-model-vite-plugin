/* eslint-disable unicorn/consistent-function-scoping */
/* eslint-disable sonarjs/slow-regex */
/* eslint-disable sonarjs/duplicates-in-character-class */
/* eslint-disable @typescript-eslint/no-use-before-define */

import fs from 'node:fs';
import path from 'node:path';

export class ViewModelHierarchy {
  cache = new Map<string, string[]>();

  constructor(files: string[] = []) {
    this.build(files);
  }

  build(files: string[]) {
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        this.analyzeFile(file, content);
      } catch (error) {
        console.error(`Error reading ${file}:`, error);
      }
    }
  }

  getParentClasses = (
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
              ...this.getParentClasses(parentBase, parentFile, parentContent),
            ];
          }
        }
      } catch (error) {
        console.error(`Error resolving parent ${baseClassName}:`, error);
      }
    }

    return parents;
  };

  analyzeFile = (filePath: string, content: string) => {
    const classHierarchy: string[] = [];

    // Определяем все классы в файле
    const classRegex = /class\s+(\w+)\s+extends\s+(\w+)/g;
    let match;

    while ((match = classRegex.exec(content)) !== null) {
      const className = match[1];
      const baseClassName = match[2];
      classHierarchy.push(className);

      // Запоминаем связь класс -> базовый класс
      this.cache.set(`${filePath}:${className}`, [
        `${filePath}:${baseClassName}`,
        ...this.getParentClasses(baseClassName, filePath, content),
      ]);
    }

    // Проверяем прямой импорт ViewModelBase
    if (
      /extends\s+ViewModelBase\b/.test(content) &&
      /from\s+['"]mobx-view-model['"]/.test(content)
    ) {
      classHierarchy.forEach((className) => {
        this.cache.set(`${filePath}:${className}`, []);
      });
    }

    if (
      /implements\s+ViewModel\b/.test(content) &&
      /from\s+['"]mobx-view-model['"]/.test(content)
    ) {
      classHierarchy.forEach((className) => {
        this.cache.set(`${filePath}:${className}`, []);
      });
    }

    if (
      /implements\s+ViewModelSimple\b/.test(content) &&
      /from\s+['"]mobx-view-model['"]/.test(content)
    ) {
      classHierarchy.forEach((className) => {
        this.cache.set(`${filePath}:${className}`, []);
      });
    }
  };

  /**
   * Относится ли этот файл к вью моделям
   */
  isRelated = (filePath: string, className: string): boolean => {
    const key = `${filePath}:${className}`;

    // Проверяем кэш
    if (this.cache.has(key)) {
      return true;
    }

    // Проверяем родителей
    const parentKeys = this.cache.get(key) || [];
    return parentKeys.some((parentKey) => this.cache.has(parentKey));
  };
}
