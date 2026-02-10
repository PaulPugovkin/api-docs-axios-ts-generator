/**
 * Валидация конфигурации генератора
 */
import { GeneratorConfig } from '../types/config.types';

export function validateConfig(config: GeneratorConfig): void {
  // Проверка обязательного поля outputDir
  if (!config.outputDir) {
    throw new Error('Configuration error: outputDir is required');
  }

  // Проверка, что указан либо apiDocsUrl, либо apiDocsPath
  if (!config.apiDocsUrl && !config.apiDocsPath) {
    throw new Error('Configuration error: either apiDocsUrl or apiDocsPath must be specified');
  }

  // Проверка groupBy
  if (config.groupBy && !['tag', 'all', 'path'].includes(config.groupBy)) {
    throw new Error(`Configuration error: invalid groupBy value "${config.groupBy}". Must be one of: tag, all, path`);
  }

  // Проверка classMode
  if (config.classMode && !['single', 'multiple'].includes(config.classMode)) {
    throw new Error(`Configuration error: invalid classMode value "${config.classMode}". Must be one of: single, multiple`);
  }

  // Проверка фильтрации по тегам
  if (config.tags) {
    if (config.tags.include && config.tags.exclude) {
      console.warn('Warning: Both include and exclude tags are specified. Include will take precedence.');
    }

    if (config.tags.include && config.tags.include.length === 0) {
      console.warn('Warning: tags.include is empty. No tags will be filtered.');
    }
  }

  // Проверка совместимости groupBy и classMode
  if (config.groupBy === 'all' && config.classMode === 'multiple') {
    console.warn('Warning: groupBy="all" with classMode="multiple" will generate only one class. Consider using classMode="single".');
  }

  // Проверка настроек axios
  if (config.axios) {
    if (config.axios.timeout !== undefined && config.axios.timeout < 0) {
      throw new Error('Configuration error: axios.timeout must be a positive number');
    }
  }

  // Проверка опций генерации
  if (config.options) {
    if (config.options.generateAxiosConfig && !config.axios) {
      console.warn('Warning: generateAxiosConfig is true but no axios config provided. Using default values.');
    }
  }

  console.log('Configuration validated successfully.');
}
