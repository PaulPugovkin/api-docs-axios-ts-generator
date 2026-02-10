/**
 * Пример конфигурации для генератора API клиента
 */
import { GeneratorConfig } from './src/types/config.types';

const config: GeneratorConfig = {
  // URL для загрузки OpenAPI спецификации
  apiDocsUrl: 'https://api.example.com/v3/api-docs.json',

  // Или используйте локальный файл
  // apiDocsPath: './src/api-docs.json',

  // Директория для вывода сгенерированных файлов
  outputDir: './generated',

  // Директория для интерфейсов (опционально)
  interfacesDir: './generated/interfaces',

  // Директория для классов (опционально)
  classesDir: './generated/classes',

  // Фильтрация по тегам
  tags: {
    // Включить только эти теги
    include: ['api_tag_users', 'api_tag_products'],

    // Исключить эти теги
    exclude: ['api_tag_internal', 'api_tag_admin'],

    // Префикс тегов
    prefix: 'api_tag_',
  },

  // Режим группировки методов
  // 'tag' - группировка по тегам (несколько классов)
  // 'all' - все методы в одном классе
  // 'path' - группировка по путям API
  groupBy: 'tag',

  // Режим генерации классов
  // 'single' - один класс для всех методов
  // 'multiple' - несколько классов по группировке
  classMode: 'multiple',

  // Настройки именования
  naming: {
    // Функция для генерации имени класса из тега
    className: (tag) => tag.replace('api_tag_', '') + 'Api',

    // Функция для генерации имени интерфейса из схемы
    interfaceName: (name) => name,

    // Функция для генерации имени метода из operationId
    methodName: (operationId) => operationId,
  },

  // Настройки импортов
  imports: {
    // Путь для импорта axios
    axiosPath: 'axios',

    // Путь для импорта BASE_URL
    baseUrlPath: './config/axios/axios',
  },

  // Дополнительные опции генерации
  options: {
    // Генерировать JSDoc комментарии
    generateJSDoc: true,

    // Генерировать index файлы
    generateIndexFiles: true,

    // Очищать директорию вывода перед генерацией
    cleanOutputDir: true,

    // Генерировать конфигурацию axios
    generateAxiosConfig: true,

    // Разрешить распыление пользовательских конфигураций axios
    allowAxiosConfigSpread: true,
  },

  // Настройки axios
  axios: {
    // Базовый URL для всех запросов
    baseURL: 'https://api.example.com',

    // Таймаут запроса в миллисекундах
    timeout: 30000,

    // Заголовки по умолчанию
    headers: {
      'Content-Type': 'application/json',
      // 'X-API-Key': 'your-api-key',
    },

    // Отправлять куки с кросс-доменными запросами
    withCredentials: false,
  },
};

export default config;
