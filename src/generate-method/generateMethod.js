const path = require("path");
const {resolveType} = require("../resolve-type/resolveType");
const {generateJSDoc} = require("../generate-js-doc/generateJSDoc");

/**
 * Генерирует метод TypeScript на основе спецификации API.
 * @param {string} name - Имя метода.
 * @param {Object} method - Описание метода API (из OpenAPI).
 * @param {string} path - Путь API.
 * @param {string} methodType - HTTP-метод (GET, POST и т.д.).
 * @param {Object<string, string>} schemaRefs - Ссылки на схемы для разрешения типов.
 * @param {Set<string>} usedInterfaces - Набор интерфейсов, используемых в методе.
 * @param {Object} config - Конфигурация генератора.
 * @returns {string} - Сгенерированный метод TypeScript.
 */
function generateMethod(
    name,
    method,
    path,
    methodType,
    schemaRefs,
    usedInterfaces,
    config = {}
) {
    const allowConfigSpread = config?.options?.allowAxiosConfigSpread !== false;
    const pathParams = [...path.matchAll(/\{(\w+)\}/g)].map((match) => match[1]);
    pathParams.forEach((param) => {
        path = path.replace(`{${param}}`, `\${${param}}`);
    });

    const requiredParams = [];
    const requiredQueryParams = [];
    const optionalQueryParams = [];
    const nestedParams = {};
    let bodyParam = null;
    let bodyString = "";
    let isMultipart = false;

    // Обработка параметров запроса
    for (const param of method.parameters || []) {
        const paramName = param.name;
        const paramLocation = param.in;
        const paramRequired = param.required || false;
        const paramSchema = param.schema || {};

        // Проверяем, является ли параметр сложным объектом (имеет $ref или properties)
        const isComplexObject = paramSchema.$ref || paramSchema.properties;

        if (paramLocation === "path") {
            const paramType = resolveType(paramSchema, schemaRefs, usedInterfaces);
            requiredParams.push(`${paramName}: ${paramType}`);
        } else if (paramLocation === "query") {
            if (isComplexObject) {
                // Для сложных объектов добавляем распыление
                const paramType = resolveType(paramSchema, schemaRefs, usedInterfaces);
                if (paramRequired) {
                    requiredParams.push(`${paramName}: ${paramType}`);
                    // Вместо добавления в requiredQueryParams, просто отмечаем что есть сложный объект
                    // который нужно распылить
                    requiredQueryParams.push(`...${paramName}`);
                } else {
                    optionalQueryParams.push(`${paramName}?: ${paramType}`);
                    // Для опциональных сложных объектов тоже добавляем распыление
                    requiredQueryParams.push(`...(${paramName} || {})`);
                }
            } else if (paramName.includes(".")) {
                const [nestedName, subfield] = paramName.split(".");
                nestedParams[nestedName] = nestedParams[nestedName] || [];
                const paramType = resolveType(paramSchema, schemaRefs, usedInterfaces);
                nestedParams[nestedName].push(`${subfield}?: ${paramType}`);
            } else {
                const paramType = resolveType(paramSchema, schemaRefs, usedInterfaces);
                if (paramRequired) {
                    requiredQueryParams.push(paramName);
                    requiredParams.push(`${paramName}: ${paramType}`);
                } else {
                    optionalQueryParams.push(`${paramName}?: ${paramType}`);
                }
            }
        }
    }

    // Обрабатываем вложенные параметры (только для простых типов)
    for (const [nestedName, fields] of Object.entries(nestedParams)) {
        optionalQueryParams.push(`${nestedName}?: { ${fields.join(", ")} }`);
    }

    // Проверяем наличие тела запроса (только для методов, которые могут иметь тело)
    const methodsWithBody = ['post', 'put', 'patch', 'delete'];
    const hasRequestBody = methodsWithBody.includes(methodType.toLowerCase()) &&
        method.requestBody &&
        method.requestBody.content &&
        Object.keys(method.requestBody.content).length > 0;

    if (hasRequestBody) {
        const content = method.requestBody.content || {};
        if (content["application/json"]) {
            const schema = content["application/json"].schema || {};
            if (schema.oneOf) {
                const refName = resolveType(schema, schemaRefs, usedInterfaces);
                bodyParam = `values: ${refName}`;
            } else if (schema.$ref) {
                const refName = schema.$ref.split("/").pop();
                usedInterfaces.add(refName);
                bodyParam = `values: ${refName}`;
            } else if (schema.properties) {
                const props = Object.entries(schema.properties)
                    .map(
                        ([key, value]) =>
                            `${key}: ${resolveType(value, schemaRefs, usedInterfaces)}`
                    )
                    .join(", ");
                bodyParam = `values: { ${props} }`;
            } else {
                bodyParam = 'values: any'
            }
            bodyString = "values";
        } else if (content["multipart/form-data"]) {
            isMultipart = true;
            const schema = content["multipart/form-data"].schema || {};
            if (schema.properties) {
                for (const [fieldName, fieldDetails] of Object.entries(
                    schema.properties
                )) {
                    let tsType = resolveType(fieldDetails, schemaRefs, usedInterfaces);
                    if (fieldDetails.format === "binary") {
                        tsType = "File";
                    }
                }
            }
            bodyParam = `data: FormData`;
            bodyString = "data";
        }
    }

    let responseType = "void";
    if (method.responses) {
        for (const [status, response] of Object.entries(method.responses)) {
            if (response.content) {
                const contentSchema = Object.values(response.content)[0].schema || {};
                if (contentSchema.$ref) {
                    const refName = contentSchema.$ref.split("/").pop();
                    responseType = refName;
                    usedInterfaces.add(refName);
                }
            }
        }
    }

    const returnType = `Promise<AxiosResponse<${responseType}>>`;
    const optionalArgsName = optionalQueryParams.length ? "queryParams" : null;
    const optionalArgsDefinition = optionalArgsName
        ? `${optionalArgsName}: { ${optionalQueryParams.join(", ")} }`
        : "";

    // Определяем, есть ли параметры запроса (query params)
    const hasQueryParams = requiredQueryParams.length > 0 || optionalQueryParams.length > 0;

    const jsDocComment = generateJSDoc(method);

    // Строки для аргументов функции
    const functionArgs = `(${[
        ...requiredParams,
        bodyParam,
        optionalArgsDefinition,
        "config?: AxiosRequestConfig",
    ]
        .filter(Boolean)
        .join(", ")}): ${returnType}`;
    const functionString = `${name}${functionArgs}`;

    // Строка url для запроса
    const fullUrlString = `const fullURL = \`\${BASE_URL}${path}\`;`;

    // Формируем строку для axios вызова
    let axiosString = '';

    // Функция для формирования объекта параметров
    const buildParamsObject = () => {
        const parts = [];

        // Добавляем обязательные параметры (простые и распыленные сложные)
        if (requiredQueryParams.length > 0) {
            parts.push(...requiredQueryParams);
        }

        // Добавляем опциональные параметры
        if (optionalArgsName) {
            if (parts.length > 0) {
                parts.push(`...${optionalArgsName}`);
            } else {
                parts.push(`...${optionalArgsName}`);
            }
        }

        return parts.length > 0 ? `{ ${parts.join(', ')} }` : '{}';
    };

    if (methodType.toLowerCase() === "delete") {
        // DELETE запросы могут иметь и тело, и параметры запроса
        if (bodyParam) {
            // Есть тело запроса
            if (hasQueryParams) {
                // Есть и тело, и параметры запроса
                const paramsObject = buildParamsObject();
                axiosString = `return axios.delete(fullURL, { data: values, ...config, params: ${paramsObject} });`;
            } else {
                // Только тело запроса, без параметров
                axiosString = `return axios.delete(fullURL, { data: values, ...config });`;
            }
        } else {
            // Нет тела запроса
            if (hasQueryParams) {
                // Только параметры запроса
                const paramsObject = buildParamsObject();
                axiosString = `return axios.delete(fullURL, { ...config, params: ${paramsObject} });`;
            } else {
                // Нет ни тела, ни параметров
                axiosString = `return axios.delete(fullURL, config);`;
            }
        }
    } else if (methodType.toLowerCase() === "get") {
        // GET запросы никогда не имеют тела
        if (hasQueryParams) {
            const paramsObject = buildParamsObject();
            axiosString = `return axios.get(fullURL, { ...config, params: ${paramsObject} });`;
        } else {
            axiosString = `return axios.get(fullURL, config);`;
        }
    } else {
        // PUT/POST/PATCH методы
        if (hasRequestBody) {
            // Есть тело запроса
            if (hasQueryParams) {
                // Есть и тело, и параметры запроса
                const paramsObject = buildParamsObject();
                axiosString = `return axios.${methodType}(fullURL, ${isMultipart ? 'data' : bodyString}, { ...config, params: ${paramsObject} });`;
            } else {
                // Только тело запроса, без параметров
                axiosString = `return axios.${methodType}(fullURL, ${isMultipart ? 'data' : bodyString}, config);`;
            }
        } else {
            // Нет тела запроса, но могут быть параметры
            if (hasQueryParams) {
                // Только параметры запроса
                const paramsObject = buildParamsObject();
                axiosString = `return axios.${methodType}(fullURL, null, { ...config, params: ${paramsObject} });`;
            } else {
                // Нет ни тела, ни параметров
                axiosString = `return axios.${methodType}(fullURL, null, config);`;
            }
        }
    }

    return `
      ${jsDocComment}
      ${functionString} {
        ${fullUrlString}
        ${axiosString}
      }
    `;
}

module.exports = {generateMethod};