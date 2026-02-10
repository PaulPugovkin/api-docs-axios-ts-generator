const {resolveType} = require("../resolve-type/resolveType");

/**
 * Функция для генерации JSDoc на основе массива объектов
 * @param {object} method - объект метода
 * @returns {string} - JSDoc строка
 */
function generateJSDoc(method) {

    let valueArg = ""

    let formDataArg = ""

    const params = method.parameters || [];

    const summary = method.summary || "";

    const docLines = [`/**`];

    if (method.requestBody) {
        const content = method.requestBody.content || {};
        if (content["application/json"]) {
            const schema = content["application/json"].schema || {};
            if (schema.oneOf) {
                valueArg = schema.oneOf.map(s => s.$ref.split("/").pop()).join(' | ');
            } else if (schema.$ref) {
                const refName = schema.$ref.split("/").pop();
                if (!!refName) {
                    valueArg = refName
                }
            }
        }
        if (content["multipart/form-data"]) {
            formDataArg = 'FormData'
        }
    }

    if (!!summary) {
        docLines.push(` * @description ${summary}`);
    }

    if (!!formDataArg) {
        docLines.push(` * @param {${formDataArg}} data - тело запроса`)
    }

    if (!!valueArg) {
        docLines.push(` * @param {${valueArg}} values - тело запроса`)
    }

    const queryParams = {}; // Хранилище для параметров с in: 'query'
    const otherParams = []; // Хранилище для всех остальных параметров

    // Разделение параметров на query и остальные
    params.forEach((param) => {
        if (param.in === "query") {
            if (param.name.includes(".")) {
                const [objectName, propertyName] = param.name.split(".");
                if (!queryParams[objectName]) {
                    queryParams[objectName] = [];
                }
                queryParams[objectName].push({
                    propertyName,
                    description: param.description || "",
                    type: param.schema.type || "string",
                    required: param.required || false,
                });
            } else {
                if (!queryParams[param.name]) {
                    queryParams[param.name] = [];
                }
                queryParams[param.name].push({
                    description: param.description || "",
                    type: param.schema.type || "string",
                    required: param.required || false,
                });
            }
        } else {
            otherParams.push({
                name: param.name,
                description: param.description || "",
                type: param.schema.type || "string",
                required: param.required || false,
            });
        }
    });

    // Добавляем queryParams в JSDoc
    if (Object.keys(queryParams).length > 0) {
        docLines.push(` * @param {object} queryParams`);
        Object.keys(queryParams).forEach((key) => {
            const group = queryParams[key];
            // Сортировка: сначала обязательные параметры
            const sortedGroup = group.sort(
                (a, b) => (b.required ? 1 : 0) - (a.required ? 1 : 0)
            );
            if (
                sortedGroup.length === 1 &&
                sortedGroup[0].propertyName === undefined
            ) {
                // Одиночный параметр без вложенности
                const param = sortedGroup[0];
                const jsType = param.type === "integer" ? "number" : param.type;
                docLines.push(
                    ` * @param {${jsType}} queryParams.${key} - ${param.description}`
                );
            } else {
                // Вложенные параметры
                docLines.push(
                    ` * @param {object} queryParams.${key} - Query parameter`
                );
                sortedGroup.forEach((subParam) => {
                    const {propertyName, description, type} = subParam;
                    const jsType = type === "integer" ? "number" : type;
                    docLines.push(
                        ` * @param {${jsType}} queryParams.${key}.${propertyName} - ${description}`
                    );
                });
            }
        });
    }

    // Сортировка других параметров: сначала обязательные
    const sortedOtherParams = otherParams.sort(
        (a, b) => (b.required ? 1 : 0) - (a.required ? 1 : 0)
    );
    sortedOtherParams.forEach((param) => {
        const jsType = param.type === "integer" ? "number" : param.type;
        docLines.push(` * @param {${jsType}} ${param.name} - ${param.description}`);
    });

    docLines.push(` * @param {AxiosRequestConfig} config - Конфигурация axios`);
    docLines.push(` */`);
    return docLines.join("\n");
}

module.exports = {generateJSDoc};
