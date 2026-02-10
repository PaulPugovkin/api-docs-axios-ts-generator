/**
 * Пример конфигурации для базового использования
 */
import { GeneratorConfig } from '@paulpugovkin/api-docs-axios-ts-generator';

const config: GeneratorConfig = {
  // URL для загрузки OpenAPI спецификации
  apiDocsUrl: 'https://api.example.com/v3/api-docs.json',

  // Директория для вывода сгенерированных файлов
  outputDir: './src/api',

  // Фильтрация по тегам
  tags: {
    // Включить только эти теги
    include: ['api_tag_users', 'api_tag_products'],
    // Исключить эти теги
    exclude: ['api_tag_internal'],
    // Префикс тегов
    prefix: 'api_tag_',
  },

  // Режим группировки методов
  groupBy: 'tag',

  // Режим генерации классов
  classMode: 'multiple',

  // Настройки именования
  naming: {
    className: (tag) => tag.replace('api_tag_', '') + 'Api',
    interfaceName: (name) => name,
    methodName: (operationId) => operationId,
  },

  // Настройки импортов
  imports: {
    axiosPath: 'axios',
    baseUrlPath: './config/axios/axios',
  },

  // Дополнительные опции генерации
  options: {
    generateJSDoc: true,
    generateIndexFiles: true,
    cleanOutputDir: true,
    generateAxiosConfig: true,
    allowAxiosConfigSpread: true,
  },

  // Настройки axios
  axios: {
    baseURL: 'https://api.example.com',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: false,
  },
};

export default config;
