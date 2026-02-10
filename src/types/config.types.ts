/**
 * Типы конфигурации для генератора API клиента
 */

/**
 * Основная конфигурация генератора
 */
export interface GeneratorConfig {
  /**
   * URL для загрузки OpenAPI спецификации
   */
  apiDocsUrl?: string;

  /**
   * Локальный путь к файлу OpenAPI спецификации
   */
  apiDocsPath?: string;

  /**
   * Директория для вывода сгенерированных файлов
   */
  outputDir: string;

  /**
   * Директория для интерфейсов (опционально, по умолчанию outputDir/interfaces)
   */
  interfacesDir?: string;

  /**
   * Директория для классов (опционально, по умолчанию outputDir/classes)
   */
  classesDir?: string;

  /**
   * Настройки фильтрации по тегам
   */
  tags?: TagFilter;

  /**
   * Режим группировки методов
   * - 'tag' - группировка по тегам (несколько классов)
   * - 'all' - все методы в одном классе
   * - 'path' - группировка по путям API
   */
  groupBy: 'tag' | 'all' | 'path';

  /**
   * Режим генерации классов
   * - 'single' - один класс для всех методов
   * - 'multiple' - несколько классов по группировке
   */
  classMode: 'single' | 'multiple';

  /**
   * Настройки именования
   */
  naming?: NamingOptions;

  /**
   * Настройки импортов
   */
  imports?: ImportOptions;

  /**
   * Дополнительные опции генерации
   */
  options?: GeneratorOptions;

  /**
   * Настройки axios
   */
  axios?: AxiosConfig;
}

/**
 * Настройки фильтрации по тегам
 */
export interface TagFilter {
  /**
   * Список тегов для включения в генерацию
   */
  include?: string[];

  /**
   * Список тегов для исключения из генерации
   */
  exclude?: string[];

  /**
   * Префикс тегов для фильтрации (например, "api_tag_")
   */
  prefix?: string;
}

/**
 * Настройки именования
 */
export interface NamingOptions {
  /**
   * Функция для генерации имени класса из тега
   */
  className?: (tag: string) => string;

  /**
   * Функция для генерации имени интерфейса из схемы
   */
  interfaceName?: (name: string) => string;

  /**
   * Функция для генерации имени метода из operationId
   */
  methodName?: (operationId: string) => string;
}

/**
 * Настройки импортов
 */
export interface ImportOptions {
  /**
   * Путь для импорта axios
   */
  axiosPath?: string;

  /**
   * Путь для импорта BASE_URL
   */
  baseUrlPath?: string;
}

/**
 * Опции генерации
 */
export interface GeneratorOptions {
  /**
   * Генерировать JSDoc комментарии
   */
  generateJSDoc?: boolean;

  /**
   * Генерировать index файлы
   */
  generateIndexFiles?: boolean;

  /**
   * Очищать директорию вывода перед генерацией
   */
  cleanOutputDir?: boolean;

  /**
   * Генерировать конфигурацию axios
   */
  generateAxiosConfig?: boolean;

  /**
   * Разрешить распыление пользовательских конфигураций axios
   */
  allowAxiosConfigSpread?: boolean;
}

/**
 * Настройки axios
 */
export interface AxiosConfig {
  /**
   * Базовый URL для всех запросов
   */
  baseURL?: string;

  /**
   * Таймаут запроса в миллисекундах
   */
  timeout?: number;

  /**
   * Заголовки по умолчанию
   */
  headers?: Record<string, string>;

  /**
   * Отправлять куки с кросс-доменными запросами
   */
  withCredentials?: boolean;
}
