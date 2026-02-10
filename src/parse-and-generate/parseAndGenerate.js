const fs = require("fs");
const path = require("path");
const {
    generateInterface,
} = require("../generate-interface/generateInterface");
const {generateMethod} = require("../generate-method/generateMethod");
const {generateClass} = require("../generate-class/generateClass");

// Проверяем и создаем директории
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {recursive: true});
    }
}

// Проверяем наличие тега с учётом префикса
function containsApiTag(array, config) {
    const prefix = config?.tags?.prefix || "api_tag_";

    for (const item of array) {
        if (item.includes(prefix)) {
            return item;
        }
    }
    return "";
}

// Проверяем, проходит ли тег через фильтрацию
function isTagIncluded(tag, config) {
    const {include, exclude, prefix} = config?.tags || {};

    // Если указан список включения, проверяем, есть ли тег в нём
    if (include && include.length > 0) {
        return include.includes(tag);
    }

    // Если указан список исключения, проверяем, что тег не в нём
    if (exclude && exclude.length > 0) {
        return !exclude.includes(tag);
    }

    // Если нет фильтров, включаем все теги с нужным префиксом
    const prefixToCheck = prefix || "api_tag_";
    return tag.includes(prefixToCheck);
}

// Группировка методов по тегам
function groupMethodsByTag(methods, config) {
    const grouped = {};
    const prefix = config?.tags?.prefix || "api_tag_";

    for (const method of methods) {
        if (!method.tag) continue;

        // Применяем пользовательскую функцию именования, если есть
        const groupName = config?.naming?.className
            ? config.naming.className(method.tag)
            : method.tag.replace(prefix, "");

        if (!grouped[groupName]) {
            grouped[groupName] = [];
        }
        grouped[groupName].push(method);
    }

    return grouped;
}

// Основная функция парсинга и генерации файлов
async function parseAndGenerate(jsonFile, config) {
    const spec = JSON.parse(fs.readFileSync(jsonFile, {encoding: "utf-8"}));

    // Определяем пути из конфигурации
    const outputDir = config.outputDir || path.resolve(process.cwd(), "generated");
    const interfacesDir = config.interfacesDir || path.join(outputDir, "interfaces");
    const classesDir = config.classesDir || path.join(outputDir, "classes");

    ensureDir(interfacesDir);
    ensureDir(classesDir);

    const schemaRefs = spec?.components?.schemas || {};

    // Генерация интерфейсов
    if (spec?.components?.schemas) {
        for (const [schemaName, schema] of Object.entries(schemaRefs)) {
            const interfaceCode = generateInterface(
                schemaName,
                schema,
                schemaRefs,
                config
            );
            fs.writeFileSync(
                path.join(interfacesDir, `${schemaName}.ts`),
                interfaceCode,
                {encoding: "utf-8"}
            );
        }
    }

    // Сбор методов из спецификации
    const allMethods = [];

    if (spec?.paths) {
        for (const [pathKey, methods] of Object.entries(spec.paths)) {
            for (const [methodType, methodDetails] of Object.entries(methods)) {
                if (methodDetails?.tags) {
                    const tag = containsApiTag(methodDetails.tags, config);

                    // Пропускаем методы без тега
                    if (!tag) continue;

                    // Проверяем фильтрацию по тегам
                    if (!isTagIncluded(tag, config)) continue;

                    allMethods.push({
                        operationId: methodDetails.operationId,
                        methodDetails,
                        pathKey,
                        methodType,
                        tag,
                    });
                }
            }
        }
    }

    // Определяем режим группировки
    const groupBy = config.groupBy || "tag";

    if (groupBy === "all" || config.classMode === "single") {
        // Все методы в одном классе
        const className = config?.naming?.className
            ? config.naming.className("all")
            : "ApiClient";

        const usedInterfaces = new Set();
        const methodCodes = allMethods.map((method) =>
            generateMethod(
                method.operationId,
                method.methodDetails,
                method.pathKey,
                method.methodType,
                schemaRefs,
                usedInterfaces,
                config
            )
        );

        const classCode = generateClass(className, methodCodes, usedInterfaces, config);
        fs.writeFileSync(
            path.join(classesDir, `${className}.ts`),
            classCode,
            {encoding: "utf-8"}
        );
    } else {
        // Группировка по тегам
        const groupedMethods = groupMethodsByTag(allMethods, config);

        for (const [groupName, methods] of Object.entries(groupedMethods)) {
            const usedInterfaces = new Set();
            const methodCodes = methods.map((method) =>
                generateMethod(
                    method.operationId,
                    method.methodDetails,
                    method.pathKey,
                    method.methodType,
                    schemaRefs,
                    usedInterfaces,
                    config
                )
            );

            const className = config?.naming?.className
                ? config.naming.className(methods[0].tag)
                : groupName + "Api";

            const classCode = generateClass(className, methodCodes, usedInterfaces, config);
            fs.writeFileSync(
                path.join(classesDir, `${className}.ts`),
                classCode,
                {encoding: "utf-8"}
            );
        }
    }

    console.log(`Generated ${allMethods.length} API methods.`);
    console.log(`Generated ${Object.keys(schemaRefs).length} interfaces.`);
}

module.exports = {parseAndGenerate};
