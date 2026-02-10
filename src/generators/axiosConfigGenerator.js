/**
 * Генератор конфигурации axios
 */
const fs = require('fs');
const path = require('path');

/**
 * Генерирует конфигурацию axios для сгенерированного API клиента
 * @param {Object} config - Конфигурация генератора
 * @param {string} outputDir - Директория вывода
 */
function generateAxiosConfig(config, outputDir) {
  const axiosDir = path.join(outputDir, 'config', 'axios');
  fs.mkdirSync(axiosDir, { recursive: true });

  const axiosConfig = config.axios || {};
  const baseURL = axiosConfig.baseURL || '';
  const timeout = axiosConfig.timeout || 30000;
  const headers = axiosConfig.headers || { 'Content-Type': 'application/json' };
  const withCredentials = axiosConfig.withCredentials || false;

  // Генерация файла axios.ts
  const axiosTsContent = `import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export const BASE_URL = '${baseURL}';

const axiosConfig: AxiosRequestConfig = {
  baseURL: BASE_URL,
  timeout: ${timeout},
  headers: ${JSON.stringify(headers, null, 2)},
  withCredentials: ${withCredentials},
};

const axiosInstance: AxiosInstance = axios.create(axiosConfig);

// Перехватчик запросов
axiosInstance.interceptors.request.use(
  (config) => {
    // Можно добавить токен авторизации
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = \`Bearer \${token}\`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Перехватчик ответов
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Обработка ошибок
    if (error.response) {
      // Сервер ответил со статусом, отличным от 2xx
      console.error('Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Запрос был сделан, но ответ не получен
      console.error('Request error:', error.request);
    } else {
      // Произошла ошибка при настройке запроса
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
`;

  fs.writeFileSync(path.join(axiosDir, 'axios.ts'), axiosTsContent, { encoding: 'utf-8' });
  console.log(`Generated axios config at: ${axiosDir}/axios.ts`);
}

module.exports = { generateAxiosConfig };
