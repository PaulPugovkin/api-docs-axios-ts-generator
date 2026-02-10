/**
 * Загрузка конфигурации генератора
 */
// @ts-ignore - Node.js types
import fs from 'fs';
// @ts-ignore - Node.js types
import path from 'path';
import { GeneratorConfig } from '../types/config.types';
import { defaultConfig } from './defaultConfig';
import { validateConfig } from './validateConfig';

/**
 * Загружает конфигурацию из файла
 * @param configPath - Путь к файлу конфигурации
 * @returns Объект конфигурации
 */
async function loadConfigFile(configPath: string): Promise<Partial<GeneratorConfig>> {
  const resolvedPath = path.resolve(configPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Configuration file not found: ${resolvedPath}`);
  }

  // Удаляем кэш для поддержки горячей перезагрузки
  // @ts-ignore
  delete require.cache[require.resolve(resolvedPath)];

  try {
    // @ts-ignore
    const userConfig = require(resolvedPath);
    return userConfig.default || userConfig;
  } catch (error) {
    throw new Error(`Failed to load configuration from ${resolvedPath}: ${error}`);
  }
}

/**
 * Объединяет конфигурации (пользовательская перекрывает дефолтную)
 * @param defaults - Конфигурация по умолчанию
 * @param userConfig - Пользовательская конфигурация
 * @returns Объединённая конфигурация
 */
function mergeConfigs(
  defaults: Partial<GeneratorConfig>,
  userConfig: Partial<GeneratorConfig>
): GeneratorConfig {
  const merged: any = {
    ...defaults,
    ...userConfig,
  };

  // Глубокое слияние для вложенных объектов
  if (defaults.tags && userConfig.tags) {
    merged.tags = { ...defaults.tags, ...userConfig.tags };
  }

  if (defaults.naming && userConfig.naming) {
    merged.naming = { ...defaults.naming, ...userConfig.naming };
  }

  if (defaults.imports && userConfig.imports) {
    merged.imports = { ...defaults.imports, ...userConfig.imports };
  }

  if (defaults.options && userConfig.options) {
    merged.options = { ...defaults.options, ...userConfig.options };
  }

  if (defaults.axios && userConfig.axios) {
    merged.axios = { ...defaults.axios, ...userConfig.axios };
    // Глубокое слияние для headers
    if (defaults.axios.headers && userConfig.axios.headers) {
      merged.axios.headers = { ...defaults.axios.headers, ...userConfig.axios.headers };
    }
  }

  return merged as GeneratorConfig;
}

/**
 * Загружает конфигурацию генератора
 * @param configPath - Путь к файлу конфигурации (опционально)
 * @param cliOverrides - Переопределения из CLI аргументов
 * @returns Полная конфигурация генератора
 */
export async function loadConfig(
  configPath?: string,
  cliOverrides?: Partial<GeneratorConfig>
): Promise<GeneratorConfig> {
  let userConfig: Partial<GeneratorConfig> = {};

  // Загрузка из файла, если указан
  if (configPath) {
    console.log(`Loading configuration from: ${configPath}`);
    userConfig = await loadConfigFile(configPath);
  } else {
    console.log('No configuration file specified, using default configuration');
  }

  // Слияние с конфигурацией по умолчанию
  let mergedConfig = mergeConfigs(defaultConfig, userConfig);

  // Применение переопределений из CLI
  if (cliOverrides) {
    mergedConfig = mergeConfigs(mergedConfig, cliOverrides);
  }

  // Валидация конфигурации
  validateConfig(mergedConfig);

  return mergedConfig;
}
