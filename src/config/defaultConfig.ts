/**
 * Конфигурация по умолчанию для генератора
 */
import { GeneratorConfig } from '../types/config.types';

export const defaultConfig: Partial<GeneratorConfig> = {
  outputDir: './generated',
  interfacesDir: './generated/interfaces',
  classesDir: './generated/classes',
  groupBy: 'tag',
  classMode: 'multiple',
  tags: {
    prefix: 'api_tag_',
  },
  imports: {
    axiosPath: 'axios',
    baseUrlPath: './config/axios/axios',
  },
  options: {
    generateJSDoc: true,
    generateIndexFiles: true,
    cleanOutputDir: true,
    generateAxiosConfig: true,
    allowAxiosConfigSpread: true,
  },
  axios: {
    baseURL: '',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  },
};
