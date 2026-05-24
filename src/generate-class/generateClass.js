/**
 * Генерация классов TypeScript
 * @param {string} name - Название класса
 * @param {string[]} methods - Список методов класса
 * @param {Set<string>} usedInterfaces - Набор используемых интерфейсов
 * @param {Object} config - Конфигурация генератора
 * @returns {string} - Сгенерированный код класса TypeScript
 */
const path = require('path');

function generateClass(name, methods, usedInterfaces, config) {
    const axiosResponseImport =
        'import type { AxiosResponse, AxiosRequestConfig } from "axios";\n';

    // Определяем пути импорта из конфигурации
    const axiosPath = config?.imports?.axiosPath || 'axios';
    const baseUrlPath = config?.imports?.baseUrlPath || './config/axios/axios';

    // Определяем базовый путь для импорта интерфейсов (папка выше, чем папка с классами)
    const interfaceImportPath = config?.outputDir
        ? path.relative(path.join(config.outputDir, 'classes'), config.outputDir)
        : '../../';

    // Импорты интерфейсов
    let interfaceImport = '';
    if (usedInterfaces && usedInterfaces.size > 0) {
        interfaceImport = Array.from(usedInterfaces)
            .sort()
            .map((interfaceName) => `import { ${interfaceName} } from '${interfaceImportPath}';`)
            .join("\n");
    }

    // Импорты axios
    const axiosImport = `\nimport axios from '${axiosPath}'`;
    const baseApiUrl = `\nimport { BASE_URL } from '${baseUrlPath}'`;

    const imports = `${axiosResponseImport}${interfaceImport}${axiosImport}${baseApiUrl}`;
    const tsMethods = methods.join("\n");
    return `${imports}\n\nexport class ${name} {\n${tsMethods}\n}\n`;
}

module.exports = {generateClass};
